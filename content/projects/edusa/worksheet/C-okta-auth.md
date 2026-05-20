---
id: C
title: "OKTA, Authentication, and Roles"
order: 3
---

### What we currently understand

- IIE provides an OKTA tenant for internal-user authentication. The FedRAMP variant of OKTA is not required (per Q&A).
- The new build implements **OKTA SSO with just-in-time (JIT) provisioning** for IIE-staff roles (Adviser, REAC, REAC Assistant, IIE Admin). Advisers and REACs already have IIE OKTA accounts (Q&A confirmed); REAC Assistants and IIE Admin sit in the same tenant. Drupal creates user records automatically on first OKTA authentication; OKTA's lifecycle (offboarding, MFA, group changes) is authoritative; IIE never manually provisions or password-manages a website account. This is the standard SSO pattern and matches your stated preference for OKTA-as-source-of-truth.
- **Sponsor authentication is the one open authentication question** — State Department staff sit on a separate identity provider from IIE's OKTA tenant. See C4 below.
- HEIs do not authenticate. They submit via anonymous forms gated by accreditation check; submissions route to REAC review → IIE Admin publish.
- **Editorial UX for IIE-staff roles is a hybrid**: Advisers submit via OKTA-verified Drupal forms (one-shot transactional flows for events, advising-center updates, etc.); REACs / REAC Assistants / IIE Admin authenticate to Drupal via OKTA SSO and use a Drupal-native editor dashboard to review, edit, and publish. This matches the linear approval workflow (Adviser → REAC → IIE Admin) and uses standard Drupal moderation rather than bespoke per-role review UI.
- The current site (Drupal 7) supports a richer six-role model that includes HEI-staff logins. The new build eliminates the HEI-staff role entirely (per Q&A) but keeps the internal-role distinctions, sourced from OKTA instead of Drupal-managed credentials.

### Questions for you

**C1. What kinds of content do REACs, REAC Assistants, and Sponsors *create* (vs. only review)?**

The RFP describes these roles as "Content Creators/Editors" who can "manage or review website information," and the Q&A confirms they're expected to "upload and manage content." But the source documents are explicit only about Adviser submissions (events, advising-center info) and HEI submissions (institutional info, scholarships). What REACs and Sponsors *originate* isn't spelled out.

- *Why we ask:* The submission-form set, editor permissions, and review workflows for REAC and Sponsor depend on what they actually create. We'd rather have a concrete list from you than infer.
- *Expected format:* short list of content types each role creates, or "they only review, they don't originate content." If regional landing pages turn out to be in scope, see also `§L12` for the related question on the current site's `/regions/*` content.

**C2. When a user logs in via OKTA, what attributes will OKTA send to the new site?**
- *Why we ask:* We need OKTA-sent metadata to drive three things on the new site:
  - **(a) Role assignment** — which Drupal role each user lands in (Adviser / REAC / REAC Assistant / IIE Admin). Usually mapped from an OKTA group membership, custom attribute, or job-title field.
  - **(b) Adviser-to-Center mapping** — which advising center an Adviser is assigned to, so the site can route their update submissions to the right center record and the right REAC. This is the most granular requirement and we want to flag it early — OKTA tenants sometimes carry basic identity attributes (email, group, job title) without the per-center detail needed to drive content routing. If OKTA doesn't carry this, we'd maintain the mapping inside Drupal instead (manual onboarding step, or imported from an IIE-maintained source).
  - **(c) Region-to-REAC mapping** — which regional REAC reviews submissions from which Advisers. Each Adviser reports to a regional REAC; we need to know whether that hierarchy lives in OKTA (as group memberships, e.g., "EUR Region") or only in internal systems and spreadsheets. If OKTA already knows it, we use it. If not, we maintain the mapping inside Drupal.
- *Expected format:* list of attributes / groups OKTA can send today, especially noting whether any of them reflect the user's assigned advising center or region. If unsure, "let's coordinate with our IT team during Strategy."

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
