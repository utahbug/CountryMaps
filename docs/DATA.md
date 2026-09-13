# Geographic data and redistribution

## Source

Natural Earth, Admin 0 – Countries, 1:10 million scale, without boundary lakes.

- Dataset description: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
- Pinned repository release: nvkelso/natural-earth-vector, tag v5.1.2.
- Original GeoJSON: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson
- Local copy: source-data/ne_10m_admin_0_countries.geojson.
- Downloaded: 2026-09-12.
- SHA-256: 239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255.

The repository tag pins the source snapshot; it does not claim every individual Natural Earth layer has the same version number. The product page identifies the countries layer as version 5.1.1.

## License and attribution

Natural Earth's vector and raster map data are public domain. The published terms permit modification and redistribution, including educational and commercial electronic distribution. No permission or author attribution is required.

Terms: https://www.naturalearthdata.com/about/terms-of-use/

CountryMaps voluntarily displays “Made with Natural Earth” and links to those terms. These data can be redistributed in a public educational GitHub Pages repository. Natural Earth does not warrant the data's accuracy or completeness. The final application has no third-party code dependencies.

## Explicit inclusion policy

The manifest lists 54 African UN member states by name and stable ISO-style ID. It is an allowlist, not an automatic filter of source polygons or the source's CONTINENT field.

- Seychelles and Mauritius are explicitly included regardless of their source continent classification.
- Source SDS maps to the public ID SSD for South Sudan.
- Source SOM and SOL are combined as Somalia. Their shared internal boundary is dissolved. Somaliland is not a separate piece.
- Western Sahara is a dashed, neutral context polygon labeled disputed and excluded from the 54-country score. This is an educational inclusion convention, not a determination of sovereignty.
- Source boundaries generally follow Natural Earth's de facto view; no new territorial assertions are drawn. Morocco retains the geometry in this pinned source snapshot.
- Dependencies and overseas territories are not independent puzzle entries. Mayotte, Réunion, Saint Helena and other non-manifest territories are not added.
- All polygons belonging to each selected source country remain one logical country. Egypt includes Sinai; island groups and disconnected parts are retained at their source locations.
- Boundaries reflect the pinned source snapshot, not a live political-boundary service.

The final generated IDs must exactly equal the 54 manifest IDs. The test suite enforces this.

## Geometry processing

The data:build script reads the local source; it does not download anything.

1. Select only each country's explicit source ID/group and the context shape.
2. Project coordinates with a spherical Lambert azimuthal equal-area projection centered at 15 degrees E, 0 degrees N.
3. Dissolve shared edges within the Somalia grouping.
4. Fit the full selected geography uniformly into an 800 by 730 coordinate canvas. Remote islands remain at their real projected locations.
5. Round projected coordinates to 0.001 canvas unit. No country-specific stretching, shifting, polygon deletion or hand-tracing is performed.
6. Generate a single compound SVG path per country, plus bounds and a sampled interior label/drop anchor.

Explorer, Reveal, Puzzle targets, tray previews, drag previews, and small-country inset shapes all read these same generated paths.

## Small-country and island treatment

The manifest enables a puzzle inset for 15 small, narrow, or dispersed countries:

Benin, Burundi, Cabo Verde, Comoros, Djibouti, Equatorial Guinea, Eswatini, The Gambia, Guinea-Bissau, Lesotho, Mauritius, Rwanda, São Tomé and Príncipe, Seychelles, and Togo.

Explorer/Reveal preserve the geographic map. Selection centers/zooms the selected country and marks its location. Puzzle keeps that same map and displays one enlarged inset for the currently selected small country. Enlargement is uniform; islands retain relative shape, spacing, and orientation. Fine island outlines have a visible stroke.

The inset frame is the accessible drop zone, so a user does not have to hit a tiny island pixel. Successful placement colors the country's original geographic path and counts exactly one country. The inset disappears when the next piece is selected. This policy is driven by data and can support microstates in future approved datasets.

