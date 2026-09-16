# Canada and Americas map-only views

## Current scope

- Canada: all 13 provinces/territories (10 provinces, 3 territories).
- Central America: Belize, Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama.
- South America: the 12 sovereign countries in the canonical config, plus French Guiana as a visible, selectable overseas department/region of France.
- Views reuse the existing SVG renderer, Explorer selection, search, fit, zoom and pointer pan. They expose no Reveal/Puzzle links or quiz controls. Direct Reveal/Puzzle query requests display the map view instead.
- Africa's geometry, assignments and interaction policies are unchanged; its three activity modes remain available.

## Source and license

Natural Earth, pinned repository tag v5.1.2:

- Canada: [Admin 1 states/provinces, 1:50 million](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/). Local source: source-data/ne_50m_admin_1_states_provinces.geojson. [Pinned download](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson).
- Central/South America: Admin 0 countries, 1:10 million, reusing the already-pinned source-data/ne_10m_admin_0_countries.geojson. [Pinned download](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson).
- Natural Earth data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/), suitable for redistribution. Attribution is not required; the existing site credit is retained voluntarily. No external runtime services or dependencies are used.
- Each generated JSON stores the source path, tag and SHA-256. These checksums are verified by automated tests. The new Canada source was downloaded on 2026-09-16.

## Reproducible generation and geography

Run npm run data:americas to generate only data/canada.json, data/central-america.json and data/south-america.json. This command never runs the Africa builder or writes Africa files. The existing manifest metadata in lib/map-configs.mjs remains canonical; generated metadata is derived from it.

Canadian source polygons are matched by iso_3166_2; country polygons by ADM0_A3. Every polygon of each included primary unit is retained, including Arctic islands, the Galápagos and offshore islands. Units with multiple polygons remain one selectable unit. Projection is spherical Lambert azimuthal equal-area, centered at (-95,60), (-85,14), and (-60,-20) respectively, uniformly fitted into the same 800 × 730 SVG coordinate space as Africa. No shapes are enlarged or moved to insets; small units such as Prince Edward Island remain reachable through the list and manual zoom.

The pinned country source groups French Guiana within France. The generator extracts whole France polygons whose vertices all fall within longitude -55 to -50 and latitude 1 to 7. It does not clip or merge boundaries, and it excludes metropolitan France and other overseas areas. French Guiana has its own GUF identifier, unitType overseas-department-region, parentSovereignState FRA / France, visible:true, learnable:true, playable:false and scored:false. South America therefore has 12 sovereign countries plus one territorial learning unit, not 13 sovereign countries.

These are explicit coverage maps. Other dependencies and neighboring countries (including the Falkland Islands, Caribbean islands outside the seven Central American countries, Greenland, the USA and Mexico) are outside this pass. Natural Earth's published boundaries are used without making a claim to resolve competing territorial claims.

## Metadata and classification

All new primary units retain name, unitType, capital (currently null/unresearched), parentSovereignState, sovereignty and playable/scored fields. Primary units are eligible for future activities (playable:true), but scored:false because these maps do not yet expose a scored activity. Capital-learning settings remain disabled.

Canada uses blue/solid for provinces and gold/dashed for territories, with a compact legend immediately above the geography, plus explicit classification in list rows and selection readouts. Outlines remain non-scaling under zoom. Geographic units retain their explicit province/territory metadata; classification is never inferred from color.
