import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canAccessProject, isEC, requireUser } from '../../../../lib/access.ts';
import { listProjectParticipants } from '../../../../lib/db.ts';
import { getProject } from '../../../../lib/projects.ts';
import { EC_ROSTER, displayNameFor } from '../../../../lib/roster.ts';

interface MentionableUser {
  email: string;
  name: string;
  role: 'ec' | 'client';
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// Returns the set of people @mention autocomplete should offer for this
// project. Union of:
//   1. EC team roster (always mentionable — they have access to all projects)
//   2. Project's explicit client_emails
//   3. Anyone who has authored a response or comment on this project
//      (auto-bootstrap for domain-allowlisted projects)
//
// Filtered through canAccessProject so a stale historic email that's since
// been revoked at the project level doesn't appear. Internal-comment
// recipients are further filtered client-side when the internal toggle is
// on (no client roles offered).
export const GET: APIRoute = async ({ params, request }) => {
  const project = params.project;
  if (!project) return json({ error: 'bad params' }, 400);

  const meta = getProject(project);
  if (!meta) return json({ error: 'not found' }, 404);

  const user = requireUser(request, meta.client.label);
  if (user instanceof Response) return user;

  if (!canAccessProject(user.email, meta)) return json({ error: 'not found' }, 404);

  const seen = new Set<string>();
  const out: MentionableUser[] = [];

  for (const ec of EC_ROSTER) {
    const key = ec.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ email: ec.email, name: ec.name, role: 'ec' });
  }

  for (const clientEmail of meta.client_emails ?? []) {
    const key = clientEmail.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ email: clientEmail, name: displayNameFor(clientEmail), role: 'client' });
  }

  const participants = await listProjectParticipants(env.DB, project);
  for (const email of participants) {
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    if (!canAccessProject(email, meta)) continue;
    seen.add(key);
    out.push({
      email,
      name: displayNameFor(email),
      role: isEC(email) ? 'ec' : 'client',
    });
  }

  return json({ users: out });
};
