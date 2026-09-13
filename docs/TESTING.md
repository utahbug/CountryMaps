# Verification report — 2026-09-12

## Scope and isolation

Initial workspace commands (before reading reference or creating files):

    git rev-parse --show-toplevel
    git remote -v
    git status --short

All three reported that the initial workspace was not a Git repository. A new local repository was later initialized only inside CountryMaps, on branch main. No remote, commit, push, GitHub repository, or deployed Site was created. Utah files were read only.

## Manifest and data

- Explicit manifest: 54 countries.
- Generated country records: 54.
- Unique country IDs: 54, in exact agreement with the manifest.
- Neutral context records: 1 (Western Sahara), excluded from the score.
- Small-country inset policy: 15 entries.
- Detailed island geometry is retained for Cabo Verde, Comoros, Mauritius, Seychelles and São Tomé and Príncipe. Every country is one logical piece.
- Somalia includes the source Somaliland polygon, with the internal boundary dissolved.

## Browser testing

Browser: Codex in-app Chromium on Windows. Tests used actual browser interactions and rendered SVG geometry.

Viewport checks:

| Viewport | Activities checked | Horizontal overflow |
| --- | --- | --- |
| 390 × 844 | Explorer, Reveal, Puzzle | None |
| 430 × 932 | Explorer, Reveal, Puzzle | None |
| 820 × 1180 | Explorer, Reveal, Puzzle | None |
| 1365 × 1000 | Explorer, Reveal, Puzzle | None |

Visual inspection covered the desktop map/tray, phone scrolling with the sticky map, visible keyboard focus, and the small-island inset. Phone piece cards and inset drop boxes remain reachable. Main map geography is not moved or stretched to accommodate islands.

Explorer:

- All 54 country-list selections matched the corresponding highlighted map ID.
- All 54 map paths responded to keyboard selection.
- Common-name search “ivory” matched Côte d’Ivoire.
- Accent-free search “sao tome” matched São Tomé and Príncipe.
- Fit map, country-centered selection, and navigation between activities worked.
- Structured selection tool accepted SYC and rejected an invalid country ID without corrupting the selection.

Reveal:

- Individual revelation of all 54 map paths reached 54/54.
- Reveal All and Reset were run repeatedly, checking 54 and 0 revealed paths.
- The same repeated cycles passed on the final-data static export.
- Revealed numbers correspond to the country list; selection names appear above the map.

Puzzle:

- Every country was actually dragged into its target: 54/54 at 390px with the final 1:10m geometry.
- Every country was actually dragged into its target: 54/54 at 1365px on the static export with final geometry.
- All 15 inset countries worked using their inset drop zone.
- Incorrect drop onto another country and drop at the map's empty edge returned the piece to its tray.
- After full completion and after failed drops, the DOM contained zero drag previews and zero dragging/faded source classes.
- Repeated dragging and scrolling the tray to reach later countries worked.
- Tap/keyboard selection followed by map activation placed Algeria.
- Escape cleared an armed selection.
- Reveal and Return to Puzzle preserved both 54/54 completion and a partial 1/54 puzzle.
- Reset cleared progress, selection, temporary state and answer preview.

## Automated pointer-state tests

The activity/pointer suite contains 11 passing tests:

1. Exact manifest/data agreement, nonempty geometry and multipart island checks.
2. All Explorer IDs selectable; unknown IDs rejected.
3. Repeated, idempotent individual/All/Reset Reveal operations.
4. Correct/incorrect/duplicate Puzzle placement, preview and count behavior.
5. Second pointer cannot take ownership, move, release or cancel the first.
6. Pointer cancel and lost capture fully clean up mouse, touch and pen drags.
7. Reset during/after abnormal states, including repeated Reset and late pointerup.
8. 200 alternating mouse/touch drag sequences with no temporary state left.
9. Stationary taps distinguished from moving drops.
10. Capture failure and reentrant lost-capture cleanup, with no double drop.
11. Nonprimary unowned pointers and right-click starts rejected.

These are deterministic controller-level pointer simulations with capture/class/preview assertions. They are not physical multitouch-device tests. The application wires cancellation, lost capture, Escape, window blur, visibility change, scroll, resize, route changes and Reset to this same cleanup path.

## Build and export

- JavaScript syntax checks passed. There is no TypeScript/compiler requirement.
- The final application is plain static HTML/CSS/JavaScript/SVG with zero dependencies. The optional packaging script copies ten files without compilation.
- A static server was tested locally at /CountryMaps/ to reproduce a project-hosted URL.
- Explorer selection, Reveal/Reset, complete Puzzle dragging, keyboard selection and partial-progress return worked on that export.
- No browser console warnings or errors were recorded during the final full desktop static puzzle test.
- The root and optional dist copy contain .nojekyll. Relative module/data/asset URLs work at the root or in a repository subfolder without rewriting.
- No upload or deployment was performed.

## Limitations and follow-up

- Physical iPhone/iPad Safari and Android Chrome were not available for testing. Browser viewport tests and controller touch-event simulations do not replace device-level multitouch testing.
- Small islands retain accurate relative geography, so individual island silhouettes can be tiny even in the grouped inset. The full inset box is deliberately the drop target; its country name and real-location ring identify the country.
- Natural Earth is a pinned boundary snapshot, not a live boundary feed.
- The detailed map JSON is about 0.9 MB and is loaded from the same static folder. There are no external map services, framework bundles or runtime dependencies.
- Europe and Asia, their regional manifests, and their navigation are intentionally not implemented.

## Final dependency-free implementation

All reported full-country Explorer, Reveal, and desktop/390px Puzzle checks were repeated after replacing the framework with native JavaScript. The final source and optional dist copy have no Cloudflare, Wrangler, Workers types, React, Vite, or third-party dependency installation.


Four additional static-project tests pass: zero dependencies/Cloudflare configuration; relative browser-module and asset paths; all country search names/common aliases; and the pinned source SHA-256. Original total: 15 passing automated tests; the Explorer pan update brings the total to 21.

The final phone tray controls were exercised repeatedly until Zimbabwe, the last piece, was fully visible; selecting and placing it succeeded. Reveal/Return retained that partial 1/54 state. All 12 viewport/activity combinations were rechecked after the dependency-free conversion with no horizontal overflow.


## Explorer direct-pan update

- Mouse clicks and native captured mouse drags passed at 390 × 844, 430 × 932, 820 × 1180 and 1365 × 1000. A click selected Algeria; a drag moved the viewBox and preserved selection. No horizontal overflow, pan ownership attributes, dragging classes or ghosts remained.
- Zoomed dragging, keyboard activation of the precision arrow controls, and Fit map restoring `0 0 800 730` passed.
- `tests/pan-browser.html` runs the actual Explorer DOM handlers inside a same-origin iframe. At each of the four sizes, 95 assertions passed using synthetic `pointerType: touch` PointerEvents. Only pointer capture is stubbed because synthetic events cannot acquire native capture. This is touch-event emulation, not an iPhone/Safari or native touch-input test.
- Browser emulation covers jitter taps, swipe selection suppression, delayed compatibility clicks, second pointer down/move/up/cancel, pointer cancel, lost capture, Reset mid-pan, scroll/blur interruption, recovery taps, 30 repeated out-and-back drags, zoom/arrows/Fit, keyboard country selection and cleanup. The harness is excluded from dist.
- Six new Node tests cover the frozen screen transform, tap threshold, final-up delta, out-and-back movement, ownership, capture failure, reentrant release, pan bounds and 200 cancel/restart cycles. All 21 tests passed; static build and syntax checks passed.
- Puzzle regression: actual Algeria and Cabo Verde inset drags placed correctly at each size, with no Explorer pan class or ghost remaining. The original Puzzle controller is unchanged and its pointer lifecycle tests still pass.
- No browser console warnings/errors were recorded. No dependencies, commits, remotes or pushes were added. Physical touch-device validation remains a follow-up.
## Explorer repeat-selection focus update

Country selection now focuses only when the selected country ID already matches the requested ID. First selections retain the current viewBox, including a manually zoomed/panned view; changing countries also retains it. Map, list, search and structured selection use the same method. Reveal retains its existing list-focus behavior.

Verified native mouse first/repeat map clicks; list first/repeat selection and switching to a different search result at 390px and 1365px. First list selection retained `0 0 800 730`; repeat selection focused; a different search result retained the focused view until selected again.

The expanded browser harness passed 103 assertions at each of 390 × 844, 430 × 932, 820 × 1180 and 1365 × 1000. Added touch-event checks cover first/repeat map selection, switching countries at an existing zoom, mixed map/list selection, Fit, and panning over a selected country without focusing it. Capture remains stubbed for synthetic touch events. This supersedes the original Explorer automatic list-focus behavior described above.
## Explorer / Reveal viewport name overlay and shared selection

Both activities now preserve the current view on first selection and focus on repeat selection of the same country, consistently across map/list/search. This supersedes the earlier Reveal list-focus behavior. Both use the existing pan controller; Puzzle retains its independent controller.

The selected name is rendered in a positioned HTML sibling of the SVG, within a relative map-viewport wrapper. It remains stationary during SVG viewBox changes, wraps at narrow widths, ignores pointer events and is hidden on Reset or in Puzzle. The top name display remains.

The browser harness passed 114 checks per activity at 390 × 844, 430 × 932, 820 × 1180 and 1365 × 1000. Checks include existing gesture/selection cases plus Central African Republic and Democratic Republic of the Congo label text, wrapping, lower-half containment, pointer-event transparency, fixed position during zoom/pan and Reset visibility. Touch uses synthetic PointerEvents with capture stubs, not physical iPhone testing.

Visual inspection of the long Congo label passed at all four widths. Native mouse dragging started directly over the label and panned the Reveal map without changing selection or leaving pan state. Reveal All reached 54/54. Static build and all 21 Node tests passed. No commits or pushes.

## Initial GitHub Pages publication preflight

Publication uses the required local repository at C:\Users\kenro\Documents\Codex\CountryMaps, copied from the original dated workspace because the required folder did not yet exist. No other repository was modified.

All 23 Node tests, syntax checks and the 16-file static packaging command passed. All 15 HTTP-served runtime assets (excluding the empty .nojekyll marker) returned 200 under /CountryMaps/. The icon dimensions, relative manifest URLs, all HTML noindex directives and robots.txt content are covered by tests. The 180px icon was visually inspected for contrast and padding.

Subfolder browser preflight: landing at 390, 430, 820 and 1365px showed three activity links and no overflow. Explorer/Reveal each passed the 114-check browser harness at all four sizes. Accent-free Sao Tome search retained Fit on first selection and focused on the second. Puzzle: all 54 countries dragged into place at 390px and 1365px; no ghosts remained; Reveal/Return retained 54/54 progress. Cabo Verde inset dragging also passed at 430px and 820px with no horizontal overflow. Tests use native mouse input and synthetic touch PointerEvents; physical iPhone/Safari testing remains a limitation.

## Local country-adjacent label update (not published)

Replaces the fixed lower-left label in Explorer/Reveal with screen-space placement around the selected country bounds and geographic anchor. Eight candidates are constrained inside the viewport, ranked first to avoid the selected bounds, then to reduce nearby land-bounds overlap and distance. If the selected country is entirely offscreen or fills the viewport at extreme zoom, placement stays at the best available in-viewport position; zero overlap cannot always be geometrically possible. Updates run after map rendering, direct pan and resize. Label hit testing remains disabled; top readout and selection logic are unchanged.

Four placement tests cover neighboring open space, side changes at an edge, offscreen/edge cases at all four widths and pan recalculation. The browser harness passes 116 assertions per activity at 390, 430, 820 and 1365px, including long-name wrapping, viewport containment and movement after zoom/pan. Native mouse dragging through the desktop label moved both geography and label by the same screen displacement and left no active drag state. Phone and desktop long-name layout were visually inspected. Touch remains emulated, not physical iPhone testing.

## Explicit territory handling (local, not published)

The 54-country manifest file and all 54 generated country records remain unchanged. Context now contains SAH, BRT and SOL with source geometry and identification metadata. All 29 automated tests pass, including complete Africa-continent source coverage and score rejection for all context IDs. Explorer/Reveal each passed 138 browser-harness assertions at 390, 430, 820 and 1365px. Native territory keyboard selection left Reveal at 0/54; Reveal All reached 54/54. Western Sahara search selected its classified label without zooming. All 54 pieces were dragged successfully at 390px, with zero territory pieces or ghosts; Reveal/Return retained 54/54. Phone and desktop labels were visually inspected. No commit or push.

## Memorization toggles (local, not published)

Explorer: selecting a different country restores Fit, and repeated selection alternates Fit/focus while preserving selection. Reveal: each activation toggles the country's revealed state independently, with the same selected-country view alternation. Hidden names are cleared from the overlay, top name, sidebar and accessible map labels/tooltips; unscored territory identification remains visible. Manual controls remain available; a repeated selection from a manually zoomed view returns to Fit.

All 31 Node tests pass. Added engine tests toggle every one of the 54 countries through four reveal/hide cycles, test Reveal All followed by individual hiding, reject context IDs and verify repeated Reset. The updated browser harness passed 158 Explorer and 192 Reveal assertions at each of 390, 430, 820 and 1365px, covering ten successive tap cycles, country switching, hidden-name leakage, independent revealed states, Reveal All/Reset, pan versus tap, label containment and territory score isolation. Native mouse taps at 390px confirmed alternating Fit/revealed, focus/hidden, Fit/revealed and focus/hidden states. Long-name phone layout was visually inspected. Touch remains synthetic PointerEvents with capture stubs; physical-device validation remains outstanding.

## Current-build publication preflight

Before publishing the memorization/territory/adjacent-label update, all 31 Node tests and syntax checks passed. Explorer passed 158 and Reveal 192 browser-harness assertions at each of 390×844, 430×932, 820×1180 and 1365×1000 under /CountryMaps/. Landing showed all three activities without overflow at each size. Puzzle reached 54/54 by native dragging at 390px and 1365px with no ghosts; mainland, inset and Somalia drops passed at 430px and 820px. Icons, noindex directives, robots.txt and relative manifest/module paths remain covered by publication tests. This preflight supersedes the earlier local-only status of the changes above. Physical iPhone testing is the purpose of this remote review build.

## Phone Reveal stability fix

At max-width 650px, Reveal enforces the fitted view in selection, paint, focus, map-control actions and the pan callback. Navigation controls are hidden; the gesture recognizer still rejects swipe/cancel/second-pointer input as taps. Touch-action pan-y allows page scrolling. A fixed-height phone readout prevents a long selected name from changing map position. Resize from a larger Reveal layout re-applies Fit when entering the phone breakpoint.

Pre-publication verification: all 31 Node tests passed. A dedicated actual-DOM harness passed 135 assertions at both 390×844 and 430×932. It compares map bounds and the SVG screen transform after taps across Algeria, DR Congo, South Africa, Madagascar, Senegal and Central African Republic, individual hiding, 12 repeated taps, swipes, cancellations, attempted manual controls, list/search selection, Reveal All and Reset. Long names wrap inside the viewport. Native mouse taps across Africa at 390px independently revealed four countries and hid DR Congo again with identical map bounds and viewBox at every step. Long-name layouts were visually inspected at both phone widths. Explorer retained all 158 regression checks at both phone sizes; Reveal retained all 192 checks at 820px and 1365px. Touch is emulated PointerEvents with capture stubs; physical iPhone/Safari validation remains the user's remote test.
