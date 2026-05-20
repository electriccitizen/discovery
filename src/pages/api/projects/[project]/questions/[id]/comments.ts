import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { requireUser } from '../../../../../../lib/access.ts';
import { addComment, listComments } from '../../../../../../lib/db.ts';
import { getProject } from '../../../../../../lib/projects.ts';

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
  if (!meta) return json({ error: 'unknown project' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  const db = env.DB;
  const rows = await listComments(db, project, questionId);
  return json({ comments: rows });
};

export const POST: APIRoute = async ({ params, request }) => {
  const project = params.project;
  const questionId = params.id;
  if (!project || !questionId) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'unknown project' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  let payload: { body?: unknown };
  try {
    payload = (await request.json()) as { body?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (typeof payload.body !== 'string' || payload.body.trim().length === 0) {
    return json({ error: 'body required' }, 400);
  }
  if (payload.body.length > 10000) {
    return json({ error: 'body too long' }, 400);
  }

  const db = env.DB;
  const row = await addComment(
    db,
    project,
    questionId,
    user.email,
    user.label,
    payload.body.trim()
  );
  return json({ comment: row }, 201);
};
