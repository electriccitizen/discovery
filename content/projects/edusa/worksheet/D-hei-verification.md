---
id: D
title: "HEI Verification"
order: 4
---

### What we currently understand

- HEIs will not have logins on the new site. Their submissions (institutional info, scholarships, possibly financial aid records) come through anonymous Drupal forms.
- Per RFP, only accredited U.S. Higher Education Institutions should be able to submit. Per your Q&A, you accept some PII (first name, last name, email) to support verification.

### Questions for you

**D1. Is there an authoritative list of accredited U.S. higher-education institutions we should validate submissions against?** Two patterns we can build:
- **(a) Internal allowlist:** IIE supplies a list (e.g., a CSV maintained in-house, or a snapshot of an external source) that we import into Drupal and update periodically. Validation is fast and offline.
- **(b) Live integration with an external accreditation source:** e.g., NCES IPEDS, CHEA, or another authority. Validation is real-time but introduces an external dependency.
- *Why we ask:* The choice changes the data-ingest plan and ongoing maintenance commitment. If neither (a) nor (b) is feasible, we fall back to manual review-then-publish.
- *Expected format:* source name + access method (file / API endpoint / manual maintenance), or "we'll review submissions manually."

**D2. When a non-accredited person submits something, what should the system do — reject silently, reject with a message, route to manual review, or something else?**
