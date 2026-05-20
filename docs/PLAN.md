---
title: Discovery Portal — MVP Plan
generated_at: 2026-05-19
status: Draft (awaiting approval)
---

# Discovery Portal — MVP Plan

A lightweight client-facing app that turns a discovery worksheet into an
interactive site: client reads each question in context, types a response,
leaves comments, EC replies, status + priority tracked per question.

**MVP scope: EducationUSA only.** The content folder structure is multi-project-
ready (`content/projects/{slug}/`) so that future engagements can be added by
dropping a new project folder + adding it to the project index — no schema
changes, no refactor.

## 1. Goals

| Goal | How we'll know it's met |
|---|---|
| Replace the "Google Doc of 61 questions" UX with something the client can actually work through | Albino opens `discovery.electriccitizen.com`, sees the EdUSA worksheet, answers a question, leaves a comment, closes the tab. EC sees it. |
| EC can update question wording or add new questions by editing markdown and pushing to GitHub | `git push` → CF Pages rebuilds → client sees updated wording on next page load. Existing responses against that question persist. |
| Client and EC can have threaded back-and-forth on individual questions | Albino answers `G3`. EC replies in the comment thread. Albino refines. Thread survives page reloads. |
| Simple completion + priority tracking visible to both sides | Project page shows "answered / pending" counts. Each question has a status pill (`Not started` / `In progress` / `Answered` / `Needs clarification`) and priority pill (`High` / `Med` / `Low`). |
| Reference docs are available alongside the worksheet | Client can read `technical-analysis.md`, `site-discovery.md`, etc. inside the portal, linked from relevant questions. |
| Quick to build, hosted on infra EC already operates | ~1 day of build effort. Cloudflare Pages + D1 + Access — same stack as `reports/`. |

## 2. Architecture summary

```
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Access (email OTP) — gates discovery.ec.com      │
│   • EC team auto-allowed via @electriccitizen.com           │
│   • Client emails individually whitelisted per project      │
│   • CF injects Cf-Access-Authenticated-User-Email header    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Workers + Static Assets                          │
│   Astro 6 + @astrojs/cloudflare adapter (server output)     │
│   • Worker handles SSR + API routes                         │
│   • Static client bundle served from the ASSETS binding     │
│   • Same hosting primitive as reports/, with a Worker added │
└─────────┬────────────────────────────────────┬──────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────────────┐         ┌──────────────────────────────┐
│ content/projects/    │         │ Cloudflare D1 (SQLite)       │
│   edusa/             │         │   • responses (PK: project + │
│     worksheet/*.md   │         │     question_id)             │
│     references/*.md  │         │   • comments                 │
│   _meta.json         │         │   • audit_log (optional)     │
│ (canonical content)  │         │                              │
└──────────────────────┘         └──────────────────────────────┘
```

Content is baked into the build. Responses + comments are runtime state.
Auth is at the edge — no auth code.

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro 6.x | Same major version as `reports/`. Will run with `output: 'server'` for API routes. |
| Adapter | `@astrojs/cloudflare` | Required for SSR on Pages. |
| Hosting | Cloudflare Workers + Static Assets | `discovery.electriccitizen.com`. Same primitive as `reports/`; `reports/` is static-only, this also has a Worker for SSR. |
| Auth | Cloudflare Access (email OTP) | Same pattern as `reports/`. Zero auth code. |
| Database | Cloudflare D1 | Free tier: 5 GB, 5M reads/day, 100k writes/day. |
| Node | 22 (`.nvmrc`) | Matches `reports/`. |
| Markdown parsing | `gray-matter` + `marked` | Same as `reports/src/lib/reports.ts`. |
| CSS | Plain CSS, no framework | Match `reports/` minimalism. |
| Client JS | Vanilla / minimal | No React unless we hit a wall. |
| Deploy | Workers Builds (GH integration) | `git push` to `main` → CF rebuilds + deploys. Equivalent of Pages's GH integration on the Workers platform. |

## 4. Repo structure

```
~/projects/discovery/                          (new repo)
├── astro.config.mjs                           # output: 'server', adapter: cloudflare
├── wrangler.jsonc                             # name: discovery, D1 binding
├── package.json
├── .nvmrc                                     # 22
├── README.md
├── content/
│   └── projects/                              # multi-project ready
│       ├── _index.json                        # list of projects (for the homepage)
│       └── edusa/
│           ├── _meta.json                     # {title, client, status, ec_team[]}
│           ├── worksheet/                     # ← canonical question source
│           │   ├── A-hosting.md
│           │   ├── B-content-migration.md
│           │   ├── C-okta-auth.md
│           │   ├── D-hei-verification.md
│           │   ├── E-interactive-maps.md
│           │   ├── F-scholarships-events.md
│           │   ├── G-ai-features.md
│           │   ├── H-search.md
│           │   ├── I-integrations.md
│           │   ├── J-domain-launch.md
│           │   ├── K-source-control.md
│           │   ├── L-live-site-discovery.md
│           │   └── M-forms.md
│           └── references/                    # ← copied from edusa repo
│               ├── technical-analysis.md
│               ├── site-discovery.md
│               ├── sitemap-inventory.md
│               ├── migration-analysis.md
│               └── source-documents.md
├── migrations/
│   └── 0001_init.sql                          # D1 schema
├── scripts/
│   └── sync-references.mjs                    # one-way: edusa/docs → discovery/.../references
├── src/
│   ├── lib/
│   │   ├── worksheet.ts                       # parse section markdown → questions
│   │   ├── projects.ts                        # load _meta.json + _index.json
│   │   └── db.ts                              # D1 query helpers
│   ├── components/
│   │   ├── QuestionCard.astro                 # static shell
│   │   ├── ResponseForm.client.ts             # debounced autosave textarea
│   │   ├── CommentThread.client.ts            # comment list + form
│   │   └── StatusPill.client.ts               # status + priority selectors
│   ├── pages/
│   │   ├── index.astro                        # project picker (MVP: just edusa)
│   │   ├── [project]/
│   │   │   ├── index.astro                    # worksheet overview + completion %
│   │   │   ├── section/[slug].astro           # one section view
│   │   │   ├── question/[id].astro            # deep link to single question
│   │   │   └── reference/[slug].astro         # render a reference doc
│   │   └── api/
│   │       └── projects/[project]/questions/[id]/
│   │           ├── response.ts                # GET, PATCH
│   │           ├── comments.ts                # GET, POST
│   │           └── status.ts                  # PATCH (status + priority)
│   └── styles/
│       └── global.css
└── docs/
    ├── PLAN.md                                # this file
    ├── runbook.md
    └── adr/                                   # decisions worth preserving
```

## 5. Content model — questions as markdown

Each section gets one markdown file under `content/projects/edusa/worksheet/`,
named `{letter}-{slug}.md`. Frontmatter carries section metadata; questions
are `##` second-level headings parsed at build time.

```markdown
---
id: G
title: AI Features
order: 7
---

## Intro

What we currently understand: …

## Questions

### G1. Confirm AI-summarization budget posture

**Why we ask:** The LOA scopes AI summarization at $X; we want to confirm
that's still the budget envelope before we spec providers.

**Expected format:** "yes, proceed" / "yes, with these adjustments" / "let's discuss."

### G2. Which provider family is acceptable?

**Why we ask:** …

**Expected format:** …
```

Parser logic (`src/lib/worksheet.ts`):
1. Glob `content/projects/{project}/worksheet/*.md`.
2. Parse frontmatter for section metadata.
3. Split body on `### ` headings inside the "Questions" section.
4. Extract question ID (`G1`), title, body, `**Why we ask:**` paragraph,
   `**Expected format:**` paragraph.

## 6. Reference docs — relationship with the edusa repo

The 5 EdUSA reference docs (`technical-analysis`, `site-discovery`,
`sitemap-inventory`, `migration-analysis`, `source-documents`) live canonically
in `~/projects/edusa/docs/`. The discovery portal needs them too — but the
portal repo should be self-contained for deployment.

**Convention: one-way copy, edusa → discovery.**

- `~/projects/edusa/docs/*.md` remains the **canonical source** for those 5
  docs. Edit them in the edusa repo when content changes.
- `~/projects/discovery/content/projects/edusa/references/*.md` is a **copy**,
  refreshed via `scripts/sync-references.mjs` whenever the edusa-side
  originals change.
- The portal **only reads** from its own `references/` folder — it doesn't
  reach into the edusa repo at runtime or build time.

For MVP this is a manual sync (run the script before committing if you've
updated reference docs). If we end up doing this constantly, post-MVP we can
move to a `reports/`-style GH Actions sync (pull from a `sources.json`-listed
edusa branch every 5 min).

**Note on `discovery-worksheet.md`:** This file in `edusa/docs/` was the
pre-portal canonical question delivery. Once the portal is live and the
worksheet is split into 13 `worksheet/*.md` section files, the portal's
section files become canonical — the original `edusa/docs/discovery-worksheet.md`
should be marked "superseded — see discovery portal" with a banner, or
deleted. (Decision deferred to Phase 4.)

## 7. Data model — D1 schema

```sql
-- migrations/0001_init.sql

CREATE TABLE responses (
  project_slug  TEXT NOT NULL,            -- e.g. 'edusa'
  question_id   TEXT NOT NULL,            -- e.g. 'A1', 'G3'
  body          TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'not_started',
                                          -- not_started | in_progress | answered | needs_clarification
  priority      TEXT NOT NULL DEFAULT 'medium',
                                          -- high | medium | low
  updated_at    TEXT NOT NULL,            -- ISO8601
  updated_by    TEXT NOT NULL,            -- email from CF Access header
  PRIMARY KEY (project_slug, question_id)
);

CREATE TABLE comments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug  TEXT NOT NULL,
  question_id   TEXT NOT NULL,
  author_email  TEXT NOT NULL,            -- from CF Access header
  author_label  TEXT NOT NULL,            -- 'EC' or 'IIE' — derived from email domain
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE INDEX idx_comments_question ON comments(project_slug, question_id, created_at);
```

No `users` or `sessions` table — Cloudflare Access is the identity layer.
`updated_by` and `author_email` are populated from
`Cf-Access-Authenticated-User-Email` request header.

**Author label rule:** emails ending in `@electriccitizen.com` → `EC`,
everything else → label from project's `_meta.json` (`IIE` for EdUSA).

## 8. Routes

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Project picker. MVP: lists just EdUSA. |
| `/[project]` | GET | Project overview: section list, completion %, priority breakdown. |
| `/[project]/section/[slug]` | GET | One section: intro + question cards. |
| `/[project]/question/[id]` | GET | Deep link to single question (for sharing a thread). |
| `/[project]/reference/[slug]` | GET | Render a reference doc (e.g., `technical-analysis`). |
| `/api/projects/[project]/questions/[id]/response` | GET, PATCH | Get or update response. PATCH is debounced autosave. |
| `/api/projects/[project]/questions/[id]/comments` | GET, POST | List or add comments. |
| `/api/projects/[project]/questions/[id]/status` | PATCH | Update status + priority. |

Every API route reads `Cf-Access-Authenticated-User-Email` to attribute writes.
Missing header → 401 (defense-in-depth — shouldn't happen behind Access).

## 9. Auth — Cloudflare Access setup

In CF Zero Trust dashboard:

1. Add application: `discovery.electriccitizen.com`
2. Policy 1 (Allow): emails ending `@electriccitizen.com` → Google SSO
3. Policy 2 (Allow): per-project client email list (EdUSA: Albino + designated IIE staff) → One-Time PIN
4. Session duration: 24 h

No app-side auth code. Access enforces at the edge.

## 10. Deployment

We're on **Cloudflare Workers + Static Assets** (not the legacy Pages product).
The Astro adapter emits a deployable Worker + static asset bundle on build;
`wrangler deploy --config dist/server/wrangler.json` ships it.

For routine deploys we use **Workers Builds**, Cloudflare's git-connected build
service (the Workers equivalent of the old Pages GH integration). `git push` to
`main` triggers a build + deploy in the Cloudflare dashboard.

1. Create GH repo `electriccitizen/discovery`, push initial scaffold.
2. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git → pick repo:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy --config dist/server/wrangler.json`
   - Root directory: `/`
3. Create D1: `npx wrangler d1 create discovery` → paste the `database_id`
   into root `wrangler.jsonc` under `d1_databases` (binding `DB`).
4. Run migration: `npx wrangler d1 execute discovery --file migrations/0001_init.sql --remote`
5. Custom domain: in the Worker's settings → Triggers → Custom Domains →
   add `discovery.electriccitizen.com`.
6. Cloudflare Access (Zero Trust) → Applications → Add self-hosted app for
   `discovery.electriccitizen.com`.

Subsequent updates: edit MD → `git push` → Workers Builds rebuilds in ~60s.

Manual deploy from local (for emergencies / debugging):
```bash
npm run build && npx wrangler deploy --config dist/server/wrangler.json
```

## 11. Build sequence (phased)

**Phase 0 — Scaffold + deploy hello world (1 hr)**
- Hand-rolled Astro 6 scaffold (skipping `npm create astro@latest` because
  `content/`, `docs/`, and `src/` subdirs are pre-staged from PLAN work).
- Dependencies: `astro@^6.3.1`, `@astrojs/cloudflare@^13.5.2`, `gray-matter`,
  `marked`; devDep `wrangler@^4.83`.
- `output: 'server'` + Cloudflare adapter; `wrangler.jsonc` carries bindings,
  adapter generates `dist/server/wrangler.json` for deploy.
- Push to GH; wire Workers Builds → repo; deploy hello world to
  `discovery.electriccitizen.com`.
- Configure CF Access (EC team only at this point).

**Phase 1 — Read-only worksheet + reference docs (2.5 hr)**
- Split `references/discovery-worksheet.md` into 13 section files under `worksheet/`
- Build `src/lib/worksheet.ts` parser
- Build `src/lib/projects.ts` (load `_index.json` + `_meta.json`)
- Implement `/`, `/[project]`, `/[project]/section/[slug]`, `/[project]/reference/[slug]` — all static, no D1
- Visual styling pass

**Phase 2 — Responses (2 hr)**
- Create D1, run migrations, wire `wrangler.jsonc` binding
- Build `ResponseForm.client.ts` (textarea + debounced autosave)
- `/api/projects/[project]/questions/[id]/response` endpoint
- Status + priority pills + `/api/projects/[project]/questions/[id]/status` endpoint

**Phase 3 — Comments (1.5 hr)**
- `CommentThread.client.ts`
- `/api/projects/[project]/questions/[id]/comments` endpoint
- EC vs. IIE styling on bubbles

**Phase 4 — Polish + client onboard (1 hr)**
- Project overview completion meter + priority breakdown
- Add Albino + designated IIE emails to CF Access
- Send Albino a one-liner: URL + how OTP works
- Mark `edusa/docs/discovery-worksheet.md` as superseded (banner pointing at portal)
- Write `scripts/sync-references.mjs` for future doc edits

**Total: ~8 hours of focused work.** A solid day, plausibly compressed if uninterrupted.

## 12. Open questions / risks

- **Albino's tech comfort with email OTP:** Email OTP is standard but not zero-friction. Worth a 2-min screen-share walkthrough on first session.
- **Response export to a "discovery findings" doc:** At some point EC will want to extract responses to a final doc. Out of MVP scope — `/api/state` (or direct SQL) is enough for now.
- **Mobile UX:** Not a primary use case (clients respond at desks) but shouldn't be broken. Phase 1 styling should handle it.
- **Concurrent edit conflicts:** Last-write-wins on responses. Acceptable for MVP given the usage pattern (typically one author per section). Documented in README.
- **Reference doc sync:** Manual `scripts/sync-references.mjs` for MVP. If we end up running it often, post-MVP move to cron'd GH Actions like `reports/`.
- **`discovery-worksheet.md` fate post-launch:** Two options — (a) delete from edusa repo since portal is canonical, or (b) leave with "superseded" banner pointing at portal. Recommend (b) for safety; trivial to switch.

## Revision Log

| Date | Change |
|---|---|
| 2026-05-19 | Initial draft (saved to edusa/docs). Architecture + 4-phase build. Decisions: CF Access OTP, single-worksheet (no day-1 template), threaded comments. |
| 2026-05-19 | Moved canonical PLAN to `~/projects/discovery/docs/`. Updated §4 repo structure to `content/projects/{slug}/` multi-project layout. Added §6 on edusa↔discovery reference-doc sync convention (one-way copy via `scripts/sync-references.mjs`). Added `/[project]/reference/[slug]` route. Added `project_slug` to D1 schema. Phase 1 now includes reference-doc rendering. |
| 2026-05-19 | Phase 0 scaffold landed. Pivoted hosting from Cloudflare Pages to Cloudflare Workers + Static Assets — same primitive `reports/` rides on, current direction of CF's hosting story, and the only path `@astrojs/cloudflare@13.x` (Astro 6 era) supports cleanly. §2 architecture, §3 stack, §10 deployment, §11 Phase 0 updated accordingly. No app-code or schema impact. |
