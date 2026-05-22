// Daily digest cron worker. Fires once per day (see wrangler.jsonc), walks
// every project that has at least one daily_digest subscriber, and — only
// if there was activity in the last 24h — sends a per-subscriber digest
// via Resend. Zero activity = no email. Quiet days stay quiet.
//
// Internal-comment rule: comment rows with internal=1 are EC-only on every
// surface. The digest enforces this per recipient — we fetch internal +
// public separately, then build the per-recipient body using only the
// slice that recipient is allowed to see. Mirrors the rule enforced by
// listComments/listAllComments in src/lib/db.ts.

import questions from './questions.json';

const DEFAULT_PORTAL_BASE = 'https://discovery.electriccitizen.com';
const FROM = 'EC Discovery Portal <noreply@electriccitizen.com>';
const EC_DOMAIN = '@electriccitizen.com';

function isEC(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(EC_DOMAIN);
}

// Scheduled-only worker — no HTTP surface. For manual testing, use
// `npx wrangler dev --test-scheduled` and hit /__scheduled locally.
export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(run(env));
  },
};

async function run(env) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const portalBase = env.PORTAL_BASE_URL || DEFAULT_PORTAL_BASE;

  const projects = await env.DB.prepare(
    'SELECT DISTINCT project_slug FROM notification_preferences WHERE daily_digest = 1'
  ).all();

  for (const { project_slug } of projects.results ?? []) {
    // Fetch all comments (incl. internal) — we partition per recipient below
    // and only send the subset each viewer is allowed to see.
    const comments = await env.DB.prepare(
      `SELECT question_id, author_email, author_label, body, created_at, internal
         FROM comments
        WHERE project_slug = ?1 AND created_at > ?2
        ORDER BY created_at ASC`
    ).bind(project_slug, since).all();

    // Exclude notification_pref entries — those would echo a user's own
    // preference change back at them. They're not meaningful project activity.
    const audit = await env.DB.prepare(
      `SELECT question_id, kind, prev_value, new_value, changed_by, changed_at
         FROM audit_log
        WHERE project_slug = ?1
          AND changed_at > ?2
          AND kind != 'notification_pref'
        ORDER BY changed_at ASC`
    ).bind(project_slug, since).all();

    const commentRows = comments.results ?? [];
    const auditRows = audit.results ?? [];
    const publicComments = commentRows.filter((c) => !c.internal);

    const subs = await env.DB.prepare(
      'SELECT email FROM notification_preferences WHERE project_slug = ?1 AND daily_digest = 1'
    ).bind(project_slug).all();
    const subscribers = (subs.results ?? []).map((r) => r.email);

    for (const email of subscribers) {
      const viewerIsEC = isEC(email);
      const visibleComments = viewerIsEC ? commentRows : publicComments;

      // Pull mentions targeting this specific recipient. JOIN against
      // comments so we can filter on internal-ness per viewer too.
      const internalClause = viewerIsEC ? '' : ' AND c.internal = 0';
      const mentions = await env.DB.prepare(
        `SELECT c.id AS comment_id, c.question_id, c.author_email, c.author_label,
                c.body, c.created_at, c.internal
           FROM comment_mentions m
           JOIN comments c ON c.id = m.comment_id
          WHERE c.project_slug = ?1
            AND m.mentioned_email = lower(?2)
            AND m.created_at > ?3${internalClause}
          ORDER BY c.created_at ASC`
      ).bind(project_slug, email, since).all();
      const mentionRows = mentions.results ?? [];

      const totalActivity = visibleComments.length + auditRows.length;

      // Per-recipient "silent day" check — a project might have audit/public
      // activity for one viewer and only-internal activity for another. We
      // mustn't send a client an email triggered solely by internal traffic.
      // Mentions count toward activity too: even a quiet day deserves a send
      // if the viewer was explicitly mentioned.
      if (totalActivity === 0 && mentionRows.length === 0) {
        console.log(`[digest] ${project_slug} → ${email}: zero visible activity, skipping`);
        continue;
      }

      const body = composeDigest({
        projectSlug: project_slug,
        portalBase,
        comments: visibleComments,
        audit: auditRows,
        mentions: mentionRows,
      });
      const subject = subjectLine(totalActivity + mentionRows.length);
      const ok = await sendEmail(env, email, subject, body);
      console.log(`[digest] ${project_slug} → ${email}: ${ok ? 'sent' : 'failed'}`);
    }
  }
}

function subjectLine(count) {
  const noun = count === 1 ? 'item' : 'items';
  return `Daily Discovery Digest (${count} ${noun})`;
}

function questionInfo(projectSlug, questionId) {
  return questions?.[projectSlug]?.[questionId] ?? null;
}

function questionLink(portalBase, projectSlug, questionId) {
  const info = questionInfo(projectSlug, questionId);
  if (!info) return `${portalBase}/${projectSlug}`;
  return `${portalBase}/${projectSlug}/section/${info.sectionSlug}#${questionId}`;
}

function questionHeading(projectSlug, questionId) {
  const info = questionInfo(projectSlug, questionId);
  if (!info) return questionId;
  return `${questionId} — ${info.title}`;
}

function composeDigest({ projectSlug, portalBase, comments, audit, mentions = [] }) {
  const lines = [];
  lines.push(`Activity on your discovery portal in the last 24 hours.`);
  lines.push('');

  if (mentions.length > 0) {
    lines.push(`You were mentioned (${mentions.length})`);
    for (const m of mentions) {
      const tag = m.internal ? ' [INTERNAL]' : '';
      lines.push(`  • ${questionHeading(projectSlug, m.question_id)}${tag}`);
      lines.push(`    ${m.author_label} (${m.author_email}): "${clip(m.body, 200)}"`);
      lines.push(`    → ${questionLink(portalBase, projectSlug, m.question_id)}`);
      lines.push('');
    }
  }

  if (comments.length > 0) {
    lines.push(`Comments (${comments.length})`);
    for (const c of comments) {
      const tag = c.internal ? ' [INTERNAL]' : '';
      lines.push(`  • ${questionHeading(projectSlug, c.question_id)}${tag}`);
      lines.push(`    ${c.author_label} (${c.author_email}): "${clip(c.body, 200)}"`);
      lines.push(`    → ${questionLink(portalBase, projectSlug, c.question_id)}`);
      lines.push('');
    }
  }

  const responses = audit.filter((a) => a.kind === 'body');
  if (responses.length > 0) {
    lines.push(`Response edits (${responses.length})`);
    for (const a of responses) {
      lines.push(`  • ${questionHeading(projectSlug, a.question_id)}`);
      lines.push(`    edited by ${a.changed_by}`);
      lines.push(`    → ${questionLink(portalBase, projectSlug, a.question_id)}`);
      lines.push('');
    }
  }

  const statuses = audit.filter((a) => a.kind === 'status');
  if (statuses.length > 0) {
    lines.push(`Status changes (${statuses.length})`);
    for (const a of statuses) {
      lines.push(`  • ${questionHeading(projectSlug, a.question_id)}`);
      lines.push(`    ${humanStatus(a.prev_value)} → ${humanStatus(a.new_value)} (by ${a.changed_by})`);
      lines.push(`    → ${questionLink(portalBase, projectSlug, a.question_id)}`);
      lines.push('');
    }
  }

  const flags = audit.filter((a) => a.kind === 'flag');
  if (flags.length > 0) {
    lines.push(`Priority flag changes (${flags.length})`);
    for (const a of flags) {
      const what = a.new_value === '1' ? 'flagged as priority' : 'unflagged';
      lines.push(`  • ${questionHeading(projectSlug, a.question_id)}`);
      lines.push(`    ${what} by ${a.changed_by}`);
      lines.push(`    → ${questionLink(portalBase, projectSlug, a.question_id)}`);
      lines.push('');
    }
  }

  lines.push(`Open the project: ${portalBase}/${projectSlug}`);
  lines.push('');
  lines.push(`Manage your notification preferences: ${portalBase}/${projectSlug}/notifications`);

  return lines.join('\n');
}

function clip(s, max) {
  const trimmed = (s || '').replace(/\s+/g, ' ').trim();
  return trimmed.length > max ? trimmed.slice(0, max - 1) + '…' : trimmed;
}

function humanStatus(s) {
  if (!s) return '(unset)';
  return s.replace(/_/g, ' ');
}

async function sendEmail(env, to, subject, text) {
  if (!env.RESEND_API_KEY) {
    console.error('[digest] RESEND_API_KEY secret not set; skipping');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[digest] resend ${res.status} for ${to}: ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[digest] send error for ${to}:`, err);
    return false;
  }
}
