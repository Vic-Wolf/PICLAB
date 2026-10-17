# PICLAB User-Friendliness Feature Update

This update applies additive changes to the existing PICLAB project. It retains the Vanilla JS/HTML/CSS stack, PIC18F4520 target, dark-only theme, existing state store/navigation, all ten experiments, YouTube links, search engine, and service worker.

## Updated files
- `js/ui/views/registerView.js` — eight-bit register controls, live hex/decimal/binary values, active bit state summaries, datasheet reference.
- `js/ui/views/pinoutView.js` — peripheral configuration wizard, pin highlighting, duplicate-pin conflict detection, XC8 initialization snippet and copy action.
- `js/ui/views/labDetailView.js` — source line numbers, exact-source copy, `.c` download, theory glossary and datasheet links.
- `js/ui/views/lessonDetailView.js` — lesson code line numbers, glossary tooltips, datasheet reference links.
- `js/app.js` — `/`, `Ctrl+K`, `Cmd+K`, and Escape keyboard handling.
- `index.html` — visible keyboard shortcut legend.
- `css/components.css` — responsive and accessible styles for the new controls.
- `tests/usability-features.test.js` — regression tests for the added features.

## Verification
- `npm test`: 33 tests passed.
- `npm run check`: predeploy check passed, including JavaScript syntax, relative imports, PWA precache assets, duplicate IDs, local assets, PIC18F4520 device data, and hosting security headers.

The checks are automated static/render tests. A live visual browser pass at every requested viewport size was not available in this environment, so the CSS includes responsive safeguards but pixel-perfect behavior at 320, 375, 768, 1024, and 1440 px should still be checked in a browser before release.

Generated peripheral code is a starting template, not a substitute for validating oscillator frequency, baud rate, analog configuration, electrical limits, and device configuration bits against the exact PIC18F4520 datasheet and project clock.
