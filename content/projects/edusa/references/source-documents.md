# EducationUSA Rebuild — Source Documents

This document indexes the three source documents that ground the EducationUSA rebuild, and explains how they relate. Every claim in the discovery worksheet and the supporting reference docs traces back to one of these three.

## The three source documents

### Letter of Agreement (LOA)

- **Date:** April 17, 2026 (signed)
- **Parties:** IIE ↔ Electric Citizen
- **Role:** Binding contract. The single authoritative source for scope, budget, deliverables, payment terms, and the hosting carve-out.
- **Structure:** Agreement body + Attachment A (Incorporated Regulations) + Attachment B (Scope of Work) + Attachment C (Budget) + Attachment D (Payment).
- **Key load-bearing commitments:**
  - Fixed-fee, NTE $234k
  - Launch target: April 30, 2027
  - EC builds; IIE operates
  - Hosting carve-out — IIE holds the hosting contract directly
  - Google Translate at launch; richer multilingual handled as a future change order
  - Megawatt support plan (10 hrs/month)

### RFP — Original Solicitation

- **Date:** September 2025
- **Issued by:** IIE
- **Role:** The original solicitation. Defines initial scope, evaluation criteria, technical requirements, and the original page list. Superseded by the LOA where the two differ, and by the Q&A on items the Q&A explicitly clarifies. Still useful for understanding intent and for items the LOA/Q&A don't touch.
- **Notable content:** the AI-feature framing, the broad integration vision (later narrowed by the Q&A), the original launch date (moved by the LOA), Attachment C security certification requirements.

### RFP Q&A — Solicitation Amendment 1

- **Date:** October 7, 2025
- **Issued by:** IIE
- **Role:** Official amendment to the RFP. Captures IIE's binding answers to vendor questions during the solicitation period. Clarifies ambiguous RFP items and occasionally overrides the original RFP language.
- **Why it matters:** the Q&A is where most of the build's working assumptions were settled. Many worksheet questions trace directly to one of these Q&A answers. See §3 below for the substantive clarifications.

---

## Document precedence

When two source documents disagree on the same point, this is the order of authority:

1. **LOA** (binding contract — wins)
2. **Q&A** (clarifying — wins over the RFP)
3. **RFP** (contextual — superseded where the others speak)

A handful of items in the worksheet are flagged where the LOA scope and the earlier Q&A guidance pointed in different directions. Those are surfaced as explicit decision points rather than assumed away.

---

## Key Q&A clarifications

Grouped by topic, with the LOA position noted where it differs.

### Identity / OKTA

- **Standard OKTA, not the FedRAMP variant.** IIE provides API documentation; EC builds SSO against the IIE OKTA tenant.
- **MFA, attribute mapping, and protocol** (SAML vs OIDC) are discovery items — see worksheet §C.

### Hosting

- **FedRAMP hosting is preferred, not required.** This expanded the hosting candidate pool. As of May 2026 IIE selected **Pantheon** (SOC 2 Type 2, runs on Google Cloud, Fastly CDN).
- **No traffic peaks expected.** The site is steady-state; hosting can be sized for baseline + reasonable headroom rather than spike auto-scaling. (Caveat: anniversary or Olympics-year promotion may break this assumption.)
- **No ATO required.** PII protection (HEI first name / last name / email) is handled via the DPA + standard security controls.
- **Disaster Recovery: Tier 2 Important Business-Critical.** RTO hours-to-a-day, RPO hours. Pantheon's standard infrastructure fits this tier.

### AI features

- **IIE wants AI to be "instrumental" to the website**, not just present. Confirmed broader ambition than a sidebar feature. See worksheet §G for the per-feature scoping.
- **No data privacy restrictions on LLM API use** — standard commercial LLM APIs are acceptable; the DPA still applies, and PII passed into prompts is minimized.

### Integrations

- **The only required external API is OKTA.** Other "integrations" are content embeds, exports, or one-way pulls — not bidirectional APIs.
- **MailChimp must be built fresh.** No existing connector to reuse; we wire the standard Drupal MailChimp module to IIE's account. See worksheet §I.

### Content & editorial

- **Site content is created and approved by IIE.** EC does not write copy.
- **Migration is manual and selective.** IIE leads the inventory of what to migrate vs. drop. As of May 2026, EC owns the URL inventory from the crawl; IIE provides editorial review. See worksheet §B.
- **Editorial workflow is linear:** Adviser submits → REAC reviews → IIE approves/publishes. See worksheet §C.

### Multilingual

- **Google Translate at launch.** Richer multilingual capabilities are deferred to a future change order. The Q&A's earlier reference to an "internal translation program" was superseded by the LOA's specific Google-Translate framing.

---

## Confirmed scope boundaries

| Topic | What the Q&A confirms |
|---|---|
| Single vs multiple vendors | Single |
| External sites in scope | Only `educationusa.org`. Other URLs are link-out only. |
| Maintaining old `.gov` site | EC handles redirects only; not maintaining the legacy site |
| Decision-making authority | IIE is the key decision maker; concurrence sought from sponsor, REACs, and other stakeholders |
| Accessibility standard | Section 508 + WCAG 2.1 AA (no additional standards) |
| PII to protect | HEI first name, last name, email |
| Office tooling | Microsoft + Google Workspace |
| Brand | Existing brand guidelines; new site builds on them |
| Social media in scope | Facebook, X, Instagram, LinkedIn, YouTube |
| Audience research | IIE has researched all stakeholder perspectives except students; vendor will help test with students during the build |

---

## Items left open ("TBD")

These were asked in the Q&A and answered with deferral. They've been surfaced as discovery questions in the worksheet where applicable:

| Topic | Where it's handled |
|---|---|
| CDN | Hosting selection (resolved May 2026: Pantheon includes Fastly) |
| Personalization | Strategy phase |
| Service Level Agreements (uptime / DR specifics) | Hosting selection + EC support plan |
| Hyper-care stabilization period | Default 30–60 days post-launch; confirm in scoping |
| Multi-region failover | Hosting selection |
| Content governance policies | Strategy phase output |
| Library Services use cases | Discovery |
| Officials/Administration page (static vs dynamic) | UX call during Design |
