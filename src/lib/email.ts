// Instant @mention notification emails, sent from the main worker on
// comment POST. Mirrors the digest worker's Resend integration in
// cron/digest.mjs — same FROM, same secret name (RESEND_API_KEY), same
// "skip silently if no secret" behavior so local dev never sends.
//
// Wrapped in try/catch by the caller; we additionally swallow + log
// inside so the comment write never fails because Resend is down.

import type { AccessUser } from './access.ts';
import { displayNameFor } from './roster.ts';
import { findQuestion } from './worksheet.ts';

const FROM = 'EC Discovery Portal <noreply@electriccitizen.com>';
const DEFAULT_PORTAL_BASE = 'https://discovery.electriccitizen.com';

interface SendMentionEmailArgs {
  env: { RESEND_API_KEY?: string; PORTAL_BASE_URL?: string };
  projectSlug: string;
  projectTitle: string;
  questionId: string;
  author: AccessUser;
  bodyExcerpt: string;
  recipients: string[];      // already deduped + filtered to mentionable set
  internal: boolean;
}

export async function sendMentionEmail(args: SendMentionEmailArgs): Promise<void> {
  const {
    env,
    projectSlug,
    projectTitle,
    questionId,
    author,
    bodyExcerpt,
    recipients,
    internal,
  } = args;

  if (recipients.length === 0) return;

  const portalBase = env.PORTAL_BASE_URL || DEFAULT_PORTAL_BASE;
  const found = findQuestion(projectSlug, questionId);
  const questionTitle = found?.question.title ?? questionId;
  const sectionSlug = found?.section.slug;
  const link = sectionSlug
    ? `${portalBase}/${projectSlug}/section/${sectionSlug}#${questionId}`
    : `${portalBase}/${projectSlug}`;

  const authorName = displayNameFor(author.email);
  const internalTag = internal ? ' [INTERNAL]' : '';
  const subject = `[${projectTitle}] ${authorName} mentioned you on ${questionId}${internalTag}`;
  const text = composeBody({
    authorName,
    authorEmail: author.email,
    questionId,
    questionTitle,
    bodyExcerpt,
    link,
    internal,
  });

  if (!env.RESEND_API_KEY) {
    // Same pattern as cron/digest.mjs: in local dev (no secret bound)
    // the call is a no-op — visible in logs but never sends. The console
    // line doubles as a way to inspect rendered email content during
    // development without wiring up Resend.
    console.log(
      `[mention-email] no RESEND_API_KEY; would send to ${recipients.join(', ')}\n` +
      `subject: ${subject}\n${text}`
    );
    // Dev-only preview: dump each rendered email to .dev-emails/ so it can
    // be opened in an editor or mail client. Gated by the missing-secret
    // check above, which by construction is never true in prod (RESEND_API_KEY
    // is always bound there). The fs import is dynamic so the prod bundle
    // never has to resolve node:fs at all.
    await writeDevPreview({ recipients, subject, text }).catch((err) => {
      console.error('[mention-email] preview write failed:', err);
    });
    return;
  }

  for (const to of recipients) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: [to], subject, text }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[mention-email] resend ${res.status} for ${to}: ${errBody}`);
      }
    } catch (err) {
      console.error(`[mention-email] send error for ${to}:`, err);
    }
  }
}

function composeBody(args: {
  authorName: string;
  authorEmail: string;
  questionId: string;
  questionTitle: string;
  bodyExcerpt: string;
  link: string;
  internal: boolean;
}): string {
  const lines: string[] = [];
  if (args.internal) {
    lines.push('You were mentioned in an INTERNAL (EC-only) comment.');
  } else {
    lines.push('You were mentioned in a comment.');
  }
  lines.push('');
  lines.push(`Question: ${args.questionId} — ${args.questionTitle}`);
  lines.push(`From: ${args.authorName} <${args.authorEmail}>`);
  lines.push('');
  lines.push(clip(args.bodyExcerpt, 500));
  lines.push('');
  lines.push(`Open the thread: ${args.link}`);
  return lines.join('\n');
}

function clip(s: string, max: number): string {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  return trimmed.length > max ? trimmed.slice(0, max - 1) + '…' : trimmed;
}

// Write a rendered email to .dev-emails/{timestamp}-{recipient}.eml for
// local preview. The worker runtime (workerd, even in dev) cannot write
// to disk directly, so we POST to a small Node-side sidecar that the
// Vite dev plugin starts on DEV_EMAIL_PREVIEW_PORT (see astro.config.mjs).
// In prod this code path is unreachable (the !env.RESEND_API_KEY gate
// guarantees it), so the network call never fires there.
const PREVIEW_SIDECAR_URL = 'http://127.0.0.1:4327/write';

async function writeDevPreview(args: {
  recipients: string[];
  subject: string;
  text: string;
}): Promise<void> {
  const body = [
    `From: ${FROM}`,
    `To: ${args.recipients.join(', ')}`,
    `Subject: ${args.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    args.text,
  ].join('\n');
  const res = await fetch(PREVIEW_SIDECAR_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      kind: 'mention',
      recipients: args.recipients,
      eml: body,
    }),
  });
  if (!res.ok) {
    throw new Error(`sidecar HTTP ${res.status}`);
  }
  const path = await res.text();
  console.log(`[mention-email] preview: ${path}`);
}
