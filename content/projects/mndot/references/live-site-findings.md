An inventory of the current site assembled from the outside. Worksheet sections reference it instead of repeating the detail. It is not a substitute for a full crawl (see below).

## How this was gathered, and what it doesn't cover

We could not run a page-by-page crawl of `dot.state.mn.us`. This was built two ways: searching public search-engine indexes (useful for linked items such as subdomains, named tools, and integrations), and reading the site's `sitemap.xml` (useful for the shape of the content).

Limits on the data:

- The sitemap is partial and appears stale. It has no last-modified dates, every entry is marked "changes daily," and it leans heavily on 2021 news. The same pages appear more than once under `http`/`https` and `www`/non-`www`.
- It likely misses PDFs and other documents, the full set of construction-project pages, pages added in recent years, and anything not linked from the public side.
- A full crawl (for example, Screaming Frog), run by MnDOT or by us, would turn up more. We recommend one before the content inventory in Content Strategy.

---

## 1. The site is static HTML; the tools live elsewhere

Every URL in the sitemap is a `.html` file, consistent with the RFP: the public site is hand-built static pages from Dreamweaver. The applications (permits, bidding, maps, traveler info) are not on the main site. They run on separate addresses (below). Scope: we are rebuilding the static pages; the applications are separate systems the site links out to.

## 2. Subdomains and application servers

Separate sites and applications under the MnDOT umbrella. None are named in the RFP or Q&A, so all are out of scope. We document them as boundaries (link out, embed). Feeds section G.

| Address | What it is | Notes |
|---|---|---|
| `talk.dot.state.mn.us` | "Let's Talk Transportation" public engagement platform | Likely a third-party tool; embedded on many project and study pages |
| `transport.dot.state.mn.us` | Bid letting application | Runs on a different technology (Microsoft/.NET), not the static stack |
| `dotapp7.dot.state.mn.us` | Contractor civil-rights/labor and payroll (AASHTOWare) | One of a numbered range of app servers |
| `dotapp9.dot.state.mn.us` | App server | Range appears to run dotapp1–9 |
| `www.mndot.gov` | A second domain already in use | TDA pages link to it. Open question: is this the new domain target or a legacy redirect? Domain choice is MnDOT's; redirect mapping is J3 in section J. |

## 3. External and third-party systems

Separate systems the public uses, reached from the current site. All out of scope; document the boundary for each. Feeds section G, and the two named systems feed section D.

| System | Address | Disposition |
|---|---|---|
| Traveler info / cameras / road conditions | `511mn.org` | Link out (the most-cited tool in the public feedback data) |
| Oversize/overweight permits and routing (SUPERLOAD) | `mn.gotpermits.com` | Link out |
| Electronic bidding (Bid Express) | `bidx.com` | Link out |
| E-Plan Room (bid plans/proposals) | via `transport.` / bidx | Link out |
| State licensing portal | `mn.gov/elicense` | Link out |
| Site search | `mn.gov/dot/search/` | Runs on a Funnelback-style search platform. See section 6. |
| E-ZPass vendor | `ezpassmn.net` | Link out (there is also an on-site `/ezpassmn/` section; see section 7) |
| Driver and vehicle services (DVS) | `dps.mn.gov` | Different agency. Needs clear "this isn't us" routing; the public frequently confuses the two (seen throughout the feedback data) |
| State financial/vendor system (SWIFT) | — | No website touchpoint; feeds bidding only. Note only. |
| Email bulletins / notifications | GovDelivery (Granicus) | Link out / boundary. Powers MnDOT email bulletins; a share of "news" entries link to GovDelivery bulletins rather than hosted pages. |
| Forms / public intake | Formstack (`mndotforms.formstack.com`) | The report form and the other intake forms (ADA, ombudsman, and others) are Formstack-hosted, surfaced via static landing pages. Whether to migrate these to Drupal Webform or keep Formstack is a section F decision. |

## 4. Maps and GIS

MnDOT runs a mapping operation on Esri/ArcGIS technology, separate from the website: EMMA (the enterprise map viewer), MnMap, Right-of-Way Mapping and Monitoring, the Interactive Basemap, MnCORS (survey corrections), a Traffic Mapping Application, a Local Road Project map, and internal tools (RACER, RPMA, CHIMES, the Linear Referencing System).

This is relevant to section D: the RFP's "adding node content to maps" (Q18) sits on top of this existing stack. The map platform itself is out of scope; what is in scope is how new-site content connects to it. The source data behind any map or API is MnDOT's responsibility during development, not ours.

## 5. Document and data repositories (searchable)

Out of scope, but listed because pages link into them: eDOCS (maps, plats, permits, plans, survey records, Commissioner's Orders), the E-Plan Room, bid abstracts (public bid-tabulation data), the Data Practices request portal, and TDA datasets (GIS files, traffic counts). Feeds section G.

## 6. Two different search systems

- Main site search runs at `mn.gov/dot/search/`. The URL pattern points to a Funnelback-style platform, so search may already be a state-provided service rather than something on the MnDOT site.
- Construction project search is described elsewhere as a "Google-enhanced" search: a separate Google search box scoped to project pages.

There are at least two search experiences to reconcile in the rebuild. Feeds section E (keep Funnelback, move to Drupal's own search, or consolidate).

## 7. Non-standard pages

From the sitemap. These pages do not fit a clean content model and need individual decisions.

### Project microsites (each hand-built, own URL root)
`/35w94/`, `/i94-mg-clearwater/`, `/metro/projects/i35construction/`, `/metro/projects/i35wbloomington/`, `/knowyourroute/`. Large projects each got a custom mini-site. Migration decision per site: rebuild as structured project content, or retire. Feeds section C and section H.

### Program/campaign microsites at the root
`/junkyard/` (junkyard-control program, about 10 pages, fully built out), `/adopt/` (Adopt-a-Highway), `/highway-sponsorship/`, `/aggressivedriving/`, `/speed/`, `/broadband/`, `/stem/`, `/aboutrail/`, `/restareas/`, `/ezpassmn/`. Root-level vanity URLs; each needs a redirect plan. Feeds the redirects question, J3 in section J.

### Intake forms
The public comment form (`/information/submit.html`, the source of the 32k-submission dataset) is one of several forms. All are hosted on Formstack (`mndotforms.formstack.com`) and surfaced through static landing pages, confirmed on the comment form and the ADA complaint form:

- `/ombudsman/`: its own case, report, and contact forms
- `/ada/complaintform.html` and `/ada/accommodation.html`
- `/cvo/complaint.html`: commercial-vehicle complaint
- `/tortclaims/`: legal claims against MnDOT
- `/bike/routes-map-request-form.html`
- `/row/propsales*`: excess-property sales, split across "by request," "over the counter," and "structures"

Relevant to section F: the scope is the full catalog of forms, not only the report form. Which move to Drupal forms, which stay as-is, which retire.

### Parallel and duplicated structures
- Nine district subsites (`/d1`–`/d8` plus `/metro`), each with its own about, news, contacts, and projects pages, maintained separately. Reflects an organization by office rather than by user. Feeds section B and section C.
- News: a current central system plus a legacy district archive. The active news engine is the central `/news/YYYY/MM/...` feed, which tags every release by district in the slug (`d1`–`d8`, `metro`, `statewide`). The per-district `/dX/newsrels/...` folders are older (around 2020) and appear to be a legacy archive. Some "news" entries link out to GovDelivery email bulletins rather than hosted pages, so news today is a mix of hosted releases and outbound bulletin links. Modeling decision in section C; whether districts still self-publish affects editorial access in section B.
- Same pages duplicated across `http`/`https` and `www`/non-`www`. Feeds J3 in section J.

### Internal content on the public site
`/employee-resources.html`, `/policy/hr/hr009.html`, `/information/topstaff.html`. Some of this may not belong on a public site, or may need to sit behind a login. Relevant to the content audit, and to section A if any of it needs gating.

### Niche reference clusters
`/const/tools/*` (contracting-method pages, contractor-facing), `/roadway/data/*` (generated data tables and project logs), `/congressional/*` (a legislator-facing reporting mini-site). Audience-specific; relevant to information-architecture decisions in Design.

## 8. What's named in the RFP/Q&A vs. everything else

For quick reference when deciding scope:

- Named, in scope: construction-data API to consume (Q18) and adding node content to maps (Q18), feeding section D. SEO is in scope (Q11), which pulls in search, feeding section E. The public comment form is part of the site being rebuilt, feeding section F.
- Everything else above: unnamed, out of scope, documented as a boundary only.

## 9. Still to confirm (not crawlable from outside)

- A full, fresh crawl to catch PDFs, the complete construction-project set, and recent pages the sitemap misses.
- How the ~150 editors sign in today and what sign-on system MnDOT/MNIT provides; nothing about staff login is visible from the public side. An ADA page links to a `mn365.sharepoint.com` site, which indicates MnDOT is on Microsoft 365, so SSO is most likely Microsoft Entra ID (Azure AD). To confirm in section A.
- Whether `mndot.gov` is the new domain or a legacy redirect. This is MnDOT's call (domain/DNS out of scope); redirect mapping is J3 in section J.

## 10. Analytics and tracking (from the homepage HTML)

Read from the server-rendered homepage source, not a JavaScript-executed crawl, so any tags injected at runtime would not show here.

- GA4 is the active tracker, added directly in the page via `gtag`. There is no Google Tag Manager container (no `GTM-…`), so tags are hardcoded rather than managed through GTM.
- Siteimprove is present, common on government sites for accessibility and analytics monitoring.
- A legacy Universal Analytics tag (`UA-…`) is still in the page but no longer collecting; Google retired UA in July 2023. It can be removed in the rebuild.

Feeds section I.
