---
id: C
title: "Content Model and Structured Content"
order: 3
---

### What we currently understand

- Content today is mostly hand-built static pages organized by office, with little that's structured or reusable.
- Our standard base build ships with a core set of content types:

| Machine name | Label |
|---|---|
| `alert` | Alert |
| `bios` | Bios |
| `event` | Event |
| `landing_page` | Landing Page |
| `news` | News |
| `page` | Basic page |

- Your current site points to several other possible content types. Most notably construction projects (built today as one-off microsites), plus office locations and rest areas.
- This section is intended to get an initial read on which content types the site needs. 
- The final list with detailed fields and taxonomy for each come later during content discovery and the build documentation process.

### Questions for you

**C1. Starting from the base list above, which types fit MnDOT as-is, and what additional types are you considering?**
- **Recommendation:** Start from the base set and add types only where content recurs with a consistent structure. Office locations, districts, rest areas, and construction projects look like potential candidates from your current site, and an FAQ type would support self-service (see section E). (Construction projects we've pulled out separately in C2.)
- *Why we ask:* The content-type list is the backbone of both the build plan and the migration plan. We need to determine which content deserves its own type, and which may be better served as a taxonomy or simple pages.

**C2. Construction projects are built today as standalone microsites (e.g. `/35w94/`, `/i94-mg-clearwater/`). We assume that these become a structured Project content type as a key feature of the new site?**
- **Recommendation:** Yes. A Project type replaces hand-built microsites with a consistent structure, and it's what would feed the maps integration in section D.
- *Why we ask:* It's central to the overall content plan, the construction API, and to the maps work.

**C3. News already tags every release by district (in the central `/news/` feed), with older per-district archives alongside. Should news be one content type with a district field, and do districts still publish their own releases, or is it centralized now?**
- **Recommendation:** One News type with a district field. It formalizes the district tagging you already do, and powers per-district filtering and landing pages.
- *Why we ask:* It determines how news is created and filtered, and whether editors need district-scoped publishing rights (ties to section B).

**C4. Reference data like District, Highway, and City appears inconsistently across the current site. We assume these should be managed as standardized taxonomy lists? Are there any other known metadata/taxonomies that you can identify?**
- **Recommendation:** Managed taxonomies for District, Highway, and City so projects, news, and other content types can be filtered and mapped consistently. (Your feedback data showed these values are messy today.) The detailed taxonomy design will happen during the build process but we are hoping to identify the known one here.
- *Why we ask:* The taxonomy system will be key to filtering, content routing, and the maps integration.
