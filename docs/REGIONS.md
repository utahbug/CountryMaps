# Africa regional practice sets

Convention: [UN Statistics Division M49 geographic regions](https://unstats.un.org/unsd/methodology/m49/overview/), checked 2026-09-15, intersected with our existing 54-country sovereign-country manifest. The UI calls Middle Africa **Central Africa**. These are educational geographic groups, not political affiliations.

## North Africa (6)

- Algeria (`DZA`)
- Egypt (`EGY`)
- Libya (`LBY`)
- Morocco (`MAR`)
- Sudan (`SDN`)
- Tunisia (`TUN`)

## West Africa (16)

- Benin (`BEN`)
- Burkina Faso (`BFA`)
- Cabo Verde (`CPV`)
- Côte d’Ivoire (`CIV`)
- The Gambia (`GMB`)
- Ghana (`GHA`)
- Guinea (`GIN`)
- Guinea-Bissau (`GNB`)
- Liberia (`LBR`)
- Mali (`MLI`)
- Mauritania (`MRT`)
- Niger (`NER`)
- Nigeria (`NGA`)
- Senegal (`SEN`)
- Sierra Leone (`SLE`)
- Togo (`TGO`)

## Central Africa (9)

- Angola (`AGO`)
- Cameroon (`CMR`)
- Central African Republic (`CAF`)
- Chad (`TCD`)
- Democratic Republic of the Congo (`COD`)
- Republic of the Congo (`COG`)
- Equatorial Guinea (`GNQ`)
- Gabon (`GAB`)
- São Tomé and Príncipe (`STP`)

## East Africa (18)

- Burundi (`BDI`)
- Comoros (`COM`)
- Djibouti (`DJI`)
- Eritrea (`ERI`)
- Ethiopia (`ETH`)
- Kenya (`KEN`)
- Madagascar (`MDG`)
- Malawi (`MWI`)
- Mauritius (`MUS`)
- Mozambique (`MOZ`)
- Rwanda (`RWA`)
- Seychelles (`SYC`)
- Somalia (`SOM`)
- South Sudan (`SSD`)
- Tanzania (`TZA`)
- Uganda (`UGA`)
- Zambia (`ZMB`)
- Zimbabwe (`ZWE`)

## Southern Africa (5)

- Botswana (`BWA`)
- Eswatini (`SWZ`)
- Lesotho (`LSO`)
- Namibia (`NAM`)
- South Africa (`ZAF`)

## Classification choices

Sudan is North; South Sudan is East. Mauritania is West, despite its frequent association with the Maghreb. Chad and Angola are Central. Burundi and Rwanda are East. Malawi, Mozambique, Zambia and Zimbabwe are East under M49, although often grouped with southern Africa in other conventions. Madagascar, Comoros, Mauritius and Seychelles are East; Cabo Verde is West; São Tomé and Príncipe is Central. Southern is the five-country M49 group.

The five sets are disjoint: 6 + 16 + 9 + 18 + 5 = **54**, with every canonical country included exactly once. All Africa always includes all 54. Dependencies are not added.

## Geographic context and fitting

Western Sahara and Bir Tawil remain separately styled context in North, and Somaliland in East. These context assignments are display choices, not sovereign-country membership or new political claims; Bir Tawil and Somaliland do not have separate M49 entries. All Africa retains all three context polygons. They never increase country counts. Regional map bounds include all the selected countries’ original polygons and their context, with a 5.5% geographic padding. Islands are neither relocated nor distorted; East Africa consequently spans Madagascar and the Indian Ocean islands.

## Interaction and architecture

Explorer and Reveal share the region selector on phones, tablets and desktop; All Africa is the default everywhere. Reveal switches start a fresh region-only set, with Reset fitting that set and country taps only toggling names. Reveal All reveals only that subset.

Explorer always retains all 54 canonical country objects and searches all 54 in either A–Z or By region mode. Its grouped list is alphabetical within each region. Region heading buttons fit and expand a region; separate disclosure controls expand/collapse without camera movement. Search automatically expands matching groups (disclosure controls are disabled during a nonempty search). Region-focused country selections preserve the current viewport, including manual zoom/pan and repeated selection. Selecting an outside-region country fits its own region so it is visible. All Africa / Fit map restores the continent; ordinary individual-country focus toggling continues in All Africa. Nonregional countries remain as dimmed geographic context.

URLs support `?map=africa&mode=explorer&region=west`. Explorer region focus replaces the current URL without creating a history entry for every focus operation; reload restores it. Explorer/Reveal mode links preserve the region, while Puzzle remains full-Africa. The region ID lists also supply Puzzle's optional regional clues; no separate classification is maintained.

`lib/regions.mjs` stores country IDs only. `practiceSet` filters canonical object references from `data/africa.json`; no country names, geometry, aliases or puzzle treatments are duplicated. `fittedRegion` computes the shared view. Any activity engine can consume the subset IDs: tests exercise PuzzleEngine against every regional subset. Puzzle UI remains the existing 54-country activity in this pass; its navigation intentionally omits the region parameter.
