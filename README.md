# CountryMaps

A standalone static HTML/CSS/JavaScript/SVG app. Africa is complete; Europe and Asia are not implemented.

**No application dependencies, framework, bundler, Cloudflare package, Worker, database, service account, or remote runtime is required.** GitHub Pages can serve the project root directly.

## Run locally

With Node.js installed:

    npm start

Or, without npm:

    node scripts/serve.mjs

Open http://127.0.0.1:4173/. No npm install is needed. The local server uses only Node's built-in modules; it is not part of the deployed app. Any ordinary static HTTP server also works.

Use an HTTP server rather than double-clicking index.html: browser modules and the local JSON request follow browser origin/CORS rules.

Routes:

- ?map=africa — landing page
- ?map=africa&mode=explorer
- ?map=africa&mode=reveal
- ?map=africa&mode=puzzle

## GitHub Pages compatibility

All application assets, modules, and map-data URLs are relative. The same files work at a domain root or a repository subfolder with no base-path build setting.

The root contains .nojekyll so GitHub Pages serves static files directly. The review site is published from the main branch root at https://utahbug.github.io/CountryMaps/.

The optional command below copies just the seventeen publishable files into dist/; it does not compile code, install anything, or publish:

    npm run build

To preview that copy:

    npm run preview

For local subfolder testing only, the preview server can mount under COUNTRYMAPS_BASE_PATH, such as /CountryMaps. This setting affects the test server, not the application or packaging.

## Files

    CountryMaps/
      index.html
      styles.css
      favicon.svg
      .nojekyll
      js/app.js
      lib/maps.js
      lib/engines/activities.mjs
      lib/engines/drag-controller.mjs
      lib/engines/pan-controller.mjs
      data/africa.manifest.json
      data/africa.json
      source-data/ne_10m_admin_0_countries.geojson
      scripts/build-map.mjs
      scripts/build-static.mjs
      scripts/serve.mjs
      tests/engines.test.mjs
      docs/DATA.md
      docs/TESTING.md
      package.json
      README.md

The package.json file only provides optional local commands. It has no dependencies or devDependencies.

## Shared architecture

- lib/maps.js: one map registry, local data loader, search normalization, and inset transform.
- lib/engines/activities.mjs: shared Explorer, Reveal, and Puzzle state engines.
- lib/engines/drag-controller.mjs: one active pointer owner, capture lifecycle, centralized cleanup.
- lib/engines/pan-controller.mjs: Explorer/Reveal pointer panning and tap recognition, independent of Puzzle drag state.
- js/app.js: shared SVG rendering, country list, piece tray, activity controls and navigation.
- styles.css: shared design tokens, focus states, touch targets and responsive layout.
- data/africa.manifest.json: explicit country inclusion, grouping, names, aliases and inset policy.
- data/africa.json: one generated geometry record per country, used by every activity.

Future approved continents or regional submaps can be registered with the same schema and normalized 800 by 730 coordinate space. No Explorer, Reveal or Puzzle engine needs duplication. No Europe or Asia dataset or navigation has been added.

## Activities

Explorer: select a map shape or search/list entry. The country name appears above the map. A new country selection returns to the fitted full-continent view. Repeated selection alternates country focus and full-continent Fit while retaining the highlight. Map, list and search use the same behavior. If manually zoomed in, the next repeated selection returns to Fit; at full scale, it focuses the country. Drag directly with a mouse or one finger to pan. Movement of at least 6 CSS pixels counts as a pan and cannot select a country; ordinary clicks/taps still select. Zoom, keyboard-accessible pan arrows and Fit map remain available. Pan gestures clean up on release, cancellation, lost capture, Reset and interrupted navigation. Scroll the page outside the map.

Reveal: starts with an unlabeled map. Reveal individual shapes or use the country list. Revealed shapes gain color and an index number corresponding to the country list. Reveal All and Reset are repeatable. Each country toggles independently between revealed and hidden on activation. Hidden names are removed from the adjacent overlay, top readout, sidebar text and map tooltip/accessibility name; numbered placeholders remain in the list. Country selection never changes the Reveal viewport. Every revealed country has its own persistent map label. Direct dragging pans without changing selection, name visibility or click-toggle state. Reset hides all names and restores Fit.

Puzzle: all countries begin in the external piece tray. Drag to the matching geographic shape; small countries use an enlarged inset drop box. Wrong drops return cleanly. A tap selects a piece, then a map tap places it. Keyboard users select a piece with Enter, then focus a location and press Enter. Escape clears selection/drag. Reveal temporarily shows the answer map; Return to Puzzle preserves placed pieces.

At phone widths the map stays visible as the tray scrolls. Previous pieces / More pieces buttons make every piece reachable without requiring touch scrolling on a draggable card. Unexpected scrolling/resizing during a drag cancels cleanly. Reset clears progress and all temporary drag state.

Explorer and Reveal display the selected name near the rendered country bounds. The wrapping, non-interactive label evaluates neighboring positions, avoids covering the selected country where space permits, prefers open space, and stays inside the viewport. Placement updates on pan, zoom, Fit and resize; the original top name remains visible. Reset clears the label.

Refreshing the page starts a new session. There is no account, analytics, persistence, or remote geographic-data service. The one JSON map file is loaded from the same static folder.

## Verification

    npm test
    npm run check
    npm run data:build
    npm run build

All commands use Node built-ins only. The data generator uses the included pinned source; it does not download anything.

See docs/TESTING.md for browser checks, automated pointer-state checks, and physical-device limitations. See docs/DATA.md for the explicit 54-country policy, source, license and inset treatment.

## Reference and dependency decision

The existing Utah Counties pages were inspected read-only. The palette, bordered panels, activity navigation and map/tray arrangement informed the design. The old drag implementation was not copied.

The initial scaffold included @cloudflare/vite-plugin and Wrangler. Wrangler required matching @cloudflare/workers-types definitions. None was necessary for this static app. That scaffold and all of its installed dependencies were removed; the final app uses browser-native HTML, CSS, JavaScript and SVG.




## Review publication

Repository: https://github.com/utahbug/CountryMaps

Site: https://utahbug.github.io/CountryMaps/

Every HTML entry point has `noindex, nofollow`. The project root contains `robots.txt` with `Disallow: /`. These are indexing requests, not access control; anyone knowing the URL can open the site. Crawlers normally read robots.txt at the host root, so the noindex HTML directive is the operative page-level exclusion for this project-hosted site. No other repository or host-root policy was changed.

The green/cream globe with a gold location marker is supplied as favicon.svg, favicon-32x32.png, apple-touch-icon.png (180px), icon-192.png and icon-512.png. Artwork is inset from the edges for Home Screen masking. All icon/manifest links, start_url and scope are relative to the project path. PNGs were rasterized from the SVG using an already-installed development utility; the app has no added dependencies.


## Territory identification

Western Sahara, Bir Tawil and Somaliland are distinct labeled, searchable context in Explorer/Reveal, styled with neutral hatching and dashed boundaries. They never count toward the 54-country score. The unchanged Somalia Puzzle piece includes the Somaliland geometry; the map legend makes that scoring convention explicit. See [the source audit](docs/TERRITORIES.md) for details and all other omitted African/overseas source components.

## Phone Reveal study mode

At the existing phone breakpoint (650px and below), Reveal stays fitted to Africa. Country taps only toggle independent name visibility; they never change the geographic view. Map pan/zoom and directional controls are unavailable in phone Reveal; swiping can scroll the page. The map readout reserves a fixed height so long names do not move the map. Reveal All shows all 54 names in the map viewport and numbered country list. Labels use measured, non-overlapping placements with an 8px edge margin; dense views prioritize full name visibility over proximity. Reset hides all names and restores Fit. Explorer remains available for close inspection; tablet/desktop Reveal retains manual navigation, but no country activation changes zoom or pan. Reveal All also preserves the current viewport.

## Regional practice

Explorer and Reveal share All Africa, North, West, Central, East and Southern Africa assignments. Reveal uses region-only practice sets; Explorer keeps all 54 countries searchable and uses the region as a map focus. All Africa is the default on every device. Region configurations contain IDs only. Puzzle currently remains full-Africa, with clues drawn from the same assignments. See [exact membership and conventions](docs/REGIONS.md).

## Optional Puzzle clues

Clue sits directly above the map, inside the sticky phone map panel. The first request names the active country's region using the same regional assignments as the practice selector. The second request pulses the correct geographic destination for 2.8 seconds; for inset countries both the real geography and existing inset drop zone are outlined. Further requests replay the pulse. Reduced-motion preferences receive a steady temporary outline instead. No clue changes the score, camera, geometry, or piece position. Clues reset when the active country changes, after correct placement, on Reset, when entering Reveal preview or another mode, and on page exit. Incorrect drops retain the requested clue level. Clue requests during an active drag are ignored so another pointer cannot disturb the drag. All 54 countries have one regional clue; disputed territories are not puzzle pieces.

## Puzzle drop tolerance

Pointer position is no longer the placement test. Normal countries use uniform filled-shape overlap samples from the canonical SVG path; roughly 30% overlap is sufficient unless neighboring geometry dominates. Small/narrow rendered shapes get an invisible 8 CSS-pixel tolerance, but must still overlap the intended country, satisfy the expanded-overlap threshold, and pass neighboring-geometry/nearest-center checks. A mostly-neighbor drop is rejected even if that neighbor's center is far away.

Existing small-country inset destinations remain in use. These compare the visible dragged piece's bounds with the active inset rectangle (35% direct overlap, or bounded 8px tolerance with at least 12% direct overlap). Nearby visible geography can reject ambiguous inset-edge drops; geography covered by the inset cannot interfere. No outline, island position, inset scale, or canonical snap position is changed. Rendering and validation share the same drag-footprint calculation. Successful placement still marks only the matching country in the existing engine; incorrect drops retain the existing clean return.

## Explorer regional learning

A–Z keeps the existing list. By region groups all 54 countries, alphabetically within the five shared regions. Heading buttons fit the region and open its list; separate +/− buttons expand/collapse without moving the map. On phones, collapsed headings keep the list compact. Search covers all 54 countries in either organization and temporarily expands matching groups.

A focused region keeps its current viewport when selecting or repeatedly selecting countries within it, including after manual zoom/pan. Choosing a search result or country outside that region fits the newly chosen country's whole region. All Africa / Fit map clears regional focus, restores the continent and retains the selected country; the ordinary Explorer repeat-selection country zoom resumes. All original geometry remains visible as context, with countries outside the focused region dimmed. The region selector and links preserve the shared region ID; Reveal continues to use that ID as a practice subset.

## Shared map architecture

Internal definitions cover `canada` (13 provinces/territories), `central-america` (7 countries), and `south-america` (12 sovereign countries plus French Guiana). These now have map-only views; Africa retains all three activities. See [configuration contract and exact coverage](docs/MAP_CONFIGURATION.md).

Planned units now support explicit `unitType`, capital metadata and parent sovereign states. Canada distinguishes 10 provinces from 3 territories. South America plans 13 learnable geographic units (12 sovereign countries plus French Guiana, an overseas department/region of France), while keeping its sovereign-country Puzzle count at 12. Classification/capital-learning UI remains disabled.

## Canada and Americas: map-only views

Working local routes: `?map=canada`, `?map=central-america`, `?map=south-america`. These reuse the shared map renderer and Explorer navigation, with no Reveal/Puzzle links. Canada displays 13 provinces/territories; Central America displays seven countries; South America displays 12 sovereign countries plus French Guiana — France. See [source/license and scope](docs/AMERICAS_DATA.md). Generate only these datasets with `npm run data:americas`. Africa is unchanged.

## Main entry and navigation

The project root (`/CountryMaps/`) is the All Maps hub. Cards are generated from the available-map registry: Africa opens its existing activity landing page; Canada, Central America and South America open map-only views. Both the CountryMaps brand and the prominent All Maps header link return to the short project root. Future ready maps automatically join the same card/navigation structure. All links are project-relative for GitHub Pages and the Home Screen manifest still starts at `./`.

The root hub uses compact geography tiles with real SVG previews from `assets/maps/`. `npm run build` regenerates them from the canonical map JSON using `scripts/build-thumbnails.mjs`; only preview paths are simplified, never activity geometry. Available registry entries automatically receive a tile and preview. Tiles show Africa’s Explorer / Reveal / Puzzle availability or Map only for now, with no unfinished activity links.

United States (`united-states`) is reserved as a separate 50-state map and appears as a non-clickable Planned home tile. State metadata reserves capitals, U.S. regions, Alaska/Hawaii insets and a future optional external Utah-project link. No U.S. activities or Utah county data are included.

## Publishing workflow

GitHub Pages at https://utahbug.github.io/CountryMaps/ is the primary review and iPhone testing version. After each completed, tested requested change: commit to this repository, push main, wait for the existing Pages deployment, verify the live site and /CountryMaps/ asset paths, then report the commit hash and deployment status. Do not publish when explicitly instructed otherwise, when tests fail, or when incomplete/experimental changes could break the site; report the blocker clearly. Preserve noindex, nofollow and the root robots.txt exclusion until instructed otherwise.
