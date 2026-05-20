---
id: G
title: "AI Features"
order: 7
---

### What we currently understand

- Per LOA §G and your Q&A, AI features to explore for launch include: a chat/greeter assistant, AI-enhanced search, translation assistance, and editorial tagging.
- Your Q&A characterized AI as something you want "instrumental" to the site — not just present.
- LLM and Vector DB token costs are IIE's responsibility (per LOA p. 30).

### Questions for you

**G1. Do you have a preferred LLM provider for the AI features?** Options include OpenAI, Anthropic (Claude), Google (Gemini), Microsoft (Azure OpenAI), or "vendor's choice / no preference."
- **Recommendation:** We recommend OpenAI (gpt-4o-mini) as the best option for AI integrations for budget and technical reasons, but we are open to other LLMs if necessary.
- *Why we ask:* Each has different pricing, capabilities, and SLAs. Affects build cost since you're funding token usage.

**G2. The LLM and Vector DB contracts will be held by IIE directly — can you please confirm?** The LOA assigns these costs to IIE (p. 30), so the default is that IIE provisions both accounts (OpenAI or chosen vendor + the Vector DB) and pays usage directly. EC integrates against your API keys.
- *Expected format:* "confirmed" / "let's discuss alternatives."

**G3. What's your vision for the Greeter / chat assistant?** Sitewide for any content? Limited to certain sections (5 Steps, FAQ)? Narrowly task-focused (e.g., "find me a scholarship")? Any voice/tone preferences?

**G4. What's your vision for AI-enhanced search?** Natural-language query understanding + semantic results? AI-summarized result groupings? Strict retrieval grounded in indexed site content, or also synthesize answers from external knowledge?

**G5. What's your vision for AI-assisted editorial tagging?** Examples we'd expect: auto-suggest meta tags / descriptions, taxonomy terms (Region / Country / Audience), alt text for images, transcripts for videos, internal-link suggestions. Which of these are in scope?

**G6. Translation Support — what's the actual use case?** The LOA names *"AI-assisted translation integration (e.g. Google Cloud Translate) within editorial workflows,"* but the Drupal multilingual content stack is deferred to a future change order — so there's no native place to store translated content at launch. The feature only makes sense if IIE has a specific use case in mind. Possibilities:
- **(a) One-off page translations** — staff occasionally produce, e.g., a Spanish version of a high-value English page; saved as separate Drupal nodes manually linked to the source.
- **(b) Editorial-aid only** — helps translators draft text faster; translations live outside Drupal (PDFs, social posts, etc.).
- **(c) Inbound pre-translate** — auto-translate non-English adviser/HEI submissions for REAC review.
- **(d) Defer entirely** — fold into the multilingual change order, where it makes more sense paired with proper content storage.

- *Expected format:* (a) / (b) / (c) / (d), or "let's discuss in Strategy."

**G7. Does IIE agree with the overall AI feature approach?** To summarize: we'll build with OpenAI as the LLM provider (G1); IIE holds the contract and pays token costs (G2). The four AI features — Greeter (G3), AI-enhanced search (G4), Editorial tagging (G5), Translation Support (G6) — are all toggleable per the LOA, so IIE can enable or disable each individually.
- *Why we ask:* AI features are one of the loosest-defined areas in the source docs. Confirming alignment now reduces scope-creep risk during build.
- *Expected format:* "yes, proceed as described" / "yes, with these changes: …" / "let's discuss."
