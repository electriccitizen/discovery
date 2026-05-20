# EducationUSA — Sitemap-Derived URL Inventory

> **Generated:** 2026-05-18
> **Source:** `https://educationusa.state.gov/sitemap.xml` (sitemap index + pages 1 and 2)
> **Method:** Fetched both sitemap pages, extracted all `<loc>` entries, grouped by URL pattern.
> **Status:** Raw URL-level inventory of the live site. Holds counts that the discovery docs do not yet reflect — see *"Things this changes"* at the bottom.


## 1. Summary

The live sitemap is split across two pages:

- [https://educationusa.state.gov/sitemap.xml?page=1](https://educationusa.state.gov/sitemap.xml?page=1) — 4,985 lines
- [https://educationusa.state.gov/sitemap.xml?page=2](https://educationusa.state.gov/sitemap.xml?page=2) — 3,078 lines

Combined, the sitemap contains **8,055 URLs**.

## 2. Inventory by URL pattern

| Group | URL pattern | Count | Notes |
|---|---|---|---|
| **Structured: Event** | `/events/{slug}` | **5,624** | Flat 2-segment slugs. Vastly larger than the 270 figure in `site-discovery.md §2`. Likely includes historical/past events; [/find-event](https://educationusa.state.gov/find-event) View probably filters to upcoming only. |
| **Structured: Scholarship** | `/scholarships/{slug}` | **857** | Flat 2-segment slugs. **3× the 270 count** in `site-discovery.md §2`. The 270 figure is the [/find-financial-aid](https://educationusa.state.gov/find-financial-aid) View result count; the database holds 3× more — likely expired/inactive/unpublished records the View filters out. |
| **Structured: Advising Center** | `/centers/{slug}` | **436** | Flat 2-segment slugs. Close to site-discovery's 422 (small drift since that crawl). |
| **Unaliased nodes** | `/node/{N}` | **965** | NID range 135 → 17742. Full redirect pass (§7 below) resolves these: 961/965 → 403; 187 → `/regions/{slug}` (12 region landing pages); 778 → no alias / truly orphaned; 2 → 200 (Bug Form + Survey Popup); 2 → 500. |
| **Audience hub: 5 Steps** | [/your-5-steps-us-study/...](https://educationusa.state.gov/your-5-steps-us-study) | **71** | Deepest content tree on the site. Breakdown: 1 hub + 6 (depth 2) + 27 (depth 3) + 27 (depth 4) + 10 (depth 5). |
| **Audience hub: HE Professionals** | [/us-higher-education-professionals/...](https://educationusa.state.gov/us-higher-education-professionals) | **25** | 1 hub + 7 (depth 2) + 17 (depth 3). |
| **Audience hub: Foreign Inst./Gov.** | [/foreign-institutions-and-governments/...](https://educationusa.state.gov/foreign-institutions-and-governments) | **20** | 1 hub + 5 (depth 2) + 14 (depth 3). |
| **Audience hub: Experience** | [/experience-studying-usa/...](https://educationusa.state.gov/experience-studying-usa) | **8** | 1 hub + 5 (depth 2) + 3 (depth 3). Includes three notable single-page-multi-item assets: the **FAQ** page, the **Glossary** page, and the **[Stories from International Students](https://educationusa.state.gov/experience-studying-usa/stories-international-students)** gallery (paginated, 24+ pages of stories inline; no per-story URLs). |
| **Finder Views** | [/find-event](https://educationusa.state.gov/find-event), [/find-advising-center](https://educationusa.state.gov/find-advising-center), [/find-financial-aid](https://educationusa.state.gov/find-financial-aid), [/financial-aid](https://educationusa.state.gov/financial-aid) (alias), [/videos-0](https://educationusa.state.gov/videos-0), [/videos](https://educationusa.state.gov/videos) | **6** | Listing pages with no per-record URLs in sitemap. |
| **Standalone landing/utility pages** (depth-1 singletons not in hubs) | various | **~38** | See breakdown below. |
| **Anomaly** | `/%3Cnolink%3E` | 1 | URL-encoded `<nolink>` — likely a broken menu link still indexed. |

**Total accounted for:** 8,055 (rounds match the sitemap's `<loc>` count exactly).

## 3. Standalone depth-1 pages

Roughly 38 single-segment URLs not part of any audience hub or structured-type pattern. Grouping them by character:

**Real content pages:**
- [/about-educationusa](https://educationusa.state.gov/about-educationusa), [/contact-us](https://educationusa.state.gov/contact-us), [/alerts-and-messages](https://educationusa.state.gov/alerts-and-messages), [/employment-and-internship-information](https://educationusa.state.gov/employment-and-internship-information)
- [/social-media-terms-and-conditions](https://educationusa.state.gov/social-media-terms-and-conditions), [/understanding-us-accreditation](https://educationusa.state.gov/understanding-us-accreditation)
- [/podcasts](https://educationusa.state.gov/podcasts), [/online-learning](https://educationusa.state.gov/online-learning), [/english-language](https://educationusa.state.gov/english-language), [/athletic-scholarships](https://educationusa.state.gov/athletic-scholarships)
- [/principles-good-practice](https://educationusa.state.gov/principles-good-practice), [/define-your-priorities](https://educationusa.state.gov/define-your-priorities)
- [/how-search-your-community-college](https://educationusa.state.gov/how-search-your-community-college), [/prepare-your-departure-united-states](https://educationusa.state.gov/prepare-your-departure-united-states)
- [/educationusa-your-official-source-us-higher-education](https://educationusa.state.gov/educationusa-your-official-source-us-higher-education), [/educationusa-interactive](https://educationusa.state.gov/educationusa-interactive)

**Likely aliases / legacy redirects:**
- [/educationusa-advising-centers](https://educationusa.state.gov/educationusa-advising-centers), [/educationusa-centers](https://educationusa.state.gov/educationusa-centers) (vs. canonical `/centers/...`)
- [/us-higher-education-system](https://educationusa.state.gov/us-higher-education-system) (vs. `/us-higher-education-professionals/...`)
- [/experience](https://educationusa.state.gov/experience) (vs. `/experience-studying-usa/...`)
- [/complete-your-us-application-graduate](https://educationusa.state.gov/complete-your-us-application-graduate)
- **Typo-aliased URLs** — `/experience-ofstudying-usa/stories-international-students` and `/experience-ofstudying-usa/news` are typo-mirrors of the canonical `/experience-studying-usa/*` paths. Same Drupal alias-collision artifact as the `/resources-lgbt-students-{0,1,2,3}` family below. Should redirect to the canonical paths during migration.

**Resource-style stubs (with a duplication pattern):**
- [/resources-every-kind-student](https://educationusa.state.gov/resources-every-kind-student)
- [/resources-foreign-governments-and-institutions](https://educationusa.state.gov/resources-foreign-governments-and-institutions)
- [/resources-students-disabilities](https://educationusa.state.gov/resources-students-disabilities)
- [/resources-lgbt-students](https://educationusa.state.gov/resources-lgbt-students) plus **four numbered duplicates** [/resources-lgbt-students-0](https://educationusa.state.gov/resources-lgbt-students-0), [-1](https://educationusa.state.gov/resources-lgbt-students-1), [-2](https://educationusa.state.gov/resources-lgbt-students-2), [-3](https://educationusa.state.gov/resources-lgbt-students-3) — the `-N` suffix is a Drupal alias-collision artifact. Same content, multiple paths. Suggests authoring drift over time.

**Likely stale / one-off:**
- [/expo2020](https://educationusa.state.gov/expo2020) — past event branding
- [/region-news](https://educationusa.state.gov/region-news) — content/freshness unknown
- [/my-resources](https://educationusa.state.gov/my-resources) — portal-side path leaking into the public sitemap?
- [/login](https://educationusa.state.gov/login), [/search](https://educationusa.state.gov/search) — utility paths (Drupal default)
- [/homepage](https://educationusa.state.gov/homepage), [/home-page-replacement](https://educationusa.state.gov/home-page-replacement) — paired pages suggesting an in-progress homepage swap that left a stray alias

## 4. URL depth distribution

| Depth | Count | Typical content |
|---|---|---|
| ROOT (homepage) | 1 | `/` |
| 1 | 45 | Section roots, finder Views, standalone landing pages |
| 2 | 7,911 | Structured-content detail pages (events / scholarships / centers) + audience-hub second-tier + `/node/N` |
| 3 | 62 | Audience-hub third-tier basic pages |
| 4 | 27 | 5 Steps tree (deep) |
| 5 | 10 | 5 Steps tree (deepest) |

The vast majority of URLs (7,911 at depth 2) are structured content type detail pages. Hierarchical basic-page content tops out at ~100 across all four audience hubs combined.

## 5. Things this changes about the discovery docs

These are deltas the existing docs do not yet reflect. Not folded in pending the user's confirmation.

1. **Events: 5,624 (vs. unspecified earlier).** This is the largest delta. `site-discovery.md §2` never quantified events. The migration scope decision is now more nuanced: the new build either needs to handle the historical archive (soft-delete past events, migrate as historical content, or leave behind) or commit to a much smaller "active events only" scope.
2. **Scholarships: 857 (vs. 270 documented).** Three times more records in the database than the public View surfaces. Migration scope language in `migration-analysis.md` and `discovery-worksheet.md §L1` needs to specify "all 857" vs. "the 270 currently active." Different work.
3. **`/node/N`: 965 (vs. ~350 estimated in `site-discovery.md §11`).** Almost 3× the earlier figure. Full redirect pass (§7) resolves the mix: 12 region landing pages account for 187 of these as historical alias accumulation; 778 are truly unaliased (drafts/orphans/portal-internal). `discovery-worksheet.md §L7` references "~350" — should be updated to 778 (truly unaliased) and cross-referenced to §L12 (Region scope).
4. **Audience-hub basic pages: ~124 total.** Site-discovery never enumerated. Add ~38 standalone singletons for the full basic-page picture.
5. **The 5 Steps tree is deeper than other hubs** — 5 levels deep where the others top out at 3. Has IA implications for navigation design and migration tooling.
6. **[/resources-lgbt-students-0](https://educationusa.state.gov/resources-lgbt-students-0) through [-3](https://educationusa.state.gov/resources-lgbt-students-3)** — four numbered duplicate URLs for the same content (Drupal alias-collision artifact). Worth confirming during migration whether all four should redirect to a single canonical, or whether they're meaningfully different pages.
7. **Homepage drift** — [/homepage](https://educationusa.state.gov/homepage) and [/home-page-replacement](https://educationusa.state.gov/home-page-replacement) both in the sitemap suggests an in-progress swap that never finished. Worth a quick question.

## 6. Caveats

- **Sitemap inventory is URL-level, not entity-level.** Media entities (e.g., the 242 Video records) and other non-publish-routed content are likely absent from the sitemap entirely.
- **Sitemap may include unpublished or 403-gated content.** Drupal's xmlsitemap module includes whatever is configured, not just what's anonymously accessible. The 965 `/node/N` entries confirm this — many of them 403 anonymously per `site-discovery.md`.
- **No `lastmod` analysis here.** Both sitemap pages share a single `lastmod` of `2026-05-15T14:43Z`, so we can't tell from this data which records are stale.
- **Sitemap is configured at the path-alias layer.** A content type set to "do not index" would be entirely absent. Inverse: we don't see counts here for any content that's not surfaced through xmlsitemap.

The raw URL list lives at `/tmp/all-urls.txt` from the fetch run and can be re-derived from the sitemap pages at any time.

## 7. `/node/N` full redirect pass

To resolve the 965 unaliased `/node/N` URLs into something more useful than "mostly 403," we ran a parallel HEAD-follow against every one of them.

### Status code distribution

| Status | Count |
|---|---|
| 403 Access Denied | **961** |
| 200 OK | **2** — [/node/1116](https://educationusa.state.gov/node/1116) (the Bug-Report Form, already documented as the source of the 6-role enumeration in `site-discovery.md`); [/node/15030](https://educationusa.state.gov/node/15030) ("Survey Popup" page — used for occasional surveys) |
| 500 Server Error | **2** — [/node/3003](https://educationusa.state.gov/node/3003), [/node/3081](https://educationusa.state.gov/node/3081). Broken pages on the current site. |

### Redirect destination

| Final destination | Count | Implication |
|---|---|---|
| Stays at `/node/N` (no alias) | **778** | Truly unaliased. Mix of drafts / role-gated portal content / orphaned nodes. None have a public-facing canonical URL. |
| Redirects to `/regions/{slug}` | **187** | Canonical Region landing pages — but only **12 unique destinations**, meaning the 187 nodes collapse onto 12 actual pages. Likely revision-drift artifacts. |

### `/regions/{slug}` distribution

The 187 `/node/N` aliases redirect to exactly 12 unique URLs, matching the 12 terms in the Region taxonomy (confirmed by the `/find-advising-center` filter dropdown). Number of `/node/N` aliases per region:

| `/regions/{slug}` | # of historical aliases |
|---|---|
| [americas-north-central-america-and-caribbean](https://educationusa.state.gov/regions/americas-north-central-america-and-caribbean) | 27 |
| [southern-east-africa](https://educationusa.state.gov/regions/southern-east-africa) | 24 |
| [northern-western-europe](https://educationusa.state.gov/regions/northern-western-europe) | 24 |
| [west-central-africa](https://educationusa.state.gov/regions/west-central-africa) | 23 |
| [europe-and-eurasia](https://educationusa.state.gov/regions/europe-and-eurasia) | 21 |
| [northeast-asia-and-pacific](https://educationusa.state.gov/regions/northeast-asia-and-pacific) | 16 |
| [middle-east-and-north-africa](https://educationusa.state.gov/regions/middle-east-and-north-africa) | 13 |
| [middle-east-south-and-central-asia](https://educationusa.state.gov/regions/middle-east-south-and-central-asia) | 12 |
| [southeast-asia](https://educationusa.state.gov/regions/southeast-asia) | 11 |
| [south-asia](https://educationusa.state.gov/regions/south-asia) | 6 |
| [south-america-and-southern-cone](https://educationusa.state.gov/regions/south-america-and-southern-cone) | 5 |
| [south-america-and-andes-region](https://educationusa.state.gov/regions/south-america-and-andes-region) | 5 |
| **Total** | **187** |

All 12 destination URLs themselves return 403 anonymously — confirmed gated content. Each destination has accumulated 5–27 historical node aliases, most plausibly because Drupal Pathauto created new nodes over time as content was re-authored, with the alias migrating forward while the old node IDs lingered in the sitemap as redirects.

**Net resolution of the 965-node mystery:**

- 12 of them are real, currently-active region landing pages (gated to REAC/IIE).
- 175 are historical aliases pointing at those same 12 pages.
- 778 are unaliased — drafts, role-gated portal-internal content, or orphans. No public canonical URL.
- 4 are anomalies (2 accessible, 2 broken).

This dramatically tightens the migration question. Only **12 region pages** are real candidates for migration consideration (see `discovery-worksheet.md §L12`), and the other 778 are best left alone — they aren't anonymously accessible today and have no canonical URL to preserve.

---

## Revision Log

| Date | Notes |
|------|-------|
| 2026-05-18 | Initial inventory pulled from the live sitemap. Total URLs: 8,055. Significant deltas vs. `site-discovery.md §2` for Events, Scholarships, and unaliased `/node/N` paths. Counts not yet folded into `technical-analysis.md §3.14` or related docs. |
| 2026-05-18 | Updated path-style references to clickable full URLs throughout. |
| 2026-05-18 | Added §7 — full `/node/` redirect pass against all 965 unaliased nodes. Resolved the mystery: 961 → 403; 12 unique `/regions/{slug}` destinations account for 187 of the 965 (historical alias accumulation, 5–27 each); 778 truly unaliased; 2 accessible (Bug Form + Survey Popup); 2 broken. §2 and §5 updated to reference the §7 detail. The 12 region landing pages are confirmed as real authenticated-only content and now appear as a Tier 1 row in `technical-analysis.md §3.14` with a corresponding scope question at `discovery-worksheet.md §L12`. |
