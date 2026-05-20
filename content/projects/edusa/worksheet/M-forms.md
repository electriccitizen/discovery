---
id: M
title: "Forms"
order: 13
---

### What we currently understand

- The current site uses a mix of form tools: native Drupal forms (limited), four external Google Forms (Campus Hosting submissions), and per-event bit.ly redirects (event registration). Submissions for the external tools live outside Drupal — outside its editorial workflow, audit trail, and integration surface.
- The new build defaults to native Drupal (Form API or the Webform contrib module) for submission flows tied to OKTA identity (Adviser submissions) and HEI submissions (institutional info, scholarships, newsletter signup).

### Questions for you

**M1. Campus Hosting submission workflow — currently four external Google Forms power four distinct application paths** (2 Virtual Visit + 2 In-Person Visit) on `/us-higher-education-professionals/fairs-and-events/educationusa-campus-hosting-opportunities`. For the new build:
- (a) **Move into Drupal as native submission forms** (better integration, deeper editorial tooling, harder to evolve quickly), or
- (b) **Keep on Google Forms** (operationally lightweight, IIE already comfortable, but data lives outside the system of record)?
- *Why we ask:* Option (a) keeps submissions inside Drupal. Our standard approach is to enable the Webform module and train your team to build and manage their own forms, rather than building each one for you — clients tend to find it more flexible long-term. Option (b) keeps the forms on Google Forms; the new site just links out to them, and we'd add a small editor tool so IIE staff can update each form's link, season, and deadline without our help.

**M2. Event registration is uniformly routed off-site** via per-event bit.ly links on every event record we sampled. Confirm this stays the pattern for the new build — i.e., Event content type has a "Registration URL" field, and we are **not** building event registration into Drupal.

**M3. Any other third-party form tools on the current site we haven't surfaced?** Our crawl identified the four Campus Hosting Google Forms and the bit.ly event-registration pattern. Beyond those, are there any other embedded Webforms, Formstack/Wufoo widgets, or third-party form tools we should know about?
- *Why we ask:* Form submissions live in external tools, not in the Drupal site. We need a full inventory before we can decide migration treatment for each.
