# Daily digest cron worker

Generated 2026-05-20.

Standalone Cloudflare Worker that fires once per day, summarizes the
prior 24 hours of activity per project, and emails opted-in subscribers
via Resend. **Zero activity in a 24-hour window → no email sent.**

## Files

| File | Purpose |
| --- | --- |
| `digest.mjs` | The Worker. Exports `scheduled` only — no public HTTP surface. |
| `wrangler.jsonc` | Worker config: name `discovery-digest`, cron `0 11 * * *`, D1 binding to the shared `discovery` database. |
| `build-questions.mjs` | Pre-build step. Walks `/content/projects/*/worksheet/*.md` and writes `questions.json` (question_id → title, section info). The digest worker imports this to surface real question titles and deep links in the email instead of bare `A1`-style IDs. |
| `questions.json` | Generated. **Re-run `build-questions.mjs` whenever you edit worksheet markdown content, then redeploy.** |

## Before every deploy

```bash
cd cron
node build-questions.mjs
npx wrangler deploy
```

The `build-questions.mjs` step is fast (~50ms) and ensures the email digest reflects any worksheet edits since the last deploy. If you forget, deploys still work — the email will just fall back to bare question IDs for any new/renamed questions.

## Cron schedule

`0 11 * * *` (UTC) — 11:00 UTC daily.

- 6 AM Central Daylight Time (most of the year)
- 5 AM Central Standard Time (early Nov – early Mar)

Cloudflare Cron Triggers are UTC-only, so the wall-clock time shifts by
one hour at DST boundaries. Adjust the cron expression in
`wrangler.jsonc` to retune.

## One-time setup

### 1. Resend account + API key

1. Sign up at <https://resend.com>. Free tier covers 100 emails/day,
   3,000/mo — well above what this digest will send.
2. Add `electriccitizen.com` as a verified domain. Resend will give you
   3 DNS records (SPF TXT, DKIM CNAME, optionally a return-path MX).
3. Add those records to the `electriccitizen.com` zone in Cloudflare
   DNS. Verify in Resend.
4. Generate a server API key (full sending scope) and copy it.

### 2. Deploy the worker

```bash
cd cron
npx wrangler deploy
```

This creates the `discovery-digest` worker in Cloudflare, registers the
cron trigger, and binds the shared D1 database.

### 3. Set the Resend API key as a secret

```bash
cd cron
npx wrangler secret put RESEND_API_KEY
# paste the key when prompted
```

The secret is encrypted at rest and only readable by the worker at
runtime.

### 4. (Optional) Override the portal base URL

```bash
npx wrangler secret put PORTAL_BASE_URL
# paste e.g. https://discovery.electriccitizen.com
```

Defaults to `https://discovery.electriccitizen.com` if not set.

## Manual test

The worker has no public HTTP surface. Two ways to fire the digest on
demand:

**1. Cloudflare dashboard** — open the `discovery-digest` worker →
Triggers → Cron Triggers → click the "Trigger" button next to the cron
expression. Runs the deployed handler against real D1, real Resend.
Easiest for a one-off.

**2. Local wrangler dev** — fires the `scheduled` handler locally.
Defaults to local D1 (won't see prod data) unless you pass `--remote`:

```bash
cd cron
npx wrangler dev --test-scheduled --remote
# in another terminal:
curl 'http://localhost:8787/__scheduled?cron=0+11+*+*+*'
```

`--remote` sends real emails to real subscribers — use sparingly.

Watch logs from the deployed worker in real time:

```bash
npx wrangler tail discovery-digest
```

The handler logs `[digest] <project>: zero activity in 24h, skipping send`
or `[digest] <project> → <email>: sent` for every project it touches.

## Behaviour

1. Find every distinct `project_slug` in `notification_preferences` that
   has at least one `daily_digest = 1` subscriber.
2. For each project, query `comments` and `audit_log` for rows newer
   than `now() - 24h`. `audit_log.kind = 'notification_pref'` is
   excluded (people don't need their own preference toggles echoed back).
3. If `comments.length + audit.length == 0` → log + skip, no email.
4. Otherwise, fetch the subscriber list and send one email per
   subscriber, grouped by activity kind (comments, response edits,
   status changes, priority flag changes).

## Rollback

To stop the cron entirely without removing the worker:

```bash
# Comment out the "triggers" block in wrangler.jsonc and redeploy.
cd cron && npx wrangler deploy
```

To remove the worker outright:

```bash
npx wrangler delete --name discovery-digest
```

The `notification_preferences` table and `notification_pref` audit
entries are harmless if left in place — they just won't drive any sends.
