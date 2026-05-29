---
title: Runbook — Add a New Project to the Discovery Portal
generated_at: 2026-05-21
status: Active
---

# Add a new project to the Discovery Portal

End-to-end checklist for spinning up a new client project. Follow top to
bottom; nothing here requires deep app knowledge.

## Revision log

| Date       | Change |
|------------|--------|
| 2026-05-21 | Initial. Covers _meta.json fields, worksheet format, registry, build step, deploy. |
| 2026-05-21 | Added: Acme is now the canonical project template (full reference doc set). Recommend `cp -r content/projects/acme content/projects/{newslug}` as the starting point. |

---

## Recommended starting point: copy Acme

Acme is the canonical demo project and serves as the template for any new
engagement. It carries the full set of reference docs we typically produce
(technical-analysis, site-discovery, sitemap-inventory, migration-analysis,
source-documents), a worksheet skeleton, and a working comment thread.

```
cp -r content/projects/acme content/projects/{newslug}
```

Then walk through steps 1–11 below, replacing Acme-specific content as
you go. The steps describe the structure in case you want to build from
scratch or understand what each file does.

---

## 1. Pick a slug

URL-safe lowercase, 3–10 chars. Used in `/[slug]/` paths and as the
foreign key on every DB row, so **don't rename later** — pick once.

Examples: `edusa`, `acme`, `parks-mn`. Avoid generic words that might
collide with future routes (`api`, `admin`, `search`, `section`).

## 2. Create the project directory

```
content/projects/{slug}/
├── _meta.json
├── _intro.md
├── worksheet/
│   ├── A-{section-slug}.md
│   ├── B-{section-slug}.md
│   └── …
└── references/                ← optional; can be empty/omitted
    ├── technical-analysis.md
    └── …
```

## 3. Write `_meta.json`

Copy the shape below. Every field is required except `references` (which
can be `[]`).

```json
{
  "slug": "{slug}",
  "title": "Project or initiative name",
  "engagement": "Technical Discovery",
  "client": {
    "name": "Full Client Name Here",
    "label": "Short Label",
    "primary_contact": "Contact Name"
  },
  "ec_team": [
    "tim@electriccitizen.com"
  ],
  "client_emails": [],
  "client_email_domains": ["clientdomain.com"],
  "status": "Active",
  "section_order": ["A", "B", "C", "D"],
  "references": [
    { "slug": "technical-analysis", "title": "Technical Analysis" }
  ]
}
```

### Field notes

| Field | Notes |
|-------|-------|
| `slug` | Must match the directory name. |
| `title` | Project or initiative name (NOT the type of work) — appears as the prominent name in the header crumb. Examples: `EducationUSA`, `Acme Corp`. |
| `engagement` | The type of work — appears as a small chip alongside `title`. Examples: `Technical Discovery`, `Site Build`, `Maintenance & Support`. |
| `client.label` | Short form shown as the comment author label and in the auth role chip. Keep it ≤ 10 chars. |
| `ec_team` | Currently informational only; EC access is granted by `@electriccitizen.com` domain match in `src/lib/access.ts`. List here is for reference. |
| `client_emails` | Exact email allowlist. Required for `@mention` autocomplete to surface a client by name before they've posted anything (domain-only allowlists pick up participants from comment/response history once they show up). |
| `client_email_domains` | Wildcard allowlist (e.g. `iie.org`). Use this OR `client_emails`, usually both. |
| `status` | Free text. Currently displayed verbatim. |
| `section_order` | Letters matching the `id:` frontmatter values of your worksheet files. Controls section ordering on the project home + nav. |
| `references` | Can be `[]`. Reference docs are rendered from `references/{slug}.md`. |

## 4. Write `_intro.md`

Markdown. Rendered on the project home. Use `<details class="intro-section">`
for collapsible sections (existing projects show the pattern).

## 5. Write the worksheet sections

One markdown file per section in `worksheet/`. Filename `{ID}-{slug}.md`
(e.g. `A-hosting.md`). Frontmatter:

```yaml
---
id: A
title: "Hosting"
order: 1
---
```

### Question ID format — **strict**

Questions must use the pattern `{SECTION_LETTER}{NUMBER}`, where the
letter is **A–M only** (the parsers in `src/lib/worksheet.ts:43` and
`cron/build-questions.mjs:57` hardcode this range). The body of each
section uses a `### Questions for you` heading, then questions as bold
headers:

```markdown
### What we currently understand

- Paragraphs and bullets as needed.

### Questions for you

**A1. The question title here, ending in a question mark?**
- *Why we ask:* Optional rationale paragraph.

**A2. Next question?**
- **Recommendation:** Optional EC steer.
- *Why we ask:* Rationale.
```

If a section needs more than the A–M range allows, extend the regex —
don't reuse a letter. Section IDs in `_meta.json:section_order` must
match.

## 6. Register the project in `_index.json`

`content/projects/_index.json`:

```json
{
  "projects": [
    { "slug": "edusa", "active": true },
    { "slug": "{new-slug}", "active": true }
  ]
}
```

`active: false` hides the project from listings without deleting it.

## 7. Regenerate `questions.json`

The cron worker needs a flat `question_id → title` lookup for digest
deep-links and mention emails. Regenerate after any worksheet change:

```
node cron/build-questions.mjs
```

Commit `cron/questions.json` along with your worksheet changes. CI does
not regenerate this on deploy.

## 8. (Optional) Add reference documents

Drop markdown files into `references/{slug}.md` and list each in the
`references` array in `_meta.json` with a matching `slug`. They render
under `/[project]/reference/[slug]` and appear in the header dropdown.

## 9. Set up the daily digest subscribers (optional)

The digest cron only emails people who've opted in. Each subscriber sets
their own preference via `/[project]/notifications` once they have access.
You don't seed this server-side for real projects.

For a demo project, you can pre-seed digest subscriptions in a seed SQL
file (see `seed/acme.sql` for the pattern).

## 10. Verify locally

```
npm run dev
```

Open `http://localhost:4321/[slug]`. Confirm:

- Project title + sections render
- Header shows: title crumb, search box, notifications bell, presenter
  toggle (EC view only)
- A question card opens with response form, comment thread, history
- (If references exist) reference docs menu in header

Test as the client role:
```
DEV_USER_EMAIL=client@yourclient.com   # in .dev.vars
```
Reload. Internal toggle should disappear, internal comments should be
invisible, presenter toggle should disappear.

## 11. Deploy

```
npm run deploy
```

Wrangler picks up the new content files via Vite's `import.meta.glob`.
No additional configuration required.

If the project introduces a new `client_email_domains` value, no Access
configuration changes are needed — Cloudflare Access is the perimeter
(it gates `discovery.electriccitizen.com`), and the per-project access
check in `src/lib/access.ts` does the rest.

## 12. Migrations (if you've touched schema)

This step is **only** relevant if you also added a migration alongside
the project — not a normal step for vanilla project creation.

```
npx wrangler d1 execute discovery --remote --file=./migrations/000X_…sql
```

Confirm the change with a probe query before assuming success:
```
npx wrangler d1 execute discovery --remote --command="SELECT name FROM pragma_table_info('your_table');"
```

---

## Common gotchas

- **Question IDs outside A–M** silently get dropped from `questions.json`
  and won't deep-link from digests/mention emails. Build the regex
  before reaching for `N+`.
- **`_meta.json` with empty `client_emails` AND empty `client_email_domains`**
  means *no* clients can access the project. Fine for an EC-only project;
  surprising otherwise.
- **Forgetting to regenerate `questions.json`** doesn't break the app
  but causes digest/mention emails to show bare IDs instead of question
  titles and to deep-link to the project home instead of the question.
- **Reference list shape**: `references: [{ slug, title }]`. If you drop
  a file in `references/` without listing it, it's invisible.
- **The slug becomes a foreign key everywhere** (`responses.project_slug`,
  `comments.project_slug`, `audit_log.project_slug`, `notification_preferences.project_slug`).
  Renaming a slug means orphaning all that data. Don't.
