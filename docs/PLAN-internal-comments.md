---
title: Discovery Portal — Internal (EC-only) Comments
generated_at: 2026-05-21
status: Draft (not started)
---

# Internal (EC-only) comments

Let EC team members post comments on any question that **clients can never
see**. Bonus: a presenter toggle to hide them from the EC view too, for Zoom
screen-sharing.

## Context

- Auth model already classifies the requester as `ec` or `client`
  (`src/lib/access.ts`).
- Every existing comment row already carries an `author_label` of `EC` or
  `Client`, so we already distinguish authorship — we just don't distinguish
  *audience*.
- Comments are append-only. Internal comments inherit that — no edit, no
  delete.

## Hard rule (drives every design decision)

**Clients can NEVER see that an internal comment exists.** No placeholder, no
row count, no "EC team added a private note" hint, no entry in any audit-log
view a client can reach, no mention in their daily digest. Total opacity.

This is a server-side guarantee, not a UI guarantee. Every read path filters by
role.

## Open design decisions

1. **Composer UX**
   - Option A: checkbox "Internal (EC only)" next to the submit button.
   - Option B: separate tab / segmented control ("Reply" vs "Internal note").
   - **Recommendation: A.** One composer, one checkbox, with strong visual
     feedback when the checkbox is on (e.g., textarea border + background turns
     amber, submit button label changes to "Post internal note"). Less surface
     area than two composers, and the styling shift makes accidents obvious.

2. **Default state of the checkbox**
   - Off (safe default — public comment unless you opt in).
   - **Recommendation: off**, reset every page load (don't remember last state
     — a sticky default is exactly how someone posts a client-visible comment
     thinking it was internal, or vice versa).

3. **Visual treatment of internal comments in the thread**
   - Yellow/amber background, "INTERNAL" badge, lock icon. Goal: impossible
     to confuse with a client-visible comment at a glance.
   - **Recommendation: badge + tinted background + left border accent.**
     Belt-and-braces because the failure mode (treating an internal as public)
     is bad.

4. **Presenter ("hide internal") toggle**
   - (a) Button in page header that toggles a `data-hide-internal` attribute
     on `<body>`; CSS hides internal comments. State in `localStorage` so it
     persists across navigation. Keyboard shortcut e.g. `Shift+H`.
   - (b) Same as (a) but framed as a broader "Presenter mode" that also hides
     any other EC-only UI we add later.
   - (c) Auto-detect screen-share via `navigator.mediaDevices`.
   - **Recommendation: (a) now, upgrade to (b) when more EC-only chrome
     accumulates.** Skip (c) — unreliable across browsers + Zoom configs.

5. **Indicator that presenter mode is on**
   - When hide-internal is active, EC users should see a persistent badge
     somewhere (header chip: "Presenting — internal hidden"). Otherwise it's
     easy to forget it's on and wonder where your notes went.
   - **Recommendation: yes, persistent header chip while active.**

## Work breakdown

### 1. Data + migration (small)
- Migration file: `migrations/0002_comments_internal.sql` (or `0003_` if the
  mentions plan landed first).
  ```sql
  ALTER TABLE comments ADD COLUMN internal INTEGER NOT NULL DEFAULT 0;
  CREATE INDEX idx_comments_internal ON comments(project_slug, question_id, internal, created_at);
  ```
- Update `src/lib/db.ts` types + `addComment()` to accept `internal: boolean`.

### 2. Server enforcement (small — but the security boundary)
- `POST /api/projects/[project]/questions/[id]/comments`:
  - Accept optional `internal: boolean` in body.
  - If `internal === true` and requester role ≠ `ec`: **400 reject**, don't
    silently coerce. Silent coercion would hide UI bugs.
- `GET /api/projects/[project]/questions/[id]/comments`:
  - `WHERE (internal = 0 OR :role = 'ec')`.
- `listAllComments()` (digest path): add a `includeInternal` param; cron passes
  it based on subscriber's role.
- Any other path that surfaces comments or comment counts to a client must
  apply the same filter. Audit by grepping for `comments` table references
  before merging.

### 3. Composer UI (small)
- Edit `src/components/CommentThread.astro`:
  - Server-render the "Internal (EC only)" checkbox **only when the requester
    is `ec`** (don't ship the markup to clients at all).
- Edit `src/scripts/discovery.ts`:
  - When checkbox checked: amber border on textarea, submit label →
    "Post internal note", reset on submit.
  - Send `internal: true` in POST body when checked.

### 4. Thread rendering (small)
- In `CommentThread.astro`, when rendering a comment, branch on `c.internal`:
  - Amber/yellow background, left border accent, "INTERNAL" badge with lock
    icon next to author info.
- Internal comments only appear in the rendered HTML when the requester is EC
  (server already filtered them out for clients).

### 5. Presenter toggle (small)
- Add a button in the project page header (or a global header partial),
  visible only to EC: "Hide internal" / "Show internal".
- Clicking toggles `document.body.dataset.hideInternal` and writes to
  `localStorage` under a key like `discovery.presenter.hideInternal`.
- CSS: `body[data-hide-internal] .comment--internal { display: none }`.
- On page load, read `localStorage` and apply.
- Keyboard shortcut: `Shift+H` (document-level listener, ignore when focus is
  in a textarea/input).
- When active, show a persistent header chip: "Presenting · internal hidden".

### 6. Digest split (small)
- `cron/digest.mjs`:
  - When composing per-recipient, look up the recipient's role.
  - EC subscribers: include internal comments (consider tagging them
    "[INTERNAL]" in the digest body for clarity).
  - Client subscribers: skip internal comments entirely — and if a project's
    only 24h activity was internal, that project is "silent" for that client
    (digest skipped entirely, matching existing behavior).

## Interactions with the @mentions plan (if both ship)

- **Mentionable set inside an internal comment = EC roster only.** The
  autocomplete must not offer client emails when the Internal checkbox is on.
- Server: if a comment has `internal=1`, drop any mention rows targeting
  non-EC emails before persisting.
- Mention notification emails for internal comments only go to EC addresses —
  enforced at the email-send step, not just at parse.

## Risks / unknowns

- **Read-path leak**: any new endpoint or view that touches comments must
  apply the role filter. Easy to miss when adding future features. Mitigation:
  helper function `listVisibleComments(role, ...)` in `src/lib/db.ts` so the
  filter is centralized — no raw `SELECT * FROM comments` in handlers.
- **Stale toggle state**: if a user enables presenter mode and forgets,
  internal notes are invisible until toggled off. The persistent header chip
  mitigates.
- **Existing comments**: all backfill to `internal=0` via the DEFAULT — no
  data migration needed.

## Out of scope (explicitly)

- Per-comment visibility scopes beyond binary EC/client (no "share with this
  one client user only").
- Converting a public comment to internal (or vice versa) after posting.
- Internal-only **questions** or sections — internal-ness is per comment, not
  per question.
- Internal comments as DMs between EC team members on a specific topic — same
  thread, just hidden from clients.

## Rough effort estimate

| Step | Estimate |
|------|----------|
| 1. Migration + db.ts plumbing | 30 min |
| 2. Server enforcement (POST + GET + listAllComments) | 1 hr |
| 3. Composer UI (checkbox + visual feedback) | 1 hr |
| 4. Thread rendering (badge + styling) | 30 min |
| 5. Presenter toggle (button + CSS + shortcut + chip) | 1 hr |
| 6. Digest split | 30 min |
| **Total** | **~half a day** |
