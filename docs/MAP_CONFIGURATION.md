# Map configuration and future coverage

Africa offers Explorer, Reveal and Puzzle. Canada, Central America and South America now offer map-only geographic views through the same renderer. See [data and map-only scope](AMERICAS_DATA.md).

## Catalog and runtime contract

- lib/map-configs.mjs contains mapDefinitions: id, name, status, unitType, terminology, source, manifest, optional regions, activities.explorer/reveal/puzzle, smallUnits and context.
- lib/maps.js derives the available registry only from ready entries with a dataUrl. Planned requests fail before fetching. Changing status alone cannot activate a map without a data URL.
- Sources are now selected for all four maps; see AMERICAS_DATA.md and DATA.md for licenses and provenance.
- Africa references its existing manifest and territory files. Canonical manifests are metadata only: IDs, names, explicit unitType, sovereignty, capital and parent-state metadata. Do not duplicate these definitions when adding geometry.
- Runtime data has id/name/width/height, units and optional context. Each geometric unit supplies id/name/aliases/path/bounds/anchor/color and optional inset. prepareMap attaches config and checks unique IDs/count. The legacy countries field aliases the same units array for compatibility; the shared app consumes units. Legacy country-named DOM hooks remain to preserve CSS and existing tests.
- Region groups contain unit IDs and context IDs, never copies of geometry. Explorer grouping, practiceSet and Puzzle clues share the configured groups. No groups are assigned for planned maps yet; clues stay disabled until configured.
- Explorer repeat-selection policy and Reveal phone navigation are configurable. Reveal name toggling and viewport preservation remain shared invariants. Puzzle scoring uses playable unit count, never a country-specific constant. All three existing activity engines accept arbitrary unit IDs.
- smallUnits records the accurate-outline / optional Puzzle-inset policy. Africa keeps its existing per-unit inset metadata and inset layout. Future maps should use the current normalized 800 × 730 map space when using that layout; dataset-specific inset layout can be added here if needed, without duplicating activity engines.
- context is separate from playable units; its manifest or features describes disputed/non-sovereign geography. Context must not enter the scoring manifest.

## Map manifests

| ID | Display name | Unit type | Planned playable count |
| --- | --- | --- | --- |
| canada | Canada | province/territory | 13 |
| central-america | Central America | country | 7 |
| south-america | South America | country | 12 |

Canada provinces: Alberta, British Columbia, Manitoba, New Brunswick, Newfoundland and Labrador, Nova Scotia, Ontario, Prince Edward Island, Quebec, Saskatchewan.

Canada territories: Northwest Territories, Nunavut, Yukon.

Central America: Belize, Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama.

South America: Argentina, Bolivia, Brazil, Chile, Colombia, Ecuador, Guyana, Paraguay, Peru, Suriname, Uruguay, Venezuela.

French Guiana is a planned visible, learnable geographic unit classified as an overseas department/region of France (unitType: overseas-department-region, parentSovereignState: FRA / France). It belongs to context.features with visible:true, learnable:true, playable:false. South America therefore has 13 learnable units: 12 sovereign countries and 1 territorial unit; its sovereign-country Puzzle still has 12 pieces.

## Later activation checklist

When explicitly authorized to build a map: select and document an open redistribution-compatible source; generate geometry against the planned manifest (verify exact ID membership); handle context and small units; assign optional canonical regions; verify all activities, touch navigation and labels; supply dataUrl and mark ready only after verification. Add navigation only for completed maps. No new activity engine is needed.

## Unit classification and future learning metadata

Every planned playable unit and learnable context feature uses the same fields:

| Field | Meaning |
| --- | --- |
| unitType | Stable classification key: country, province, territory, overseas-department-region. Replaces the old type field. |
| isSovereign | Whether this unit is a sovereign state; never infer sovereignty from Puzzle eligibility. |
| parentSovereignState | null for a sovereign country; otherwise {id, name} for the parent state. Canada subdivisions use CAN / Canada; French Guiana uses FRA / France. |
| capital | null while unresearched, or {name, role, additionalSeats?, source?}. Applies to sovereign and non-sovereign units alike. |

Capital role can distinguish capital, administrative-centre, constitutional-capital or seat-of-government. additionalSeats is an optional array of {name, role} for multiple seats; do not flatten distinct roles into a single city or confuse a unit's capital with its parent state's capital. source may record a supporting reference when real capital metadata is added. This pass deliberately does not populate capital facts. Null means unknown/unresearched, not that a unit has no capital.

unitTypes supplies display labels, including exactly Province and Territory. Canada's 10 provinces and 3 territories carry explicit per-unit unitType values, so a future UI can display the distinction or compare quiz answers directly without guessing from names. The map-level province/territory value describes mixed coverage only.

learning.unitType and learning.capital declare future answer fields, with enabled:false. Capital and classification quizzes remain disabled; Canada displays classification as a learning cue. The same capital field is available to future Africa manifest metadata; current Africa data is intentionally untouched, and missing capital metadata must be treated as unresearched.

plannedLearningUnits combines planned playable units and visible, learnable context features by reference. plannedUnitCounts reports playable, learnable, sovereignCountries and territorialUnits separately; it is a planning helper for inline manifests, not a count of Africa's external manifest. Territorial units includes administrative subdivisions (Canada: 13), not just disputed areas or dependencies. Canada's province/territory split is determined separately by unitType (10/3).

The current map-only view identifies French Guiana and displays its classification and parent state. Future sovereign-country quiz/Puzzle eligibility must use the playable manifest or isSovereign filter, never every learnable unit. No France polygon or extra sovereign South American puzzle piece is implied.

## Canada visual classification

Canada visualClassification defines one shared treatment for all activities: provinces use blue (#90bfd3) with solid boundaries; territories use warm gold (#e1bc70) with dashed boundaries. Boundary dashes provide a non-color cue even in grayscale. A compact legend explicitly names Province / Territory and solid / dashed outlines. Selected readouts and Puzzle piece text also include the classification. Metadata remains unitType: province or territory; styling never determines the classification.

The shared unit-presentation helper is wired to Explorer/Reveal map fills, Puzzle targets, tray pieces, drag previews and insets. Classification remains visible before Reveal names are uncovered; selected/placed state keeps existing emphasis. Non-scaling boundaries preserve the cue under zoom. Canada now has a verified map-only view; Reveal and Puzzle remain unavailable. Africa has no visualClassification setting and retains its existing appearance.

## United States — planned only

ID: united-states. A separate 50-state learning map with 50 explicit US-XX identifiers and unitType: state, excluding DC and territories from the state manifest. The home overview displays a non-clickable Planned tile; the map has no dataUrl and cannot load. Explorer, Reveal and Puzzle settings are explicitly disabled/planned.

Each state retains name, capital (null until researched), parentSovereignState (USA / United States), regionId (null until a regional convention is chosen), playable:true for future eligibility, and scored:false until an activity is built. The optional regions configuration will be the single canonical regional assignment source; no U.S. classification is implied yet.

Alaska and Hawaii reference separate inset groups ak and hi. Each group reserves placement and scale metadata but supplies no invented coordinates, scale or geometry. Canonical geographic shapes must remain unchanged; future inset rendering should be a presentation transform, with clear inset labels.

US-UT is the Utah state, not a county map. Its relatedProject is null; a future explicit external link may store {name, url} pointing to the independent Utah project. No Utah county definitions, data, code or geometry are imported or duplicated. No U.S. data source has been selected/downloaded, no map thumbnail geometry is fabricated, and no U.S. activity pages are enabled.
