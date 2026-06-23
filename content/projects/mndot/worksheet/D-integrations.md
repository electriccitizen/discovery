---
id: D
title: "Integrations: Construction Data and Maps"
order: 4
---

### What we currently understand

- The RFP Q&A names two integrations (Q18): a construction data API, and adding node content to maps.
- Your maps today are standalone applications the site links to, not maps embedded in pages. This appears to be an Esri ArcGIS Online account that already hosts web maps (MnMap, the pedestrian asset inventory), alongside a few self-hosted GIS apps (EMMA, Right of Way). You also already plot projects on a map for State Aid local roads (via Google Maps). We are assuming any new construction mapping builds on this data, not a new platform.
- The API and its source data are MnDOT's to provide; our role is to recommend how the new site consumes and displays them.
- Construction projects as a content type are covered in section C2.

### Questions for you

**D1. Does the construction data API already exist, or will MnDOT build it? At a high level, what will it provide (e.g. project status, location, schedule) and how often does it refresh?**
- **Recommendation:** Pull the data into the Project content type on a schedule rather than calling the API on every page load, which is better for performance and resilience.
- *Why we ask:* We are trying to determine what data the API contains and recommend how Drupal consumes and displays it.

**D2. How should this data show up on the site: a list of project pages, a construction map, or both?**

- **Recommendation:** Feed it into the Project content type so one source powers project pages, a filterable list, and the map.
- *Why we ask:* It determines how we recommend connecting the API to content and display.

**D3. For the construction map, should it be built and owned in your ArcGIS Online environment (with the new site feeding it project data), or built natively in the new site?**

You already run maps both ways: hosted web maps in ArcGIS Online (MnMap, the pedestrian asset inventory) and a few self-hosted GIS apps (EMMA, Right of Way). Two workable patterns:

- **GIS-owned (ArcGIS Online):** the new site publishes project data as a feed; your GIS team builds and styles the map; the site embeds or links it. We believe this is the closest to how you work today.
- **Site-owned (Drupal):** the new site builds the map itself from Project content type, optionally using your ArcGIS basemap and layers.

- **Recommendation:** Initially, GIS-owned for the main construction map. This matches your current ArcGIS Online practice and keeps ownership with the GIS team. A lightweight location map on individual project pages can still live in the site.
- *Why we ask:* This is one of the bigger open questions on the project. Map ownership decides who builds what, where the data lives, and the integration approach we recommend.

**D4. At a high level, are the specific layers and basemaps a construction map would need already shared publicly (or easily made public) in your ArcGIS Online org, or are they internal, on an Enterprise portal, or licensed in a way that limits sharing?**

- *Why we ask:* It tells us which approach in D3 to recommend. We don't need the connection details (your team works those out at build), just a general sense of what's available to share.
