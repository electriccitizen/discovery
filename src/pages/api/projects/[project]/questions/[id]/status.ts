import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, requireUser } from '../../../../../../lib/access.ts';
import {
  isPriority,
  isStatus,
  upsertResponseStatus,
  type Priority,
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

  let payload: { status?: unknown; priority?: unknown };
  try {
    payload = (await request.json()) as { status?: unknown; priority?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (payload.status !== undefined && !isStatus(payload.status)) {
    return json({ error: 'invalid status' }, 400);
  }
  if (payload.priority !== undefined && !isPriority(payload.priority)) {
    return json({ error: 'invalid priority' }, 400);
  }
  if (payload.status === undefined && payload.priority === undefined) {
    return json({ error: 'must include status or priority' }, 400);
  }

  const db = env.DB;
  const row = await upsertResponseStatus(
    db,
    project,
    questionId,
    {
      status: payload.status as Status | undefined,
      priority: payload.priority as Priority | undefined,
    },
    user.email
  );
  return json({ response: row });
};
