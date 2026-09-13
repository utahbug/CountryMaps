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

Reveal: starts with an unlabeled map. Reveal individual shapes or use the country list. Revealed shapes gain color and an index number corresponding to the country list. Reveal All and Reset are repeatable. Each country toggles independently between revealed and hidden on activation. Hidden names are removed from the adjacent overlay, top readout, sidebar text and map tooltip/accessibility name; numbered placeholders remain in the list. Repeated selection also alternates country focus and Fit, while selecting a different country returns to Fit. Direct dragging pans without changing selection, name visibility or click-toggle state. Reset hides all names and restores Fit.

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

At the existing phone breakpoint (650px and below), Reveal stays fitted to Africa. Country taps only toggle independent name visibility; they never change the geographic view. Map pan/zoom and directional controls are unavailable in phone Reveal; swiping can scroll the page. The map readout reserves a fixed height so long names do not move the map. Reveal All shows all names in the numbered country list, and the active revealed country keeps its adjacent map label. Reset hides all names and restores Fit. Explorer remains available for close inspection; tablet/desktop Reveal retains its existing controls and view toggles.
