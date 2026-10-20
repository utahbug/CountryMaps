# CountryMaps standing requirements

WCAG 2.1 Level AA is a release baseline for every current and future page, geographic dataset, shared component and activity, including Special Geography. Preserve the static GitHub Pages architecture and existing routes.

Before publishing, run automated checks and manual keyboard/focus, accessible-name/state, contrast, reduced-motion, 200% text-resize, phone (390/430), tablet and desktop checks. Use the release checklist in docs/ACCESSIBILITY.md. Automated checks alone do not establish conformance. Do not knowingly publish a new page or major interaction with an unresolved AA failure; report the affected pages and blocker instead.

Prefer shared fixes. Maintain non-drag placement, meaningful SVG names/states, semantic controls, logical focus order, focus return for popovers, live feedback, and non-color state cues. Use 44px touch targets where practical as an additional product standard. Never describe that target size as a WCAG 2.1 AA requirement.

Preserve noindex/robots during review. Publish completed, tested changes to the existing main branch/Pages site when authorized by the ongoing user workflow.
