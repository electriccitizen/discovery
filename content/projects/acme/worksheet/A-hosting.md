---
id: A
title: "Hosting"
order: 1
---

### What we currently understand

- Acme is currently hosted on a self-managed VPS with no CDN in front of it.
- This is a new point!
- Acme has expressed a preference for a managed Drupal host (Pantheon or Acquia) to reduce ops burden on internal staff.
- Estimated peak traffic: ~50k pageviews/month.

### Questions for you

**A1. Which managed hosting provider does Acme want to use?**
- **Recommendation:** Pantheon — Electric Citizen is a Pantheon agency partner and can manage the relationship end-to-end.
- *Why we ask:* The choice affects deployment pipelines, environment count, included CDN/WAF, and the hand-off model. Pantheon and Acquia are both good fits; the call drives several downstream decisions.

**A2. Will Acme hold the hosting contract directly, or via EC?**
- *Why we ask:* Either works. Acme holding it gives you direct billing control; EC holding it simplifies onboarding and lets us provision immediately. We'll align deployment access either way.

**A3. Are there any compliance constraints (SOC2, HIPAA, FedRAMP, data residency) that constrain the hosting choice?**
- *Why we ask:* These constraints can narrow the tier within a provider (e.g., Pantheon Gold for HIPAA-eligible workloads) and affect what we can bind to the site.
