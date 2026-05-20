# EducationUSA — Live Site Discovery Findings

> **Generated:** 2026-05-14
> **Source:** Live-site exploration of `educationusa.state.gov` (anonymous, no login access). Methodology: WebFetch probing of homepage + all top-level nav items + one-level-deep sampling under each, plus sitemap walk.
> **Companion to:** `migration-analysis.md`, `technical-analysis.md`
> **Purpose:** Surface site structure, tools, and hidden functionality that aren't apparent from the RFP, EC proposal, LOA, or Q&A. The "unknown unknowns" of the existing site.


## ⚠ Confidence flags

Every finding below carries one of three confidence levels:

- **🟢 Confirmed** — directly observed on a public-side page (e.g., visible CTA, dropdown contents, page count from sitemap)
- **🟡 Inferred** — concluded from public-side breadcrumbs (nav references, CTAs, surface descriptions) without seeing the thing itself
- **🔴 Speculative** — guess based on platform conventions or surrounding context; needs verification

We do not have login access. The single highest-leverage discovery action that closes the 🟡 → 🟢 gap is a **REAC screen-share** (see `migration-analysis.md §8.4`).

---

## 1. Site outline (top-level navigation)

**🟢 Confirmed.** Visible on every public page.

| Section | URL | What it leads to |
|---|---|---|
| Experience Studying in the USA | `/experience-studying-usa` | Evergreen content for prospective students (already documented) |
| Your 5 Steps to U.S. Study | `/your-5-steps-us-study` | Evergreen guided journey (already documented) |
| Find an Event | `/find-event` | Faceted event search (Audience, In-Person/Online, Location) |
| Find an Advising Center | `/find-advising-center` | Faceted center search (Region, Country, Level of Service) |
| U.S. Higher Education Professionals | `/us-higher-education-professionals` | HEI-audience portal hub (has "Request a Login Now!" CTA) |
| Foreign Institutions and Governments | `/foreign-institutions-and-governments` | Foreign-audience mirror of HEI hub |

**Header utility:** sibling ECA properties (`eca.state.gov`, `alumni.state.gov`, `americanenglish.state.gov`, `exchanges.state.gov`, `j1visa.state.gov`, `studyabroad.state.gov`) + `/about/translation` + `/user/login`.

**Footer:** `/about-educationusa`, State Dept Privacy Notice (external), `/contact-us`, `/videos-0`, `/experience-studying-usa/us-educational-system/glossary`, `/experience-studying-usa/us-educational-system/frequently-asked-questions-faqs`, `/alerts-and-messages`, `/find-financial-aid`, `/employment-and-internship-information`, `/node/1116` (Error/Bug form).

---

## 2. Content types: four surfaced so far

(Three were identified by the live-probing in `migration-analysis.md §3` because their URL patterns were obvious in the sitemap; the site-exploration agent found one more — Video. The earlier identification of "Financial Aid" as a separate content type was wrong — see §11 corrections. The LOA itself doesn't enumerate a content-type count — it references events, scholarships, advising centers, "adviser profiles," and "downloadable resources" without a total.)

| Content type | URL pattern | Volume | Status before this discovery |
|---|---|---|---|
| Advising Center | `/centers/{slug}`, `/find-advising-center` | **422** | Documented; in LOA |
| Scholarship | `/scholarships/{slug}`, `/find-financial-aid` | **270** | Documented; in LOA. `/find-financial-aid` is a **second View** over the same Scholarship content type — *not* a separate type. |
| Event | `/events/{slug}`, `/find-event` | (per sitemap) | Documented; in LOA |
| **Video** | `/videos-0` | **242** | **🟢 Confirmed new finding.** Video as a content medium **IS** LOA-committed (Att. B obj. #3 + Drupal block list + Q&A). The current dedicated-library pattern is the open question — see `discovery-worksheet.md §L2`. |

### Scholarships / Financial Aid

- **🟢** Same content type, surfaced through two Views:
  - `/scholarships/{slug}` — canonical record path
  - `/find-financial-aid` — alternate filtered View (degree level, U.S. state, country)
  - `/financial-aid` — alias path for the same View (confirmed during extended pass)
- **🟢** 270 records total
- **🟡** User-submittable via the logged-in portal (inferred from public-side menu labels)

### Videos (`/videos-0`) — new finding

- **🟢** Library of 242 records, paginated
- **🟢** Filters: Category (General / Recruitment / Student Story / mapped to the 5 steps), Audience
- **🟡** User-submittable via the gated portal
- **🟢** Section 508 captions required (mentioned on public-side description)
- **🟢** Hosting confirmed as **YouTube** — thumbnail URLs reference Drupal's `media-youtube/` module path. One self-hosted MP4 exception noted in the agent crawl.

**Implication:** the new build's content model is **4 types**, not 5 or 3. Videos involve user submissions + curation workflows, which adds editorial/submission system scope. Worth confirming with Albino whether Videos migrate, deprecate, or rebuild as part of this contract.

---

## 3. The logged-in portal — small, narrow, and being demolished

The current site has an authentication surface that supports content submission. The site itself describes its purpose in a single sentence (verbatim from the Submit Content page):

> *"By logging in to the EducationUSA website, you can submit content such as videos, financial aid opportunities, and campus news stories for hosting on our website."*

That's the portal. It exists to let approved users submit three content types: **videos, financial aid opportunities, and campus news stories.** Plus newsletter subscription + a REAC contact directory + presumably some account management.

**Why this stops mattering quickly for our build:**

1. The new build eliminates HEI accounts entirely — submissions move to anonymous forms with manual approval.
2. The new build moves advisers/REACs to OKTA SSO, not Drupal-managed credentials.
3. Therefore the **portal as a thing is being demolished**, not migrated.
4. The only data in the portal that matters for migration is **whatever is publicly surfaced today** — because that's the only data we can scrape, and per IIE's design intent, anything not publicly surfaced is portal-internal state that goes away.

Mapped to publicly-visible content types:
- **Videos** → publicly visible at `/videos-0` (242 records) → scrapable
- **Financial aid opportunities** → publicly visible at `/find-financial-aid` (270 records) → scrapable
- **Campus news stories** → public URL unknown; possibly portal-only

So everything below in §3.x is for the record, not for migration planning.

### 3.1 What we can confirm about the portal

**🟢 Direct observation:**

- **6 user roles** (from the bug-form Account Type dropdown at `/node/1116`): Anonymous, State Dept Staff, U.S. HE Professional, Adviser, REAC, IIE Staff
- **3 self-registerable roles** (from `/user/register`): Adviser, State Dept Staff, U.S. Higher Education Professional. REAC and IIE Staff are presumably promoted internally.
- **Login CTAs** on the HEI section + `/user/login` reachable from the footer
- **"Submit Content" is a real labeled feature** at `/us-higher-education-professionals/online-services/submit-content`, described by the site itself as supporting submission of videos, financial-aid opportunities, and campus news stories
- **"Webinars" exists under Online Services** at `/us-higher-education-professionals/online-services/webinars` — though the URL **301-redirects to the homepage** (extended-pass finding); link present in nav, page content unreachable anonymously
- **A "U.S. Higher Education Monthly Newsletter" page** exists publicly at `/us-higher-education-professionals/online-services/us-higher-education-monthly-newsletter` (this is distinct from the gated "HEI eNews" referenced elsewhere; possibly a public archive of the newsletter)

### 3.2 What we previously over-claimed (now corrected)

These appeared in the original agent run and were repeated as facts but **could not be verified by direct probing**:

- ~~"My Resources" workspace label~~ — not found in public HTML; likely agent pattern-matching
- ~~"My Content" workspace label~~ — same
- ~~"Regions and REACs" as a portal section~~ — appears in nav references but the actual portal feature is unverified; the public REAC page (`/us-higher-education-professionals/educationusa-network/region-educational-advising`) shows the region list publicly with full details gated
- ~~"3-5 business-day human approval workflow"~~ — agent claim; specific wording not independently verified

### 3.3 Why none of this matters past noting it

The portal is being demolished, not migrated (see top of §3). For migration purposes, the only useful question is **what's publicly surfaced** — and that's covered by the content-type inventory in §2.

---

## 4. Tools and interactive features (not in any other doc)

**🟢 Confirmed:**

- **Glossary** (`/experience-studying-usa/us-educational-system/glossary`) — **130+ terms** (extended-pass count refined the earlier ~115–120 estimate), A–Z anchor index, plain HTML. Straightforward to migrate.
- **FAQ** (`/experience-studying-usa/us-educational-system/frequently-asked-questions-faqs`) — **60+ Q&As** (refined from earlier 50+), organized **chronologically, not by topic** — opportunity in the new build to add topic grouping + search.
- **Stories from International Students** (`/experience-studying-usa/stories-international-students`) — public success-stories gallery, **paginated single page with 24+ pages of stories rendered inline** (no per-story URLs). Substantive content (68KB rendered page). Missed in the original crawl as a distinct asset; surfaced via targeted re-crawl of the Experience hub. New-build architecture (preserve paginated page vs. per-story content type) is open — see `discovery-worksheet.md §L13`.
- **Sitewide search** — **prominent**, lives at `/search` (with results page) and is exposed via search inputs in both header and footer on every page. The `/search` results page also has a **sidebar of preset "Other Searches" entry points**: Website / Advising Centers / Events / Financial Aid / Videos. (Earlier claim of "no prominent on-site search bar" was wrong.) **However**: the four faceted finders (`/find-event`, `/find-advising-center`, `/find-financial-aid`, `/videos-0`) appear to be **independent of** sitewide search — a search for "scholarship" returns "Page" results, not Scholarship records. The new build's "AI-enhanced search" should unify these surfaces.
- **EducationUSA Global Guide** (`/us-higher-education-professionals/recruitment-resources/global-guide`) — **ungated.** Direct PDF downloads: current 2024 full report + six regional breakdowns + 11-year archive (2013–2023). (Earlier 🟡 guess of "gated PDF" was wrong.)
- **Alerts and Messages** (`/alerts-and-messages`) — **misleadingly named.** Not an alerts list. Static page directing users to external State Department + CDC travel advisories. No subscribe widget.
- **Employment and Internship Information** (`/employment-and-internship-information`) — links to USAJobs.gov, State Dept internship portal, IIE.org careers. No embedded jobs feed.
- **No interactive map anywhere on the current site.** Centers + events are list+filter only. The RFP's interactive-map requirement is **greenfield, not a replacement.**
- **No social-media feed embeds.** Surprising for a public-facing State Dept site. Social presence is link-out only.
- **No Google Translate widget on public pages.** `/about/translation` is a disclaimer-only page; no translation tool is currently deployed. We'd be adding it in the new build, not replacing it.

**🟡 Inferred:**
- **Country/Territory Student Mobility Fact Sheets** (`/us-higher-education-professionals/recruitment-resources/country-fact-sheets`) — **redirect-loop** to anonymous fetch (confirmed extended pass); likely login-gated. Different gating posture than the Global Guide (which is open).

**🟢 Additional confirmed items** (surfaced while auditing the Online Services nav):
- **⚠ "Webinars"** at `/us-higher-education-professionals/online-services/webinars` — **dead link.** The parent "Online Services" page links to it, but the URL returns **HTTP 301 → redirect to homepage**. Not in sitemap.xml. Status unknown — possibly retired, possibly moved behind login, possibly relocated. Ask IIE.
- **U.S. Higher Education Monthly Newsletter** at `/us-higher-education-professionals/online-services/us-higher-education-monthly-newsletter` — a public-side newsletter page. **Confirmed subscription happens via user-profile checkbox after login**, not a public signup form.
- **Podcasts** actually live at `/podcasts` (the agent's earlier `/us-higher-education-professionals/online-services/podcasts` URL was wrong — corrected). **Pure link-out hub** to Spotify / Apple Podcasts / SoundCloud / Amazon Music / iHeart for 5 podcast series. No embedded player, no RSS, no on-site audio hosting.
- **Social Media Terms and Conditions** at `/social-media-terms-and-conditions`
- **External dependency:** an in-content link on `/us-higher-education-professionals/online-services` points to a **Google Slides deck** (`docs.google.com/presentation/d/1OzX0DnJJKGwMeTNU9IpG3kMpU6n3UsY-5_lhHBll2Uw/edit`) as "navigation instructions" — meaning some operational documentation lives outside the Drupal site in a public Google doc. Worth knowing.

---

## 5. Forms

**🟢 Confirmed (extended-pass full inventory):**

| URL | Purpose | Inputs | Gating | Notes |
|---|---|---|---|---|
| `/node/1116` | Error/Bug submission | Browser*, OS, URL*, Steps to recreate*, Account Type (6-role dropdown), Email, image CAPTCHA* | Public/anonymous | Drupal Webform `webform_client_form_1116`. 6-role dropdown is the canonical role-model artifact. **Only public form with any spam protection** — image CAPTCHA (not reCAPTCHA). |
| `/` header + footer (sitewide) | Site search | Single keyword field | Public | Submits to `/search`. Two instances per page. |
| `/find-event` | Event finder | Audience, Type (In-person/Online), Location (250+ countries), keyword | Public | GET; pagination via `?page=N`. No map. |
| `/find-advising-center` | Advising-center finder | Region (6), Location (195+ countries), Level of Service, keyword | Public | 422 results, paginated, no map. |
| `/find-financial-aid` | Scholarship finder | Degree Level (5), U.S. State (50+ DC + territories), Country (50+), keyword | Public | 270 results, 27 pages. View over Scholarship content type. |
| `/videos-0` | Video library finder | Category, Topic/Audience | Public | 242 videos. YouTube-backed. |
| `/user/login` | Login | Email*, Password* | Public form; access gated | Standard Drupal `/user`. **No SSO/OKTA** on the current site. |
| `/user/register` | Account registration | Role radio (3 public options: U.S. HE Professional / State Dept Staff / Adviser) | Public form; **3–5 business-day approval** | REAC and IIE Staff are internally promoted, not self-registerable. |
| `/user/password` | Password reset | Email | Public | Standard Drupal. |
| `/us-higher-education-professionals/fairs-and-events/educationusa-campus-hosting-opportunities` | Campus visit applications | (4 external Google Forms — Drupal page is just a routing surface) | Public, off-site | **2 Virtual Visit + 2 In-Person Visit** forms, all on Google Forms. Operational workflow lives outside Drupal. |

**Pages that look like forms but aren't:**
- **`/contact-us`** — `mailto:educationusa@state.gov` routing page only. No form. New build should have a real contact form.
- **Individual event pages** (e.g., `/events/...`) — no registration form on-page; registration is an external **bit.ly link** to off-site systems. Pattern is uniform across all events.
- **Individual scholarship pages** (e.g., `/scholarships/...`) — no application form on-page; applications link off-site to the institution's own admissions portal.

**🟡 Gated (behind login):**
- Newsletter (HEI eNews) — subscription is **a checkbox in user-profile preferences after login**, confirmed during extended pass. Not a public form. No MailChimp embed visible anywhere.
- Submit Content workflows for videos, financial aid, campus news — happen inside the gated portal.

**Spam-protection posture (across all public forms):**
- Only `/node/1116` has any protection (image CAPTCHA).
- **No reCAPTCHA, no honeypot, no visible rate-limit** anywhere public.
- Image CAPTCHA is both accessibility-problematic (WCAG) and weak spam defense in 2026. **New build should swap to a modern stack** — honeypot + reCAPTCHA v3 (or hCaptcha) + Drupal `flood` controls.

---

## 6. External integrations visible from the public side

**🟢 Confirmed (or confirmed-absent):**

- **No** Vimeo, MailChimp, Constant Contact, Twitter/X, Google Translate widget, or reCAPTCHA visible on public pages.
- **Sibling State Dept properties** linked from the header (six of them; see §1).
- **External federal portals** referenced in content: USAJobs.gov, State Dept internship portal, IIE.org careers, DHS Study in the States, CDC travel notices.

**🟢 Confirmed during extended pass:**
- **Video hosting = YouTube.** `/videos-0` records embed via Drupal's `media-youtube` module (thumbnail URLs reveal the integration). One self-hosted MP4 exception suggests at least one video lives on the Drupal server itself.
- **Event registration = bit.ly to external sites.** Every event record we sampled (e.g., `/events/financial-aid-scholarships-us-0`) routes registration off-site via a `bit.ly/...` link. Pattern is uniform — IIE deliberately doesn't host event registration in Drupal.
- **Campus Hosting submissions = external Google Forms.** `/us-higher-education-professionals/fairs-and-events/educationusa-campus-hosting-opportunities` funnels four distinct workflows (2 Virtual Visit + 2 In-Person Visit) through **off-site Google Forms** + Google Docs. Operational submission UX lives outside Drupal.

**🔴 Unknown:**
- The Open Doors Report integration — pointed at IIE-hosted asset, not self-hosted; unclear how (or if) data is pulled into the Drupal site.

---

## 7. Audience-segmented sections — observed shape

**🟢 Confirmed:**

- **U.S. Higher Education Professionals** (`/us-higher-education-professionals`)
  - Public sub-sections: Why Internationalize, EducationUSA Network (Centers, Embassies, REACs, Advisers, Service Policies), Fairs and Events, Special Programs, Recruitment Resources, Online Services, U.S. Government Resources
  - Gated portal: My Resources, My Content, Regions and REACs, HEI eNews, Submit Content workflows
- **Foreign Institutions and Governments** (`/foreign-institutions-and-governments`)
  - Mirror of HEI hub for foreign-side audiences
  - No login CTA observed
  - Sub-sections include Student Emergencies, Student Mobility Data, Partnering with U.S. Universities, Non-EducationUSA Overseas International Events
- **Special Programs** — 5 listed (Opportunity Funds, EducationUSA Academy [sunset 2024], MOOC Camp, EducationUSA Training Institutes, Competitive College Clubs). External applications; no on-site forms.
- **REACs** — 12 coordinators across 6 regions (SSA, EAP, EUR, MENA, SCA, WHA). Public page shows region list only; contact details gated.

---

## 8. Notable / weird

- **EducationUSA Academy concluded summer 2024** — content still on the site for a defunct program. Two-year-stale content on a federally-funded site is a content-audit signal worth its own pre-launch pass.
- **REAC terminology drift** — page title is "Regional Educational Advising **Managers**" but URLs/nav say "**Coordinators**." Data-model inconsistency in the source.
- **Mirror navigation** — Centers/events appear in nav trees under both the HE Professionals and Foreign Institutions sections. Likely duplicated menu entries, not duplicated nodes, but worth verifying for the new IA.
- **422 advising centers** (current count). The RFP's "400+" is approximately right.
- **12 REACs** across 6 world regions.
- **No social feeds, no interactive maps, no Google Translate widget today.** Site search IS exposed (corrected from earlier finding — see §4). The new build's "interactive map," "AI-enhanced search," and "translation features" are all greenfield additions or upgrades, not replacements.
- **3–5 day account-approval workflow** is real and visible on the public-side account-request page. Suggests a Drupal `user_register` moderation hook or Workbench-style queue.
- **No on-page adviser profiles anywhere public** (extended-pass finding). The LOA references "adviser profiles" as a content type but the current site doesn't surface any. `/us-higher-education-professionals/educationusa-network/educationusa-advisers` is a static "what advisers do" page with no profile listings. **New-build adviser-profile feature is greenfield, not migration.**
- **~350 `/node/*` URLs in sitemap page 2 return 403 anonymously** (extended-pass finding). Substantial chunk of indexed-but-inaccessible content. Could be aliased nodes whose original `/node/N` paths now deny but remain in sitemap, or genuine orphan content. **Strong case for the REAC screen-share agenda to include "show me what `/node/179` is" walk-throughs.**
- **`/experience-studying-usa/news` 404** — Experience hub nav references News but the URL doesn't resolve. Either moved or sitemap-orphaned. Need to find the real news index path (if any).
- **"Your 5 Steps to U.S. Study" is static**, not a guided wizard (extended-pass finding). Branded as a "journey," but no progress tracker, no conditional logic. Each step branches into 6 study-level pages → a 30-page grid. New build could legitimately turn this into a guided wizard if IIE wants that UX.
- **Server-rendered, JS-light** (extended-pass finding). No SPA frameworks, no React mount points, no data-attribute-driven widgets in HTML scans. Whatever map / visualization / AI-search the new build adds will be **net-new JavaScript surface area**, not replacement of existing dynamic behavior. Performance-budget implications.
- **404s / redirect-loops on several documented child URLs** (country fact sheets index, some scholarship slugs, some advising-center slugs, the `/news` URL, the webinars URL) — combination of gated content, possible CDN bot-detection, and dead links. Worth a manual browser check on a handful during the REAC screen-share.

---

## 9. Implications for our working docs

The findings here change three things across the doc set:

1. **`migration-analysis.md §3`** — content type inventory expands from the three live-probed types (centers, scholarships, events) to **four total**. Videos (242 records, YouTube-backed) is a confirmed structured collection that isn't in the LOA Scope of Work. (Financial Aid is **not** a separate type — it's a second View over Scholarship; the earlier 5-type claim was wrong.)
2. **`migration-analysis.md §5`** — my earlier read that "HEIs don't have accounts today" was wrong. They do. The Q&A's no-accounts statement was forward-looking (about the new site), not descriptive of current state.
3. **`technical-analysis.md` role model** — see `technical-analysis.md §3.2` for the role architecture and submission workflows.

The findings also surface **new scope questions for Albino** that need to be folded into `discovery-worksheet.md`:

- Are Videos in scope for the new build? Migrate, deprecate, or change-order?
- What happens to the existing HEI portal at cutover? In-flight submission state? Existing HEI user records?
- Is the new build expected to support more or fewer audience-specific content streams than the current site?
- The 3–5 day human-review account approval — is this preserved in the new design (for advisers/REACs via OKTA), or replaced with automatic role-mapping?
- **Webinars status** — is this program retired, moved behind login, or relocated?
- **Adviser profiles** — does IIE want public adviser profiles in the new build (greenfield, not migration)?
- **Campus Hosting Google Forms** — replace with native Drupal forms, or accept external-form pattern?
- **~350 `/node/*` 403 URLs** — what are they, and are any of them migration-relevant?
- **EducationUSA Academy stale content** — kill before launch?

---

## 10. Recommended next discovery actions

1. **REAC screen-share** — already at the top of the migration recommendations. Expanded agenda: walk through the logged-in portal (Submit Content, Regions and REACs); show a sample of the ~350 `/node/*` URLs that 403 anonymously; confirm whether the webinars URL is retired or moved; show how Country Fact Sheets appear to logged-in users.
2. **Verify Videos in/out of scope with Albino** before any build planning treats it as in-scope (or excludes it). Same for the campus-news content stream that's portal-only.
3. **Inspect one of each user-contributable record type** (a video record, a campus news record) to confirm parseability and field structure — same approach used for centers/scholarships/events in `migration-analysis.md §3.3`.
4. **Probe the existing HEI signup → newsletter pipeline** during the screen-share — does it integrate with MailChimp, with an internal IIE list, or is it self-contained Drupal?
5. **Confirm Campus Hosting Google Forms strategy** — replace with native Drupal forms or accept the external pattern?
6. **Confirm adviser-profile scope** — IIE expects them per the LOA but the current site doesn't surface any; new build is greenfield, not migration.

---

## 11. Extended-pass findings (2026-05-15)

This section consolidates the deltas from a deeper, forms-focused crawl. The inline edits to §2, §3.1, §4, §5, §6, §8, §9 above reflect these findings; this section summarizes for quick reference.

### Corrections to earlier findings

- **Content type count: 4, not 5** — Financial Aid is a second View over the Scholarship content type, not a separate type. The "270 records" figure remains correct but applies to the Scholarship type total.
- **Site search IS prominent** — `/search` results page exists with paginated results and a sidebar of preset content-type entry points (Website / Advising Centers / Events / Financial Aid / Videos). Header + footer search boxes on every page. Earlier "no prominent on-site search bar" claim was wrong.
- **Global Guide is ungated** — full 2013–2024 archive as direct PDF downloads. Earlier "likely behind login" guess was wrong.
- **Video hosting = YouTube** — confirmed via Drupal `media-youtube` module thumbnail URLs. Earlier 🔴 unknown is now 🟢.
- **Glossary 130+ / FAQ 60+** — refined counts; FAQ organized chronologically, not by topic (opportunity).

### Net-new findings worth scoping

- **4 external Google Forms** at `/us-higher-education-professionals/fairs-and-events/educationusa-campus-hosting-opportunities`. Operational submission workflow lives outside Drupal. Decision point for the new build.
- **bit.ly event-registration pattern** — every event record sampled uses a per-event bit.ly link to off-site registration. Uniform pattern; deliberate. Implication: new build needs a clean external-link field on Event content type, not a registration system.
- **No on-page adviser profiles** anywhere public. The LOA references "adviser profiles"; current site has none. **Greenfield, not migration.**
- **~350 `/node/*` URLs in sitemap page 2 return 403 anonymously.** Substantial unknown. Could be aliased nodes still in sitemap, or genuine orphan content. Migration-blind risk.
- **`/experience-studying-usa/news` 404** — Experience hub nav references News, URL doesn't resolve. Either moved or orphaned in sitemap.
- **Webinars URL 301 → home** — `/us-higher-education-professionals/online-services/webinars` is a dead link. Parent nav still points to it. Status unclear: retired, moved behind login, or relocated.
- **Country Fact Sheets gated** (redirect-loop anonymously), unlike the Global Guide which is open. Different gating posture.
- **`/financial-aid` exists as alias** alongside `/find-financial-aid` — two URL paths, same View. Redirect-mapping consideration during migration.
- **"Your 5 Steps" is static, not a wizard** — 30-page grid (5 steps × 6 study levels). Branded as a journey, but no progress tracker / conditional logic.
- **Server-rendered, JS-light** — no SPA frameworks, no React mount points. Any new dynamic UI (map, AI search) is net-new JavaScript, not replacement.
- **Spam protection is minimal** — only `/node/1116` has protection (image CAPTCHA). No reCAPTCHA, no honeypot, no visible rate-limiting anywhere. WCAG concern + weak defense.
- **EducationUSA Academy content still live** two years after the program sunset (summer 2024). Content-audit signal.
- **REAC region page references "My Resources" / "Regions and REACs"** verbatim on the public side — earlier revision-log retraction of these labels (2026-05-14) was over-cautious; they're real.

### Coverage gaps still open

- `/robots.txt` returns 403 to anonymous fetch (second confirmation). WAF-blocked. Needs backend access or screen-share to inspect.
- ~350 `/node/*` URLs in sitemap page 2 return 403. See above.
- Country Fact Sheets, some scholarship slugs, some advising-center slugs return redirect-loops anonymously. Likely gated or CDN-bot-detection. Browser-based verification needed.
- Logged-in portal contents (Submit Content forms, HEI eNews subscription UI, webinars if they live there). Same as prior pass — gated.
- Filter URL syntax on faceted finders — GET-based but exact taxonomy parameter names not confirmed without JavaScript-driven submission. Minor.

---

## Revision Log

| Date | Notes |
|------|-------|
| 2026-05-14 | First-pass exploration findings from background agent run. Confidence flagged per item. |
| 2026-05-14 | Audited and corrected agent claims about the portal. Stripped invented workspace labels ("My Content"/"My Resources"). Added authoritative on-page quote from `/us-higher-education-professionals/online-services/submit-content`. Added a "what the portal actually is" framing at the top of §3 reflecting that the portal is being demolished in the new build, not migrated. |
| 2026-05-15 | **Extended-pass crawl** (2–3 levels deep, forms-focused). Major corrections to §2 (content types: 4 not 5 — Financial Aid is a View over Scholarship), §4 (search IS prominent; Global Guide is ungated; webinars URL is a dead 301-to-home; Glossary 130+ / FAQ 60+ counts refined), §6 (YouTube confirmed as primary video hosting). New §11 section documents net-new findings: 4 external Google Forms at Campus Hosting, bit.ly event-registration pattern, no public adviser profiles, ~350 `/node/*` URLs that 403 anonymously, `/experience-studying-usa/news` 404, Country Fact Sheets gated, `/financial-aid` alias, static "5 Steps" pages (not a wizard), and server-rendered/JS-light architecture. |
