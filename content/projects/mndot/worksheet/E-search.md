---
id: E
title: "Search"
order: 5
---

### What we currently understand

- The current static site has no built-in search of its own. Search today is a separate state-hosted service on `mn.gov` (Funnelback), plus a Google-powered search just for construction projects.
- The new Drupal site will have integrated search. We recommend Drupal's Search API with a Solr backend for a site this size.
- We suggest a global site search with a dedicated construction-project finder.

### Questions for you

**E1. We recommend building search on Drupal's Search API with a Solr backend (a dedicated search engine suited to large sites and fast filtering). Will your environment support Solr or a hosted search service, or should we plan around Drupal's built-in database search?**
- **Recommendation:** Search API with Solr for performance and faceted filtering at this scale; the built-in database search is a fallback if Solr isn't available.
- *Why we ask:* The search backend depends on what your hosting environment can run, which sits on your side.

**E2. Alongside global site search, we'd build a dedicated construction-project finder (filterable by district, highway, status). Does that match how you want projects surfaced?**
- **Recommendation:** One search across all content, plus a focused project finder built on the Project content type (C2). Projects are a top task and benefit from their own filtered view.
- *Why we ask:* It confirms we should plan the project finder as a distinct view, not just rely on global search.

**E3. Is there any need to keep or maintain the existing `mn.gov` state search or the Google project search after launch?**
- **Recommendation:** Retire both in favor of the integrated Drupal search, unless a state requirement or another system depends on the `mn.gov` search.
- *Why we ask:* We want to recommend a single search experience, but only if nothing mandates keeping the state one.

**E4. Beyond the construction-project finder, are there other content or data sets you'd want searchable or browsable in their own right, for example office/staff directories, locations, documents and PDFs, etc?**
- **Recommendation:** Flag these now so they're built as structured data (section C). NOTE: If the data does not exist on the current site, you'll need to add it as structured data in the new site since it cannot be migrated.
- *Why we ask:* It tells us which content types to document searchable views for, versus living only in global search.

**E5. AI-enhanced search was not mentioned in the current scope, but it's an option to consider and might be the strongest lever for increasing self-service levels and addressing issues found in your site feedback data. Would you want us to outline any of these options?**
- **Recommendation:** Search API/Solr is still the standard for most gov sites but that is likely to change. If you're interested, we can discuss the options.
- *Why we ask:* We want to ensure all options are on the table especially since this is a full rebuild.
