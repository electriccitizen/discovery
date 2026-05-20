---
id: J
title: "Domain, Launch, and Cutover"
order: 10
---

### What we currently understand

- The new domain is `educationusa.org`; the current domain is `educationusa.state.gov`. Launch target is **April 30, 2027** per the signed LOA.
- The cutover is more than DNS. The work includes: a 301 redirect map (pre-built from the migration crawl), State Department coordination for the `.state.gov`-side redirect (outside our control), an SEO transition plan (Search Console property changes, sitemap resubmissions), and communications messaging that the address has changed.
- Possible cookie/session domain implications if any shared services span the transition.

### Questions for you

**J1. Should the new site and the old site run in parallel for a period before the legacy site is taken down, or is it a hard switch?**

- **Recommendation:** It is probably not necessary to run them in parallel unless you want a "testing" period on the new site before traffic is redirected.

**J2. Permanent 301 redirects for legacy `.state.gov` URLs + the State Dept POC who can implement them.** Our recommendation is straightforward: permanent 301 redirects from every `.state.gov` URL to its `.org` equivalent (per the J3 redirect map). This is the standard pattern that preserves search-engine traffic, social-media links, partner-site references, and accumulated bookmarks. The alternative options (time-bounded redirect then teardown, immediate teardown, parallel-running for some period) all sacrifice some portion of that accumulated equity.

EC can prepare and deliver the redirect map; only State Dept IT can deploy it on the legacy domain. The earlier we have the contact name, the more time we have to coordinate.

- **(a)** Confirm permanent 301 redirects are the intended pattern.
- **(b)** Provide the State Department contact (name, role, how to reach them), or escalate via ECA to find one.

**J3. Redirect map review.** EC will produce a 301 redirect map from the current `.state.gov` sitemap to the new `.org` URLs as part of the migration work. The mapping is mechanical for most pages (URL pattern → new URL), but **IIE review and adjustments are needed** for important content — pages that should redirect to a curated equivalent rather than a literal URL match (e.g., a deprecated section that should redirect to its replacement, or high-traffic pages that have been restructured). Confirm IIE will provide editorial input on the redirect map before launch.
- *Why we ask:* The mechanical mapping handles most URLs; the high-value pages need IIE judgment on the best landing destination. Without that review, important content may redirect to a generic page instead of its intended successor.

**J4. SSL certificate — Pantheon-managed Let's Encrypt, or do you need a custom certificate?** Pantheon's standard offering is automatic Let's Encrypt with auto-renewal — free, secure, covers `educationusa.org` plus any subdomains we configure. If IIE has a corporate cert policy that requires EV, a wildcard from a specific CA, or a non-Let's-Encrypt issuer, we'd coordinate that procurement and upload separately.
- *Why we ask:* Most projects are fine with Let's Encrypt. If IIE has a policy requiring otherwise, we need to know now so the cert is procured before launch.
- *Expected format:* "Let's Encrypt is fine" / "we need a custom cert from [CA]" / "let's check with IIE IT."

**J5. Who controls DNS for `educationusa.org`?** This is one of the load-bearing launch contacts. The DNS controller is responsible for:
- **Repointing the domain to Pantheon at launch** — the critical cutover act. A/CNAME records change at the moment we flip the switch; if this doesn't happen on schedule, the new site doesn't go live.
- **Maintaining SPF / DKIM / DMARC** records for outbound email deliverability (per J6 / J7).
- **Updating records** when CDN, certificate, or other infrastructure changes occur.

- *Expected format:* named contact + role + how to reach them.

**J6. Outbound email from the site — what SMTP service will we use?** Pantheon does not provide outbound SMTP, so all email leaving the site (form confirmations, workflow notifications, password resets, newsletter dispatch) has to route through either a third-party service or an existing IIE relay. Common options: **SendGrid**, **Mailgun**, **AWS SES**, **Postmark**, or an internal IIE SMTP relay if available.
- *Why we ask:* Critical for email deliverability and brand consistency. If IIE has a vetted internal relay, we use it (cheaper, simpler). If not, SendGrid is the typical default. The choice affects DNS records (DKIM/SPF/DMARC — see J5) and the sender-domain decision (J7).
- *Expected format:* "use [vendor name]" / "we have an internal IIE relay at [hostname]" / "let's pick during Strategy."

**J7. Sender domain for outbound email from the site.** Form confirmations, workflow notifications, event confirmations — what sender domain do you want them to come from? (e.g., `noreply@educationusa.org` vs. `events@educationusa.org` vs. multiple per-purpose addresses.)
- *Why we ask:* Deliverability and brand consistency. The DNS / DKIM / SPF / DMARC setup (J5) depends on this.
