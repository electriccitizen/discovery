---
id: I
title: "Integrations"
order: 9
---

### What we currently understand

- Per Q&A, the only required external API integration is OKTA. Other "integrations" are content embeds, exports, or one-way data pulls — not bidirectional APIs.
- MailChimp is IIE's email tool. We'll integrate using the standard Drupal MailChimp contrib module (`drupal/mailchimp`) configured against IIE's account.
- Social media in scope: Facebook, X (Twitter), Instagram, LinkedIn, YouTube (Q&A).
- Analytics: GA4 + Google Tag Manager (committed), Google Looker Studio (committed; EC connects to GA4), and a heat-map tool (LOA-committed but vendor unnamed; see I2).
- **Ongoing ownership stays with IIE.** Day-to-day tools (MailChimp, SMTP, heat-map) get wired up by EC at build; your team owns the ongoing pieces — email templates, subscriber lists, dashboards, capture rules, subscription costs. Mirrors the LOA pattern for AI token costs.

### Questions for you

**I1. MailChimp setup for the new site's newsletter signup.** A few things to confirm, because the current site's newsletter subscription is a post-login user-profile checkbox (not a public form) and we don't know exactly how that pipeline connects to MailChimp today.
- **(a) Existing list?** Do you have an existing MailChimp list that holds current EducationUSA newsletter subscribers? If so, please share the list name(s) — the new site's signup form would subscribe new signups to that list. If not, we'd set up a fresh list at launch.
- **(b) Existing subscribers?** Where do current newsletter subscribers live today (MailChimp, internal IIE system, the current Drupal site's user database)? If they're not already in MailChimp, you may want to export and import them so the new site's audience isn't empty at launch.
- **(c) Multiple lists?** Is there a need for users to be able to subscribe to different lists? Something like a checkbox or select function where they select the list they want to subscribe to when providing their info.

**I1a. Newsletter signup — who's the audience?** The RFP lists this capability under the HEI section, but newsletter signups are typically open to anyone (HS counselors, deans, parents, prospective international students). Should the public-facing signup form be:
- (a) HEI-only (gated by accreditation check, like other HEI submissions);
- (b) Open to any visitor (just collect email + preferences);
- (c) Hybrid (an open "general" list plus a separate accreditation-gated "HEI" list)?
NOTE: Gated singup lists may need to be a future project phase due to budget.

**I2. Analytics tooling — a few questions to align on.**

The LOA has us integrating Google Looker Studio plus a heat-map tool, but it's pretty open-ended on the details. Here's the pattern we'd typically follow — happy to adjust if you'd prefer something different:

- **EC wires up:** Looker Studio connected to your GA4 data; the heat-map tool's JavaScript snippet placed on the site via GTM, with PII masked on form fields by default.
- **You take it from there:** vendor choice for the heat-map tool, any subscription if you pick a paid one, and ongoing dashboards / capture rules in both tools after launch. (Mirrors how the LOA handles AI token costs — keeps these tools fully in your team's hands.)

A few things to confirm:

- **(a) Heat-map vendor preference?** Common picks:
  - *Microsoft Clarity* — free, no traffic caps, integrates with GA4, solid privacy posture. Nice default.
  - *Hotjar* — paid (free tier capped at \~35 sessions/day). More mature feature set.
  - *Mouseflow* — paid, similar territory.
  - *Existing IIE tool* — if someone at IIE is already using something, let us know and we'll wire that up instead.
- **(b) Subscription costs.** If you go with a paid tier, the subscription is on your side. Comfortable with that?
- **(c) Dashboards.** Dashboard authoring in both Looker and the heat-map tool is IIE's after launch — confirm.
- **(d) PII masking.** Our baseline heat-map capture will mask all HEI contact-form inputs and scholarship-submission fields. Anything else you'd want masked from day one?

- *Why we ask:* These affect sizing and clarity on who handles what after launch.
- *Expected format:* short answers per (a)–(d), or "let's discuss in Strategy."

**I3. Will the new site require a cookie-consent banner (e.g., for EU visitors under GDPR or California users under CCPA)?**
- *Why we ask:* Affects whether analytics and heat-map tracking fire before or after user consent.

**I4. Social media embed feeds** EC recommends not embedding social media feeds. This is a dated practice that has largely been dropped from websites because users typically follow social feeds directly in their platform apps. Social feed embeds are also large performance hogs and frequently fail to due to platform API changes. EC recommends that instead you add social sharing links where appropriate.
