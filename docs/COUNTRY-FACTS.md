# Africa Explorer comparison facts

Retrieved 17 October 2026. Canonical factual records are in data/africa-facts.json, keyed by the existing 54 sovereign-unit IDs. Regions remain exclusively in the shared region configuration. Explorer cards and the map-side panel use the same records. Capitals and Puzzle recaps retain the existing concise descriptions.

## Population and land area

World Bank, World Development Indicators, updated 8 October 2026. Population: SP.POP.TOTL, latest non-null observation for every configured country is 2025. These are estimates, not a live 2026 count. Original providers include UN Population Division, national statistical offices and Eurostat. Land area: AG.LND.TOTL.K2, latest observation is 2024 for all 54; original provider FAO. Land area excludes inland water and is not total surface area. Display values are rounded to whole square kilometres; sorting uses source precision. Each record carries its year and indicator URL. Statistical territorial coverage follows the provider, not our displayed SVG; figures must not be interpreted as endorsing disputed boundaries.

- https://data.worldbank.org/indicator/SP.POP.TOTL
- https://data.worldbank.org/indicator/AG.LND.TOTL.K2
- https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&date=2023:2026
- https://api.worldbank.org/v2/country/all/indicator/AG.LND.TOTL.K2?format=json&per_page=20000&date=2022:2026

Attribution: World Bank and the original providers listed above, CC BY 4.0. Terms: https://data.worldbank.org/summary-terms-of-use ; license: https://creativecommons.org/licenses/by/4.0/ . Changes: subset selection, latest-observation selection and display rounding. No values inferred from map shapes.

## Political dates are events, not country ages

Baseline: CIA World Factbook independence field, historical US-government public-domain material preserved by MIT: https://start.csail.mit.edu/mirror/cia.gov/library/publications/the-world-factbook/fields/2088.html . The original CIA archive now redirects to its February 2026 retirement notice, so the preserved table is linked explicitly. Date labels, notes and overrides were reviewed; old names are mapped only to existing canonical IDs. The table is not used for current statistics or current political leadership.

One event is chosen for sorting; it is not an assertion about the age of a people, civilization, or territory. The following are intentionally not all labeled Independence:

- Ethiopia: 21 August 1995, Federal constitution. An ancient independent state, not a newly independent country in 1995. Primary legislation: https://www.refworld.org/legal/legislation/natlegbod/1995/en/18206 ; ILO https://natlex.ilo.org/dyn/natlex2/r/natlex/fe/details?p3_isn=47312 .
- South Africa: 31 May 1910, Union established, not democratic independence. Republic in 1961; first non-racial national elections in 1994. https://www.thepresidency.gov.za/history ; https://www.gov.za/issues/20years/milestones-20-years-freedom .
- Tanzania: 26 April 1964, Union formed. Tanganyika independence 1961; Zanzibar 1963. https://www.un.tzembassy.go.tz/tanzania/about-tanzania . The older baseline's Zanzibar day is erroneous; it is not copied.
- Somalia: 1 July 1960, Independence & union of former British and Italian Somaliland. This is historical context, not a resolution of Somaliland's current status.
- Senegal: 20 August 1960, Separate state after the Mali Federation; 4 April is the commemorated national holiday. https://www.presidence.sn/fr/presidence/lindependance-4-avril-1960/ .
- Mali: 22 September 1960, Republic of Mali following the federation's breakup.
- Guinea-Bissau: 24 September 1973 declaration; Portuguese recognition followed 10 September 1974.
- Egypt: 28 February 1922 declaration ended the protectorate but reserved British powers; republic followed in 1953.
- Morocco: 2 March 1956 restoration after the French protectorate, not the founding of Morocco.
- Cameroon: 1960 for French-administered Cameroon; British Southern Cameroons joined in 1961. https://mandates.un.org/mandate/A/RES/1608%28XV%29 .
- South Sudan: 9 July 2011 independence, rather than the later UN admission date. https://www.un.org/en/about-us/member-states/south-sudan .
- Comoros: independence in 1975; Mayotte's separate administration and the Comorian claim are explicitly distinguished. https://www.un.int/comoros/fr/statements_speeches/la-65eme-session-ordinaire-de-lassemblee-generale-des-nations-unies .

Per-unit sources are included in the data. Historical dates do not automatically imply today's boundaries or constitutional arrangements.

## Presentation

The map-side panel never scrolls the page on selection. Desktop/tablet use a lower-left viewport-anchored facts panel; phones place the panel immediately beneath the map. Cards below the complete map area are secondary, with compact Sort and Order controls. Sorting is numeric/chronological (not formatted-text sorting), with alphabetical ties, and applies within regional groups when grouped browsing is selected. Filtering and search retain the selected sort. No capital fields are promoted in Explorer.

## Verification

84 Node tests passed. The new Explorer factual browser harness passed 722 checks at each of 390×844, 430×932, 1024×900 and 1440×1000: exact 54-card coverage, every country selected through map and list, no scroll/zoom changes, source-matching population, bounded panel layout, all eight sort orders, search, subsets and regional headings. Explorer pointer regressions passed 159 checks at each size. Capitals compatibility passed 407 phone and 409 desktop checks; Puzzle phone-navigation passed 144 checks. Browser touch events are synthetic with capture stubbed; physical iPhone Safari was not available.
