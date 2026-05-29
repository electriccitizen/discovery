import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, requireUser } from '../../../../../../lib/access.ts';
import {
  addComment,
  listComments,
  listProjectParticipants,
} from '../../../../../../lib/db.ts';
import { getProject } from '../../../../../../lib/projects.ts';
import {
  EC_ROSTER,
  extractMentionEmails,
  isInternalRecipient,
} from '../../../../../../lib/roster.ts';
import { sendMentionEmail } from '../../../../../../lib/email.ts';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const project = params.project;
  const questionId = params.id;
  if (!project || !questionId) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  const db = env.DB;
  const rows = await listComments(db, project, questionId, {
    includeInternal: user.role === 'ec',
  });
  return json({ comments: rows });
};

export const POST: APIRoute = async ({ params, request }) => {
  const project = params.project;
  const questionId = params.id;
  if (!project || !questionId) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  let payload: { body?: unknown; internal?: unknown };
  try {
    payload = (await request.json()) as { body?: unknown; internal?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (typeof payload.body !== 'string' || payload.body.trim().length === 0) {
    return json({ error: 'body required' }, 400);
  }
  if (payload.body.length > 10000) {
    return json({ error: 'body too long' }, 400);
  }

  // Hard rule: only EC users can post internal comments. Reject explicitly
  // rather than silently coercing — a silent coerce would mask UI bugs that
  // try to send internal=true from a client session.
  const wantsInternal = payload.internal === true;
  if (wantsInternal && user.role !== 'ec') {
    return json({ error: 'forbidden: internal comments are EC-only' }, 403);
  }

  const db = env.DB;
  const trimmedBody = payload.body.trim();

  // Build the per-project mentionable set: EC roster + explicit client_emails
  // + project participants (response/comment authors). Same union the
  // GET /mentionable endpoint exposes; recomputed here so the server never
  // trusts the client to say who's mentionable.
  const participants = await listProjectParticipants(db, project);
  const allowed = new Set<string>();
  for (const ec of EC_ROSTER) allowed.add(ec.email.toLowerCase());
  for (const e of meta.client_emails ?? []) allowed.add(e.toLowerCase());
  for (const e of participants) {
    if (canAccessProject(e, meta)) allowed.add(e.toLowerCase());
  }

  const candidateMentions = extractMentionEmails(trimmedBody);
  // Internal comments: silently drop any mention targeting a non-EC email
  // so a private note can never notify a client.
  const filteredMentions = candidateMentions
    .filter((e) => allowed.has(e))
    .filter((e) => (wantsInternal ? isInternalRecipient(e) : true));

  const { row, mentioned } = await addComment(
    db,
    project,
    questionId,
    user.email,
    user.label,
    trimmedBody,
    { internal: wantsInternal, mentionedEmails: filteredMentions }
  );

  // Instant email notifications. Fire-and-forget; wrapped in try/catch
  // inside the helper so a Resend outage never fails the comment write.
  // Locally (no RESEND_API_KEY), the helper logs and no-ops.
  if (mentioned.length > 0) {
    await sendMentionEmail({
      env,
      projectSlug: project,
      projectTitle: meta.title,
      questionId,
      author: user,
      bodyExcerpt: trimmedBody,
      recipients: mentioned,
      internal: wantsInternal,
    });
  }

  return json({ comment: row, mentioned }, 201);
};
