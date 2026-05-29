// Hardcoded EC team roster. Used by the @mention autocomplete to surface
// internal team members on every project (since EC has blanket access and
// is never listed in per-project client_emails).
//
// Keep this short — fits in a single file because the team is small. When
// the team changes, edit here and redeploy. A future iteration could move
// this to D1 or to a CF env var if churn warrants it.

export interface RosterUser {
  email: string;
  name: string;
}

export const EC_ROSTER: RosterUser[] = [
  { email: 'tim@electriccitizen.com',   name: 'Tim Broeker' },
  { email: 'adam@electriccitizen.com',  name: 'Adam' },
  { email: 'emily@electriccitizen.com', name: 'Emily' },
  { email: 'dan@electriccitizen.com',   name: 'Dan' },
  { email: 'brian@electriccitizen.com', name: 'Brian' },
  { email: 'trent@electriccitizen.com', name: 'Trent' },
  // Personal / off-domain addresses that should still receive internal-mention
  // emails. Adding an entry here grants notification access only — it does NOT
  // grant portal login (Cloudflare Access remains the perimeter, which is
  // domain-gated). Use sparingly; treat as a security-adjacent edit.
  { email: 'broeker@gmail.com',         name: 'Tim (personal)' },
];

/**
 * Is this email allowed to receive notifications for internal (EC-only)
 * comments? True for any @electriccitizen.com address (the security
 * primitive `isEC`) OR any address explicitly in EC_ROSTER. The roster
 * branch lets us notify contractors and personal addresses without
 * widening the actual EC identity check.
 *
 * Used by the comments POST handler when filtering @-mention targets on
 * internal comments. Must NOT be used as an authorization check for
 * anything else — it's purely for "do we email this person on internal
 * mentions" semantics.
 */
export function isInternalRecipient(email: string): boolean {
  const lower = email.toLowerCase();
  if (lower.endsWith('@electriccitizen.com')) return true;
  return EC_ROSTER.some((u) => u.email.toLowerCase() === lower);
}

export function findRosterUser(email: string): RosterUser | undefined {
  const lower = email.toLowerCase();
  return EC_ROSTER.find((u) => u.email.toLowerCase() === lower);
}

/**
 * Best-effort display name for an email address. Used by the mention
 * autocomplete and the mention email subject line. Falls back to the
 * email prefix (before @) if we don't have a registered name.
 */
export function displayNameFor(email: string): string {
  const known = findRosterUser(email);
  if (known) return known.name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

// Match @email tokens in a comment body. Loose RFC: word chars, dots,
// hyphens, plus, underscore on both sides of @. Conservative enough to
// avoid false positives in URLs ("see https://foo@bar.com" won't trip
// because the @ has no leading whitespace/start-of-string boundary).
const MENTION_PATTERN = /(?:^|[\s(\[,;])@([A-Za-z0-9._+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/g;

/**
 * Extract @-mention email tokens from comment body text. Returns the raw
 * lowercased emails (de-duplicated). The caller is responsible for
 * filtering against the project's mentionable set — this just finds
 * candidates.
 */
export function extractMentionEmails(body: string): string[] {
  const out = new Set<string>();
  for (const m of body.matchAll(MENTION_PATTERN)) {
    out.add(m[1].toLowerCase());
  }
  return [...out];
}
