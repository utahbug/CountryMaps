# Explorer learning reference

Reviewed 2026-09-16. The Utah Counties Explorer was inspected as an information-architecture reference only: compact summaries, disclosure details, and historical entities below current units. No Utah data was imported.

## Model and scope

`data/africa-learning.json` supplies optional facts keyed by canonical unit ID. It is not a manifest. `referenceUrl` enables reusable `learning-reference.mjs` cards and history rendering for any map. The module uses unit names supplied by the map, so provinces, territories and states do not need a country-specific engine. `capital: null` reserves unresearched capital metadata; no capital activity is enabled.

Neighbors are present-day land-boundary relationships, including river/lake boundaries, between the 54 manifest countries. Maritime neighbors are not land neighbors. External borders and disputed areas are called out separately. Somaliland is not silently promoted into the sovereign manifest. Coastal includes island countries; Islands is the existing six-country practice subset. Equatorial Guinea has both mainland and island territory and remains coastal, not a wholly island state.

Regions and Islands/Small countries membership come only from existing config. Coastal/Landlocked are derived from the reference's landlocked field. Search remains global across filters. Cards preserve the current viewport; Focus on map is an explicit action. Map gestures retain their existing behavior.

History is an expandable, curated reference, not an exhaustive list of former African polities. Each record contains a type, a qualified date/period string, an array of currentUnitIds, a concise note and source URLs. These arrays support one-to-many and many-to-one associations. Modern links highlight modern geography, never claim historical boundaries were identical. Unknown start dates are omitted rather than guessed. Sovereign scoring remains 54.

## Geography sources

- Natural Earth Admin 0, the project's existing pinned boundary dataset: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/ — public domain, voluntary attribution retained. Relative locations and neighboring units were checked against the canonical map; geography has not been rebuilt.
- UN Geospatial Africa reference map: https://www.un.org/geospatial/file/2653/download?token=iLAw-SWW — reference only, not redistributed. Its older names do not override current manifest names.
- UN list of landlocked developing countries: https://www.un.org/en/node/205691 — the 16 African members establish landlocked classification.
- Natural Earth physical geography (coast, lakes, rivers): https://www.naturalearthdata.com/downloads/10m-physical-vectors/ — brief original geographic descriptions, no copied prose.

## History sources and attribution

Every historical record stores its own source URLs and exposes them in its expanded card. Sources are the UN member-state/name records, UN Treaty Collection historical information, UN decolonization records, and U.S. Department of State Office of the Historian country recognition histories. Name-change dates describe the stated event, not necessarily the whole period the name was in use. The Rhodesia entry explicitly distinguishes the unrecognized unilateral state from colonial Southern Rhodesia. Sudan's continuing statehood and unresolved border issues are retained. The United Arab Republic entry includes Syria in its explanation although Syria is outside this map.

Text is original concise paraphrase of factual material, not copied source prose. Links provide attribution; no source map or copyrighted illustration is bundled. U.S. federal historical text is generally public domain; third-party material on those sites is not imported. UN sources are cited as factual references, not relicensed as project assets.

## Validation

Unit tests check exactly 54 fact records, valid reciprocal neighbor references, canonical regions, 16 landlocked / 38 coastal countries, unique historical IDs and valid modern targets. Browser tests cover all cards, all filters, global search, context-preserving selection, expansion, explicit focus, historical links, responsive overflow and 44px controls. Existing Reveal and Puzzle engines and geometry are untouched.

The map and compact Find a country locator come first. Full learning cards follow immediately below the complete map workspace in two desktop/tablet columns or one phone column. Cards use one native summary/caret to expand or collapse, with the country name, classification and brief sentence always visible. The locator contains names only. Map selections open and scroll to the corresponding card. Locator selections only highlight the country, preserving page position, map viewport and card expansion state; card activation highlights its map unit. Explicit Focus on map remains available. Soft green, blue, gold and lavender cycle for readability without political meaning. History follows the current-country section, collapsed by default.

Reveal and Puzzle share `activityLearningCard` and the existing reference facts. Reveal retains the last individually revealed country when hidden again or after Reveal All; Reset or a fresh region clears it. Puzzle updates only after successful placement, retains the recap across piece filters/reference-map preview, and clears on Reset. A fixed-height slot below the map reserves space to keep interaction geometry and tray position stable. No separate activity descriptions or capitals UI are introduced.
