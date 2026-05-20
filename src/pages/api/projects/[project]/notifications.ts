import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, requireUser } from '../../../../lib/access.ts';
import { getNotificationPref, upsertNotificationPref } from '../../../../lib/db.ts';
import { getProject } from '../../../../lib/projects.ts';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params, request }) => {
  const project = params.project;
  if (!project) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  const pref = await getNotificationPref(env.DB, user.email, project);
  return json({
    pref: {
      email: user.email,
      project_slug: project,
      daily_digest: pref?.daily_digest === 1,
      updated_at: pref?.updated_at ?? null,
    },
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const project = params.project;
  if (!project) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  let payload: { daily_digest?: unknown };
  try {
    payload = (await request.json()) as { daily_digest?: unknown };
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (typeof payload.daily_digest !== 'boolean') {
    return json({ error: 'daily_digest must be boolean' }, 400);
  }

  const row = await upsertNotificationPref(env.DB, user.email, project, payload.daily_digest);
  return json({
    pref: {
      email: row.email,
      project_slug: row.project_slug,
      daily_digest: row.daily_digest === 1,
      updated_at: row.updated_at,
    },
  });
};
