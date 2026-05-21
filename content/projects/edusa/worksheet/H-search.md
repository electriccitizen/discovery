---
id: H
title: "Search"
order: 8
---

### What we currently understand

The new build has **two distinct search experiences** (detail in [Technical Analysis](/edusa/reference/technical-analysis) §3.11):

- **Per-content-type finders** (`/find-advising-center`, `/find-event`, `/find-financial-aid`, `/videos-0`). For visitors browsing a specific content type.
- **Sitewide unified search** (`/search`). AI-driven semantic search across all content types, handling natural-language queries like *"scholarships for graduate students in Europe"*. The LOA §G "filters by content type, topic, region, or role" requirement is satisfied by the per-finder pattern.

Permissioned content (e.g., HEI contact info behind a privacy wall) is excluded from both surfaces.

### Questions for you

**H1. Which content types should NOT appear in public search results?** By default, most publicly-accessible content is indexed — Advising Centers, Scholarships, Videos, Adviser Profiles, HEI listings, Success Stories, FAQ, Glossary, Basic Pages, Landing pages, etc. Gated content and time-specific content (events, private contact info, anything behind login) is excluded automatically. Is there content you'd want kept out — e.g., legal specific or internal-facing pages, etc?
- *Why we ask:* Default-include / explicit-exclude is the standard pattern; we want to confirm the exclusion list before we configure the search index.
