// Daily digest cron worker. Fires once per day (see wrangler.jsonc), walks
// every project that has at least one daily_digest subscriber, and — only
// if there was activity in the last 24h — sends a per-subscriber digest
// via Resend. Zero activity = no email. Quiet days stay quiet.

import questions from './questions.json';

const DEFAULT_PORTAL_BASE = 'https://discovery.electriccitizen.com';
const FROM = 'EC Discovery Portal <noreply@electriccitizen.com>';

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(run(env));
  },

  // A fetch handler so we can manually trigger the digest while testing.
  // Reachable only when workers_dev is temporarily flipped on in wrangler.jsonc.
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname !== '/__run') {
      return new Response('not found', { status: 404 });
    }
    ctx.waitUntil(run(env));
    return new Response('digest run scheduled', { status: 202 });
  },
};

async function run(env) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const portalBase = env.PORTAL_BASE_URL || DEFAULT_PORTAL_BASE;

  const projects = await env.DB.prepare(
    'SELECT DISTINCT project_slug FROM notification_preferences WHERE daily_digest = 1'
  ).all();

  for (const { project_slug } of projects.results ?? []) {
    const comments = await env.DB.prepare(
      `SELECT question_id, author_email, author_label, body, created_at
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
    const totalActivity = commentRows.length + auditRows.length;

    if (totalActivity === 0) {
      console.log(`[digest] ${project_slug}: zero activity in 24h, skipping send`);
      continue;
    }

    const subs = await env.DB.prepare(
      'SELECT email FROM notification_preferences WHERE project_slug = ?1 AND daily_digest = 1'
    ).bind(project_slug).all();

    const subscribers = (subs.results ?? []).map((r) => r.email);
    const body = composeDigest({ projectSlug: project_slug, portalBase, comments: commentRows, audit: auditRows });
    const subject = subjectLine(totalActivity);

    for (const email of subscribers) {
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

function composeDigest({ projectSlug, portalBase, comments, audit }) {
  const lines = [];
  lines.push(`Activity on your discovery portal in the last 24 hours.`);
  lines.push('');

  if (comments.length > 0) {
    lines.push(`Comments (${comments.length})`);
    for (const c of comments) {
      lines.push(`  • ${questionHeading(projectSlug, c.question_id)}`);
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
