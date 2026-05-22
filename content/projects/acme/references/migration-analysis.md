# Acme — Migration Analysis

> **Generated:** YYYY-MM-DD
> **Companion to:** `technical-analysis.md`, `sitemap-inventory.md`, `source-documents.md`
> **Premise:** Records the per-content-type plan for migration. Updated as decisions are confirmed with the client.

This doc is the **single source of truth for migrate/drop/rebuild decisions** per content type. Worksheet questions in section B (Content Migration) trace back to specific decisions here.

For each content type below, capture: volume, source, target shape, decision, owner, and any open questions.

---

## Decision matrix

| Content type | Source volume | Decision | Editorial review owner | Status |
|--------------|---------------|----------|------------------------|--------|
| Products | ~180 | Migrate (DB export) | _name_ | _pending / confirmed_ |
| Case studies | ~60 | Migrate (DB export) | _name_ | _pending / confirmed_ |
| Blog posts | ~412 | Migrate, then editorial cull | _name_ | _pending — see B2_ |
| Tag/author indexes | ~354 | Regenerate on new platform | n/a | Confirmed |
| Legacy redirects | ~87 | Drop, replace with redirect map | n/a | Confirmed |
| Orphan `/node/N` | ~95 | Unknown — needs DB access (B1) | _name_ | Blocked on B1 |
| Member-area content | unknown | Unknown — needs portal access | _name_ | Blocked |
| PDF spec sheets | unknown | Migrate if discoverable | _name_ | Open |

---

## Per-type detail

### Products
- **Source:** DB export expected; fallback is scrape from `/products/{slug}` (180 pages).
- **Target shape:** new product content type with fields {name, sku, description, image, spec PDF, related products}.
- **Notes:** spec PDFs live at `/assets/pdfs/{sku}.pdf` — confirm coverage matches the product list.

### Case studies
- **Source:** DB export expected; fallback is scrape.
- **Target shape:** matches current 1:1 — minimal field changes.
- **Notes:** images are large (~2MB avg); plan a resize/optimize pass on import.

### Blog posts
- **Source:** DB export strongly preferred for tags + author entity linking.
- **Target shape:** same fields, taxonomy preserved.
- **Notes:** editorial cull is in scope per LOA — _name_ to provide migrate/drop list.

### Tag and author index pages
- **Decision:** regenerate, do not migrate. The new platform handles these via views/templates.

### Legacy redirects
- **Decision:** drop the destination pages, replace with a redirect map at the edge or in `.htaccess`/`_redirects`.

---

## Risks that expand or shrink the manual-recreation surface

The shape of this list is **load-bearing for timeline**. Each item below either confirms a migration assumption or expands manual scope.

- **No DB dump (B1)** → orphan `/node/N`, member-area, and tag/field metadata all become manual or unrecoverable. Estimate: adds 40-60 hours of editorial work.
- **No editorial review owner (B2)** → migrate/drop/rebuild decisions stall; content cutover slips.
- **Hidden surface area (B3)** → if client surfaces additional gated material, scope grows; should be inventoried now, not at cutover.

## Open questions tied to this doc

Each worksheet question that maps to a decision here:

- B1: D7 DB dump availability
- B2: editorial review owner + cadence
- B3: hidden / gated content beyond what we've identified
