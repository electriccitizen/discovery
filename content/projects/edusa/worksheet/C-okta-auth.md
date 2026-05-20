---
id: C
title: "OKTA, Authentication, and Roles"
order: 3
---

### What we currently understand

- IIE provides an OKTA tenant for internal-user authentication. The FedRAMP variant is not required (per Q&A).
- The new build implements **OKTA SSO with just-in-time (JIT) provisioning** for IIE-staff roles (Adviser, REAC, REAC Assistant, IIE Admin). Drupal creates user records on first OKTA authentication; OKTA's lifecycle (offboarding, MFA, group changes) is authoritative; IIE never manually provisions website accounts. Advisers and REACs already have IIE OKTA accounts (Q&A confirmed).
- **Sponsor authentication is the one open question.** State Department staff sit on a separate identity provider from IIE's OKTA tenant. See C4.
- HEIs do not authenticate. They submit via anonymous forms gated by accreditation check; submissions route to REAC review → IIE Admin publish.
- **Editorial UX is hybrid by role.** Advisers submit via OKTA-verified Drupal forms (one-shot transactional flows). REACs / REAC Assistants / IIE Admin authenticate to Drupal via OKTA SSO and use a Drupal-native editor dashboard to review, edit, and publish. Standard Drupal moderation, not bespoke per-role review UI.
- The current Drupal 7 site supports a richer six-role model including HEI-staff logins. The new build eliminates HEI-staff entirely (per Q&A) but keeps the internal-role distinctions, sourced from OKTA.

### Questions for you

**C1. What kinds of content do REACs, REAC Assistants, and Sponsors *create* (vs. only review)?**

The RFP describes these roles as "Content Creators/Editors" who can "manage or review website information," and the Q&A confirms they're expected to "upload and manage content." But the source documents are explicit only about Adviser submissions (events, advising-center info) and HEI submissions (institutional info, scholarships). What REACs and Sponsors *originate* isn't spelled out.

- *Why we ask:* The submission-form set, editor permissions, and review workflows for REAC and Sponsor depend on what they actually create. We'd rather have a concrete list from you than infer.
- *Expected format:* short list of content types each role creates, or "they only review, they don't originate content." If regional landing pages turn out to be in scope, see also `§L12` for the related question on the current site's `/regions/*` content.

**C2. When a user logs in via OKTA, what attributes will OKTA send to the new site?**

We need OKTA-sent metadata to drive three things on the new site:

- **Role assignment** — which Drupal role each user lands in (Adviser / REAC / REAC Assistant / IIE Admin). Usually mapped from an OKTA group, custom attribute, or job-title field.
- **Adviser-to-Center mapping** — which advising center an Adviser is assigned to, so submissions route to the right center record and the right REAC. The most granular requirement; if OKTA doesn't carry it, we'd maintain the mapping inside Drupal instead.
- **Region-to-REAC mapping** — which regional REAC reviews submissions from which Advisers. If OKTA carries this (e.g., an "EUR Region" group), we use it; otherwise we maintain it in Drupal.

- *Why we ask:* Each Drupal feature above depends on corresponding OKTA data. We want to confirm what's available before designing the integration.
- *Expected format:* list of attributes / groups OKTA can send today, especially noting any that reflect the user's assigned advising center or region. If unsure, "let's coordinate with our IT team during Strategy."

**C3. Is MFA (multi-factor authentication) enforced on your OKTA tenant?**
- *Why we ask:* This is enforced at the OKTA level, not Drupal — but we need to confirm so we don't design any flow that assumes single-factor authentication.

**C4. How will Sponsors (State Department staff) authenticate to the new site?**

Your Q&A Mod 1 §User Accounts specifically names *Advisers and REACs* as having existing IIE OKTA logins — Sponsors are conspicuously not in that list, even though the same Q&A entry includes them among the content-uploading roles. Since Sponsors are State Department staff rather than IIE staff, we can't assume they sit in IIE's OKTA tenant.

- *Expected format:* guidance on how Sponsors will authenticate, or "we need to consult State Dept IT before answering."

**C5. How can you provide technical details on OKTA integration?** Drupal SSO needs a handful of OKTA specifics. Some up-front (so we know what protocol/module to plan for), others during implementation (so IIE IT knows what to prepare).

**Up-front, for discovery:**
- **(a) OKTA tenant URL** (e.g., `iie.okta.com`).
- **(b) Protocol** — SAML 2.0 or OIDC? Both work with Drupal; this determines which integration module we install.
- **(c) Named IIE IT contact** for the integration work.

**At implementation, IIE IT will need to provide (we'll coordinate directly):**
- For **SAML**: IdP metadata XML (or SSO URL + Entity ID + X.509 signing certificate).
- For **OIDC**: Client ID + Client Secret, issuer URL, scopes.
- Attribute mapping for Drupal role/region assignment (relates to C2).
- One or two test OKTA accounts for integration testing.
- Callback / redirect URLs — we provide these once Pantheon environments are up.

- *Expected format:* answers to (a)–(c) now; the rest deferred to direct IIE IT coordination.
