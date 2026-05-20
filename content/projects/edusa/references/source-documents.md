# EducationUSA Rebuild — Source Documents

> **Generated:** 2026-05-14 (reframed as Source Documents 2026-05-19)
> **Companion to:** `technical-analysis.md`
> **Status:** Index, precedence, and synthesis of the three pre-build source documents that ground every claim in the working docs. (EC's own proposal response is captured separately at the end as an internal-only reference.)

## Purpose

When `technical-analysis.md`, `migration-analysis.md`, `discovery-worksheet.md`, etc. cites "the LOA," "the Q&A," or "the RFP," this is the doc that tells you what those are, how they relate, and which one wins when they conflict. It also preserves the line-by-line synthesis of the Q&A amendment (§2 below) — the largest single source-doc reading we've done — since the Q&A is where the most material clarifications to the original RFP live.

---

## ⚠ Document precedence — read this first

The **signed LOA (Apr 17, 2026) is the binding contract.** The RFP and Q&A predate it and are not in the LOA's order-of-precedence stack. The LOA's Scope of Work (Attachment B) is what we are legally required to build, regardless of what the RFP or Q&A says.

**Order of precedence per LOA Art. 29:**

1. The Agreement (LOA body)
2. Attachment A — Incorporated Regulations
3. Attachment B — Scope of Work
4. Attachment C — Budget
5. Attachment D — Payment

**How to read each source:**

- **LOA (binding):** what we must deliver. If a working doc claim references the LOA, it's load-bearing scope.
- **Q&A (clarifying):** fills gaps the LOA leaves vague; safe to incorporate as working assumptions unless it conflicts with the LOA.
- **RFP (contextual):** the original solicitation. Superseded by the Q&A on items the Q&A explicitly clarifies, and by the LOA on items the LOA differs. Useful for understanding intent and for items the LOA/Q&A don't touch.

When multiple sources speak to the same claim, the precedence above governs which one is authoritative. Q&A items flagged below as "Discrepancy with LOA — surface for discussion" are the cases where we work to the LOA and flag the Q&A's different expectation to IIE for confirmation.

---

## 1. The three source documents

### 1.1 Letter of Agreement (LOA)

- **File:** `docs/background/3000403861_Electric Citizen_LOA.pdf`
- **Date:** Apr 17, 2026 (signed)
- **Parties:** IIE ↔ Electric Citizen
- **Role:** Binding contract. The single authoritative source for scope, budget, deliverables, payment terms, and hosting carve-out.
- **Structure:** Agreement body + Attachment A (Incorporated Regulations) + Attachment B (Scope of Work) + Attachment C (Budget) + Attachment D (Payment).
- **Used by:** every working doc. Citations look like "per LOA §X" or "LOA Att. B obj. #N."
- **Notable load-bearing language:** fixed-fee NTE $234k, launch Apr 30, 2027, EC builds / IIE operates, hosting carve-out (IIE holds the hosting contract), Google Translate at launch (richer multilingual = future change order), Megawatt support plan (10 hrs/month).

### 1.2 RFP — Original Solicitation

- **File:** `docs/background/EducationUSA RFP.pdf`
- **Date:** Sep 2025
- **Issued by:** IIE
- **Role:** Original solicitation. Defines initial scope, evaluation criteria, technical requirements, and the original page-list. Superseded by the LOA where they differ, and by the Q&A on items the Q&A explicitly clarifies.
- **Used by:** working docs cite it for intent, for audience definitions, broad feature lists, and items the LOA/Q&A don't touch (e.g., "An engaging webpage of text and multimedia content showcasing international students" per p.10 — referenced from `discovery-worksheet.md §L13`).
- **Notable load-bearing language:** the AI-feature framing, the broad integration vision (later narrowed by the Q&A), the original launch date (later moved to Apr 2027 in the LOA), Attachment C security certification requirements.

### 1.3 RFP Q&A — Solicitation Amendment 1

- **File:** `docs/background/RFP-Mod-1_QA.pdf`
- **Date:** Oct 7, 2025
- **Issued by:** IIE
- **Role:** Official amendment to the RFP. Captures IIE's binding answers to vendor questions during the solicitation period. Clarifies ambiguous RFP items; sometimes contradicts the original RFP (Q&A wins over RFP); occasionally diverges from the eventual LOA (LOA wins).
- **Used by:** working docs cite it for clarifications — e.g., "standard OKTA, not FedRAMP variant," "monthly security reporting expectation," "MailChimp connector must be built fresh," "the only required external API is OKTA."
- **Synthesis below in §2.** That section is the largest single source-doc reading we've done — every Q&A clarification that changed a working assumption is logged there with the prior-vs-actual delta.

---

## 2. Q&A clarifications synthesis

The Q&A is the densest source-doc-vs-prior-assumption delta. Each subsection below captures one Q&A clarification that changed a working assumption.

### 2.1 OKTA is **not** required to be the FedRAMP variant

> *"OKTA FedRAMP not required. IIE will provide the necessary documentation."*
> *"OKTA FedRAMP integration … OKTA FedRAMP not required. Selected vendor is tasked with required API for IIE OKTA."*

**Prior assumption (now wrong):** My docs called this "OKTA (IIE's FedRAMP tenant)" throughout, implying the FedRAMP-authorized variant of OKTA Identity Cloud was the integration target. The RFP did say "FedRAMP/OKTA" as one of the security framings, which is what I latched onto.

**Actual:** Standard OKTA integration. IIE will supply API documentation and access. We build the SSO connector against their tenant.

**Impact:** Simpler than I had it. No additional FedRAMP environmental requirement coming through OKTA.

### 2.2 FedRAMP hosting is **preferred, not required**

> *"This can be negotiated with selected vendor, but IIE prefers to manage the hosting contract."*
> *"FedRAMP preferred but not required."*
> *"FedRAMP certification preferred but not required."*

**Prior assumption:** FedRAMP Moderate had been treated as a hard hosting requirement.

**Actual:** Preference, not mandate. IIE explicitly opened the door to compliance via a leading CSP (AWS/Azure/GCP) that meets Tier III+ standards without a FedRAMP-specific ATO.

**Impact:** Significantly expanded the hosting candidate pool. **Resolution (May 2026):** IIE selected **Pantheon** — SOC 2 Type 2, runs on Google Cloud, Fastly CDN. Pantheon's FedRAMP posture should be verified directly, but the Q&A's relaxation made this selection viable. See `technical-analysis.md §5`.

### 2.3 Security certifications are **mandatory for the vendor itself**

> *"Are there additional accessibility standards beyond Section 508/WCAG 2.1 AA…" — No.*
> *"Security Certifications: Is it mandatory for vendors to hold ISO 27001 or SOC 2 Type 2 certifications, or will completing the NIST CSF assessment suffice? — Yes. Please see Attachment C of the RFP which is applicable."*

**Prior assumption:** I had these as "verify if EC holds them."

**Actual:** Mandatory. Vendor (EC) must hold **ISO 27001** OR (**SOC 2 Type 2 attestation + NIST CSF self-assessment**). This is enforced via the OneTrust IT Security Questionnaire process before any renewal that crosses thresholds.

**Impact:** This is a real obligation, not a "verify" — EC ops/leadership need to confirm which certification path we're on. If neither, the NIST CSF assessment is the lift, and it must happen before any future renewal touching IIE data.

### 2.4 Multilingual — **settled by LOA** (no action)

> *Q&A:* *"IIE expects student facing pages (5 steps, U.S. info, events, scholarships) to be translated. IIE currently has an internal translating program that we would like to integrate."*

**LOA position (final, what we build to):** LOA §G Integrations: *"Multilingual capabilities most likely using Google (with the possibility of a more robust plugin in the future as part of a change order)."*

**Status:** The LOA was signed six months after this Q&A and is specific about the launch state (Google Translate) and the upgrade path (future change order). No discrepancy to surface — the LOA superseded any earlier intent. The "internal translating program" referenced in the Q&A may map to the future "robust plugin" upgrade, or may have been deferred — either way, in-scope at launch is Google Translate.

**No action needed during discovery.** Per the LOA, the launch state is Google Translate; a full multilingual build-out is planned for a future phase with a separate scope.

### 2.5 API integrations are **smaller in scope than the RFP implied**

> *"IIE does not anticipate the use of API to transfer data with external system. The only exception would be the use of OKTA."*

**Prior assumption:** My integrations inventory in `technical-analysis.md §4` listed many candidate APIs (CRM, MailChimp, Open Doors/Project Atlas data sources, etc.).

**Actual:** Per IIE, the only required external API is OKTA. Most "integrations" are content embeds, exports, or one-way data pulls — not bidirectional APIs.

**Impact:** Lighter integration load than originally feared. **But** — this conflicts with QA elsewhere where IIE says they want "data analytics plug-ins, social media account feeds, digital marketing platforms" and "current and future third-party plugins." So the answer is "low API surface today, designed to accept plugins later." Worth pinning down in discovery what each system actually is.

### 2.6 MailChimp integration must be built from scratch

> *"Currently we do not have access to existing connectors. We do have backend access to Mailchimp."*

**Prior assumption:** Treated MailChimp as a standard integration with existing Drupal modules.

**Actual:** No existing connector to reuse. Drupal does have a Mailchimp module (`drupal/mailchimp`) which would be the starting point, but we'll need to wire it to IIE's account and build the HEI-list export logic specifically.

**Impact:** Modest. The Drupal Mailchimp module handles most of it — but it's another configuration deliverable, not a freebie.

### 2.7 No traffic peaks expected

> *"The website generally does not have peaks of traffic but is consistent throughout the year."*

**Prior assumption:** I had treated auto-scaling as a hosting requirement.

**Actual:** Steady-state traffic. Hosting can be sized for the baseline + reasonable headroom, not for spikes.

**Impact:** Lowers hosting cost. Removes a complexity driver from hosting selection. (Note: any "viral moment" — Olympics-year U.S. study coverage, anniversary-year publicity — would invalidate this. The Q&A specifically mentions a 250th-anniversary tie-in for the original July 2026 launch date, which suggests at least one expected spike, contradicting this answer somewhat.)

### 2.8 AI is wanted to be **instrumental**, not just present

> *"IIE would like AI to be instrumental to the website."*
> *"The AI-driven features are desired for full launch by July 27, 2026, and should be internally tested prior to that date."* (note: original July 2026 date superseded by LOA's April 2027)
> *"This is entirely new for EducationUSA and we hope that the tools will be highly used/valued by all who visit our pages."*

**Prior assumption:** I had AI features as "committed but toggleable, four use cases."

**Actual:** IIE has higher ambition for AI than I had inferred. They want it central to the user experience, not a sidebar feature.

**Impact:** Reinforces Risk **R3** (AI scope vs $106k development CLIN). The gap between "instrumental to the website" and "fits inside a fixed-fee build alongside everything else" is the tension we'll need to manage during scoping. Worth surfacing with Albino during discovery: which AI feature is most important if budget forces phasing?

### 2.9 No data privacy restrictions on LLM API use

> *"Do you have privacy or data restrictions for using an LLM to train called via an API? — No."*

**Prior assumption:** Treated LLM vendor choice as constrained by FedRAMP/DPA flow-down.

**Actual:** IIE explicitly permits LLM API use without specific privacy restrictions. The DPA still applies (we have to flow it down), but no extra blocker.

**Impact:** Frees vendor selection. Standard commercial Anthropic/OpenAI/Google APIs are acceptable as long as their DPAs are in order. (Caveat: site users will still expect normal data-handling expectations, and any PII passed into prompts should be minimized.)

### 2.10 Editorial workflow is simpler than I had structured

> *"This should be a simple role-based approval workflow for the adviser-side updates: adviser > REAC > IIE."*

**Prior assumption:** I had structured this as Drupal `content_moderation` with multi-state transitions and Webform-driven submission entities.

**Actual:** Three-step linear: adviser submits → REAC reviews → IIE approves/publishes. Simpler than the multi-path matrix I sketched.

**Impact:** Standard Drupal `content_moderation` covers this without much customization. Lowers complexity in §3.2 of `technical-analysis.md`.

### 2.11 Migration is **manual + selective + IIE-led inventory**

> *"We are looking at a mix of manually importing content and creating brand new content for the new website."*
> *"This might be moved manually or new content created. Most content that is on the current website will be retained but IIE is in the process of doing an inventory of current content."*

**Prior assumption:** Migration via scraping tools, possibly manual.

**Actual (per Q&A):** Mostly manual, with IIE doing the inventory themselves. We're less the migration owner than I had assumed — more of an enabler.

**Status update (2026-05-19):** The Q&A's "IIE is producing an inventory in parallel" hasn't materialized in practice — IIE has not yet been able to produce analytics or pre-existing inventory data. Working posture has shifted: **EC owns the URL inventory** (crawl-derived; see `sitemap-inventory.md`); **IIE provides editorial review and migrate/drop judgment** rather than producing a complementary second inventory. See `discovery-worksheet.md §B2` for the question to IIE on review mechanism / cadence.

**Impact:** Lowers migration risk (R2). The dependency now is on IIE editorial-review time and a named owner, not on a deliverable inventory document.

### 2.12 ATO is not currently required

> *"Will the new EducationUSA website require an Authority to Operate (ATO)? — The current site does not, so this is open for discussion. There is PII (FN, LN, Email) for HEIs that needs to be protected."*

**Prior assumption:** Hadn't tracked this explicitly.

**Actual:** No ATO required. PII protection is the underlying concern, which is handled via the DPA + standard security controls.

**Impact:** Removes a major federal-compliance step we had previously been hedging around.

### 2.13 Disaster Recovery tier is **Tier 2 Important Business-Critical**

> *"To be determined. The new website threshold fits tier 2 Important Business-Critical"*

**Actual:** IIE has classified the site as Tier 2 (Important Business-Critical) for RTO/RPO purposes. Tier 2 typically means RTO of hours-to-a-day, RPO of hours.

**Impact:** Useful for hosting sizing — we don't need Tier 1 (real-time) DR. Acquia's standard 99.95% SLA + automated failover is plenty. Pantheon's standard infrastructure also fits.

### 2.14 Monthly security reporting — **discrepancy with LOA / proposal; surface for discussion**

> *Q&A:* *"Does IIE require monthly/quarterly security reporting as part of the vendor's support obligations? — Yes, monthly security reporting will be required."*

**LOA position:** The LOA's support plan (Megawatt Plan, 10 hrs/month, §K) does not specify a monthly security report. Our proposal committed to *quarterly* reviews (proposal §Ongoing Maintenance).

**Q&A position:** Monthly security reporting required.

**Working assumption:** Per the LOA + proposal, our committed cadence is quarterly. Surface the Q&A's monthly expectation with IIE early: either monthly fits inside the existing 10-hour Megawatt plan, or it's an upscope. Build a lightweight monthly template either way (cheap insurance, even if quarterly is what we formally commit to).

---

## 3. Q&A — confirmed scope boundaries

These are things the Q&A pinned down that the RFP left vague. Each is a working boundary, not a delta from any prior assumption.

| Topic | Q&A says | Impact |
|---|---|---|
| **Single vs. multiple vendors** | Single | No partner-of-record split to negotiate. |
| **Content creation responsibility** | "Site content will be created and approved by IIE." | Hard boundary — we don't write copy. |
| **External sites in scope** | Only `educationusa.org`. Other URLs are link-out only. | Confirms LOA exclusions. |
| **Maintaining old `.gov` site** | "No. Aside from ensuring redirect and other possible migration, selected vendor will not help maintain the previous website." | Confirms our role on cutover. |
| **IIE governance** | "The IIE team will be the key decision maker. IIE will work with sponsor, REACs and other stakeholders to achieve concurrence on select decisions but IIE will ultimately be the decision maker." | Reinforces Albino as approval funnel. |
| **PII to be protected** | "FN, LN, Email" for HEIs explicitly. | Tightens our DPA scope statement — same fields, just officially confirmed. |
| **Audiences beyond HEIs / students / sponsors** | Secondary: broader higher ed field (HS counselors, deans, admins), parents, domestic + international government stakeholders. | IA/UX work should consider these — but not at parity with primary audiences. |

---

## 4. Q&A — items explicitly left open ("TBD")

These were asked-and-answered with deferral. They become explicit Discovery questions, not assumptions.

| Topic | Q&A response | Discovery action |
|---|---|---|
| Content Delivery Network (CDN) | "To be determined." | Pin down during hosting selection. |
| Personalization | "To be determined." | Confirm in Strategy phase. |
| Service Level Agreements (uptime / DR specifics) | "To be determined." | Negotiate during hosting selection + EC support plan. |
| RTO / RPO specific values | "Tier 2 Business-Critical" (a tier, not numbers) | Pin to hosting provider's tier-2 standard. |
| Hyper-care stabilization period | "To be determined." | Propose 30–60 days post-launch as a default; confirm in scoping. |
| Multi-region failover | "Depends on what hosting solution vendor provides and can be negotiated…" | Decide in hosting selection. |
| Content governance policies | "To be determined." | Output of Strategy phase. |
| Library Services use cases | "Open for discussion. Protect data submitted by HEIs." | Probe in discovery. |
| Officials/Administration page (static vs dynamic) | "IIE is open to vendor vision." | UX call. |

---

## 5. Q&A — items confirmed without changing prior assumptions

Worth recording but no doc updates required:

- Hybrid offshore/onshore delivery model — open. (Not our model anyway.)
- No additional accessibility standards beyond Section 508 / WCAG 2.1 AA.
- IIE uses Microsoft + Google Suite.
- Brand guidelines exist; new site builds on them.
- Maps: feasible custom build with clickable regions, multimedia.
- Social media accounts to integrate: Facebook, X, Instagram, LinkedIn, YouTube.
- IIE has done audience research from all stakeholder perspectives **except students** — they want vendor to help test with students.
- Contract is fixed-price (confirmed in LOA).
- 24×7×365 technical support is required, per RFP.
- Vendor is responsible for migration redirects.
- No specific federal compliance standards beyond what's already mentioned in the RFP.

---

## 6. How the source docs feed the working docs

| Working doc | Primary sources | Notes |
|---|---|---|
| `technical-analysis.md` | LOA (scope), RFP (page list, audiences, feature framing), Q&A (clarifications) | The synthesis backbone — most claims trace to one of these three. |
| `migration-analysis.md` | LOA (migration carve-out language), Q&A (manual-vs-scrape, IIE inventory framing), live site crawl | Heavy live-site empirical content layered on source-doc framing. |
| `discovery-worksheet.md` | LOA (default scope posture), Q&A (gap-fills), live site (factual basis for questions) | Questions default to LOA scope; Q&A clarifications inform what we already know vs. what we ask. |
| `site-discovery.md` | RFP (audience model), Q&A (account-state clarifications), live site crawl | Almost entirely empirical; source docs ground the interpretation. |
| `sitemap-inventory.md` | Live site crawl | Empirical; references LOA scope language to frame migrate/drop decisions. |
| `source-documents.md` | All three solicitation docs (+ EC proposal as internal appendix) | This doc. |

When tracing a working-doc claim back to its source: check the working doc's section text for an inline citation; if absent, default to this precedence: LOA > Q&A > RFP > empirical/live-site. EC's own proposal (Appendix A) governs internal delivery posture where the LOA didn't restate (e.g., support cadence).

---

## 7. Discovery questions surfaced by the Q&A

All client-facing questions surfaced by the Q&A synthesis have been folded into `discovery-worksheet.md`:

- AI feature phasing priority — question removed; AI features now framed as toggleable per the LOA. Cost estimation question also deferred.
- Hyper-care duration → worksheet §A6
- Personalization layer — Q&A answer was TBD; question dropped from worksheet (no source-grounded requirement)

(The Q&A's "internal translation program" reference was retired in favor of the LOA's specific Google-Translate language; see §2.4 above.)

---

## Appendix A — EC Proposal Response (EC-internal reference)

> 🔒 **Internal only.** This appendix tracks EC's own proposal commitments. It is not shared with IIE.

- **File:** `docs/background/101325-01 IIE EducationUSA.pdf`
- **Date:** Oct 13, 2025
- **Issued by:** Electric Citizen
- **Role:** EC's proposal response to the RFP. Binds EC on commitments the LOA accepted by reference (e.g., support-plan cadence in §Ongoing Maintenance, methodology, hyper-care framing). Not authoritative on scope (LOA superseded it), but authoritative on EC's committed delivery posture where the LOA didn't restate.
- **Used by:** support-plan cadence claims (quarterly reviews per proposal §Ongoing Maintenance), Megawatt support framing, EC's stated migration / QA / onboarding approach.

---

## Revision Log

| Date | Notes |
|------|-------|
| 2026-05-14 | First-pass synthesis of the Q&A amendment. Highlights deltas vs prior working assumptions. |
| 2026-05-15 | Removed former §2.4 (out-of-scope item); media management uses Drupal Media Library natively. Renumbered §2.5–§2.15 → §2.4–§2.14. Updated risk cross-refs (R4→R3, R5→R4, R9→R8) to match technical-risks renumbering. |
| 2026-05-19 | **Reframed from `qa-findings.md` to `source-documents.md`.** Broadened scope from Q&A-only delta doc to all-source index. Added §1 (the three IIE-originated source documents with file paths, dates, roles, precedence-in-context), §6 (how source docs feed working docs). Preserved §2 (Q&A clarifications), §3 (confirmed scope boundaries — formerly §1), §4 (TBDs — formerly §3), §5 (confirmed-no-change — formerly §4), §7 (discovery-question synthesis — formerly §6). Dropped former §5 (doc-by-doc update map) as historical — those updates have all been applied. |
| 2026-05-19 | Moved EC Proposal Response to Appendix A and flagged as EC-internal — the three solicitation docs are the IIE-originated source set; EC's proposal commitments are kept separately so the main body is shareable as a source-grounding reference if needed. |
