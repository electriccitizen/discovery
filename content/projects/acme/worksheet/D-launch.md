---
id: D
title: "Launch & Cutover"
order: 4
---

### What we currently understand

- Target launch: Q4 2026, ideally before the November sales push.
- The `acme.example` domain is registered through GoDaddy; DNS is managed at Cloudflare.
- Acme would like a soft-launch period (~1 week) before flipping DNS.

### Questions for you

**D1. Who manages the DNS cutover, and what's the rollback plan if something breaks at flip time?**
- **Recommendation:** EC walks Acme's DNS owner through the cutover live; we keep the old site warm for 48 hours and pre-coordinate a rollback record set.
- *Why we ask:* DNS flips are the highest-risk moment in a launch. A clear runbook and a tested rollback are the difference between a hiccup and an outage.

**D2. Is there a content freeze planned, and how will in-flight content from the old site be reconciled on launch day?**
- *Why we ask:* Without a freeze, content authored on the old site after the migration cutoff is lost on flip day. Even a 48-hour freeze materially reduces reconciliation work.
