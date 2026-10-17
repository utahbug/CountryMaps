# Africa capitals

Verified 17 October 2026. All 54 playable units obtain their capital object from data/africa-capitals.json at load time. Geometry, regions and the sovereign-country manifest are unchanged. Fields support name, role, shortRole, additionalSeats, note and source(s); additional seats are labeled by function, not silently treated as interchangeable national capitals.

Baseline: World Bank Country API (https://api.worldbank.org/v2/country?format=json&per_page=400), attributed to World Bank, under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/; terms https://data.worldbank.org/summary-terms-of-use). Accents were normalized and outdated/single-seat answers amended using primary sources linked on each data entry. These are factual summaries, not copied source descriptions.

## Special cases

- Equatorial Guinea: Ciudad de la Paz replaced Malabo as declared capital on 2 January 2026. Source: Oficina de Información y Prensa de Guinea Ecuatorial, presidential announcement linked in GNQ.
- Burundi: Gitega is the political capital; Bujumbura the economic capital (Prime Minister's office).
- Benin: Porto-Novo is the official capital; Cotonou the government seat (French foreign ministry and Benin statistics documentation).
- Côte d’Ivoire: Yamoussoukro is the political capital; Abidjan the economic capital and an important government center (Presidency).
- Eswatini: Mbabane administrative; Lobamba royal/legislative (African Union).
- South Africa: Pretoria administrative; Cape Town legislative; Bloemfontein judicial (South African government). The conventional judicial designation does not mean every national court is there.
- Egypt: Cairo remains the constitutional capital; the New Administrative Capital hosts government functions (constitution article 222 and State Information Service).
- Tanzania: Dodoma is the capital, rather than former capital Dar es Salaam (2018 capital-city law).
- Sudan: Khartoum remains the capital. Temporary wartime government operations in Port Sudan do not make it a second national capital (government account of the January 2026 Khartoum meeting).

## Activity and compatibility

The public route is ?map=africa&mode=capitals. Old mode=reveal bookmarks load the same Capitals activity. The internal reveal configuration key remains for CSS and regional-navigation compatibility. Capital learning cycles empty → country → country plus capital → empty, retaining the two oldest-to-newest active countries. Advancing an existing country does not renew its FIFO age. Clear empties labels without moving the view; Reset also restores fit. Special-status areas remain informational only. Explorer and Puzzle retain their separate behavior.

Labels reserve the country/capital pair's measured dimensions from the first click, preventing movement on the second click. Inside placement samples the actual SVG polygon; otherwise two stable lower-left slots are used. Hidden capital text is not exposed by accessibility labels until state two. Hover country titles are temporary and do not change state.

## Verification

80 Node tests pass, including exact capital-manifest coverage, FIFO/cycle state, slot collision checks, existing geography, and Puzzle/Explorer engines. Browser harness tests/capitals-browser.html passed 407 assertions at 390 and 430 px, and 409 at 1024 and 1920 px: every country's cycle, viewport bounds, stable pair placement, Clear, Reset, special-status exclusion, regional state, and cross-mode navigation. Existing Explorer pointer harness passed 159 checks at each width. Existing Puzzle phone-navigation harness passed 144 checks at both phone widths (transformed small/island drops, pan/pinch, pointer cleanup and filters). Synthetic touch tests stub pointer capture; physical iPhone Safari was not available.
