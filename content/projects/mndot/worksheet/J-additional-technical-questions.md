---
id: J
title: "Additional Technical Questions"
order: 10
---

### What we currently understand

- Technical questions that span several areas or don't fit neatly under a single section above: email and notifications, redirects, accessibility, and multilingual support.

### Questions for you

**J1. GovDelivery (email bulletins and subscriptions): how should the new site work with it, and do you need separate subscription lists (for example, by district or topic) with sign-up embeds on the site?**
- **Recommendation:** Pending, depending on how you plan to use GovDelivery.
- *Why we ask:* It tells us whether to plan a sign-up block that can be used on multiple pages or multiple sign up blocks for different list subscriptions.

**J2. Transactional email (form confirmations, password resets, system notices): what should the new site use to send it?**
- **Recommendation:** Most of our state clients use the state's SMTP server for this use case.
- *Why we ask:* Confirmation needed to provide the correct module recommendation.

**J3. We assume URL redirects will be handled within Drupal, with your team creating the redirect import file. Does that work?**
- **Recommendation:** Use the Drupal Path Redirect Import module and bulk-load the old-to-new URL mapping. Your team produces the import file mapping legacy URLs to their new destinations.
- *Why we ask:* To confirm your plans for URL redirects so we can recommend the correct approach.

**J4. We understand the standard is WCAG 2.2 AA (layered on the Minnesota Digital Accessibility Standard: Section 508 and WCAG 2.1 AA), that accessibility is built into our design deliverables and theme prototype, that automated and manual audits happen before launch, and that legacy PDF accessibility is out of scope. Are there other accessibility concerns or considerations we should account for?**
- **Recommendation:** We design and document to WCAG 2.2 AA throughout (built into the design system and theme prototype). Tell us if anything beyond that needs consideration, including any published accessibility statements or public reporting paths.
- *Why we ask:* We mainly need to confirm the bar and surface anything site-specific.

**J5. Multilingual support isn't mentioned in the RFP or Q&A, so we're assuming the new site is English-only with no content translation. Is that correct?**
- **Recommendation:** Assume English-only unless you tell us otherwise. If language access is needed, Drupal can handle it, from full content translation to a lighter translation widget, but it affects the content model, migration, and URL structure, so it's best decided early.
- *Why we ask:* It's far easier to plan for translation from the start than to retrofit it after the content model is built.
