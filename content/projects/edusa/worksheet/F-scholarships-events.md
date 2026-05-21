---
id: F
title: "Scholarships and Events"
order: 6
---

### What we currently understand

- Scholarships and events are existing structured content types with consistent URL patterns we can parse and migrate from public HTML.
- Per Q&A, the editorial workflow is linear: Adviser submits → REAC reviews → IIE approves and publishes.
- Per RFP, scholarships should auto-expire and be removed from public view after a configured date.
- *Note: Advising-center field-level questions are handled separately during discovery conversations (richer detail than the worksheet format supports) and via §C2 (Adviser→Center OKTA attribute availability). This section covers Scholarships and Events only.*

### Questions for you

**F1. Scholarship filter vocabularies — confirm existing and fill gaps.** The current site already has these filters in use, which we'd carry forward:
- **Degree Level** — 5-term taxonomy: Associate's / Bachelor's / Master's / Doctorate / Post-Doctorate. Confirm or flag changes.
- **Country** and **U.S. State / Territory** — already used as finder filters; carry over (Country handling per E2).

The RFP specifies two additional filters that **don't currently exist** on the live finder and need IIE input:
- **(a) Discipline / subject** — what controlled vocabulary? (A standard list like NCES CIP codes, IIE's own list, or open-text per scholarship?)
- **(b) Award amount** — filter by ranges (e.g., "<$5k / $5k–25k / $25k+")?

**Note on data backfill:** Whatever IIE decides for (a) and (b), those are new fields on the Scholarship content type. We'll include them on the HEI submission form for future scholarships — but **existing scholarships migrated from the current site will need IIE to back-fill discipline and award-amount values manually** (the data isn't visible in the crawl). Same pattern as the manual-recreation framing in §B for new fields on existing content types.

- **Recommendation:** Go with the filters you think are valuable, and decide whether you want to back-fill old/existing nodes with this data or just apply it to new ones moving forward.

**F2. Scholarship auto-expire — when and how?** The RFP commits scholarships to auto-expiry. Two related items:
- **(a) Default expiration window** — how long after submission/publish should a scholarship auto-expire by default? (6 months, 1 year, 2 years, or fully driven by the submitter's stated application deadline?)
- **(b) Behavior at expiration** — hard delete, soft-archive with no public display, admin alert with manual decision, or auto-hide but keep for record-keeping?

**F3. Adviser event sub-categorization — what event types within "adviser events" do you want to differentiate?** The RFP says adviser events "can be differentiated by event type" but doesn't specify what those types are, and the current site doesn't appear to have an Event Type field. Examples we'd expect to see: information session, pre-departure orientation, application workshop, webinar — or something else.
- *Why we ask:* Determines whether the Event content type gets an "Event Type" taxonomy/list field for editorial categorization and finder filtering.
- *Note on data backfill:* This is a new field that doesn't exist on the current site, so **existing events migrated from the current site will need IIE to back-fill event-type values manually**, and the field gets added to the adviser submission form for future events. Same pattern as the F1 backfill note.
- **Recommendation:** Go with the event types you think are valuable, and decide whether you want to back-fill old/existing events with this data or just apply it to new ones moving forward.

**F4. Event migration — how far back?** The sitemap surfaces \~5,624 Event records, most historical. We need a date cutoff for migration. Options:
- **Upcoming only at launch** — cleanest, smallest dataset, loses historical record.
- **Past N months/years** (e.g., last 12 months, last 3 years) — preserves recent activity, manageable volume.
- **Full archive** — preserves complete history but adds bulk and clutters search/finder without strong filtering.
- **Recommendation:** We suggest only migrating a small amount of past events, if any, unless there is a compelling reason to keep them.
- *Why we ask:* This is the single biggest variable in event migration volume. Affects new-site URL count, search indexing, and pre-launch editorial review effort.

**F5. Does IIE agree with the overall approach to Scholarships and Events?** To summarize: existing Scholarship and Event content types migrate cleanly from the current site; new submissions follow the existing patterns (HEIs submit scholarships via the accreditation-gated form → REAC review → IIE publish; Advisers submit events via the OKTA-verified form → REAC review → IIE publish). Auto-expiry on scholarships per F2. Event registration stays off-site (per M2). New filter fields and event-type categorization per F1 and F3 — IIE back-fills those on migrated records.
- *Why we ask:* Same as B4 / E6 — confirms alignment on the section's overall shape before we lock in editorial workflows and the data model.
- *Expected format:* "yes, proceed as described" / "yes, with these changes: …" / "let's discuss."
