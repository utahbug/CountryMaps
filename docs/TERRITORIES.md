# Africa source-geometry and territory audit

This audit refers to the included, SHA-256-pinned Natural Earth 1:10m Admin-0 countries snapshot, not a current legal determination. Natural Earth draws de facto geometry; its country-level records and classifications do not by themselves define the app's sovereign-country manifest. Policy: https://www.naturalearthdata.com/about/disputed-boundaries-policy/

## Displayed source records outside the 54-country manifest

| Source code | Source name | Before this update | Current treatment |
| --- | --- | --- | --- |
| SAH | Western Sahara | Neutral, non-interactive context; title only | Separate labeled, hatched/dashed, selectable disputed territory in Explorer/Reveal. Never merged into Morocco or Mauritania. Unscored neutral context in Puzzle. |
| SOL | Somaliland | Dissolved into the Somalia country geometry | Separate source boundary and neutral context overlay in Explorer/Reveal, explicitly identified as disputed/breakaway. The unchanged 54-country Puzzle uses the existing Somalia piece, including this geometry; the UI and metadata explain this convention. This is not a sovereignty determination. |
| BRT | Bir Tawil | Omitted, leaving a small unexplained mainland gap | Its original polygon is now drawn, labeled, and selectable as indeterminate territory between Egypt and Sudan. Neutral context, never a puzzle piece. |
| SDS | South Sudan | Mapped to manifest ID SSD | ID normalization only; this is one of the existing 54 countries, not an additional territory. |

The audit checks every feature whose CONTINENT is Africa against the source IDs consumed by the manifest or the explicit context policy. There are no unaccounted-for African mainland Admin-0 records after this update. The 54 scored country records (including paths, bounds, anchors, IDs and colors) are byte-for-byte identical as JSON to those in the published initial commit. The sovereign-country manifest file is unchanged.

`data/africa.territories.json` is the authoritative expanded context policy, separate from the unchanged 54-country manifest. Its generated records are stored in `africa.json.context`. The manifest's older context hint is superseded by this policy. Territory identification uses the same map rendering/projection, pan/tap lifecycle, repeat-selection focus and adjacent-label placement. Country engines receive only the 54 country IDs. Territory selection never reveals or scores an extra country.

## Other non-manifest African or Africa-adjacent source geometry

The full world source contains the following additional records or polygon components. None is drawn by this Africa app, merged into a configured country, or counted as a puzzle country. These omissions do not create substantial unexplained mainland gaps; they are offshore dependencies/islands or very small coastal enclaves. Listing them avoids assuming that filtering CONTINENT alone finds every African island.

| Source record | Relevant components / treatment |
| --- | --- |
| FRA (France) | Reunion and Mayotte components are embedded in the France feature. Omitted, not merged into Mauritius, Madagascar or Comoros. |
| ESP (Spain) | Canary Islands, Ceuta, Melilla and smaller north-African coastal possessions/rocks are components of Spain. Omitted, not merged into Morocco. |
| PRT (Portugal) | Madeira, Porto Santo, Desertas and Selvagens components are omitted. Azores are also not included in the Africa map. |
| SHN (Saint Helena) | Saint Helena, Ascension and Tristan da Cunha group; source CONTINENT is Seven seas, REGION_UN is Africa. Omitted. |
| ATF (French Southern and Antarctic Lands) | Includes scattered western Indian Ocean islands and southern Indian Ocean groups. Source REGION_UN is Africa, CONTINENT is Seven seas. Omitted; no merging into Madagascar or Comoros. |
| HMD (Heard Island and McDonald Islands) | Source REGION_UN is Africa despite its distant southern Indian Ocean location. Omitted. |
| IOA (Indian Ocean Territories) | Australian Indian Ocean territories record, including Christmas/Cocos components; source REGION_UN is Africa, CONTINENT is Asia. Omitted. |
| IOT (British Indian Ocean Territory) | Chagos source record, under the name in this pinned snapshot; REGION_UN is Africa. Omitted. This audit does not assert current sovereignty or naming. |

Adjacent European and Asian land visible in the world source is not drawn. Seas/lakes and the map background are not unassigned country polygons. Other claims represented only in Natural Earth's optional disputed-boundary layers (not this countries file) are outside this source audit; no claim is made to display every territorial dispute in Africa.

## Verification

- Source-level audit accounts for all Africa-continent records.
- 54 country IDs exactly match the unchanged explicit manifest.
- All three context records have source geometry, names, status labels and handling descriptions.
- Reveal and Puzzle reject all three context IDs; completing all countries still yields exactly 54.
- Explorer and Reveal browser checks cover territory taps, first-selection Fit, repeat focus, visible status classification and unchanged score at phone/tablet/desktop sizes.
