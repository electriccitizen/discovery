import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, requireUser } from '../../../../../../lib/access.ts';
import { getResponse, upsertResponseBody } from '../../../../../../lib/db.ts';
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
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  const db = env.DB;
  const row = await getResponse(db, project, questionId);
  return json({ response: row });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const project = params.project;
  const questionId = params.id;
  if (!project || !questionId) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  let payload: { body?: unknown; clear?: unknown };
  try {
    payload = (await request.json()) as { body?: unknown; clear?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (typeof payload.body !== 'string') {
    return json({ error: 'body must be a string' }, 400);
  }
  if (payload.clear !== undefined && typeof payload.clear !== 'boolean') {
    return json({ error: 'clear must be a boolean' }, 400);
  }

  const db = env.DB;
  const row = await upsertResponseBody(db, project, questionId, payload.body, user.email, {
    clear: payload.clear === true,
  });
  return json({ response: row });
};
