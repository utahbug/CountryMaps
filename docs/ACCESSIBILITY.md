# Accessibility baseline and release checklist

WCAG 2.1 Level AA is required for all CountryMaps pages, current and future maps, Learn, Capitals, Puzzle, and Special Geography. This is an engineering requirement, not a claim that an automated scan certifies the entire site. See [WCAG 2.1](https://www.w3.org/TR/WCAG21/). All applicable Level A and AA success criteria apply, including those not repeated below.

## Shared implementation contract

- Use native links, buttons, inputs, selects, headings and disclosures. Visible labels must be included in accessible names. Icon-only controls require descriptive names and native tooltips.
- Keep keyboard focus visible, maintain DOM/tab order, and focus the new heading after local route changes. Skip to content must focus the main region. Native non-modal popovers receive focus on open and return it to the opener on close; Escape dismisses them. Do not trap focus in a non-modal popover.
- SVG units expose meaningful names and pressed state; selected locator rows have a checkmark/border as well as color. Canada also uses border styles to distinguish province/territory. Puzzle completed cards and live messages convey completion separately from fills.
- Puzzle supports selecting a piece and activating its named map destination with Enter/Space, as well as tapping or dragging. Single-pointer zoom/pan/Fit controls accompany gesture navigation. Do not introduce a pinch-only or drag-only essential operation.
- Status changes use polite live regions without moving focus. Keep announcements concise. Decorative labels, silhouettes and animation copies must not duplicate accessible controls.
- Text contrast: 4.5:1 normal, 3:1 large; essential graphics/control/focus boundaries: 3:1. Check hover, selected, focus, error and completed states. Shared palette checks include the actual dataset fill colors.
- Never use color alone. Respect reduced motion in CSS and scripted animations. No sound, flashing, or forced motion.
- Allow 200% text enlargement and narrow-width reflow; wrap headings and control rows, let learning cards grow, and avoid clipping important names. Map geometry may retain its two-dimensional layout, but surrounding controls and text must reflow.
- Aim for 44px touch targets as a CountryMaps product standard (WCAG 2.1's 44px Target Size criterion is AAA, not AA). Preserve usable hit areas for tiny geographic features and keyboard alternatives.

## Release procedure

1. Run `npm run check`, `npm test`, `npm run build`, and `git diff --check`.
2. Serve the project under `/CountryMaps/`. Open `tests/accessibility-browser.html` at 390, 430, 768 and 1440px. Run its axe audit for Home, Africa landing, all three Africa activities, Canada, Central America and South America. Investigate **incomplete** results, not only violations. The fixture also measures overflow after doubling computed text sizes; this is a text-resize simulation, not a substitute for actual browser/OS zoom testing.
3. Manually Tab/Shift+Tab through navigation, filters, search, disclosures, popovers, map paths and pieces. Exercise Enter/Space, Escape, zoom/pan/Fit, correct and incorrect placement, reset and route changes. Confirm focus entry/return, selected/completed names and status updates.
4. Inspect 200% text size: long country names, map station, region/sort controls, learning cards, popup scrollability. Check no overlap, clipping or horizontal page scroll. Check desktop/tablet/390/430 layouts and actual browser zoom.
5. Review contrast and non-color cues, including SVG boundaries and focus. Verify reduced-motion preference and cancellation of animations. Run shared layout, Capitals and phone navigation regression fixtures when relevant.
6. Test with NVDA/Firefox or NVDA/Chrome and iPhone Safari/VoiceOver for substantial interaction changes. Record device/browser and any outstanding validation gaps. DOM/AX inspection is not a listening test.
7. Do not publish a known unresolved A/AA failure in a new page or major interaction. Record the affected page, criterion, reproduction and proposed fix. Do not silently waive failures. Future maps inherit this checklist and the shared accessibility module/styles.

## Automated audit tool

`tests/vendor/axe.min.js` is pinned axe-core **4.10.3**, MPL-2.0; its license is `tests/vendor/axe-LICENSE`. Source: [Deque axe-core](https://github.com/dequelabs/axe-core), distributed from `https://cdn.jsdelivr.net/npm/axe-core@4.10.3/axe.min.js`. It is a development-only fixture dependency, excluded from the static production build. It runs WCAG 2 A/AA and 2.1 A/AA tagged rules. No runtime framework or production dependency was added.

## October 20, 2026 audit scope

Shared fixes include popup/route focus handling, meaningful puzzle destination names, selected locator state/checkmarks, stronger geographic outlines, single-pointer navigation alternatives, reduced-motion CSS, and text-enlargement reflow. Existing geometry, scoring, filters and drop tolerance remain unchanged.

Automated scans cover the eight routes above; manual review covers important accessible names/states, popup focus/escape/return, keyboard piece placement, selected locator feedback and responsive/text-enlarged layouts. Axe's remaining review items concern gradient backgrounds, decorative arrow glyphs and SVG/text overlap; shared palette contrast is checked separately. Background wash is light, with dark text; no gradient is used to convey information.

Validation limits: this environment does not provide an actual VoiceOver/NVDA listening session or a physical iPhone. Text-size doubling is a fixture simulation. Those device/assistive-technology and actual browser zoom checks remain outstanding; **full WCAG conformance is not certified** by this pass. Record any subsequently discovered failures here and fix them before the affected feature's next release.

Verified results for this pass: 89 Node tests; eight-route axe scans at 390, 430, 768 and 1440px with zero definite violations and no page overflow at normal/doubled text size; compact layout/navigation fixtures (49 phone / 54 tablet-desktop assertions); 144 synthetic phone navigation assertions per phone width; 44 desktop reward checks including reduced-motion and reset cleanup. Manual keyboard checks verified skip-link focus, Learn locator state, route-heading focus, Capitals' country/capital cycle, Puzzle placement, filter activation, and Help focus entry/Escape/return. A long Central African Republic station at doubled text size was checked for overlap with Skip/navigation. These are scoped results, not a whole-site assistive-technology certification.
The targeted Capitals browser regression also passed 407 assertions at 430px.
