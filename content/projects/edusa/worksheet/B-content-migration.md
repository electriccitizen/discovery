---
id: B
title: "Content Migration"
order: 2
---

### What we currently understand

- Source site: `educationusa.state.gov` — **Drupal 7, no backend or DB access.** The LOA committed migration via scraping tools.
- Sitemap totals **8,055 URLs**, but most are historical (\~5,624 Events, \~857 Scholarships vs. \~270 active, \~965 `/node/N` 403s). The substantive surface to actually migrate is roughly **\~5,000 URLs** once stale records are filtered — pending IIE editorial review per page.
- Four structured content types are visible publicly: advising centers (\~422), scholarships (\~270 active), events, and a video library (\~242).
- EC produces the URL inventory from the crawl. **Final migrate / drop / rebuild calls require IIE editorial judgment** — REAC network, content owners, anyone with knowledge of what each page is for. EC can't make those calls from crawl data alone.
- **Gated PDFs** (Regional Fact Sheets, Global Guide) are recoverable — IIE supplies the source files from Drive/Box, the current-site file directory, or a REAC-login export.
- **Gated database content has no exportable source.** Region landing pages (L12), portal-only Campus News (L3), Adviser Profiles (L6), Webinars (L8), and the \~778 orphaned `/node/N` URLs (L7) live only inside Drupal. Without a D7 DB dump (B1), these require manual re-authoring on the new site. Rough combined volume: a few hundred pages, but accurate sizing requires portal access.
- **Taxonomy and tagging are unrecoverable from scrape alone.** We see term labels (12 Regions, 177 Countries, 5 Degree Levels) but not IDs, hierarchy, custom fields, or which content carries which tags. Without a dump we rebuild vocabularies from observed labels and re-tag during migration; surface-invisible metadata is lost.
- **Manual recreation is part of any migration.** Gated content + new fields on existing types (e.g., country tag on Success Stories per E4(c), region metadata for Adviser Profiles per L6) + content-shape changes all require fresh writes rather than ports. A DB dump shrinks this surface; without one, it expands. We'll flag specifics as we go so the editorial workload is visible up-front.

### Questions for you

**B1. Final effort on obtaining a D7 database dump :)** We don't need backend access, accounts etc. — just an export of the database. Is there a possibility?
- *Why it matters:* Working from public HTML alone, we lose structured nuance (taxonomy IDs, entity references, admin-only fields, draft state). An export materially improves migration quality and de-risks the timeline.
- *Expected format:* a named contact, "we'll escalate via ECA," or "confirmed not obtainable."

**B2. How will IIE provide editorial review on the migrate/drop decisions?**
- **Recommendation:** We can wait on a decision until we have more clarity from your internal audit and the ongoing content audits from our team. This question is designed to call out a necessary step in the migration process and to get your initial thoughts.
- *Why we ask:* The Q&A indicated IIE was producing a content inventory in parallel. We'd like to confirm the current status of that work — and in any case, EC will need editorial-review time from REAC / content owners / IIE staff to reconcile what should actually migrate vs. drop vs. rebuild. What's the right mechanism and cadence for that review work?
- *Expected format:* a named owner + a working pattern (e.g., weekly review session, batch sign-offs via Drive, REAC-network polling).

**B3. Beyond the gated content we've already identified, are there other hidden pages, downloads, or asset libraries we should know about?** Our crawl + redirect-pass surfaced a substantial gated surface: the 12 Region landing pages (L12), the Country Fact Sheets library (L9), the Submit Content portal, and Campus News / Adviser Profile content that appears to live in the portal (L3, L6). What we can't see from outside the gate is anything that's not linked or hinted at on the public side — orphan content, internal-only PDF dumps in unusual directory paths, separate file-storage areas. Does your network (advisers, REACs, IIE staff) know of any?
- *Why we ask:* Orphan content and PDF dumps in unusual paths often live alongside the public site without being linked. Better to surface them now than discover them post-migration.

**B4. Does IIE agree with the overall migration strategy and risks?** To summarize: EC scrapes the public site, produces a URL inventory, and migrates structured content where we can. For everything else — gated content, taxonomies invisible to a crawl, content changing shape on the new build — IIE supplies source files where they exist, provides editorial judgment on what to migrate, and recreates content manually where there's no other path. A DB dump (B1) materially reduces the manual-recreation surface; without it, manual recreation expands.
- *Why we ask:* The overall division of labor is foundational and affects timeline and IIE's editorial workload. Better to confirm alignment now than discover misalignment at content-cutover time.
- *Expected format:* "yes, proceed as described" / "yes, with these changes: …" / "let's discuss."
