# PICLAB Challenge Dialog Fix

## Root cause
The Challenges workspace is rendered inside `.workspace-panel`, whose fade-in animation applies a transform. A `position: fixed` descendant of a transformed element can be positioned relative to that element rather than the viewport. As a result, the diagnosis dialog appeared down the page and users had to scroll to find it.

## Fix
- Portal the challenge dialog to `document.body` after rendering, so it is positioned relative to the viewport.
- Focus the dialog with `preventScroll` to avoid an automatic page jump.
- Lock background page scrolling while the dialog is open and restore the previous overflow state when it closes or the XP claim completes.
- Keep delegated handling for dynamic answer, hint, close and Claim XP controls.
- Keep the dialog itself scrollable when its content exceeds the viewport height.

## Verification
- Automated tests: 29 passed, 0 failed.
- `npm run check`: passed (syntax, imports, local assets, PWA resources, device data and deployment configuration).
- Regression coverage checks that the challenge modal is portalled to the body, remains viewport-fixed, receives focus without scrolling, and locks background scrolling.

Physical-device and live-hosting end-to-end verification have not been performed in this environment.
