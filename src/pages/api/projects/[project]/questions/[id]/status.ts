import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, isEC, requireUser } from '../../../../../../lib/access.ts';
import {
  isStatus,
  upsertResponseStatus,
  type Status,
} from '../../../../../../lib/db.ts';
import { getProject } from '../../../../../../lib/projects.ts';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const project = params.project;
  const questionId = params.id;
  if (!project || !questionId) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  let payload: { status?: unknown; flagged?: unknown };
  try {
    payload = (await request.json()) as { status?: unknown; flagged?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (payload.status !== undefined && !isStatus(payload.status)) {
    return json({ error: 'invalid status' }, 400);
  }
  if (payload.flagged !== undefined && typeof payload.flagged !== 'boolean') {
    return json({ error: 'flagged must be boolean' }, 400);
  }
  if (payload.status === undefined && payload.flagged === undefined) {
    return json({ error: 'must include status or flagged' }, 400);
  }

  // Only EC can set/unset the priority flag. Clients see flagged questions
  // but cannot change the flag themselves.
  if (payload.flagged !== undefined && !isEC(user.email)) {
    return json({ error: 'flagging is EC-only' }, 403);
  }

  const db = env.DB;
  const row = await upsertResponseStatus(
    db,
    project,
    questionId,
    {
      status: payload.status as Status | undefined,
      flagged: payload.flagged as boolean | undefined,
    },
    user.email
  );
  return json({ response: row });
};
