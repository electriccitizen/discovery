# Acme — Source Documents

This document indexes the source documents that ground the Acme rebuild and explains how they relate. Every claim in the discovery worksheet and the supporting reference docs traces back to one of these.

## The source documents

### Letter of Agreement (LOA)

- **Date:** YYYY-MM-DD (signed)
- **Parties:** Acme ↔ Electric Citizen
- **Role:** Binding contract. Single authoritative source for scope, budget, deliverables, payment terms, and any carve-outs.
- **Structure:** Agreement body + Attachment A (Incorporated Regulations) + Attachment B (Scope of Work) + Attachment C (Budget) + Attachment D (Payment).
- **Key load-bearing commitments:**
  - Fixed-fee, NTE _$XXk_
  - Launch target: _YYYY-MM-DD_
  - EC builds; Acme operates
  - Hosting carve-out — _who holds the contract?_
  - Support plan: _N hrs/month_

### RFP — Original Solicitation

- **Date:** YYYY-MM-DD
- **Issued by:** Acme
- **Role:** The original solicitation. Defines initial scope, evaluation criteria, technical requirements, and the original page list. **Superseded by the LOA where the two differ.**
- **Notable content:** original launch date, original scope items that may have shifted, security/compliance language.

### RFP Q&A — Solicitation Amendment

- **Date:** YYYY-MM-DD
- **Issued by:** Acme
- **Role:** Official amendment to the RFP. Captures Acme's binding answers to vendor questions during the solicitation. Clarifies ambiguous RFP items and occasionally overrides original RFP language.
- **Why it matters:** the Q&A is where most working assumptions were settled. Many worksheet questions trace to a specific Q&A answer.

### SOW (if separate from LOA)

- **Date:** YYYY-MM-DD
- **Role:** Detailed statement of work if the LOA references a separate SOW. Otherwise omit this section.

---

## Document precedence

When two source documents disagree on the same point, this is the order of authority:

1. **LOA** (binding contract — wins on scope, budget, deliverables, dates).
2. **RFP Q&A** (binding amendment — wins on RFP items it explicitly clarifies).
3. **RFP** (informs intent on items the LOA and Q&A don't touch).

Cite the source when there's any chance of ambiguity. The worksheet calls out divergence points explicitly so they're not buried.

---

## Material clarifications from the Q&A

Bullet-point the substantive Q&A answers that shape the build. Examples of the kind of thing to capture:

- _"AI features are exploratory, not required at launch."_ → narrows section G scope.
- _"Newsletter integration: HubSpot, not Mailchimp."_ → resolves C2.
- _"All migration content review is Acme's responsibility."_ → drives B2.
- _"Launch is firm at YYYY-MM-DD."_ → constrains D1.

Each bullet should link to the worksheet question it informs, so a reader can trace a worksheet question back to its source.

---

## File locations

Source PDFs live outside the repo (sensitive). Typical paths:

- `~/Drive/Clients/Acme/contracts/LOA-signed.pdf`
- `~/Drive/Clients/Acme/rfp/Acme-RFP.pdf`
- `~/Drive/Clients/Acme/rfp/Acme-RFP-QA-amendment-1.pdf`

Update these paths to match the actual storage on a real project.
