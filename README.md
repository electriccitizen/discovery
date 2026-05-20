# Discovery Portal

A lightweight client-facing app for working through technical discovery
worksheets interactively — replacing the "Google Doc of 60+ questions" UX
with something a client can actually engage with: response fields, threaded
comments, per-question status + priority, completion tracking, and inline
links to supporting reference docs.

**Status:** Pre-MVP scaffold. See [`docs/PLAN.md`](docs/PLAN.md) for the full
build plan.

**Live:** `https://discovery.electriccitizen.com` *(not yet deployed)*

## What this is

- **Astro 6 + Cloudflare Workers (Static Assets)** with edge SSR via the
  `@astrojs/cloudflare` adapter, server output mode
- **Cloudflare D1** for runtime state (responses, comments, status)
- **Cloudflare Access (email OTP)** for client auth — no in-app login code
- **Markdown-driven content**: edit a `.md` file → `git push` → Workers Builds
  rebuilds → client sees the change

Same hosting primitive as [`~/projects/reports/`](../reports/), different
shape: reports/ is static-only; discovery adds a Worker for SSR + API routes
that hit D1.

## Multi-project layout

```
content/projects/
├── _index.json                          # list of projects shown on home page
└── edusa/                               # one folder per engagement
    ├── _meta.json                       # title, client, EC team, status
    ├── worksheet/                       # canonical questions for this project
    │   ├── A-hosting.md
    │   ├── B-content-migration.md
    │   └── ... (13 section files)
    └── references/                      # supporting docs (read-only)
        ├── technical-analysis.md
        ├── site-discovery.md
        ├── sitemap-inventory.md
        ├── migration-analysis.md
        └── source-documents.md
```

For MVP only the `edusa` project exists. Future projects: drop a new folder
and add it to `_index.json` — no schema changes.

## Reference docs ↔ source repos

The `references/` folder holds **copies** of canonical docs that live in the
project's own source repo (for EdUSA: `~/projects/edusa/docs/*.md`).

**Convention: one-way copy from source repo → discovery.**

When the source-repo docs change:

```bash
node scripts/sync-references.mjs --project edusa --source ~/projects/edusa/docs
```

*(Script not yet written — Phase 4 task. Until then, copy manually.)*

Do **not** edit reference docs directly inside this repo — your changes will
be overwritten on the next sync. Edit in the source repo, then sync.

The discovery portal **never reaches into the source repo at runtime or build
time** — it only reads from its own bundled `content/`.

## Roles

| Domain | Maps to | What they can do |
|---|---|---|
| `@electriccitizen.com` | `EC` | Read everything, comment, edit questions (via PR), update status/priority |
| Per-project allowlist (`_meta.json#client_emails`) | `IIE` (or other client label) | Read assigned project, write responses, comment |

Cloudflare Access enforces the gate at the edge. Every API request carries
`Cf-Access-Authenticated-User-Email` — the app trusts this header because the
route is unreachable without Access.

## Quick start

*(Once Phase 0 is complete — not yet runnable.)*

```bash
nvm use                        # Node 22
npm install
npm run dev                    # localhost:4321
npm run build
npm run preview
```

D1 setup:

```bash
npx wrangler d1 create discovery
# Add the binding to wrangler.jsonc, then:
npx wrangler d1 execute discovery --file migrations/0001_init.sql --remote
```

## Deployment

GitHub → **Workers Builds** (Cloudflare's git-connected build service for
Workers, equivalent of Pages's GH integration). `git push` to `main` triggers
a rebuild and deploy in ~60s. No GH Actions needed.

Manual deploy from local:

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```

See `docs/PLAN.md` §10 for the full deploy checklist.

## Repo conventions

- **Documentation lives in `docs/`** — `PLAN.md`, runbook, ADRs
- **Canonical question content lives in `content/projects/{slug}/worksheet/`**
- **Runtime state (responses, comments) lives in D1**, never in markdown
- **No emojis in source files** unless explicitly requested
- **Markdown for all docs**, follow CommonMark; tables OK
