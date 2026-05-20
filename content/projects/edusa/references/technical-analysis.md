# EducationUSA Rebuild — Technical Analysis

> **Generated:** 2026-05-13 (last updated 2026-05-19)
> **Source documents:** `docs/background/EducationUSA RFP.pdf`, `docs/background/101325-01 IIE EducationUSA.pdf` (EC proposal), `docs/background/3000403861_Electric Citizen_LOA.pdf`, `docs/background/RFP-Mod-1_QA.pdf` (Solicitation Amendment 1 / Q&A)
> **Status:** Initial synthesis, updated to reflect RFP Q&A. Precursor to the Technical Discovery Worksheet.


## Glossary

A quick reference for the acronyms and project-specific terms used throughout this document. Where a term ties back to a contract/role definition we've already cited, the source is noted.

### People, roles & organizations

- **IIE** — Institute of International Education. The client; prime contractor with the State Department.
- **ECA** — Bureau of Educational and Cultural Affairs, U.S. Department of State. The funder/sponsor (LOA Art. 1).
- **EC** — Electric Citizen.
- **Sponsor** — In role terms, State Department staff. Per RFP §User Roles, Sponsors have the same content-creator/editor permissions as REACs.
- **REAC** — Regional Educational Advising Coordinator. IIE staff who manage a global region and review/approve adviser submissions. (Note: the current site uses "Regional Educational Advising Manager" interchangeably.)
- **REAC Assistant** — Support role to REACs; same content-review permissions per RFP.
- **Adviser** — In-country EducationUSA advising-center staff. Submits events and advising-center information for REAC review.
- **HEI** — Higher Education Institution. The RFP uses this term for both the *institution* and individual *HEI staff* — context determines which.

### Third-party software in scope or under discussion

- **OKTA** — IIE's identity provider; powers SSO for internal authenticated users. Standard variant (FedRAMP variant *not* required per Q&A).
- **MailChimp** — Email marketing platform. HEI list export integration committed; we'll use the standard `drupal/mailchimp` contrib module configured against IIE's MailChimp account.
- **Pantheon** — Hosting provider IIE selected (May 2026). EC integrates but does not hold the Pantheon contract.

---

## 1. Project Snapshot

| Item | Value | Source |
|------|-------|--------|
| Client | Institute of International Education (IIE) | LOA p.1 |
| Funder / Sponsor | U.S. Department of State, Bureau of Educational and Cultural Affairs (ECA) | RFP §1, LOA Art. 1 |
| Start / End | 3/30/2026 – 9/30/2027 (renewable annually up to 5 yrs) | LOA p.1, RFP §6 |
| Launch target | **By April 30, 2027** | LOA §J |
| CMS | **Drupal 11** | EC proposal p.22 |
| Hosting | **Pantheon** (IIE-procured; EC integrates) | LOA Att. B "Hosting Services" |
| Source repo | GitHub or GitLab; IIE access at any time | LOA p.30 |

---

## 2. Foundational Technical Decisions (already made)

These were locked in via the proposal and/or LOA. They drive everything downstream.

| Decision | Detail | Implication |
|---|---|---|
| **CMS = Drupal 11** | EC proposal §Cost Proposal | Locks the platform; eliminates WP path that the RFP left open. |
| **Domain migration** | `educationusa.state.gov` → `educationusa.org` | New TLD, full redirect strategy, brand+SEO transition out of `.gov`. |
| **SSO = OKTA (IIE's tenant) for internal users only** | LOA §G Integrations; Q&A confirms OKTA FedRAMP variant is **not** required | Advisers, REACs, REAC Assistants, Sponsors, Admins authenticate via IIE's OKTA. IIE will supply API documentation. HEIs do **not** get accounts. |
| **Editorial model for HEIs** | HEIs submit via anonymous forms gated by accreditation check → REAC review → IIE Admin publish *(RFP §User Roles, LOA §G, Q&A linear workflow)*. No HEI logins, no HEI accounts. The one open authentication question is **Sponsor role** (State Department staff, separate identity provider from IIE's OKTA tenant) — see `discovery-worksheet.md §C4`. | No HEI authentication or HEI-side dashboards to build. |
| **Analytics stack** | GA4 + Google Tag Manager (committed, LOA §G). Looker Studio named in LOA §G; Att. B characterizes as "optional data dashboards (e.g., Google Looker Studio)" — integration in scope, specific dashboard content open. Heat-map tool TBD. | Standard. |
| **Multilingual** | Google Translate widget at launch. A full multilingual build-out is planned for a future phase with a separate scope, per the LOA §G roadmap. | Standard. The site is English-only underneath the GT widget at launch; the Drupal core multilingual stack is scoped to that future phase. |
| **Accessibility** | WCAG 2.1 AA (LOA §G) | Hard requirement; in-admin editor checks committed. |
| **Modular content** | Drupal Paragraphs | EC proposal §"Innovative Approaches" |
| **Source code delivery** | Full code handover to IIE (CLIN 4.4) | We do not retain a closed-source artifact. |
| **AI features at launch** | Greeter/chat, AI-enhanced search, translation assist, editorial tagging — all toggleable *(LOA §G AI)* | Each public-facing feature must be independently feature-flagged so editors can disable without code changes. |
| **Hosting** | Pantheon (IIE procures + owns the contract) | EC will coordinate hosting setup. |

---

## 3. Major Technical Work Streams

Ordered roughly by where the open questions cluster.

### 3.1 Content migration from a `.gov` site we do not have backend access to

- RFP says explicitly: *"We may not have full back-end access to the educationusa@state.gov site."* (RFP p.11, repeated p.12)
- LOA scope confirms migration via **scraping tools** as the planned path (LOA §G "Content Migration").
- **Inventory size:** the sitemap surfaces 8,055 URLs total. The bulk is historical: ~5,624 Event records (most never displayed by the upcoming-events finder), ~857 Scholarship records (~270 currently active), and ~965 unaliased `/node/N` URLs (mostly 403-gated internal content). The substantive content surface to migrate is roughly **~5,000 URLs** once historical events and stale records are filtered. Canonical breakdown lives in `sitemap-inventory.md`.
- EC will work with IIE to define and migrate all substantive content.
- IIE-sourced migration is required for content the scrape can't reach. Known categories: gated PDFs (Regional Fact Sheets, Global Guide — see §3.8 "Migration source for gated PDFs") and the gated/portal-only content listed in §3.14 → "Greenfield or inaccessible" (Region landing pages, Webinars, Campus News Stories). For each, IIE supplies the source — bulk Drive/Box export, current-site file directory, or REAC-login export.

**Client questions on this topic:** see `discovery-worksheet.md §B` (Content Migration).

### 3.2 User roles, authentication, and submission workflows

- IIE provides an OKTA tenant for internal-user authentication. The FedRAMP variant of OKTA is not required (per Q&A). IIE will supply API documentation and access during discovery.
- **Authentication for IIE-staff roles** (Adviser, REAC, REAC Assistant, IIE Admin) is **OKTA SSO with JIT (just-in-time) provisioning**. Existing IIE OKTA credentials are the source of truth; Drupal creates user records automatically on first authentication; OKTA's lifecycle (offboarding, MFA, group changes) is authoritative; IIE never manually provisions or password-manages a website account.
- **Sponsor authentication is the one open authentication question.** Sponsors are State Department staff and may sit on a separate identity provider. See `discovery-worksheet.md §C4` for the options to align on.
- **Editorial UX is a hybrid.** Advisers submit via OKTA-verified Drupal forms (one-shot flows for events, advising-center updates); REACs, REAC Assistants, and IIE Admin authenticate to Drupal via OKTA SSO and use a Drupal-native editor dashboard to review, edit, and publish. This matches the linear approval workflow (Adviser → REAC → IIE Admin per Q&A).
- HEIs do **not** authenticate. Submissions are anonymous, gated by an accreditation check, and land in "Needs Review" by default per RFP §User Roles (content creators cannot publish their own content).
- **Access enforcement inside Drupal is layered separately from OKTA.** OKTA supplies identity and attributes; Drupal enforces *per-section* editorial access via the **Workbench Access** contrib module (EC's standard pattern for region-scoped editorial). Workbench Access sections are keyed off the Region taxonomy (12 terms), so REAC / REAC Assistant / Sponsor users are scoped to their assigned region(s). OKTA-supplied region attributes drive these assignments during JIT provisioning; if OKTA doesn't carry region metadata, the assignments are Drupal-maintained instead (see `discovery-worksheet.md §C2`). The narrower Adviser→own-center case sits on top of Workbench Access with a small targeted node-access addition.

**Proposed user roles:**

| Role | Who they are | Authentication | Drupal access |
|---|---|---|---|
| **IIE Admin** | IIE administrators | OKTA SSO + JIT | Full editor + admin UI |
| **REAC / REAC Assistant** | Regional educational advising staff (IIE) | OKTA SSO + JIT | Editor dashboard for review / edit / publish |
| **Adviser** | In-country advising-center staff | OKTA-verified at form submission | Submission forms only (no editor session). The Adviser's assigned advising center (used to route updates and approvals) is identified from an OKTA attribute or group, or from a Drupal-maintained mapping — **availability of the right OKTA metadata is a discovery item, see `discovery-worksheet.md §C2`** |
| **Sponsor** | U.S. State Department staff | **TBD** — see `discovery-worksheet.md §C4` | Same content access as REAC per RFP §User Roles |
| **HEI** | Higher Education Institution staff | None — anonymous + accreditation check | Anonymous form submission only |

**Submission workflows:** Each row is a distinct submission path. The Q&A confirms a linear approval flow (Adviser → REAC → IIE Admin), so the Reviewer column shows first-review and final-publish steps where they differ.

| Submitter | Submission | Reviewer |
|---|---|---|
| Adviser | Event listing | REAC / REAC Assistant → IIE Admin (publish) |
| Adviser | Advising-center contact info update | REAC / REAC Assistant → IIE Admin (publish) |
| REAC / REAC Assistant | **TBD — REACs are confirmed as reviewers and approvers per RFP, but the content types they *originate* are not specified in source documents.** Possible scope includes regional landing pages and other REAC-curated content. See `discovery-worksheet.md §C1` (REAC/Sponsor content creation) and `§L12` (regional pages scope) | IIE Admin (publish) |
| Sponsor (State Dept) | Same scope as REAC per RFP §User Roles | IIE Admin (publish) |
| HEI (anonymous, accreditation-gated) | Institutional info / contact / map pin | REAC + IIE Admin |
| HEI (anonymous, accreditation-gated) | Scholarship entry (with auto-expiry date) | REAC + IIE Admin |

**Drupal pattern:** OKTA SSO via `simplesamlphp_auth` or `openid_connect` depending on tenant protocol; `workbench_access` for region-scoped editorial access (sections keyed off the Region taxonomy), plus targeted node-access logic for the Adviser→own-center case; `workflows` + `content_moderation` core for the Needs Review → Published states. Submission forms (Drupal Form API or the Webform contrib module — implementation TBD at build planning) drive Adviser and HEI submissions; events / advising centers / scholarships / HEIs are implemented as Drupal content types (nodes), inheriting content_moderation, taxonomy, pathauto, Views integration, revisions, and the standard contrib-module ecosystem. HEI accreditation requires either an internal allowlist of accredited institutions OR integration with an accreditation source — see `discovery-worksheet.md §D1`.

**Client questions on this topic:** see `discovery-worksheet.md §C` (OKTA, Authentication, and Roles).

### 3.3 Interactive map(s)

The LOA lists "Interactive map" as a CLIN 4.4 deliverable (March 2027) integrating advising centers, success stories, U.S. regional geography, and HEIs. The RFP adds country/territory demographics, country education-system info, and outbound links to regional/local adviser-created sites (with a leaving-the-official-site disclaimer). The LOA's singular "an interactive map" is the default; the RFP's separate "world map" and "U.S. map" framing is checked with IIE in §E1.

EC will build this with a standard mapping library (Leaflet, Mapbox, or similar) using the provider's default boundaries and labels. The main open item is **data provenance** — where each layer actually comes from and how it stays current (asked in §E3 and §E4). Architectural decisions (library choice, basemap, tile-cost ownership, external-link disclaimer treatment) stay with EC and resolve during Strategy + Design.

**Client questions on this topic:** see `discovery-worksheet.md §E` (Interactive Map).

### 3.4 Advising Center system

EducationUSA is, in operational terms, a network of advising centers. The RFP frames the network as *"over 400 international student advising centers in more than 170 countries and territories"* — they are the touchpoint where the program meets prospective students, and structurally they are among the most prominent content on the site (436 records in the current sitemap; 422 surfaced via the public finder).

**Where the Advising Center content surfaces:**

- **Public finder** at `/find-advising-center` — faceted browsing (Region / Country / Center Level) per the existing pattern. See §3.11 Search for the cross-finder facet inventory.
- **Per-center detail pages** at `/centers/{slug}` — the richest record of the four crawl-confirmed content types, surfacing services, dual addresses (walk-in + mailing), per-day operating hours (physical + virtual), social presence, and linked events and scholarships.
- **Interactive map** (§3.3) — centers are the primary geographic data layer.
- **Adviser submissions** — each Adviser is associated with one center via the OKTA-attribute-or-Drupal-mapping pattern (§3.2); their submission flow keeps that center's information current.

**Editorial workflow** (per RFP §HEI Audience + Q&A):

- Adviser submits center info updates via an OKTA-verified Drupal form. The Adviser is the source of truth for their own center's content (address, hours, services, contact details). The RFP says it directly: *"This update should be done by 'integration' from an outside form that EducationUSA advisers can submit and after approval gets automatically updated on the website."*
- REAC reviews the submission.
- IIE Admin publishes (linear flow per Q&A; matches §3.2 submission workflows table).

**Observed field inventory (current site).** Derived from sampled records (`/centers/turkish-american-association-ankara` and similar). Current-site node type machine name: `center`.

| Field | Type | Notes |
|---|---|---|
| Title | text | Node title (e.g., *"Turkish American Association - Ankara"*) |
| Center Level | list_string (3 values) | Reference / Standard / Comprehensive — see §3.14 vocab inventory |
| Description | long text (rich) | Center's services pitch |
| Services (compound) | repeating field collection / Paragraph | Each row: Service name + Audience (list_string). Common entries observed: *Advising by Appointments / Group Presentations / One-on-One Advising / Test Preparation Materials / Computer Internet Access*, etc. |
| Events (related) | entity reference → Event nodes | Centers surface upcoming events tied to them |
| Financial Aid (related) | entity reference → Scholarship nodes | Centers surface relevant scholarships |
| Walk-in Address | postal address (address module) | Multi-line street address with city, country |
| Mailing Address | postal address | Separate from walk-in (some centers differ) |
| Center Hours | repeating field — 7 days × open/closed/time-range | Per-day physical-location hours |
| Virtual Hours | repeating field — 7 days × open/closed/time-range | Separate from physical center hours |
| E-mail | email | Surfaced as *"Click here to email this center"* with mailto obscured for spam protection |
| Phone | text | International dialing format |
| Website (URL) | URL | The center's own external site |
| Social media links | repeating URL field (Facebook, Instagram, etc.) | *"Follow this center"* block |
| Region | taxonomy reference → **Region vocabulary** (12 terms) | Used by `/find-advising-center` filter |
| Country | taxonomy reference → **Country vocabulary** (177 terms) | Used by `/find-advising-center` filter |

Admin-only fields (status, submitter ID, internal notes) are not visible to public crawl.

**Drupal pattern:** `center` content type (node). Views power `/find-advising-center` with the existing facets; entity-reference fields surface related Events and Scholarships; the address module handles the two address fields; Paragraphs or field collections handle the Services list and the per-day hours; pathauto preserves `/centers/{slug}`. Adviser-update submissions follow the §3.2 form pattern, gated by the OKTA-attribute-based Adviser→Center mapping (the same mapping that routes the update to the right REAC reviewer — see `discovery-worksheet.md §C2`).

**Client questions on this topic:** see `discovery-worksheet.md §C2` (Adviser→Center OKTA attribute availability — load-bearing for the submission routing) and §H (Search facets covering Region / Country / Center Level).

### 3.5 Scholarship system (labeled *"Special Opportunities and Financial Aid"* on the current site)

- HEIs submit scholarships via form (anonymous, accreditation-gated).
- Each scholarship has: text, URL, **auto-expiry date** (auto-removal from site).
- Public search: discipline, degree level, award amount, geographic location.
- **Downloadable list** (CSV/Excel export of the dataset).
- REAC reviews → IIE Admin publishes (per Q&A linear workflow; matches §3.2 HEI submission row).

**Observed field inventory (current site).** Derived from sampled scholarship records and the `/find-financial-aid` filter form. Current-site node type machine name: `scholarship-hei`.

| Field | Type | Notes |
|---|---|---|
| Title | text | Node title (e.g., *"Wesleyan Freeman Asian Scholarship"*) |
| Awarding institution | text | Single-line text; one institution per scholarship (e.g., *"Wesleyan University"*) |
| Description | long text (rich) | Scholarship narrative — eligibility, renewal, award terms |
| Scholarship Deadline | text | Free-text date description (current site accepts non-date strings like *"January 1 annually"*) |
| "Deadline same as application deadline" | boolean | Yes/no flag |
| Degree Levels | taxonomy reference → **Degree Level vocabulary** (5 terms) | Associate's / Bachelor's / Master's / Doctorate / Post-Doctorate |
| Restricted to these majors | text / taxonomy ref *(TBD)* | Often free-text ("All majors"); current-site field-type structure not visible to crawl |
| Discipline | taxonomy ref *(TBD)* | Visible on some sample pages (e.g., Truman Scholars) but not surfaced as a finder filter — see §3.14 vocab/data-model concern #4 |
| Award amount | numeric or text *(TBD)* | Visible on some sample pages but not surfaced as a finder filter — see §3.14 concern #4 |
| More information URL | URL | Link to the host institution's scholarship page |
| Country | taxonomy reference → **Country vocabulary** (177 terms) | Used by `/find-financial-aid` filter; underlying field exists in the data model |
| U.S. State / Territory | taxonomy reference → **U.S. State/Territory vocabulary** (56 terms) | Used by `/find-financial-aid` filter |
| Auto-expiry date | date | RFP commitment; drives cron-based unpublish |

Admin-only fields (status, submitter ID, internal notes) are not visible to public crawl.

**Drupal pattern:** `scholarship` content type (node) with Views for search and filter, `views_data_export` for the downloadable list, cron-driven unpublish on expiry.

**Client questions on this topic:** see `discovery-worksheet.md §F` (Scholarships and Events) — particularly F1 (controlled vocabularies for discipline, degree level, award amount) and F2 (expiration behavior); and §L1 (Scholarship canonical model — the sitemap shows 857 records vs. the 270 surfaced through the public finder, scope confirmation needed).

### 3.6 Event listings

- Event listings are managed in Drupal: Adviser-submitted events go through the submission workflow (Adviser → REAC → IIE Admin) and surface in the public `/find-event` View.
- Each event record has a Registration URL field — registration itself is routed off-site (current site uses per-event bit.ly redirects; see `site-discovery.md`). We are not building event registration into Drupal.

**Observed field inventory (current site).** Derived from sampled event records and the `/find-event` filter form. Current-site node type machine name: `event-center`.

| Field | Type | Notes |
|---|---|---|
| Title | text | Node title (e.g., *"EducationUSA Jordan Fair"*) |
| Description | long text (rich) | Event narrative — agenda, sponsorship, audience pitch |
| Date and Time | datetime range | Start + end with timezone; supports multi-day events with per-day times |
| Audience | list_string → **Audience field** (3 values, shared with Video — see §3.14) | International Students / High School Counsellors / U.S. HE Professionals |
| Event Location Type | list_string (2 values) | In-Person Event / Online Event |
| In-Person Country | address-module country code (ISO 2-letter, 250 codes) | Distinct from the Scholarship/Center Country *taxonomy* — see §3.14 vocab/data-model concern #1 |
| Location (City / venue) | text | Free text; some records say "TBD" |
| Registration URL | URL | Typically a per-event bit.ly redirect to external registration (uniform pattern per `site-discovery.md`); confirms event registration is *not* built into Drupal |
| Entered by | text | Provenance — usually surfaces the advising-center name (e.g., *"EducationUSA at US Embassy Amman"*). Preserves which adviser/center authored the event. Survives migration. |
| Contact e-mail | email | Public contact for event questions |

Admin-only fields (submitter ID, status, internal notes) are not visible to public crawl.

**Client questions on this topic:** see `discovery-worksheet.md §F3` (event types beyond Adviser events and EducationUSA fairs) and `§M2` (confirmation that event registration stays off-site).

### 3.7 The "5 Steps to U.S. Study" guide

The current site's `/your-5-steps-us-study/` tree is the largest single content asset and the most prominent student-facing journey on the site — **71 pages**, **up to 5 levels deep**.

Structure (verified via targeted crawl):

- **1 hub page** at `/your-5-steps-us-study`.
- **5 step pages** under it — *Research Your Options*, *Finance Your Studies*, *Complete Your Application*, *Apply for Your Student Visa*, *Prepare for Your Departure*.
- **Audience tracks** under each step — *Community College*, *Undergraduate*, *Graduate*, *Short-Term*, *English Language*, plus *Online Learning* in some cases. Roughly 5–6 tracks per step.
- **Deeper detail pages** inside *Research* (Define Your Priorities, Prepare for U.S. Standardized Tests, Research and Narrow Your Options, What is a [audience] Student, plus subject-specific resource pages for Graduate) and inside *Prepare* (Pre-Departure Materials and Documents).
- The matrix is roughly 5 steps × 5–6 audience tracks = ~25 primary pages, plus audience-specific deeper detail pages.

Observed authoring drift: page titles use four spelling variants of the same name ("Your 5 Steps to U.S. Study" / "Your 5 steps to U.S. Study" / "Your 5 Steps To U.S. Study" / "Your 5 Steps to U.S Study"). Suggests hand-authored over time without style-guide enforcement — worth normalizing during migration regardless of which build approach is chosen.

**Open architectural questions for the new build:**

- Migrate as-is, preserving the existing 5×5 matrix and current copy (lowest cost, leans on Strategy/Design phase for visual refresh)?
- Rebuild around new Strategy/Design IA — the structural shape is right but the presentation could be substantially re-imagined (wizard-style guided journey, interactive checklists, audience-driven flows, AI-assisted personalization)?
- Hybrid — preserve the IA and matrix, invest in a new presentation layer + selective editorial refresh of the highest-traffic pages?

The choice has meaningful implications for Build budget and how much of Strategy/Design is invested here vs. elsewhere.

**Client questions on this topic:** see new `discovery-worksheet.md §L14`.

### 3.8 External resources surfaced on the new site

RFP p.10 lists a set of IIE-owned and external publications that HEIs should be able to access from the new site: **Open Doors Report**, **Project Atlas**, **EducationUSA Global Guide**, **Trade Admin Market Diversification Tool (TAMDT)**, and **Regional Fact Sheets**. The RFP says "some of this data can be pulled to inform our maps, other website pages, etc."

**These are content decisions, not technical integrations.** Per Q&A, IIE does not anticipate API-based integrations beyond OKTA. The realistic shape for each:

| Resource | What it actually is | Realistic implementation |
|---|---|---|
| Open Doors Report | IIE-published annual statistical report on international students in the U.S. Currently hosted on a separate IIE-controlled property. | Link-out and/or embedded summary widgets. Optional: hand-curated data points uploaded into Drupal for map use. |
| Project Atlas | IIE-run global student-mobility data product. | Link-out. Optional: CSV-style data snapshot for map markers. |
| EducationUSA Global Guide | IIE's annual (August) HEI-facing directory. Currently a gated PDF on the existing site. | PDF-as-media asset, refreshed annually. Possibly behind login if IIE wants to keep it HEI-only. |
| TAMDT | U.S. Department of Commerce tool (not IIE-controlled). | Link-out only. Possibly a hand-extracted data point or two for map use. |
| Regional Fact Sheets | IIE-published per-country/region PDFs. Currently gated on the existing site (`/us-higher-education-professionals/recruitment-resources/country-fact-sheets` redirect-loops anonymously). | PDF library — Drupal media bundle with country/region taxonomy for filterable display + download. **Migration note:** because the PDFs are gated, EC cannot crawl or scrape them — IIE supplies the source files (bulk Drive/Box export, current-site file directory, or REAC-login export). |

**What stays open (for discovery):**
- Source format and refresh cadence for each → `discovery-worksheet.md §E3`.
- Whether the Global Guide and Regional Fact Sheets stay gated to HEIs or become public.
- Whether any data should *actually* be pulled into the site (vs. linked) — and if so, via what mechanism (CSV upload? data snapshot? manual entry?).

**Engineering implications:** minimal. PDF management uses Drupal Media + Paragraphs. Link-outs are link-outs. Any "data pull" that IIE actually wants is almost certainly going to be a periodic file upload, not a live integration. None of this drives architectural decisions beyond confirming we have a clean Media model and per-resource taxonomy.

**Migration source for gated PDFs.** The Global Guide and Regional Fact Sheets are both gated on the current site, which means EC cannot pull them via crawl. Migration of these assets requires IIE to supply the source files directly — a bulk export from Drive/Box, the current-site file directory if State will release it, or a per-file pull via REAC login. This is the standard backend-access constraint already named in the LOA, but it's the largest concrete instance of it in the migration plan.

**Client questions on this topic:** see `discovery-worksheet.md §E3` (source format and refresh cadence for each external resource).

### 3.9 Multilingual

- **LOA commitment:** Google Translate at launch, with "a more robust plugin in the future as part of a change order." (LOA §G Integrations.)
- 170+ countries, varying language coverage. Parents-of-students audience is explicitly called out as possibly non-English-primary.
- Underneath the GT widget, the site is English-only at launch. A full multilingual build-out (Drupal core multilingual stack — Content Translation, Configuration Translation, Interface Translation) is planned for a future phase with a separate scope, per the LOA roadmap.

**Build implications to account for.** Google Translate is a client-side display overlay — it translates rendered text in the browser after the page has been served, against the English source content stored in Drupal. A few practical implications the build needs to handle:

- Standard Drupal/Solr search indexes the English source content.
- AI features sit on top of the English source content but are LOA-committed to be multilingual at the input/output layer (see §3.10): the AI Greeter is multilingual via the LLM, AI-enhanced search handles multilingual queries via NLP, and Translation Support is an AI-assisted translation tool the LOA places *"within editorial workflows."* The intended shape of Translation Support — editorial/staff-facing vs. something else — is open and needs IIE confirmation (`discovery-worksheet.md §G6`). Non-English users interact with the Greeter and AI search in their own language even though the underlying content stays English.
- SEO crawlers see the English source.

These are inherent properties of the committed approach. Internal-awareness notes only.

### 3.10 AI features (toggleable)

Four committed AI capabilities, all admin-toggleable:

| Feature | Description | Likely vendor |
|---|---|---|
| Greeter / chat | Conversational nav assistant — answers site-content and FAQ queries via retrieval-augmented generation against a vector store. Multilingual via the LLM (user prompts in their language, LLM responds in kind). | LLM (OpenAI / Claude / Gemini per §G1) + a vector store (Zilliz or similar), integrated via EC's custom Drupal AI tooling. Shared infrastructure with §3.11 AI-enhanced search |
| AI-enhanced search | NLP query understanding; **multilingual input handling** (queries in any language map to the English index via the AI/NLP layer); AI-driven result summarization. Index itself remains English; cross-references §3.9. | EC's custom Drupal AI search tooling — vector store + Solr + AI summarization, scaling in tiers (basic vector search → result summaries → chat retrieval). SearchStax was named in the proposal as an option; the build path is EC's tooling. See §3.11 |
| Translation Support | LOA wording: *"AI-assisted translation integration (e.g. Google Cloud Translate) within editorial workflows to reduce turnaround time while preserving quality."* Our read is an editorial / staff-facing tool that helps IIE's internal translators draft translations faster — distinct from the user-facing Google Translate browser widget in §3.9 — but the exact shape (UI surface, where it lives in the publish flow, who triggers it) is **not literal in the LOA** and needs IIE confirmation. See `discovery-worksheet.md §G6`. | Google Cloud Translate API (LOA names this as example) |
| Editorial tagging / summarization | Metadata generation, accessibility prompts | LLM via Drupal AI module suite *or* a direct custom integration — implementation TBD |

**Note on multilingual:** The LOA explicitly commits the Greeter as multilingual (*"Designed to be multilingual"*) and AI-enhanced search to *"handle multilingual input."* Both are deliverable on top of an English-only content store because the multilingual layer is the LLM/NLP query handler, not the index. This is consistent with §3.9's GT-only display approach for the broader site.

**LOA scope clarification (p.30):** Purchases of LLM credits/tokens (Gemini, ChatGPT, Claude) are IIE's responsibility. EC delivers the AI feature integrations; IIE owns ongoing token costs.

**Build sequencing — AI features depend on real content to be useful.** All four AI features above are retrieval-augmented (the chat, the AI-enhanced search, the AI-driven result summaries) — they need a vector-indexed corpus of real site content to produce meaningful results. AI infrastructure itself can be stood up early in the build and unit-tested against synthetic placeholder content, but meaningful demos, QA, and tuning require actual site content to be ingested. The plan: ingest scraped current-site content iteratively as it becomes available, regenerate embeddings as content quality improves, and reserve a content-ready milestone roughly 6–8 weeks before launch for final ingestion and AI-feature tuning against the populated index. See §7 Top Risks #5 for the schedule implication.

**Client questions on this topic:** see `discovery-worksheet.md §G` (AI Features) — G1 (LLM provider), G2 (LLM contract), G3 (Greeter vision), G4 (AI-enhanced search vision), G5 (editorial tagging vision), G6 (Translation Support shape), G7 (overall alignment).

### 3.11 Search

**Two distinct search surfaces.** The new build has two search experiences, each with its own UX model and filter expectations:

| Surface | What it is | Filter model |
|---|---|---|
| **Per-content-type finders** (`/find-advising-center`, `/find-event`, `/find-financial-aid`, `/videos-0`) | Drupal Views over a single content type, used by visitors intentionally browsing that type | Traditional faceted sidebar — Region, Country, Degree Level, Audience, etc. Standard Drupal Search API + Facets module pattern. |
| **Sitewide unified search** (`/search`) | AI-driven semantic search across all content types, used for cross-content question-answering | AI handles intent extraction via the LLM/NLP layer; traditional faceted sidebar is intentionally **not** built here. A natural-language query like *"scholarships for graduate students in Europe"* surfaces the right results without facet clicks. |

**Why no facets on the sitewide AI search:** semantic vector search + LLM query understanding + AI-driven result summarization make traditional filter sidebars redundant. Building them anyway adds maintenance burden (per-facet config, taxonomy upkeep across content types, facet-position UX tuning) without commensurate UX value. The LOA §G language — *"filters by content type, topic, region, or role"* — is satisfied by the per-finder pattern; the AI sitewide surface meets the same user need through different mechanics.

**Facet mapping for the per-content-type finders** (where facets ARE built):

| Facet | Source | Status |
|---|---|---|
| Content type | Built into Drupal | Free out of the box |
| Region | **Region taxonomy** (12 terms; §3.14) | Existing; carries over from current site |
| Country | **Country taxonomy** (177 terms; §3.14) | Existing; carries over (Country-representation consolidation is a separate concern — §3.14 #1) |
| Degree Level | **Degree Level taxonomy** (5 terms) | Scholarship only; existing |
| Audience | **Audience list_string** (3 values) | Event + Video finder; existing |
| Center Level | **Center Level list_string** (3 values) | Advising Center finder; existing |

**Implementation:**
- **Base search:** Drupal Search API + Pantheon Search (Solr 8). Included with the Pantheon plan at no separate cost.
- **AI-enhanced sitewide search:** EC's custom Drupal AI search tooling (vector store + Solr + AI-driven result summarization). Scales in tiers — basic vector-backed semantic search, AI-generated result summaries on top, and AI chat using a vector store such as Zilliz for retrieval-augmented responses (the latter feeds the §3.10 Greeter feature). Using EC's existing tooling means the AI search and chat features fit within the LOA AI-features budget; the proposal mentioned SearchStax as one option but the build path is EC-tooled rather than third-party SaaS.
- Both surfaces must respect permission rules ("Custom-built Site Search Engine maintained ... respect the multi-level permissions" per LOA).

**Client questions on this topic:** see `discovery-worksheet.md §H` (Search) — particularly H1 (content types to exclude from public search).

### 3.12 Analytics, heat maps, reporting

- **GA4 + Google Tag Manager** — committed deliverable (LOA §G). EC configures and hands over.
- **Looker Studio** — named in LOA §G; LOA Att. B characterizes the dashboarding tier as *"optional data dashboards (e.g., Google Looker Studio)"*. EC's deliverable is the Looker → GA4 connection. Dashboard authorship sits with IIE post-launch.
- **Heat-map tool** — LOA §G commits us to integrate a heat-map tool but does not name one. EC wires the vendor's snippet onto the site via GTM and configures baseline capture (PII masked by default on form/contact inputs). IIE selects the vendor, owns any subscription cost, and configures/manages capture rules and dashboards post-launch. See `discovery-worksheet.md §I2` for the vendor + scope confirmation.
- **Ownership:** IIE owns subscriptions, dashboard authorship, and ongoing capture-rule changes.
- Analytics outputs available through the configured tools (GA4 + Looker + the chosen heat-map tool) include things the RFP/LOA mention: configurable dashboards, advanced analytics, **CSV export of any report**, bounce/exit rate reporting, device/OS/browser breakdown, multimedia plays. Authorship of specific dashboards sits with IIE post-launch.

**Client questions on this topic:** see `discovery-worksheet.md §I2` (heat-map vendor choice, subscription cost ownership, dashboard authorship, PII masking baseline).

### 3.13 Domain transition `.state.gov` → `.org`

Not just DNS — a brand and trust transition out of a federal TLD. Requires:
- 301 redirect map (pre-built from migration crawl).
- Coordination with State Department for the `.state.gov` redirect at their side (out of our control).
- SEO transition plan (Search Console property changes, sitemap submissions).
- Email/communications messaging that the org address has changed.
- Possible cookie/session domain implications if any shared services span the transition.

**Client questions on this topic:** see `discovery-worksheet.md §J` (Domain, Launch, and Cutover) — particularly J2 (State Dept POC + 301 redirect confirmation) and J3 (redirect-map review).

### 3.14 Content type inventory

Synthesized from the site crawl (`site-discovery.md §2`), the LOA §G structured-content list, and the RFP audience sections. Three tiers based on certainty level.

**Tier 1 — Confirmed via current-site crawl**

| Content type | URL pattern (current site) | Volume | Scope |
|---|---|---|---|
| **Advising Center** | `/centers/{slug}`, `/find-advising-center` | **436** in sitemap (422 displayed via finder) | ✅ Yes |
| **Scholarship** | `/scholarships/{slug}` canonical; also `/find-financial-aid` and `/financial-aid` (both Views over the same type) | **857** in sitemap (270 active via finder — 3× delta likely expired/inactive records the View filters out; see `sitemap-inventory.md`) | ✅ Yes |
| **Event** | `/events/{slug}`, `/find-event` | **5,624** in sitemap (most likely historical/past events; finder probably filters to upcoming) | ✅ Yes |
| **Video** | `/videos-0` | 242 displayed via finder | ✅ Yes — **video as a content medium is LOA-committed** (Att. B obj. #3 — *"impact stories from students…through text, image and video"*; LOA Drupal blocks list includes video; Q&A confirms existing video assets will be incorporated). What's **not specifically named** is the current site's dedicated `/videos-0` library + Video content type + finder facets pattern. Open question: preserve that pattern, fold video content into other types (Stories, Events, 5 Steps), or both — see `discovery-worksheet.md §L2` |
| **Region landing page** | `/regions/{slug}` (authenticated-only; gated to REAC/IIE) | **12** (one per Region taxonomy term; confirmed via full `/node/` redirect pass — see `sitemap-inventory.md §7`) | ❓ **Not named in LOA Scope of Work.** Authenticated-only operational content. Confirm migrate / rebuild / drop — see `discovery-worksheet.md §L12` |

**Tier 2 — LOA-named, greenfield (does not exist on current site)**

| Content type | LOA wording | Current-site status | Build implication |
|---|---|---|---|
| **Adviser Profile** | LOA §G "structured content types … *adviser profiles*" | No public adviser profiles found (extended-pass crawl confirmed) | Greenfield. Field model, curation source, and roster size all unknown — see `discovery-worksheet.md §L6` |
| **Downloadable Resource** | LOA §G "structured content types … *downloadable resources*" | PDFs are currently embedded on other pages, not a standalone type | Likely a Drupal **Media bundle** rather than a node type. Cross-ref §3.8 |
| **News / Story** | LOA Att. A obj. 5: *"display organizational news and content"*; RFP §p.10: *"Student Success Stories gallery"* | `/news` returns 404 — no organizational news stream visible. A **Student Success Stories gallery DOES exist** at `/experience-studying-usa/stories-international-students` (paginated single page, 24+ pages of inline stories — no per-story URLs). | News stream is greenfield. Stories gallery exists — architecture decision (migrate same paginated approach vs. rebuild with per-story content type) — see new §L13 |
| **HEI** | LOA §G + RFP §HEI Audience — institutional info submitted by U.S. higher-education institutions for display on the map and HEI-facing sections | No existing HEI data on the current site | Greenfield. Same submission pattern as Scholarship (§3.2): anonymous + accreditation-gated → REAC review → IIE publish. Submission-driven dataset, not a pre-seeded directory of all accredited HEIs. See `discovery-worksheet.md §E4(b)` for the pre-launch gather plan. |

**Tier 3 — Suggested by RFP / current-site structure, treatment TBD**

| Content type | Source signal | Likely shape | Open question |
|---|---|---|---|
| **Country / Territory page** | RFP map description (170+ countries); existing Country Fact Sheets section | Node per country with demographics, education-system info, fact-sheet links | Confirm one-per-country model — new §L11 |
| **Student Success Story** | RFP §p.10 *"Student Success Stories gallery"*; current site implements as paginated single page (see Tier 2 News/Story row above — no per-story URLs today) | Either (a) preserve current paginated-page architecture, or (b) per-story node content type for individual URLs / SEO / social sharing / metadata | Architecture decision — see new §L13 |
| **Country Fact Sheet** | `/us-higher-education-professionals/recruitment-resources/country-fact-sheets` — currently gated; same artifact as the Regional Fact Sheets row in §3.8 | Media bundle (PDF), taxonomy-tagged by country | Gated vs public — §L9. Migration note: gated PDFs can't be scraped — IIE supplies the source files (see §3.8 migration-source caveat) |
| **FAQ entry** | Current site has 60+ FAQ items at `/experience-studying-usa/us-educational-system/frequently-asked-questions-faqs` | Node-per-FAQ (filterable, searchable) **OR** chunks on a single static page | Migration treatment — §L11 |
| **Glossary term** | Current site has 130+ glossary terms at `/experience-studying-usa/us-educational-system/glossary` | Node-per-term (filterable, linkable) **OR** chunks on a single static page | Migration treatment — §L11 |
| **Webinar** | Current site Online Services nav lists `/us-higher-education-professionals/online-services/webinars` (301-to-home) | If program still active: distinct type with date, video link, materials | Is the program active? — §L4 |
| **Campus News Story** | Current logged-in portal supports submission of "campus news stories" | If public on new site: per-story node with author, date, region | Public on new site? — §L3 |

**Tier 4 — Utility / Standard**

- **Basic Page** — static content (About, Contact, *5 Steps to U.S. Study* pages, Visa Information, etc.)
- **Landing / Section Overview** — section-level layouts (HEI hub, International Students hub, Officials hub, etc.)

**Note:** LOA §G says *"several custom content types for programs, people, and research, and more pending the outcome of our technical planning."* That leaves the door open for additions in discovery — Tier 3 above is our best inference, not a settled list. The complete content-type list is one of the load-bearing discovery outputs — see new `discovery-worksheet.md §L11`.

**Vocabularies and filter fields — observed on the current site.** Extracted from the `<select>` dropdowns on the four filterable Views (`/find-advising-center`, `/find-event`, `/find-financial-aid`, `/videos-0`):

*Drupal taxonomies (term references):*

| Vocabulary | Terms | Used by | Notes |
|---|---|---|---|
| **Region** | 12 | Advising Center; also the canonical key for `/regions/{slug}` gated landing pages | tids 122–11860; mirrors REAC operational geography |
| **Country** | 177 | Advising Center, Scholarship | tids 135–17742. Distinct from the address-module country list used by Event (see below) |
| **U.S. State / Territory** | 56 | Scholarship | 50 states + DC + 5 territories |
| **Degree Level** | 5 | Scholarship | Associate's / Bachelor's / Master's / Doctorate / Post-Doctorate |
| **Video Topic** | 8 | Video | Tightly coupled to the 5 Steps IA — 5 of 8 terms are *Step 1* through *Step 5*; the other 3 are General / International Student Recruitment / International Student Story |

*List_string fields (allowed-values lists, not taxonomies):*

| Field | Values | Used by |
|---|---|---|
| **Audience** | 3: International Students / High School Counsellors / U.S. HE Professionals | Event, Video (shared field name `field_audience_value`) |
| **Event Location Type** | 2: In-Person / Online | Event |
| **Center Level** | 3: Reference / Standard / Comprehensive | Advising Center |

*Address-module country code (not a taxonomy):*

| Field | Values | Used by |
|---|---|---|
| **Event In-Person Country** | 250 ISO 2-letter codes | Event |

**Vocabulary/data-model considerations:**

1. **Two country representations on the current site.** A Drupal taxonomy (177 terms) for Advising Centers + Scholarships, and the address module's 250-code ISO 2-letter list for Event locations. They don't match — the ISO list is more complete (territories, edge cases). New build should consolidate on one canonical Country source (most likely the address module's ISO list) and migrate the existing term references accordingly.
2. **Audience is a shared list_string between Event and Video, not a taxonomy.** Promoting it to a proper taxonomy on the new build would let editors manage allowed values without code/config changes.
3. **Video Topic vocabulary is tightly coupled to the 5 Steps IA.** Five of its eight terms are *Step 1* through *Step 5*. If the 5 Steps content gets restructured on the new build, Video Topic re-tagging cascades — worth keeping in mind when planning the IA.
4. **Scholarship filters missing two RFP-specified facets** — discipline and award-amount. The RFP §Scholarships specifies both as filterable, but they're not visible on the current `/find-financial-aid` form. Either not yet implemented on the current site or removed during a redesign — see `discovery-worksheet.md §F1` (already asks about controlled vocabularies for scholarship filtering).

**Drupal build pattern.** A mix of:
- **Drupal content types (nodes)** for all editorial content — both submittable types (Advising Center, Scholarship, Event, Adviser Profile) and editorial-only types (Country page, Success Story, Basic Page, Landing). Node-based inherits content_moderation, taxonomy attachments, pathauto, Views integration, revisions, and the standard contrib-module ecosystem. Region landing pages (the 12 confirmed) likely become taxonomy-term display pages keyed off the Region vocabulary.
- **Media bundles** for file-centric items (Downloadable Resource PDFs, Country Fact Sheet PDFs).
- **Taxonomy vocabularies and list_string fields** — see the inventory above for the existing set; the new build needs to decide which to carry forward, which to promote (Audience), and which to consolidate (Country).

Per-item node-vs-media decisions are made at the build-planning stage, after L11 confirms the full content type list.

**Observed field inventories for content types not already covered in §3.4 / §3.5 / §3.6.** Derived from sampled current-site records (anonymous crawl). Admin-only fields not visible to crawl are excluded. (Advising Center field inventory lives in §3.4; Scholarship in §3.5; Event in §3.6.)

#### Video
Current-site node type or media bundle (TBD — see `sitemap-inventory.md` discussion). Confirm migration treatment via `discovery-worksheet.md §L2`.

| Field | Type | Notes |
|---|---|---|
| Title | text | Video title |
| Description | long text | Video summary / abstract |
| Audience ("For:") | list_string (3 values) | Shared field with Event — see vocab inventory |
| Video Topic ("Topics covered:") | taxonomy reference → **Video Topic vocabulary** (8 terms, multi-value) | 5 of 8 terms mirror the 5 Steps IA — see vocab/data-model concern #3 |
| Video source | Media reference (YouTube primary; self-hosted MP4 in at least one case) | YouTube via `media_youtube` module per `site-discovery.md §11` |
| Self-hosted file path | (where applicable) | Pattern `/videos/{uuid}.mp4-N` observed in listing |
| Captions (508 compliance) | media attachment | Per `site-discovery.md` — Section 508 captions required for video content on current site |

#### FAQ entry, Glossary term, Student Success Story
All three are currently implemented as **single-page-multi-item assets** — items rendered inline on one page, no per-item URLs:

- **FAQ** — 60+ Q&As at `/experience-studying-usa/us-educational-system/frequently-asked-questions-faqs`. Items appear to be plain HTML question/answer pairs (no structured headings or accordion markup visible in the crawl). "Fields" are simply: question text + answer text.
- **Glossary** — 130+ terms at `/experience-studying-usa/us-educational-system/glossary`. Organized as A–Z anchor index (22 letters used: A, B, C, D, E, F, G, H, I, J, L, M, N, O, P, Q, R, S, T, U, W, Z — gaps at K, V, X, Y). Each entry = term + definition.
- **Stories from International Students** — 24+ pages of stories at `/experience-studying-usa/stories-international-students`. Each story = title (often student name) + narrative text + image. No structured fields visible per-story.

If the new build moves any of these to node-per-entry content types (per §L11 + §L13 decisions), the field set is simple: title + body + (for stories: portrait image + optional region/country/audience tagging).

#### Greenfield or inaccessible

These items fall outside the scrape-based migration approach in §3.1 — sourcing comes from IIE (discovery conversations, backend export, or net-new authoring) rather than from a crawl.

- **Region landing page** (12 pages, gated) — can't sample anonymously. Likely fields knowable only via IIE discovery input or backend access.
- **Country Fact Sheets** (gated currently — see §L9) — can't sample anonymously.
- **Webinars** (URL 301-to-home — see §L4) — content not retrievable.
- **Campus News Story** (portal-only — see §L3) — content not retrievable.
- **Adviser Profile, Country page, News, Downloadable Resource as a standalone content type** — do not exist on current site; field models are greenfield (see §L6, §L11).

**Client questions on this topic:** see `discovery-worksheet.md §L11` (complete content type inventory confirmation) and `§L12` (Regions content scope).

---

## 4. Integrations Inventory

| System | Purpose | Direction | Status / Source |
|---|---|---|---|
| **OKTA (IIE tenant — standard, *not* FedRAMP variant)** | SSO for internal users | Drupal ← OKTA (SAML or OIDC TBD) | Committed (LOA §G; Q&A confirms standard OKTA) |
| **Google Analytics 4** | Site analytics | Drupal → GA4 | Committed |
| **Google Tag Manager** | Tag orchestration | Drupal → GTM | Committed |
| **Google Looker Studio** | Dashboards on top of GA4 data | GA4 → Looker | Named in LOA §G; Att. B framing is *"optional data dashboards (e.g.,)"*. EC connects Looker to GA4; IIE owns ongoing dashboard authorship. See `discovery-worksheet.md §I2` |
| **Google Translate** | Multilingual at launch (LOA) | Drupal → Google | Committed per LOA §G. Upgrade to a "more robust plugin" deferred to a future change order. |
| **Heat map tool** | UX behavioral analytics (click / scroll / session-recording / etc.) | Site → vendor JS via GTM | LOA §G commits the integration; vendor not named. **IIE selects vendor + owns subscription**; EC wires the snippet and baseline capture. See `discovery-worksheet.md §I2` |
| **MailChimp** | Email marketing for HEI list | Drupal → MailChimp (export) | Standard `drupal/mailchimp` contrib module configured against IIE's account |
| **Social media accounts** | Feed embeds + outbound links | Embed + link out | **Per Q&A, scope = Facebook, X (Twitter), Instagram, LinkedIn, YouTube** |
| **LLM provider(s)** | Power AI features | Drupal → LLM API | Vendor + billing model TBD; tokens are IIE expense (LOA p.30) |
| **Accreditation source** | HEI vetting (not in any doc) | Source → Drupal | **Unknown** — not yet identified |

---

## 5. Hosting — Pantheon

Hosting is outside EC's scope. Per LOA Att. B: *"IIE is solely responsible for procuring and maintaining a hosting services agreement with an independent third-party hosting provider."* As of May 2026, IIE selected Pantheon. Our role is integration + coordination — we don't hold the Pantheon contract.

### What Pantheon brings
Managed Drupal hosting on Google Cloud, SOC 2 Type 2, Fastly-based CDN, Git-based Dev/Test/Live + Multidev, daily backups, Solr search and Redis cache add-ons.

### Our obligations under the LOA (Att. B)
- Primary point of contact for IIE on all website matters.
- Must coordinate with Pantheon on issues — initiate, track, escalate.
- Not liable for hosting failures.

EC will need to be added as a Supporting Org to the IIE Pantheon account.

---

## 6. Discovery Questions

The full discovery question list lives in the companion `discovery-worksheet.md`, organized A–N by topic. This document deliberately doesn't duplicate it.

---

## 7. Top Technical Risks (summary)

1. **No backend access.** Without read-only access to the existing Drupal database, content migration relies on scraping, which captures display fields cleanly but can miss structured-data nuance, embedded forms, and access-protected resources. EC will work with IIE to pursue read-only access via ECA contacts during discovery; if it's not feasible, the migration plan adapts around that.
2. **OKTA integration scope is small; the role model needs careful alignment.** The LOA's OKTA scope is modest, but the role architecture (HEI anonymous submissions + IIE-staff OKTA SSO + per-role permission grid) is the area where small discovery misalignments produce the most rework downstream. Pinning this down early (see §C1–C5 in the worksheet) keeps the editorial UX clean at launch.
3. **AI feature scope is loosely defined.** The LOA names four AI features — Greeter, AI-enhanced search, Translation Support, AI-supported analytics — but doesn't pin down depth, query/response patterns, editorial UX, or what "multilingual" actually means at each surface. Without sharper definitions in discovery (see §G in the worksheet), this is the area most exposed to scope creep against a fixed-fee budget. LLM vendor selection (Anthropic / OpenAI / Google / Azure OpenAI) is a secondary item — needed early so feature integrations can be planned against the chosen provider's API and pricing.
4. **Domain migration coordination depends on State Department.** The `state.gov` → `.org` cutover requires State to put a redirect in place on their side; that's outside our contract. EC delivers the redirect map and SEO transition plan; State's timing determines how smooth the cutover lands for inbound traffic.
5. **AI features need real content to test, train, and tune.** The Greeter, AI-enhanced search, and AI summarization features all retrieve from a vector-indexed corpus of site content (see §3.10, §3.11). Until substantive content is migrated from the current site (per §3.1) and any IIE editorial review is complete, the AI features have limited material to work against. EC's build sequence stands up the AI infrastructure early (testable with synthetic content), ingests scraped content as soon as it's available, and reserves time pre-launch for AI tuning against the final populated index. The dependency is real — meaningful AI QA happens late by necessity, so the project schedule needs to budget for it.

---

## Revision Log

| Date | Notes |
|------|-------|
| 2026-05-13 | First-pass synthesis of RFP, proposal, and LOA. No discovery interviews yet. |
| 2026-05-14 | Folded in RFP Q&A (Amendment 1). OKTA no longer described as FedRAMP variant. Editorial workflow simplified to linear. Multilingual updated to reflect IIE's internal translation program. Hosting FedRAMP softened to preferred. |
| 2026-05-15 | Added Glossary. Fixed column misuse in §2 table (Multilingual, AI features, Editorial model). Reframed §3.2 role model to separate RFP-prescribed vs. current-D7 inventory; added caveat to §3.3 about authenticated-submitter assumption. Pulled newsletter row out of §3.3 (not a submission/approval workflow). Removed "Timeline shift worth flagging" subsection from §1. Linked discovery questions C0, D1, H1a–c. |
| 2026-05-18 | Flipped the §3.2 / §3.3 framing of authentication model: source documents (RFP §User Roles + Q&A Mod 1 §User Accounts) explicitly prefer **admin-only logins with OKTA-verified forms for everyone else**. Repositioned the 4-role authenticated set from "current working assumption" to "documented fallback only if the integration approach can't work." Quoted the Q&A §User Accounts passage directly so the source intent is visible in-doc. |
| 2026-05-18 | Sharpened §3.3 to match the new §3.2 framing. Renamed the table column to *Submitter verification*; sharpened the Reviewer column to show the linear *first-review → IIE publish* flow; added REAC/REAC Assistant and Sponsor submission rows (previously omitted — RFP §User Roles makes both content creators). Added a **Reviewer-side question** subsection enumerating three patterns under model (a): custom OKTA-gated dashboard, email-link approval tokens, or JIT-provisioned invisible Drupal accounts. Flagged the non-default OKTA-token-without-Drupal-user behavior in the Drupal pattern paragraph. New corollary discovery question links: §C0a (reviewer-side mechanism) and §C0b (REAC/Sponsor submission scope). |
| 2026-05-18 | **Walked back the over-engineered "no Drupal user record" framing.** The Q&A's *"no website-specific accounts"* statement is about avoiding a separately-managed credential system, not about avoiding Drupal user records. Standard OKTA SSO with JIT provisioning *is* the pattern IIE is asking for: OKTA is the source of truth, Drupal user records exist invisibly via JIT, IIE never manually provisions an account. Removed the "custom OKTA-gated dashboard" and "email-link approval token" workarounds from §3.3. Reframed §3.2 to make the real C0 decision a **UX-surface question** (Webform-only vs Drupal editor UI vs hybrid), since all three shapes share the same authentication plumbing. Simplified the §3.3 verification column to "OKTA SSO" across all internal roles. |
| 2026-05-18 | Flagged **Sponsor authentication as unresolved**. The Q&A's "Advisers and REACs already have IIE OKTA logins" statement is conspicuously silent on Sponsors — and since Sponsors are State Department staff (not IIE staff), an IIE OKTA login can't be assumed. Updated §3.2 with a dedicated bullet enumerating four options (State Dept federation / IIE-provisioned guests / website credentials / no Sponsor authentication). Softened §3.3 table — Sponsor row now reads **TBD** with a pointer to expanded §C6 in discovery worksheet. |
| 2026-05-18 | Added **§3.7 Content type inventory**. Four-tier synthesis pulling from current-site crawl (`site-discovery.md §2`), LOA §G structured-content references, and RFP audience sections. Tier 1: crawl-confirmed (Advising Center, Scholarship, Event, Video). Tier 2: LOA-named greenfield (Adviser Profile, Downloadable Resource, News/Story). Tier 3: RFP-implied / current-site-suggested (Country pages, Success Stories, Country Fact Sheets, FAQ, Glossary, Webinars, Campus News). Tier 4: utility (Basic Page, Landing). Added discovery question §L11 to surface anything we've missed and to pin down Tier 3 node-vs-page-chunk treatment. |
| 2026-05-18 | Fixed §3.5 — replaced "EC staff edit/approve" with the correct REAC → IIE Admin workflow (Electric Citizen is the build vendor, not the editorial owner). |
| 2026-05-18 | Softened §3.9 — removed "Trade-off worth flagging" advocacy framing and the "more robust plugin" Phase 2 pitch. Replaced with neutral "Build implications to account for" describing how Google Translate (display overlay) operates against the English source content. The LOA's GT-at-launch commitment is treated as settled, not as a tradeoff to reopen. |
| 2026-05-18 | Reconciled §3.9 and §3.10 around the LOA's multilingual AI commitments. §3.10 Greeter row now reflects "multilingual via the LLM" (LOA explicit). AI-enhanced search row clarified that "multilingual" means *input handling*, not multilingual index. Translation Support row softened to quote the LOA literal phrase and acknowledge our editorial/staff-facing interpretation is **not literal in the LOA** and needs IIE confirmation via new `discovery-worksheet.md §G6`. §3.9 AI bullet rewritten to affirm rather than disclaim. |
| 2026-05-19 | Expanded §3.3 (Interactive map(s)) with source-doc grounding: LOA CLIN 4.4 deliverable date and data-source list, RFP's broader wishlist + the country/territory border-update requirement + the external-link disclaimer, RFP's separate world-map vs U.S.-map phrasing, and the Q&A's "feasible ideas / vendor judgment" answer. Set the explicit default posture that much is undefined and resolves during Strategy + Design, with data provenance flagged as the central open item. |
| 2026-05-19 | Tightened §3.12 — removed the "scope-split / AI-tokens precedent" framing and reduced it to a one-line ownership statement (IIE owns subscriptions, dashboard authorship, capture-rule changes). Adjusted the dependent trailing line on dashboard authorship to match. |
| 2026-05-19 | §3.8 Regional Fact Sheets row updated to note current-site gating and likely overlap with the ~350 `/node/{N}` sitemap 403s. Added an explicit migration-source caveat to the section: gated PDFs cannot be scraped, so IIE must supply the source files (Drive/Box export, current-site file directory, or REAC-login export). |
| 2026-05-19 | §3.14 Tier 1 table — renamed "LOA scope?" header to "Scope"; added ✅ Yes to the Video row to lead the LOA-commitment explanation. |
| 2026-05-19 | §3.14 Tier 3 Country Fact Sheet row cross-linked to the §3.8 Regional Fact Sheets row (same artifact) and tagged with the same migration-source caveat. Removed Newsletter Subscription from Tier 4 — subscriber records are form submissions / list state, not editorial content; the MailChimp integration is already covered in §2 Glossary and `discovery-worksheet.md §I1`. |
| 2026-05-19 | **Structural re-order of §3 work streams.** Promoted content-cluster items together: 5 Steps moves from §3.14 → §3.7 (adjacent to structured content types); External resources moves from §3.12 → §3.8 (adjacent to content types — overlaps with Country Fact Sheets in §3.14). Multilingual / AI / Search / Analytics / Domain shift down by 2 (§3.7→3.9, §3.8→3.10, §3.9→3.11, §3.10→3.12, §3.11→3.13). Content type inventory stays at the back as reference, renumbered §3.13→3.14. Earlier revision-log entries that reference §3.X have been updated to the new numbering to keep cross-references navigable; old→new mapping: 3.7→3.9, 3.8→3.10, 3.9→3.11, 3.10→3.12, 3.11→3.13, 3.12→3.8, 3.13→3.14, 3.14→3.7. Cross-doc §3.X citations in `discovery-worksheet.md` updated to match. |
| 2026-05-19 | **Swapped worksheet §H and §I.** Worksheet §H Integrations and §I Search swap positions so the worksheet order matches the new tech-analysis §3 order (AI → Search → Analytics). All §H/§I cross-references in `discovery-worksheet.md` and `technical-analysis.md` updated. Earlier revision-log entries that reference §H1 etc. have been updated to the new numbering to keep cross-references navigable. |
| 2026-05-19 | Expanded §3.3 (Interactive map(s)) with the architectural implications of the RFP's "shifting borders" requirement: vector-overlay-not-raster, Drupal-managed geography entities, baseline dataset as a political decision, stable internal keys, and editorial workflow honesty (attribute vs geometry edits). Replaces the prior one-line stub. |
| 2026-05-18 | Folded sitemap-inventory findings into §3.7. Tier 1 counts updated to reflect sitemap reality (Advising Center 436, Scholarship 857, Event 5,624 — vs. site-discovery's smaller View-filtered figures). Added **Region landing page** as a Tier 1 row (12 pages, gated, confirmed via `/node/` redirect pass). Replaced the vague "Taxonomy vocabularies for cross-cutting filters" bullet with a full inventory of vocabularies (Region 12 / Country 177 / U.S. State 56 / Degree Level 5 / Video Topic 8), list_string fields (Audience / Event Location Type / Center Level), and the address-module country code split (250 ISO codes used by Event, distinct from the 177-term Country taxonomy). Flagged four vocabulary/data-model concerns including the two-country-representations split. |
