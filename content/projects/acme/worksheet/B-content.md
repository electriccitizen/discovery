---
id: B
title: "Content Migration"
order: 2
---

### What we currently understand

- Source site: `acme.example` — Drupal 9 with full backend access available.
- Sitemap totals ~1,200 URLs; Acme estimates ~800 are still relevant after stale-content review.
- Three structured content types in scope: products (~180), case studies (~60), and blog posts (~400+).
- Acme will provide editorial review on the migrate/drop list.

### Questions for you

**B1. Can Acme provide a current database export for the migration?**
- *Why we ask:* A DB dump preserves taxonomy IDs, entity references, and admin-only fields that aren't recoverable from a public crawl. Materially improves migration fidelity.
- *Expected format:* a named contact or a confirmed delivery date.

**B2. Who at Acme owns the migrate/drop editorial decisions, and what cadence works for review?**
- **Recommendation:** A named owner plus a weekly 30-minute review pass against a shared inventory.
- *Why we ask:* Without a clear owner this work stalls and the timeline slips. The cadence affects how we batch the review work.

**B3. Are there any content areas (gated portals, password-protected sections, internal-only PDFs) that won't show up in a public crawl?**
- *Why we ask:* Orphan content and asset libraries living off the public path often surface mid-migration; better to identify them up front.
