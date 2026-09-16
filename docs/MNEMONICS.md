# Experimental Puzzle memory sketches

All 17 independently configurable candidates live in `lib/mnemonics.mjs`, in
`mnemonicCandidates`. Each has `enabled`, `review` (`Keep`, `Revise`, or `Remove`),
`units`, `caption`, `motion`, optional `decoration`, and `duration` in milliseconds.
All begin enabled and marked **Revise**, pending visual review. Set `enabled:false`
or `review:'Remove'` to suppress one without changing the Puzzle engine.

Candidates: Cameroon bird; Sierra Leone ball; Gabon Texas-like/star; Botswana boat;
Zambia split lobes; Somalia horn; Eritrea elephant/trunk; Burkina Faso turned bird;
Guinea wig; Niger fish; Congo/DRC pair; Sudan/South Sudan pair; Mozambique/Madagascar
M; Senegal/Gambia hug; South Africa/Lesotho/Eswatini nesting; Ethiopia snout;
Namibia reaching arm. Ethiopia's deliberately tentative analogy is individually
switchable like every other candidate.

These are **memory sketches**, not scientific claims about country shapes. Copies
of existing polygons appear in a small, clearly marked card on the map. Decorative
lines suggest the analogy; they are not edits to the actual geography. Relationship
groups use a common scale and translation so canonical size/orientation/position
are preserved at rest. Their movement rejoins the original alignment. Individual
sketches don't mark the destination; relationship sketches intentionally teach
relative locations. Zambia uses two clipped copies to suggest its lobes.

A sketch plays on first explicit card selection or drag per country per Reset.
It does not play just because the next country becomes current automatically.
Repeat picks remain quiet. Relationship sketches can be triggered by either/any
member. Duration is 1.3 seconds, with motion ending before dismissal. Reduced
motion uses the same static sketch/caption with no Web Animations. Overlays and
their descendants have `pointer-events:none` and cannot intercept input.

Changing countries/filters, placement attempts, Reset, cancellation, lost active
pointer capture, Escape, scrolling/blur, mode navigation, and answer preview clear
the overlay and cancel its animation/timer. Reset also clears first-pick history.
The player never writes canonical SVG paths or touches score/drop validation.

Preview candidates by selecting their cards after Reset. The focused browser
regression at `tests/mnemonics-browser.html` verifies every candidate, cleanup,
reduced-motion behavior, canonical paths, and concurrent dragging. This is a
static dependency-free SVG/Web Animations implementation.
