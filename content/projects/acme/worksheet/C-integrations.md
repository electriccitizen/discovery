---
id: C
title: "Integrations"
order: 3
---

### What we currently understand

- Acme uses Salesforce as the system of record for customer accounts.
- A Mailchimp newsletter signup is embedded on every page footer.
- Acme is evaluating a switch from Mailchimp to HubSpot during the build window.

### Questions for you

**C1. For the Salesforce sync — is it one-way (site → SF) or two-way?**
- *Why we ask:* Two-way sync adds significant complexity (conflict resolution, polling cadence, field mapping) and changes the auth model. One-way form submissions are straightforward.

**C2. Should we build the newsletter integration against Mailchimp or HubSpot?**
- **Recommendation:** Wait until Acme commits before we build. If you have to ship before the decision, build against an abstraction so we can swap providers cheaply.
- *Why we ask:* Building against the wrong provider doubles the work. We'd rather pause than rebuild.

**C3. Any other third-party systems the site needs to talk to (analytics beyond GA4, marketing automation, CRM, payment, search appliance)?**
- *Why we ask:* Integrations frequently surface late and inflate scope. Surfacing them now lets us plan auth, error handling, and rate-limit behavior up front.
