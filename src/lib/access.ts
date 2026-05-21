import type { ProjectMeta } from './projects.ts';

export interface AccessUser {
  email: string;
  role: 'ec' | 'client';
  label: string;
}

const EC_DOMAIN = '@electriccitizen.com';

/**
 * Read the authenticated user's email. In prod this comes from the
 * `cf-access-authenticated-user-email` header set by Cloudflare Access.
 * In local dev there is no Access perimeter, so fall back to
 * `DEV_USER_EMAIL` (or tim@electriccitizen.com) to let pages render.
 */
export function getAuthEmail(request: Request): string | null {
  const header = request.headers.get('cf-access-authenticated-user-email');
  if (header) return header;
  if (import.meta.env.DEV) {
    return import.meta.env.DEV_USER_EMAIL || 'tim@electriccitizen.com';
  }
  return null;
}

export function getUser(
  request: Request,
  clientLabel: string = 'Client'
): AccessUser | null {
  const email = getAuthEmail(request);
  if (!email) return null;
  const isEC = email.toLowerCase().endsWith(EC_DOMAIN);
  return {
    email,
    role: isEC ? 'ec' : 'client',
    label: isEC ? 'EC' : clientLabel,
  };
}

export function requireUser(
  request: Request,
  clientLabel: string = 'Client'
): AccessUser | Response {
  const user = getUser(request, clientLabel);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'missing access header' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  return user;
}

/**
 * App-level authorization: does this user have access to this project?
 *
 *   - EC team (`@electriccitizen.com`) → yes, every project
 *   - Otherwise, the user must match the project's `client_emails` exactly
 *     OR their email's domain must match `client_email_domains`
 *
 * Cloudflare Access is the perimeter (it decides who can authenticate to
 * `discovery.electriccitizen.com` at all). This function is the per-project
 * authorization layer that runs after Access — needed because all projects
 * sit on the same hostname.
 */
export function canAccessProject(email: string, project: ProjectMeta): boolean {
  const lower = email.toLowerCase();
  if (lower.endsWith(EC_DOMAIN)) return true;

  for (const allowed of project.client_emails ?? []) {
    if (allowed.toLowerCase() === lower) return true;
  }

  const domains = project.client_email_domains ?? [];
  for (const d of domains) {
    const needle = '@' + d.toLowerCase().replace(/^@/, '');
    if (lower.endsWith(needle)) return true;
  }

  return false;
}

export function isEC(email: string): boolean {
  return email.toLowerCase().endsWith(EC_DOMAIN);
}
