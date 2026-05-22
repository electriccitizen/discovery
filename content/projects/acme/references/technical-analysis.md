# Acme — Technical Analysis

> **Generated:** YYYY-MM-DD
> **Source documents:** `source-documents.md` indexes the RFP/LOA/SOW/Q&A this analysis is built from.
> **Status:** Placeholder template. Replace the placeholder sections below with the actual pre-build technical assessment.

This is the **pre-build technical assessment** of the existing client system — written before the discovery worksheet, used to ground every assumption in the worksheet. The worksheet asks the open questions; this doc records what we already know.

A typical Technical Analysis covers everything the build team needs in front of them on day one. Each section should resolve to *what we'll do* and *what we still need from the client* (which becomes worksheet questions).

---

## 1. Current platform

- **CMS:** _e.g. Drupal 9, WordPress, custom._
- **Hosting:** _provider, tier, environments available._
- **DB / backend access:** _have / don't have, and the implication for migration._
- **Auth model:** _SSO? local accounts? gated areas?_
- **Integrations in place:** _CRM, ESP, payment, search, etc._

## 2. Target platform

- **CMS choice:** _and why._
- **Hosting choice:** _and contract holder._
- **Local dev:** _DDEV / Lando / Docker / npm dev — what every dev runs._
- **Deploy pipeline:** _Pantheon Multidev / GitHub Actions / etc._

## 3. Content architecture

- Content types we plan to migrate or build.
- Taxonomies and field strategy.
- Editorial workflow assumptions (draft → review → publish).

## 4. Integrations

- Per integration: direction (one-way / two-way), auth, expected volume, failure mode.
- Anything that needs a vendor account or API key from the client up front.

## 5. Migration approach

- Source-of-truth for content (DB? scrape? CSV exports?).
- Per-content-type call: migrate / drop / rebuild.
- Editorial review responsibility — see `migration-analysis.md` for the full per-content-type breakdown.

## 6. Performance, accessibility, SEO

- Baseline targets (Lighthouse, WCAG level, redirect rules).
- Known constraints from the current site (slow vendor scripts, legacy URL patterns, etc.).

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Example: no DB dump → manual content recreation expands | Medium | Medium | Push for dump; otherwise budget the manual work explicitly |

## 8. Open items going into discovery

This section is the bridge to the worksheet. Each item below maps 1:1 to a worksheet question:

- _Hosting carve-out (A1, A2, A3)_
- _Content migration approach (B1–B3)_
- _Integration scope confirmation (C1–C3)_
- _Launch timing + cutover model (D1, D2)_
