---
id: L
title: "Scope Items from Live-Site Discovery"
order: 12
---

While reviewing the current site, we surfaced content types and features that the LOA Scope of Work doesn't specifically address. This section is the largest in the worksheet — we'd love directional input now, with the understanding that **deeper content-type architecture decisions happen in a dedicated discovery phase later in the project.**

*Treat this as a first-pass review.* Yes/no/defer-style answers are fine for most items. Question **L11** summarizes our full proposed content-type inventory — even a high-level "this list looks right" or "we'd add X / drop Y" is useful at this stage. Full schema/field decisions per content type come later.

### What we currently understand

- This section surfaces various features, content, and other anomalies that were uncovered during discovery on your live site.
- The current site has four substantive content types: **Advising Centers** (422), **Scholarships** (270, also surfaced via the `/find-financial-aid` View as "Financial Aid"), **Events**, and **Videos** (242, YouTube-backed). Centers, Scholarships, and Events are in the LOA Scope of Work; Videos is not.
- The Submit Content page on the current site references "campus news stories" as a third submittable type; we have not located its public URL.
- The current site has a "Webinars" section under Online Services, but **the URL 301-redirects to the homepage** — link present in nav, page content unreachable anonymously.
- The current site retains a defunct "EducationUSA Academy" section for a program that concluded in summer 2024.
- We've also surfaced operational patterns that depart from "all submissions go through Drupal": four **external Google Forms** drive Campus Hosting submissions, and every event we sampled routes registration off-site via **per-event bit.ly links**.

### Questions for you

**L1. Scholarship records — migration scope and View-preservation.** **Confirmed**: `/find-financial-aid` and `/financial-aid` are Views over the same Scholarship content type — all records link to canonical `/scholarships/{slug}` URLs and the detail pages render identical data (verified on a sample record). Two things still open:
- **(a) Migration scope** — the sitemap shows \~857 records vs. \~270 surfaced through the public View. The View filters out expired/inactive records. Do we migrate all 857 (preserving history) or only the 270 active ones?
- **(b) View preservation** — do we keep a "Financial Aid"-branded landing page (e.g., `/financial-aid`) on the new site as a separate entry point, or consolidate everything under `/scholarships`?

- **Recommendation:** We recommend unifying into a single view. We also recommend migrating only active, published scholarships.

**L2. Video — how should the new build present the existing video collection?** The LOA commits to video as a content medium (impact-story showcase per Att. B obj. #3, Drupal video blocks, embedded video in content) and the Q&A confirms existing video assets will be incorporated. What's open is the *current site's dedicated video library pattern* — 242 records in a Video content type with its own faceted finder at `/videos-0` (Topic + Audience filters). Three plausible paths for the new build:

- **(a) Preserve as-is** — Video stays its own content type with the existing finder, migrated with current Topic + Audience taxonomies.
- **(b) Fold videos into other content types** — embed videos directly in Stories, Events, 5 Steps pages, etc. Drop the dedicated finder. Video as a content medium remains throughout the site, just not in a centralized library.

- **Recommendation:** We recommend option (b) and keeping all videos in a standard Media library unless there is a compelling reason to treat them as their own content type.

- *Expected format:* (a) / (b) / (c).

**L3. Campus news stories — does this exist as a public-facing content stream on the current site, or only inside the logged-in portal? If public, what URL pattern? Is it in scope to migrate?**

**L4. Webinars — `/us-higher-education-professionals/online-services/webinars` is linked from the Online Services nav but 301-redirects to the homepage.** Has the webinars program been retired? Moved behind login? Relocated to a different URL? If still active, is it in scope for the new build, and what's the source format?

**L5. EducationUSA Academy content — the program ended summer 2024, but its content remains on the live site.** Should it be migrated to the new site as an historical archive, dropped entirely, or migrated with explicit "concluded" labeling?

**L6. Adviser profiles — the LOA references "adviser profiles" as content the new site should support, but the current public-facing site does not surface any.** `/us-higher-education-professionals/educationusa-network/educationusa-advisers` is a static "what advisers do" page with no profile listings. This is a **greenfield build**, not a migration. Please confirm:
- (a) Does the gated portal currently hold structured adviser profiles? If so, we'd like to see them during discovery.
- (b) What fields should an adviser profile have on the new site (name, country, advising center, contact info, photo, bio, languages, specialties, etc.)?
- (c) Should adviser profiles be **public**, **internal-only** (IIE-staff visibility), or something else?
- *Why we ask:* Visibility choice affects contact-spam protection on adviser contact info and whether profiles appear in public search.

**L7. Confirming the residual `/node/{N}` content.** Our full redirect pass against all 965 unaliased `/node/N` URLs in the sitemap found that 961 return 403 anonymously. Of those, **187 are aliases for the 12 Region landing pages** (L12) — historical accumulation as those pages went through revisions. The remaining **\~778 are truly orphaned**: they don't resolve to any current alias, and we can't classify them from the outside. Please help us spot-check during discovery — pick a handful (say `/node/179`, `/node/192`, `/node/221`) and tell us what they are. Migration risk if any of these are real one-off public-facing pages we'd need to migrate sight-unseen.

**L8. Organizational news — confirm scope.** The LOA's Project Purpose #5 calls for "a framework to display organizational news and content that inspires, educates, and engages users." The current site's Experience hub nav still references a News link, but `/experience-studying-usa/news` 404s anonymously — so the nav reference exists but no content loads. Three possibilities, each pointing in a different direction:
- The news program was retired and the nav link is stale (we'd rebuild fresh on the new site to satisfy the LOA commitment).
- News moved to a different URL we haven't found (point us to it, we'll migrate).
- The news section was never fully built (rebuild fresh).
- *Why we ask:* The LOA commits to news as a capability regardless of current state. We need IIE direction on what news content exists today, what it covers, and what cadence IIE wants going forward (e.g., weekly, monthly, as-needed).

**L9. Country Fact Sheets — confirm scope and visibility.** The RFP lists "Regional Fact Sheets" as a resource HEIs should access; we believe these are the same artifact as the per-country PDFs at `/us-higher-education-professionals/recruitment-resources/country-fact-sheets` on the current site (the URL redirect-loops anonymously, suggesting login-gated). We cannot see their content from outside the gate.

- **(a) What's actually in them?** Approximately one PDF per country (\~170?), or fewer? What does each contain (demographics, education-system info, advising-center contacts, success-story snapshots, etc.)?
- **(b) Maintenance state.** Actively maintained, or stale? Who owns updates?
- **(c) Visibility on the new site.** Since HEIs won't have logins on the new build (per §C), the options are: keep them IIE-staff-only, make them public, or drop entirely.
- **(d) Migration source.** Per §B WWCU, these are gated PDFs IIE must supply directly (we can't scrape them) — confirm IIE has access to the source files.

**L10. Spam protection — the current site uses Drupal image CAPTCHA on one form (`/node/1116`) and nothing on anything else.** Image CAPTCHA is both inaccessible (WCAG concern) and weak in 2026. Do you have a preferred anti-spam stack, or are you open to our recommended approach?

- **Recommendation:** We recommend swapping to honeypot + Cloudflare Turnstile + Drupal `flood` controls for all public forms. (Turnstile is free, privacy-preserving, accessible, and largely invisible to legitimate users — no checkbox or image puzzle.)

**L11. Content type inventory — please review.** Our current synthesis (current-site crawl + LOA §G + RFP audience sections), consolidated in [Technical Analysis](/edusa/reference/technical-analysis) §3.14 and reproduced here in summary:

- **Tier 1 (crawl-confirmed):** Advising Center (422), Scholarship (270), Event, Video (242).
- **Tier 2 (LOA-named, greenfield — does not exist on current site):** Adviser Profile, Downloadable Resource, News / Story.
- **Tier 3 (RFP-implied or current-site-suggested, treatment TBD):** Country / Territory page, Student Success Story, Country Fact Sheet, FAQ entry, Glossary term, Webinar, Campus News Story.
- **Tier 4 (utility):** Basic Page, Landing / Section Overview.

The LOA's wording — *"several custom content types for programs, people, and research, and more pending the outcome of our technical planning"* — is intentionally open-ended. **This is what we know now.** The complete list and per-type architecture (fields, relationships, taxonomy attachments, node-vs-page-chunk decisions for Tier 3) get further defined during build planning and IIE's ongoing content strategy sessions. For this round, directional input is enough:

- **(a)** Is anything obviously missing from this list that the new site needs to support?
- **(b)** Anything listed that should *not* be a distinct content type on the new site?
- **(c)** Any rough volume expectations for the greenfield types (Adviser Profile count, Success Story count, News post cadence)?

*Why we ask:* the content-type list shapes the build's foundational data model. We don't need every detail nailed down now — that's later — but a first-pass review surfaces anything we've missed before the next phase.

**L12. Region landing pages — what should the new build do with the 12 `/regions/{slug}` pages?** The current site has 12 gated region landing pages (one per Region taxonomy term, e.g., `/regions/southeast-asia`), not visible to us anonymously. We can't see the content. They appear to be REAC-facing operational content tied to the portal being demolished per Q&A, but without seeing them we can't recommend an approach. The Region taxonomy itself carries forward (it drives advising-center filtering, REAC editorial scoping, and Adviser-to-REAC routing) regardless of what we decide here.

Before recommending migrate / drop / rebuild-public, we'd like to understand what's actually in them — either share the content of a typical page with us, describe who uses them and for what, or tell us they're stale and we can drop without further review.

**L13. Student Success Stories — do you want them on the new site?** The current site has a public stories gallery at `/experience-studying-usa/stories-international-students` (single paginated page, \~24 pages of stories rendered inline, no per-story URLs). The RFP §p.10 calls for "an engaging webpage of text and multimedia content showcasing international students."

- **Recommendation:** If yes, we recommend a per-story content type — each story gets its own URL, SEO-indexable, shareable, supports per-story metadata (country/region per E4(c), audience track, university, etc.) and feeds the map's success-story layer cleanly. The current paginated-single-page architecture would be a downgrade for the new build.

- *Expected format:* "yes, per-story content type" / "no, drop them" / "yes but keep the paginated single-page approach."

**L14. The "5 Steps to U.S. Study" guide — migrate as-is or revisit in Strategy?** The current site's 5 Steps guide is the largest single content asset and the most prominent student-facing journey on the site — **71 pages**, organized as a matrix of **5 steps × 5–6 audience tracks** (Community College, Undergraduate, Graduate, Short-Term, English Language, plus Online Learning in some cases). See [Technical Analysis](/edusa/reference/technical-analysis) §3.7 for the full structure.

- **(a) Migrate as-is.** Preserve the existing 5×5 matrix and copy. Fix title-style inconsistencies and broken links during migration. Strategy/Design phase provides the visual refresh; content stays.
- **(b) Reconsider during Content Strategy.** Keep the structural shape but revisit IA, audience-track scope, and editorial refresh during the Strategy phase.

- *Expected format:* (a) / (b) / "let's discuss in Strategy."
