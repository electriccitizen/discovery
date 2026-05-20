# Daily digest cron worker

Generated 2026-05-20.

Standalone Cloudflare Worker that fires once per day, summarizes the
prior 24 hours of activity per project, and emails opted-in subscribers
via Resend. **Zero activity in a 24-hour window → no email sent.**

## Files

| File | Purpose |
| --- | --- |
| `digest.mjs` | The Worker. Exports `scheduled` and a debug `/__run` fetch handler. |
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

After deploy, dry-run the digest logic without waiting for the cron:

```bash
# Replace dummy-token with the Cloudflare Access service token if needed,
# or temporarily flip workers_dev to true in wrangler.jsonc and redeploy.
curl https://discovery-digest.electriccitizen.workers.dev/__run
```

Watch logs in real time:

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
