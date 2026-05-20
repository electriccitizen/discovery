---
id: H
title: "Search"
order: 8
---

### What we currently understand

The new build has **two distinct search experiences** (detail in `technical-analysis.md §3.11`):

- **Per-content-type finders** — the existing `/find-advising-center`, `/find-event`, `/find-financial-aid`, and `/videos-0` pattern. Used by visitors browsing a specific content type. **Keeps the traditional faceted sidebar** with the filters already on the current site (Region, Country, Degree Level, Audience, Center Level — depending on the finder).
- **Sitewide unified search** (`/search`) — AI-driven semantic search across all content types. Handles natural-language queries like *"scholarships for graduate students in Europe"* via the AI/NLP layer; the LLM extracts intent and ranks results. **No traditional faceted sidebar** here — the AI layer makes per-facet filtering redundant. The LOA §G "filters by content type, topic, region, or role" requirement is satisfied by the per-finder pattern.

Permissioned content (e.g., HEI contact information held behind a privacy "wall") is excluded from both surfaces.

### Questions for you

**H1. Which content types should NOT appear in public search results?** By default, all publicly-accessible content is indexed — Advising Centers, Scholarships, Events, Videos, Adviser Profiles, HEI listings, Country pages, Success Stories, FAQ, Glossary, Basic Pages, Landing pages, etc. Gated content (Region landing pages, HEI private contact info, anything behind login) is excluded automatically. Are there other content types you'd want kept out — e.g., admin/legal Basic Pages, Section Overview hub pages, or Country Fact Sheets if they remain gated?
- *Why we ask:* Default-include / explicit-exclude is the standard pattern; we want to confirm the exclusion list before we configure the search index.
