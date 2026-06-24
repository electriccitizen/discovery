---
id: F
title: "Forms and Public Intake"
order: 6
---

### What we currently understand

- The public "Report a Concern / Ask a Question" form (`/information/submit.html`) is the core public feedback mechanism. You get roughly 5,000+ submissions a year. It's the primary source of your feedback dataset, and it does double duty as both a reporting channel and a de facto help desk.
- The current site also has a catalog of separate intake forms: ombudsman (case, report, contact), ADA complaint and accommodation, commercial-vehicle complaint, tort claims, bike map requests, and excess-property sales. These are currently hosted on **Formstack** (a third-party form service), surfaced through static landing pages on the site.
- This section covers the forms and how submissions are handled. Editorial roles and workflow are in section B.

### Questions for you

**F1. We recommend rebuilding intake forms natively in Drupal (Webform module). Does that fit, and are there any forms you'd prefer to keep on an external tool?**
- **Recommendation:** Keep external forms only when another system owns the process. NOTE: Rebuilding the forms in Drupal means their submission data starts at 0. You'll want to ensure you archive submission data from the existing forms somewhere.
- *Why we ask:* We need to determine your baseline approach for forms.

**F2. For the report form, where do submissions go today and how are they tracked? (e.g. email, a queue, a case or CRM system?) And how should that work on the new site?**
- **Recommendation:** We will hold our initial recommendation until we can learn more about the current process. There may be strong integration possibilities, or opportunities to improve how this data is handled.
- *Why we ask:* At 5,000+ submissions a year, routing and tracking submissions seems to be a key component of the overall build.

**F3. The current feedback form appears prominently on every page. Is this still desired in the new build?**
- **Recommendation:** Keep a consistent, site-wide way to reach it, for example a header or footer "Report a Concern" call-to-action linking to a single form, rather than embedding the full form on every page, so it stays easy to find without crowding page content.
- *Why we ask:* It affects the global page template and how the report form is surfaced sitewide.

**F4. Are there any other forms (ombudsman, ADA, commercial-vehicle, tort claims, bike map requests, property sales) that might benefit from any type of integration with other systems?**
- **Recommendation:** Most forms can likely use standard routing/notifications, but there may be other opportunities for integration.
- *Why we ask:* We'll want to take any potential integrations into account during the build planning and our final recommendations.
