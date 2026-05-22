---
title: Discovery Portal — @Mention Comments
generated_at: 2026-05-21
status: Draft (not started)
---

# @Mention functionality for comments

Let users type `@` in a comment to autocomplete a project participant, then send
that person an immediate email notification when the comment is saved.

## Context

- No user accounts exist. Identity = Cloudflare Access email header.
- Mentionable set per project = EC team (`@electriccitizen.com`) +
  `client_emails` / `client_email_domains` from project config.
- Comments today store `author_email` + `author_label` + `body`. UI shows raw
  email — no display names anywhere.
- Resend is wired up but **only** in the daily digest cron worker
  (`cron/digest.mjs`). The main worker has never called Resend.

## Open design decisions (resolve before building)

1. **Storage format for mentions in body**
   - Option A: store as `@email@domain.com` literal — ugly but unambiguous, no
     lookup needed.
   - Option B: store as `@handle`, resolve via a names table — prettier,
     more moving parts.
   - **Recommendation: A**. Render-time pretty-print to display name if we have
     one, else email prefix.

2. **Instant email vs. digest-only**
   - Instant is the expected UX. Adds latency to comment POST + hard dep on
     Resend. Wrap in try/catch; never fail the comment on email failure.
   - **Recommendation: instant + still surface in digest as backup.**

3. **Mention preferences**
   - Does existing `daily_digest` opt-out also suppress mention emails?
   - **Recommendation: no — mentions are always-on.** They're explicitly
     addressed to you; opt-out belongs to digest-style noise.

4. **Display names**
   - Cheapest: derive from email prefix (`tim@…` → `tim`).
   - Proper: add optional `display_name` per email in project config + EC
     roster.
   - **Recommendation: start with email prefix, add display names later if it
     feels rough.**

5. **Off-roster mentions** (typing `@somebody-not-on-the-project`)
   - **Recommendation: silently drop on POST** (parse only mentions that match
     the mentionable set). Friendlier than rejecting the comment.

## Work breakdown

### 1. Mentionable users API (small)
- New endpoint: `GET /api/projects/[project]/mentionable`
- Returns `[{email, label, role}]` for everyone allowed to be mentioned.
- Source: project config (`client_emails` + `client_email_domains` → expand
  domains to known EC roster) + hardcoded/configured EC roster.
- Needs an EC roster source. Options:
  - Hardcode in `src/lib/access.ts` or a new `src/lib/roster.ts`.
  - Pull from a new D1 table.
- **Recommendation: hardcoded roster file.** Tiny team, rarely changes.
- Auth: same `requireUser()` as other project endpoints.

### 2. Autocomplete UI in CommentThread (medium — the trickiest piece)
- Edit `src/components/CommentThread.astro` + `src/scripts/discovery.ts`.
- Detect `@` keystroke in textarea, capture the partial token after it.
- Render a floating list anchored to the caret position.
- Keyboard nav: ↑/↓ to move, Enter/Tab to select, Esc to dismiss.
- Click-outside dismiss.
- On select: replace the partial token with `@email` form.
- Cache the mentionable list per session (it's small + stable per page load).
- Edge cases to handle: `@` mid-word (don't trigger), email already in body
  (still allow), backspacing through the trigger.

### 3. Parse + persist mentions on POST (small)
- New table:
  ```sql
  CREATE TABLE comment_mentions (
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    mentioned_email TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (comment_id, mentioned_email)
  );
  CREATE INDEX idx_mentions_email ON comment_mentions(mentioned_email, created_at);
  ```
- Migration file: `migrations/0002_comment_mentions.sql`.
- In `src/lib/db.ts addComment()`: after insert, regex-extract emails from body,
  filter against mentionable set for this project, insert rows.

### 4. Send notification email (small)
- New helper: `src/lib/email.ts` — `sendMentionEmail({to, project, question, author, bodyExcerpt, deepLink})`.
- Calls Resend; uses `RESEND_API_KEY` secret (already exists, but currently only
  bound to the cron worker — needs to be added to main worker's `wrangler.toml`
  too).
- Subject: `[Discovery: {ProjectLabel}] {Author} mentioned you on "{QuestionTitle}"`.
- Plain text body. Deep link should hit the question anchor.
- Called from the comments POST handler after successful insert.
- Wrap in try/catch + `console.error`; never fail the comment.
- Don't email the author if they mentioned themselves. Don't email twice if same
  person mentioned multiple times.

### 5. Daily digest update (trivial)
- In `cron/digest.mjs`, when composing the digest for an email, surface any
  `comment_mentions` rows targeting that recipient in the last 24h with a
  "You were mentioned" section at the top.

## Risks / unknowns

- **Caret-anchored autocomplete in a textarea**: classic browser pain point.
  Will probably need a mirror-div technique to compute caret pixel coords. Worst
  case fallback: show the autocomplete docked to the bottom of the textarea
  (less slick but no caret math).
- **Resend secret in main worker**: confirm `wrangler secret put` against the
  main worker, not just cron. Don't assume it's already there.
- **Email deliverability**: instant emails from `noreply@electriccitizen.com`
  are already proven via the digest, so no new domain/SPF/DKIM work expected.
- **Cost / rate limits**: tiny user base, unlikely to matter.

## Out of scope (explicitly)

- In-app notification center / unread badges.
- Mention notifications via anything other than email (no Slack, no SMS).
- Editing/deleting mentions after the fact (comments are append-only today;
  keep it that way).
- Cross-project mentions.
- Group mentions (`@ec`, `@all`).

## Rough effort estimate

| Step | Estimate |
|------|----------|
| 1. Mentionable API + roster | 1–2 hr |
| 2. Autocomplete UI | 3–5 hr (caret positioning is the wildcard) |
| 3. Mention parse + persist + migration | 1 hr |
| 4. Email helper + main-worker Resend binding | 1–2 hr |
| 5. Digest surface | 30 min |
| **Total** | **~1 focused day** |
