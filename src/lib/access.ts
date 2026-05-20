export interface AccessUser {
  email: string;
  role: 'ec' | 'client';
  label: string;
}

const EC_DOMAIN = '@electriccitizen.com';

export function getUser(
  request: Request,
  clientLabel: string = 'Client'
): AccessUser | null {
  const email = request.headers.get('cf-access-authenticated-user-email');
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
