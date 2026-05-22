// Render comment body text with @-mention email tokens replaced by styled
// pills. Used on both the server-rendered initial paint (CommentThread.astro)
// and the client-side optimistic append (discovery.ts via the same logic
// duplicated there — kept in sync by hand; this module is the source of
// truth for the format).
//
// Returns HTML. Body text is escaped first; pill HTML is then spliced in.

import { displayNameFor } from './roster.ts';

// Match @email tokens at start-of-string or after whitespace/punctuation,
// same boundary as extractMentionEmails in roster.ts.
const MENTION_PATTERN = /(^|[\s(\[,;])@([A-Za-z0-9._+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/g;

export function renderCommentBody(body: string): string {
  const escaped = escapeHtml(body);
  return escaped.replace(MENTION_PATTERN, (_match, lead: string, email: string) => {
    const safeEmail = escapeHtml(email);
    const label = escapeHtml(displayNameFor(email));
    return `${lead}<span class="mention-pill" title="${safeEmail}">@${label}</span>`;
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
