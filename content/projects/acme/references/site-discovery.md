# Acme — Live Site Discovery Findings

> **Generated:** YYYY-MM-DD
> **Source:** Live-site exploration of `acme.example` (anonymous, no login access).
> **Methodology:** Probe homepage + all top-level nav items + one-level-deep sampling under each, plus sitemap walk.
> **Companion to:** `migration-analysis.md`, `technical-analysis.md`

This doc records what we learned by **looking at the live site as an outside visitor** — no backend, no DB, no auth. Everything here is observation, not assumption. Used to ground migration scoping and to surface gated/hidden surface area we'll need the client's help to inventory.

A typical Site Discovery doc has these sections — replace the placeholder content per section as work progresses.

---

## 1. Public surface — top-level navigation

| Nav item | Path | Pages | Notes |
|----------|------|-------|-------|
| Home | `/` | 1 | Hero + product callouts + signup |
| Products | `/products` | ~180 | Faceted listing, individual product pages |
| Case studies | `/case-studies` | ~60 | Static editorial pages |
| Blog | `/blog` | ~400+ | Categorized, paginated |
| About | `/about` | ~12 | Team, history, careers |

## 2. Content types observed

For each: rough volume, typical fields visible, URL pattern, any structural quirks.

- **Products** (~180): name, description, image, spec sheet PDF, related products. URL: `/products/{slug}`.
- **Case studies** (~60): client name, problem, solution, results, image gallery. URL: `/case-studies/{slug}`.
- **Blog posts** (~400+): title, author, date, tags, body. URL: `/blog/{year}/{month}/{slug}`.

## 3. Gated / hidden surface area

Anything we can see hints of but not reach without credentials. **This is the section to populate with what we can't crawl** — it drives client conversations about access.

- _Example: there's a "Members" link in the footer that goes to a login page; member area content is invisible to us._
- _Example: PDF spec sheets are linked from product pages but the full library at `/assets/pdfs/` returns 403._

## 4. Third-party services in DOM

What we see by inspecting the live site:

- Analytics: _GA4 / Plausible / etc._
- Marketing: _Mailchimp embed / HubSpot tracking pixel / etc._
- Chat: _Intercom / Drift / Zendesk._
- A/B testing or personalization: _Optimizely / VWO / none._

## 5. Performance baseline

Captured from current site for reference:

- Lighthouse: Performance _xx_, Accessibility _xx_, Best Practices _xx_, SEO _xx_.
- Largest Contentful Paint: ~_x_s.
- Total Blocking Time: ~_x_ms.
- Notable culprits: _hero image, slow vendor script, etc._

## 6. Accessibility spot-checks

Two or three pages eyeballed for common issues:

- Heading hierarchy: _ok / broken._
- Form labels: _ok / missing on `/contact`._
- Color contrast on link text: _passes / fails (~3.4:1 in footer)._

## 7. What we don't know yet

The list of things the client needs to confirm. Each item probably belongs in the worksheet:

- _Total page count incl. gated sections._
- _Whether internal redirects already exist for legacy URLs._
- _Editorial volume (posts/month) we'll need to support._
