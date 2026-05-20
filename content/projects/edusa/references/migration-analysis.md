# EducationUSA Rebuild — Migration Analysis

> **Generated:** 2026-05-14
> **Companion to:** `technical-analysis.md`, `source-documents.md`
> **Premise:** Working assumption is that **we will not get backend or DB access** to the current `educationusa.state.gov` site. This doc analyzes what that means for content migration and what hidden-data risks exist that scraping cannot resolve.


## 1. Premise and contractual framing

**LOA Att. B Scope of Work — migration language:**
> *"Contractor will handle migration of existing content from educationusa.state.gov site via 'scraping tools.' IIE will review content and reuse/repurpose as needed on new educationusa.org site, providing new content to Contractor when/where necessary."*

**EC proposal assumption (p. 22):**
> *"Manual migration may be required of the client if automated migration is not possible."*

**RFP Q&A clarifications:**
- *"IIE more than likely will not have access to the back end of the current website."*
- *"We are looking at a mix of manually importing content and creating brand new content for the new website."*
- *"Most content that is on the current website will be retained but IIE is in the process of doing an inventory of current content."*
- *"IIE does not anticipate the use of API to transfer data with external system."*

**What this means in practice:**

1. The website's database is not in our hands. Whatever exists in it that isn't *rendered to a logged-out visitor* is invisible to us through any technical means.
2. The Q&A indicated IIE was producing a content inventory in parallel — but as of 2026-05-19 there's no visible signal that work is happening (IIE has not yet been able to produce analytics or any pre-existing inventory data). Practical default: **EC produces the URL inventory from the crawl; IIE provides editorial review and migrate/drop judgment** rather than a complementary second inventory. Treat the Q&A's parallel-inventory statement as aspirational pending confirmation in §B2.
3. Manual re-keying is an explicitly accepted fallback. Some structured data will be re-entered by IIE staff or by their adviser/REAC network rather than migrated.
4. There is no API to fall back on. Whatever we don't get from scraping has to come from the human network.

---

## 2. The current site has authenticated content (small surface)

The RFP's Attachment D sitemap (p. 20) lists a `LOG IN` link under "Other Links," and the Q&A acknowledged *"there have been issues with having back-end accounts on the current website."* So an authentication surface exists today — almost certainly the adviser/REAC tools used to manage advising-center info and adviser events, plus possibly admin/editorial users.

What's behind it is **likely a focused admin surface, not a large body of content.** The public site is the substantive content corpus (the sitemap inventory accounts for 8,055 URLs total; roughly ~5,000 are substantive once historical events, expired scholarships, and gated `/node/N` redirects are filtered — see `sitemap-inventory.md` for the canonical breakdown). Whatever sits behind LOG IN is the editing tool that produces that content, plus possibly some pending-submission queues and admin-only fields on otherwise-public records.

**Mitigation is straightforward:** a 30-minute screen-share with an authenticated REAC (see §8.4) enumerates this completely. The risk is real but small and constrained.

**The larger migration risk is structured-metadata fidelity — see §6.**

---

## 3. What we've confirmed by probing the live site (2026-05-14)

Before formalizing the capture/miss analysis, we ran a series of read-only probes against `educationusa.state.gov` to validate assumptions and surface concrete numbers. Findings below.

### 3.1 Platform fingerprint

- **Drupal 7 confirmed.** Asset paths under `/sites/all/themes/custom/edusa/` and `/sites/default/files/styles/...` are unmistakable D7 patterns.
- **Custom theme:** `edusa` (under `/sites/all/themes/custom/`).
- **No JSON:API** — `/jsonapi` returns 404 (expected on D7; this confirms the obvious).
- **No Services module endpoint** at `/services/session/token` (default Services path) — either not installed or behind a non-default path.
- **No Views REST exports** at the obvious paths (`/find-an-advising-center/feed`, `/find-an-event/feed` both 404).
- **`/rss.xml` exists but is empty** (channel title "EducationUSA", zero items).
- **`/robots.txt` returns 403** — common on `.state.gov` sites, not a blocker.
- **`/node/{nid}` direct URLs return 403**, meaning the site enforces path aliases — likely via Drupal's `Global Redirect` (or similar) module. **Practical consequence:** node IDs cannot be enumerated by incrementing; we must walk the sitemap to get the aliases.

**Net:** there is no API surface to fall back on. Migration via HTML scraping + DOM parsing is the path. This was the LOA's plan all along — the probing just confirms it's the only path.

### 3.2 URL inventory (sitemap walk)

`/sitemap.xml` works as a paginated index pointing to two child sitemaps:

| Sitemap page | URL count |
|---|---|
| `/sitemap.xml?page=1` | 4,985 |
| `/sitemap.xml?page=2` | 3,078 |
| **Total** | **8,055 URLs** |

Full per-pattern accounting (volumes per URL pattern, including the 5,624 historical events and 965 unaliased `/node/N` URLs that dominate the raw count) lives in `sitemap-inventory.md` — that's the canonical inventory; this section keeps the migration-treatment framing only.

URL path-pattern breakdown:

| Pattern | What it is | Migration treatment |
|---|---|---|
| `/centers/{slug}` | Advising-center detail pages (~422 records per `site-discovery.md`) | Structured-content parser (see §3.3) |
| `/scholarships/{slug}` | Scholarship detail pages | Structured-content parser |
| `/events/{slug}` | Event detail pages (includes events back to 2019) | Structured-content parser + age filtering |
| `/find-financial-aid` (search) + detail records | **Financial Aid database — 270 records.** ⚠ NOT in LOA Scope of Work. See `site-discovery.md §2`. | TBD pending scope confirmation with IIE |
| `/videos-0` (library) + detail records | **Video library — 242 records.** Video as a content medium IS LOA-committed (Att. B obj. #3 + Drupal block list + Q&A confirmation). The current dedicated-library pattern is what's TBD — see `site-discovery.md §2` and `discovery-worksheet.md §L2`. | TBD: library pattern preservation vs. folding video into other content types |
| `/your-5-steps-us-study/...` | Evergreen student guidance content | Editorial review + page-by-page migration |
| `/experience-studying-usa/...` | Evergreen student-life content | Editorial review + page-by-page migration |
| `/us-higher-education-professionals/...` | HEI-audience content (public-side; gated portal sits behind LOG IN) | Editorial review |
| `/foreign-institutions-and-governments/...` | Officials-audience content | Editorial review |
| `/english-language/...`, `/online-learning/...` | Thin topical sub-sections | Editorial review |
| `/node/{nid}` (raw) | Indexed but blocked at the public layer | Skip — use alias from sitemap |

**Migration scope:** EC will work with IIE to define and migrate all substantive content visible on the current site. Raw sitemap count is 8,055 URLs; the substantive content surface is roughly ~5,000 once historical events (the bulk of the count), expired scholarships, and gated `/node/N` redirects are filtered out.

**Scope clarifications to confirm with Albino:**

- **Video library (242 records)** — Video as a content medium is LOA-committed (Att. B obj. #3, Drupal video content blocks, Q&A confirms existing assets to be incorporated). The current site's *dedicated `/videos-0` library + Video content type + faceted finder* pattern is the open question — preserve, fold into other content types, or hybrid. See `discovery-worksheet.md §L2`.
- **Financial Aid records (270)** — This is the same Scholarship content type re-presented via the `/find-financial-aid` View per `site-discovery.md §2` corrections. Scholarships are LOA-committed; the "Financial Aid"-branded second View is a UX preservation question, not a separate scope item.

### 3.3 Parseability of structured content types

We sampled one detail page from each structured content type. All three returned consistent, template-driven Drupal output that a per-content-type HTML parser can extract cleanly. Findings:

**Advising Centers** (`/centers/{slug}`) — sample: Barcelona center
- Visible fields: **name (h1), street address, country, phone, email, website, walk-in hours, virtual hours, services list, audience tags**, carousel images
- Field labels exposed as `<h3>` section headings
- **Parseability verdict:** **highly parseable.** A single parser keyed off label text → next-sibling content extracts clean records.

**Scholarships** (`/scholarships/{slug}`) — sample: Truman Scholars Scholarship
- Visible fields: **title (h1), awarding institution (h2 + logo), award amount, degree level, discipline/majors, deadline, application link, eligibility/renewal terms**
- Field labels exposed as `<h3>` section headings ("Degree levels", "Restricted to these majors", "Scholarship Deadline")
- **Parseability verdict:** **parseable**, with caveat — *award amount* and *eligibility prose* are free-text rather than structured fields. They will migrate as rich-text body content rather than discrete columns. Filterable facets (degree level, discipline) parse cleanly.

**Events** (`/events/{slug}`) — sample: EducationUSA LL.M Tour 2019
- Visible fields: **title (h1), date, time, full multi-line address, audience, organizer ("Entered by")**
- Field labels exposed as `<h2>` section headings
- **Notable:** the **"Entered by"** field is provenance metadata — it surfaces which advising center / adviser authored the event. This is preservable on migration and useful for downstream content attribution.
- **Parseability verdict:** **highly parseable.**

### 3.4 What this changes vs. our initial assumptions

| Assumption (pre-probe) | After probing |
|---|---|
| Structured-data records (centers, scholarships, events) are unrecoverable without backend access | **Recoverable via HTML parsing** for display-level fields. Admin-only fields (status, submitter ID, draft state, internal notes) still gone. |
| Adviser-uploaded events can't be reattributed | "Entered by" field on event pages preserves provenance and survives migration |
| `/node/{nid}` URLs work as backup enumeration | Blocked at the public layer — sitemap is the only practical enumeration source |

---

## 4. What scraping captures vs. what it misses

### What scraping reliably captures
- All rendered HTML on public pages reachable from the navigation, sitemap, or inbound links
- Images, PDFs, videos linked from public pages (subject to crawler config)
- Page metadata (title, description, OG tags)
- Public form *rendering* (field labels, field types, visible validation)
- Public list pages (events, scholarships, advising centers) at the moment of crawl
- Site structure as expressed in URL hierarchy + nav

### What scraping does **not** capture

| Category | Why scraping misses it |
|---|---|
| Authenticated pages and the login-only UI | Anonymous crawler doesn't have credentials |
| Draft / unpublished content of any kind | Not rendered to anonymous visitors |
| Scheduled content not yet live at crawl time | Not visible |
| Recently-deactivated entries (e.g., advising centers that closed) | Removed from public surface |
| Pending submission queues | Editorial / admin UI only |
| Internal metadata fields on otherwise-public content (e.g., a scholarship's "submitted by," "approved on," internal notes) | Stored in DB columns not rendered to public |
| Taxonomy / term relationships *as data* | We see the rendered facets but not the underlying structure |
| Redirect maps | Server-side configuration |
| User accounts, roles, permissions | Authentication layer |
| Search index configuration | Not surfaced in HTML |
| Form submission targets and backend mappings | Action URLs may be visible but the receiving pipeline is opaque |
| Email subscriber lists, newsletter preferences | Lives in MailChimp / outreach tool, not the website |
| Analytics + engagement data | Q&A confirmed IIE has "basic engagement tracking" but no access |
| Adviser-uploaded events that were rejected or expired | Removed from public surface |
| Historical versions / revision history | DB-only |

### What scraping *might or might not* catch (depends on technique)
- Orphan pages (no inbound link from nav or sitemap) — caught only if guessable URLs are crawled
- Files in `/sites/default/files/...` or similar dump directories — depends on crawler config + whether directory listing is exposed
- Alternate-language variants — depends on how the site exposes them (URL prefix, query param, accept-language header)
- Old content reachable via Wayback Machine but no longer on the live site

---

## 5. HEI data specifically — narrower than it looks (with correction)

> **2026-05-14 correction:** This section originally inferred that "HEIs don't have accounts on the current site today" from the Q&A's *"We also expect HEIs to not have accounts as well"* phrasing. That read was wrong. The Q&A statement was **forward-looking** (about the new site IIE wants to build), not descriptive of current state. Live-site probing (see `site-discovery.md §3`) confirms the current site has HEI logins via a "Request a Login Now!" CTA on `/us-higher-education-professionals`. The HEI portal supports financial-aid and video submissions, an HEI eNews newsletter, and a gated REAC directory.
>
> What hasn't changed: in the NEW build, IIE wants no HEI accounts. The current portal scope is what's being replaced.
>
> Original section text below, kept for the record:

The RFP describes a robust set of HEI submission flows for the *new* site:

- Individual HEI contact info: name, title, institution, work email (per Q&A: FN, LN, Email is the minimum PII)
- "Evergreen" institutional contact: recruitment-office name, shared inbox, mailing address, website
- Scholarship submissions
- Institutional info for map display
- Newsletter / event communication preferences

**Read carefully, this is forward-looking requirement language, not a description of the current state.** Specifically:

- RFP: *"This **should be** a link or form on the website that HEIs can submit for approval..."* — phrasing for a new feature
- Q&A: *"We also expect HEIs to not have accounts as well. We want them to be able to submit their info..."* — parallel to current state ("as well" implies same as today: HEIs are accountless)

**Consequence:** The HEI hidden-data risk on the website itself is probably *low* because there likely isn't an HEI-facing submission system on the current site to capture data into. If HEI data exists in IIE's ecosystem today, it likely lives:

- In **MailChimp** (newsletter/outreach list)
- In **IIE-internal spreadsheets** or shared inboxes
- Distributed across **advisers' email** as ad-hoc contact records
- Possibly in a **separate CRM / contact-management system** not described in our docs

The discovery question reframes: *not* "what HEI data is hidden on the website?" but rather *"where does IIE's HEI list live today, and does migration include importing any of it into the new site at launch?"* — which is an integration scope question, not a scrape question.

---

## 6. The central migration risk: structured-metadata fidelity

The §3 probing showed display fields for advising centers, scholarships, and events parse cleanly from public HTML. What scraping **cannot** tell us is, for each visible field, *how it was structured in the source CMS*:

- Is "Africa" a **taxonomy term** (controlled vocabulary, supports filtering) or a free-text label?
- Is "Master's" a controlled-vocabulary degree level, or whatever the submitter typed?
- Is "$15,000 USD" a **numeric amount field** with min/max, or a free-text body paragraph?
- Is the event date a **structured datetime** (with timezone + recurrence support), or a string assembled at render time?
- Is the advising-center's "Spain" an **entity reference** to a country record, or just text on the page?

These distinctions matter for the new site because:

| If it's structured… | Then the new site can… |
|---|---|
| Taxonomy term | Drive faceted search ("show me all engineering scholarships") |
| Entity reference | Preserve linked-content relationships (HEI → scholarships, country → centers) |
| Numeric / datetime | Sort, filter, validate, derive |
| Free text | Render, but not filter |

**Without knowing the source structure, we have four ways forward:**

1. **Infer from consistency.** If the same labels appear discretely across many entries ("Africa", "Asia", "MENA" — exactly those strings, repeatedly), it's probably a taxonomy. This is parsing-time analysis.
2. **Re-classify on import.** Build the taxonomy fresh in Drupal 11, match scraped display strings to terms, accept the labor cost.
3. **Ask IIE's network.** A REAC with login access can tell us in 5 minutes whether the authoring UI presents these as controlled selects or free-text fields.
4. **Accept loss + recover via new submission flows.** For entries that get refreshed post-launch, the new submission UI is the structure-of-record going forward.

The right answer is probably a combination of #1 (do the inference work during parsing) and #3 (the REAC screen-share confirms the inferences and surfaces anything we missed).

### Authenticated content (smaller, secondary)

Beyond metadata fidelity, the auth-gated content surface (§2) also contains items scraping can't reach. Best estimate of what the LOG IN unlocks, in likelihood order:

1. Adviser / REAC content tools — submission UI for events, advising-center updates, possibly adviser-created site links
2. Submission queues — pending changes awaiting REAC approval
3. Adviser / REAC profile data — names, emails, regional assignments (some visible on public center pages; the rest not)
4. Admin / editorial back-of-house — draft pages, scheduled content, internal-only resource pages
5. Less likely but possible — HEI-facing forms with submission queues; alerts/messages moderation; error/bug backlog

This surface is small and constrained — fully enumerable via the REAC screen-share recommendation in §8.4.

---

## 7. Other gotchas that aren't strictly behind a login

Even without authentication, a naive scrape can miss material content:

- **Orphan pages** — pages with no inbound link from the navigation or sitemap. Common in long-lived Drupal/WordPress sites.
- **Asset dumps** — PDFs, photo libraries, and downloads in `/sites/default/files/...`, `/uploads/...`, `/wp-content/uploads/...`. A crawler set to follow only HTML links will miss these unless directory listing is enabled or the crawler is explicitly pointed at file paths.
- **Form definitions** — current contact / newsletter / error-report forms (Webform, Formstack, Wufoo, Google Forms). Scraping captures the rendered HTML, not the field validation rules, conditional logic, or submission target.
- **Translation variants** — if any content has been translated, alternate-language URLs may not be discoverable from the English nav.
- **Redirect maps** — the existing server-side redirect table is invisible to a crawl. If any prior site migration left redirects in place, those are gone.
- **Search-engine-only content** — anything indexed by Google but not in the site's own nav (rare, but happens).
- **Alerts and Messages** — scraping captures whatever banner is live at crawl time; the historical record / scheduled list is invisible.
- **Embedded third-party widgets** — social media embeds, video players. Scraping captures the embed code, not the underlying configuration.

---

## 8. Recommended migration approach

### 8.1 Crawl strategy

- Use a respectful, rate-limited crawler. Candidates: **Screaming Frog SEO Spider** (best for full SEO/inventory output), **HTTrack** (full site mirror), **wget --mirror** (lightweight), **Scrapy** (custom extraction pipelines).
- Crawl from multiple seed points: homepage, XML sitemap (if present at `/sitemap.xml`), `robots.txt`, and any URL inventory IIE provides.
- Cross-check against the **Wayback Machine** (`web.archive.org/web/*/educationusa.state.gov/*`) to surface orphan/deprecated content the live site has lost track of.
- Capture: full DOM, response headers, content-type, last-modified, status code, and inbound/outbound link graph per page.
- Do **not** attempt to bypass authentication. Whatever is behind the login is out of scope for technical migration — it comes via IIE's network.

### 8.2 Deliverables from the migration phase

| Deliverable | Purpose | Owner |
|---|---|---|
| URL inventory (CSV) | Every URL discovered, status code, content type, last-modified, recommended action (migrate / replace / discard / redirect) | EC |
| Asset inventory (CSV) | Every binary file referenced, size, file type | EC |
| Structured-data extraction tables | Parsed advising centers, scholarships, events from list pages (if their HTML is uniform enough to parse) | EC |
| Redirect map (CSV) | Old URL → new URL, with HTTP status (301 / 410 / etc.) | EC drafts, IIE confirms |
| Form inventory | Every form on the current site, field map, current submission target | EC |
| Gap report | What's *missing* — content IIE expected to exist that we couldn't find | EC + IIE network |
| Content reuse decisions | For each migrated page: keep verbatim / rewrite / discard / new | IIE editorial |

### 8.3 Hybrid approach for structured entities — parse what's viable, refresh what's stale

Initial draft of this doc recommended *rebuilding* structured entities from authoritative IIE sources rather than parsing HTML, on the assumption HTML parsing was too lossy. The §3 probing changes that calculus — display-level fields parse cleanly enough that a hybrid is now the right approach:

- **Migrate static content** (5 Steps, About, U.S. info, etc.) via scrape → IIE editorial review → import into Drupal. *(Unchanged.)*
- **Parse + import structured entities** (advising centers, scholarships, events) from scraped HTML via per-content-type parsers. Output JSON/CSV per content type → Drupal migration pipeline.
  - **Advising centers** — parse all entries; flag any with missing/stale data for adviser-network review on the new site.
  - **Scholarships** — parse all entries; apply an *active-only* filter (drop entries past their stated deadline). Surface the rest for IIE editorial confirmation before launch.
  - **Events** — parse + filter by date. Default treatment: keep future-dated events only, archive everything past. Optional: preserve historical events as read-only archive for SEO / linking continuity.
- **Re-collect via the new submission flows** what parsing can't recover:
  - Admin-only fields (status, internal notes, submitter ID) — gone, no migration path.
  - Pending/draft submissions — invisible to scraping; lost.
  - HEI individual contact info — likely lives in MailChimp / IIE-internal systems, not the website. Migration is an *integration* scope question, not a *scrape* question.

This keeps the launch state populated with real content (the "empty queues on day 1" risk goes away for the structured types) while accepting that some metadata is lost. Net: better day-1 user experience than re-collection alone, less wishful thinking than "perfect migration."

### 8.4 The leverage move: screen-share with an authenticated REAC

The single most valuable discovery action is to get a 30-minute screen-share with someone who currently has login access. Even one REAC. They will:

- Show us exactly what's behind the LOG IN
- Identify any admin-only fields on advising-center / event entries
- Surface any submission queues, scheduled content, or workflows we'd miss
- Tell us which content they personally know was added in the last year that scraping might still catch
- Identify any orphan or admin-only resource pages

This is the one thing that converts "we don't have backend access" from a blocker into a navigable constraint. Worth pushing hard for in early discovery.

---

## 9. Discovery questions for IIE

Migration-relevant client questions live in `discovery-worksheet.md §B (Content Migration)` and related sections (§L for live-site scope items, §J for cutover). This doc holds the analysis that motivates them; the worksheet holds the questions themselves.

Higher-leverage items worth highlighting in any meeting agenda:

- **Does IIE have anyone with login credentials to the current site** — even read-only — who could walk us through what's behind LOG IN in a screen-share? (Worksheet B-context, but raised explicitly because it's the single highest-leverage discovery action — see §8.4.)
- **State Dept backend access** — worksheet B1. Even read-only access changes the migration approach materially.
- **Cutover redirect coordination** — worksheet J2. Depends on a party outside the contract (State Dept IT).

---

## 10. Risks specific to migration

- **M1 — Structured-metadata fidelity (the central risk; see §6).** Display fields parse cleanly, but we can't tell from HTML alone whether a given field originated as a taxonomy term, entity reference, structured datetime, or free text. Mitigation: inference during parsing (recurring labels → likely taxonomy) + REAC screen-share to confirm + re-classification on import as needed.
- **M2 — Hidden data behind LOG IN cannot be enumerated technically.** Small constrained surface (likely adviser/REAC tools + submission queues). Mitigation: screen-share with an authenticated REAC (§8.4). If no one has access, fall back to IIE's network enumeration.
- **M3 — Orphan / asset-dump content is lost.** Mitigation: explicit Wayback Machine cross-check; ask IIE's network for known orphans; crawl from `robots.txt` and `sitemap.xml` not just the homepage.
- **M4 — Editorial review on migrate/drop decisions is the bottleneck.** The Q&A's "IIE is producing an inventory" framing hasn't materialized as of 2026-05-19. Practical posture: EC owns the URL inventory (crawl-derived; see `sitemap-inventory.md`); IIE owns the migrate/drop/rebuild judgment per page. Mitigation: line up a named editorial owner + working cadence in §B2 so the review work doesn't gate the build.
- **M5 — Form submissions in the current Webform / Formstack / etc. are lost.** Mitigation: depending on volume, accept the loss or extract submissions out-of-band from whatever tool holds them.
- **M6 — Redirects from a prior migration get dropped on cutover.** Mitigation: ask IIE if they have any record of redirects from earlier site changes; check `.htaccess`-style config exposed in HTTP response headers (rare but possible); use Wayback Machine to identify old URLs that should still redirect.
- **M7 — Public list pages (events, scholarships, centers) at crawl time are time-bound.** Mitigation: crawl multiple times across the project to catch ephemeral entries; treat crawl-time snapshot as a partial truth.

---

## 11. Recommendation summary

1. **Treat structured-metadata fidelity (§6) as the central migration risk**, not authenticated content. Display fields parse cleanly; what's at risk is the *structure* behind those fields (taxonomy vs free text, entity reference vs string).
2. **Push hard for the REAC screen-share** (§8.4) — high-leverage on both fronts: it surfaces the auth-gated content surface *and* lets us confirm whether current authoring UI uses controlled vocabularies (resolving §6).
3. **Adopt the hybrid migration approach** (§8.3) — parse + import advising centers, scholarships, and events from scraped HTML; do inference work during parsing to identify likely taxonomies; refresh stale entries via the new submission flows post-launch.
4. **Use Wayback Machine** as a cross-check for orphan and historical content.
5. **EC owns the URL inventory; IIE owns editorial review.** The Q&A's parallel-IIE-inventory framing hasn't materialized — default to EC producing the crawl-derived inventory and IIE supplying human review/judgment on what migrates.
6. **Surface migration limitations in writing** with IIE early so cutover-day expectations are calibrated: the new site will *not* be a one-to-one mirror of the old site's database. Some metadata will be re-classified during import or re-collected post-launch.

---

## Revision Log

| Date | Notes |
|------|-------|
| 2026-05-14 | First-pass migration deep-dive. Sources: RFP, EC proposal, signed LOA, RFP Q&A (Amendment 1), and the current sitemap (RFP Att. D). |
| 2026-05-14 | Added §3 with empirical findings from probing the live site (sitemap walk, parseability checks on /centers/, /scholarships/, /events/ samples). Renumbered subsequent sections. Softened M2 risk and revised §8.3 recommendation based on confirmed parseability. |
| 2026-05-14 | Rewrote §2 to be proportionate — authenticated content is a small surface, not the "central" migration risk. Reframed §6 to lead with structured-metadata fidelity (taxonomy vs free text, controlled-vocab vs hand-typed) as the actual central risk. Updated §11 recommendation summary to match. |
| 2026-05-14 | Folded in `site-discovery.md` findings: content type count is 5 (added Financial Aid /find-financial-aid and Videos /videos-0). Corrected §5 — earlier "HEIs don't have accounts today" read was wrong; current site does have HEI logins. The Q&A's no-accounts statement was forward-looking. |
