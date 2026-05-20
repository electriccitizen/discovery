---
id: E
title: "Interactive Map(s)"
order: 5
---

### What we currently understand

- The LOA names "Interactive map" as a deliverable integrating advising centers, success stories, U.S. regional geography, and HEIs. The RFP expands the wishlist to include country/territory demographics, country education-system info, and outbound links to local adviser-created websites.
- The RFP refers separately to *"an interactive world map"* and *"an interactive United States map"* — whether that resolves to one integrated experience or two distinct views needs to be settled in discovery (E1).
- The Q&A defers implementation to vendor judgment; no reference examples were provided. Library choice, basemap, and tile-cost model stay with EC and resolve during Strategy + Design.
- **The largest open item is data provenance — where each layer comes from, who maintains it, how it stays current (E3).**
- **Tagging and geocoding for map display is IIE's editorial work where the data doesn't already exist.** We auto-geocode addresses we have (advising centers, HEIs). New layers — country tags on success stories, per-country demographics, education-system writeups, outbound adviser-site URLs — must be authored or assembled by IIE (see E4). Same "manual recreation" framing as §B applied to map data.

### Questions for you

**E1. We plan to deliver one integrated map per the LOA. Does that match what you envisioned?** The RFP separately mentioned a "world map" and a "U.S. map" (and described distinct map needs for HEI vs Student audiences) — the LOA collapsed that into "an interactive map." If you actually want separate maps, flag now; otherwise we proceed with one integrated experience.

- **Recommendation:** We recommend a single map for a unified experience and less technical weight.

**E2. The current site has two parallel country lists — should the new build consolidate?** Centers and Scholarships use a Drupal Country taxonomy (177 terms); Events use the address module's ISO 2-letter list (250 codes). They don't fully overlap (ISO is more complete on territories and edge cases). Our default plan is to consolidate on a single canonical source (most likely the ISO list) and re-map existing taxonomy references during migration — that keeps the country reference clean and is what the interactive map will plot against.

- **Recommendation:** We recommend a single list of countries that is maintained for all areas of the site, unless there is a specific reason you need different lists.

- **(a)** Any reason NOT to consolidate? (e.g., the current taxonomy carries IIE-specific metadata we can't see from outside, or an editorial workflow that depends on it specifically)
- **(b)** Does IIE have a single official source for the canonical country/territory list, with names spelled the way IIE wants them surfaced? If so, please share.
- **(c)** Are there territories the ISO list omits or names differently that you need on the new site? (e.g., Taiwan, Kosovo, Palestine, Western Sahara handling.)

- *Why we ask:* The map needs one stable country source. Political-geography choices need to come from IIE.

**E3. The RFP names several IIE-owned and external resources HEIs should access from the new site — what's the format, refresh cadence, and intended role for each?** Specifically: Open Doors Report, Project Atlas, EducationUSA Global Guide, Trade Admin Market Diversification Tool (TAMDT), and Regional Fact Sheets. The RFP notes that *"some of this data can be pulled to inform our maps, other website pages, etc."* — so for each, part of the answer is what role it plays on the new site: a link-out, an embedded summary, a hosted file, or data pulled into the site (which connects to E4(e)).
- *Why we ask:* Per Q&A you don't anticipate API-based feeds beyond OKTA, so anything we host or pull from would be periodic file uploads or manual updates. We need format + cadence + role to plan the admin tooling. Link-outs need no tooling.

**E4. The map's data layers — which do you want, and what's the source for each?** The source docs describe possible layers the map could surface — we're not committed to all of them. For each, please confirm: (a) is this layer wanted on the new site's map? and (b) if yes, where does the source data come from?

- **Recommendation:** We suggest starting with a simple list of data layers from readily available sources. Fewer, better data layers beat adding everything possible.

- **(a) Advising-center locations** — we have ~436 records from the current site with street addresses; we'd geocode at migration.
- **(b) HEI locations** — described as a map layer in the RFP and LOA. HEIs submit institutional info via the form (D1), accreditation-checked and REAC-reviewed; we geocode at submission. The map would show whichever HEIs have submitted — not a pre-existing directory of all accredited institutions. Two related items:
  - (i) Confirm the submission-driven model is what you have in mind.
  - (ii) How does IIE plan to gather HEI submissions pre-launch so the map has data on day one? (Email outreach to known contacts, announcement at events like the DC Forum, direct asks to specific institutions, or accept empty-at-launch / grow-organically.)
- **(c) Success-story geotags** — for stories to appear on the map, each needs a country tag (and optionally a region or city). Would require adding a country/region field to the Success Story content type.
- **(d) U.S. regional geography** — what regions, if any? (EducationUSA-defined zones, Census Bureau regions, State Department regions, or something else.)
- **(e) Country demographics** — which specific data points if any? (Population, outbound student counts, GDP, education-attainment, internet access, etc.) Source: Open Doors / Project Atlas (E3), or another source.
- **(f) Country education-system info** — would be existing IIE content (where?) or net-new authoring per country.
- **(g) Outbound links to local adviser-created sites** — who would maintain the URL list (REAC network, central IIE, or advisers via their normal form)?

- *Expected format:* per-layer: "yes, source = X" / "no, drop this layer" / "let's discuss in Strategy."

**E5. Anything else about the map we should be considering?** Specific data sources we haven't named, presentation patterns from other reference sites, accessibility concerns, political-geography sensitivities, or any other constraints we should plan for.
