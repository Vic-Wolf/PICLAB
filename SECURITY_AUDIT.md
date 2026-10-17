# PICLAB Security & Release Audit

**Audit date:** 2026-10-12  
**Build:** PICLAB deployment candidate based on V6 UI / static educational site  
**Assessment type:** Source review, static checks, automated unit/regression tests, data-integrity checks, view-render smoke tests and a focused Chromium DOM smoke test for Challenges  
**Status:** Release candidate with documented limitations — **not an independent penetration test**

## Executive summary

PICLAB is a static HTML/CSS/JavaScript educational website. It has no backend API, server-side authentication, payment handling or database. The reviewed code now has additional input/output safeguards, regression tests and static-host security-header configuration.

The final checks completed in this environment:

- `npm test`: **16 tests passed, 0 failed**.
- `npm run check`: **passed**; 34 JavaScript files were syntax-checked, relative imports resolved, required local assets existed, static HTML IDs were unique, device data passed structural checks, and deployment header configuration was found.
- Render smoke tests: Learn, Pinout, Registers, Challenges, all 10 experiment detail pages, and navigation exclusions were checked at the module-render level.
- Challenges interaction smoke test in Chromium: **passed** using the actual challenge view, state store, event bus and escaping helper in an isolated DOM harness. It verified all 53 cards render, a challenge opens, wrong/correct answer feedback appears, the dynamically created Claim XP button works, XP is awarded once, completed challenges cannot farm XP, and no browser runtime errors occur.
- Dataset integrity: the sole supported target is PIC18F4520; its 40-pin map and curated SFR data passed structural checks.
- Secret-pattern scan: no common embedded cloud/API/private-key formats were detected in scanned project source/data files.

A full interactive browser end-to-end run against the complete site on a served or deployed origin was not performed. The Chromium check was limited to the Challenges flow in an isolated DOM harness. This report does not claim that live deployment testing or a professional penetration test was performed.

## Security controls reviewed or added

### Input and DOM rendering

- Added `escapeHtml` helpers and applied them to profile text, search terms/results, pin searches, register searches, PICO speech, and experiment text used in HTML templates.
- PICO mood values are allow-listed and speech text is bounded before rendering.
- Profile fields strip control characters and are length-limited.
- Local-state imports treat JSON as untrusted: malformed or oversized backups are rejected; IDs, strings, numerical values, device IDs, theme, SFR values, XP and progress fields are normalized.
- State path and object merge paths reject prototype-pollution keys (`__proto__`, `prototype`, `constructor`).
- New-tab external links in JavaScript-rendered pages were checked for `rel="noopener"` protection.

### State and gamification integrity

- Device switches now rebuild register state from the active device map, reset relevant values and discard stale SFRs from the previous target.
- Quiz XP awards are limited to improvement over the prior best score; replaying the same or a lower score does not farm more XP.
- Lesson completion is recorded once per lesson and topic progress is computed from completed lessons rather than increased repeatedly by clicking the completion button.
- Duplicate XP event emissions were removed from lesson/lab/challenge completion paths.
- Challenge clicks now use delegated event handling on the stable workspace, so controls created during re-render (especially Claim XP) remain functional. XP claims are guarded against duplicate awards; previously completed challenges can be reviewed without earning XP again.

### Deployment headers

- `vercel.json` and `_headers` provide Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy`.
- The CSP defaults to same-origin resources, denies objects and framing, and does not permit `unsafe-eval`.
- The CSP permits inline styles because the existing interface uses style attributes. There are no inline executable scripts in `index.html`.
- Static hosting providers differ: Vercel uses `vercel.json`; Netlify supports `_headers`; GitHub Pages does not apply `_headers`. After deployment, verify headers on the actual origin.

## Functional regression checks

The test suite includes:

1. HTML-escaping checks for dangerous markup.
2. Prototype-pollution path rejection.
3. Safe object merging.
4. Backup import normalization and numeric bounds.
5. Oversized/malformed import rejection.
6. Quiz XP replay-farming prevention.
7. Profile markup escaping.
8. PICO speech escaping and mood allow-listing.
9. Unique pin-number and SFR bit-position checks for each configured device.
10. Device switching removes stale device-specific register keys.
11. Main workspace render smoke tests.
12. Pinout has 40 contact controls and Register Explorer contains common SFRs.
13. All 10 experiments render manual sections without the removed interactive simulation section.
14. Circuit Lab / standalone Simulator are absent from primary navigation.
15. Challenge cards open a challenge, answer feedback renders, Claim XP can be clicked after it is dynamically inserted, and XP is awarded only once.
16. Challenge event delegation binds once per workspace and supports review, hint and close actions.

Run locally from the `PICLAB` directory:

```bash
npm test
npm run check
python -m http.server 8000
```

## Important limitations and residual risks

### 1. Not a penetration test

No independent tester or dynamic web application security scanner was used against a live deployment. Automated tests cannot prove the application is free of vulnerabilities. Before public launch, use a staging URL and run an approved browser/E2E suite and a reputable DAST scan such as OWASP ZAP, then review findings.

### 2. Local profile is not authentication

The “Profile ID” is a browser-local label. State is stored in `localStorage`; anyone with access to that browser profile can inspect or modify it. There is no password, account recovery, server-side access control or cross-device sync. Do not ask users for passwords or sensitive information. If real user accounts are required, implement a backend identity/data service before marketing the profile as private.

### 3. PIC18 device data coverage

PIC18F4520 is the only supported target in this build. The SFR list is a curated educational subset rather than an exhaustive device register catalogue. Verify pin multiplexing, registers, reset values, bit access rules, voltage/current limits and timing in the official Microchip PIC18F4520 datasheet before hardware design.

### 4. Simulation scope

The standalone Circuit Lab and experiment simulation controls have been removed. The pin levels shown in the Pinout Explorer are register-derived teaching indicators; they are not a circuit/electrical simulation. Experiment pages are educational manuals and are not a cycle-accurate emulator or SPICE solver.

### 5. Third-party hosting and operational controls

- Serve over HTTPS and verify response headers after deployment.
- Keep the CSP and security headers aligned with the chosen host.
- No first-party server logs, rate limiting or server-side abuse controls are applicable to this static-only version; those become necessary if APIs/accounts are added.
- No runtime third-party JavaScript dependencies were identified.
- Check institutional/manual distribution permissions before publishing content derived from supplied course manuals. PICLAB is not affiliated with Microchip; manufacturer marks and technical documentation remain their owners' property.

## Recommended pre-publication checklist

- [ ] Deploy to a private/staging URL over HTTPS.
- [ ] Verify live response headers on all routes and asset types.
- [ ] Manually walk through profile setup, theme switching, search, lesson completion, quizzes, pin filters, register bit editing, all lab routes, challenge answer flow, LocalStorage restore and backup import.
- [ ] Test current Chrome, Edge, Firefox and a mobile viewport.
- [ ] Run an approved DAST scan against the staging deployment; resolve high/critical findings.
- [ ] Have a PIC18-experienced reviewer validate the hardware-facing data before advertising it as a reference.
- [ ] Confirm the rights to redistribute all included text and assets.
- [ ] Publish only after the staging checks are complete.

## Verdict

**Suitable as a hardened static deployment candidate for controlled preview/academic use after a final staging smoke test. Not certified as “pentested” and not yet ready to be represented as an authoritative PIC18 hardware-reference tool.** The remaining blockers are independent/live security testing and validation of device-specific technical content—not the current automated regression suite.


## Cross-device readiness addendum — 2026-10-12

This release adds a dedicated responsive stylesheet and an installable PWA app shell:

- The mobile header puts device selection and global search in a second row instead of hiding them. Tablet through mid-desktop widths use a compact second-row header to avoid header clipping at intermediate widths.
- The navigation drawer now has `aria-expanded` state, an accessible label, Escape-to-close behavior, closed-state keyboard isolation on mobile, and native anchor/list semantics.
- Responsive layout overrides allow the pinout inspector to stack below the physical DIP-40 diagram. The chip diagram itself remains internally horizontally scrollable when needed.
- Viewport-height, text autosizing, iOS safe-area, modal scrolling, code wrapping, and coarse-pointer target styling were added.
- `manifest.webmanifest`, app icons and `service-worker.js` make the app installable on compatible browsers and cache the local app shell/data after a successful online visit. `CACHE_VERSION` must be bumped when deployed static assets change.
- `.nojekyll` is included for static GitHub Pages publishing.

Validation for this addendum:

- `npm test`: 21 automated tests passed.
- `npm run check`: passed, including service-worker syntax, manifest/icon references and every service-worker precache path.
- A Chromium rendered-layout harness injected the HTML produced by all 11 primary/detail views with the project CSS and checked 23 viewport widths (320, 360, 390, 430, 480, 600, 768, 769, 800, 900, 1024, 1100, 1101, 1152, 1200, 1248, 1280, 1281, 1300, 1360, 1361, 1440 and 1920 CSS pixels): 253/253 view/width combinations had no detected horizontal shell/view overflow, and the header's device/search controls remained inside the viewport.
- This layout harness was not a full run of the application's live JavaScript. Direct Chromium navigation to the local test origin was blocked by the test environment (`ERR_BLOCKED_BY_ADMINISTRATOR`), so the end-to-end navigation flow and service-worker offline behavior could not be browser-tested in that session. No physical iPhone or Android device was available for testing.

PWA/offline limits: users must first open the HTTPS-hosted site while online so the service worker can cache resources. A first visit without connectivity cannot load the site. External/un-cached content and any future server-backed feature will still require connectivity. Profile, XP and progress remain browser-local and are not automatically synchronized across devices.
