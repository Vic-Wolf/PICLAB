# PICLAB Cross-Device Readiness Report

**Assessment date:** 2026-10-12  
**Purpose:** Improve usability on phones, tablets, laptops and desktop browsers, and support installable/offline use after an initial online visit.

## Changes included

- Responsive layouts spanning 320 CSS-pixel phones through 1920 CSS-pixel desktop widths.
- A two-row small-screen/medium-screen header that retains device selection and global search instead of hiding them.
- Mobile navigation drawer improvements: accessible name and expanded state, Escape-to-close, keyboard focus management, and navigation semantics.
- Touch-friendly controls, safe-area handling, responsive modal scrolling, improved text/code wrapping, and an adaptive PIC18 pinout view that stacks the inspector under the diagram on narrower screens.
- Progressive Web App manifest, icons, install/Add to Home Screen affordance, and a service worker that caches the static application shell and bundled runtime assets for repeat/offline use.
- GitHub Pages deployment instructions and `.nojekyll`.
- README/security audit notes explaining offline behavior and cross-device progress limitations.

## Validation results

- `npm test`: 21 automated tests passed.
- `npm run check`: passed. The check covers JavaScript and service-worker syntax, relative imports, manifest/icon references, service-worker precache paths, duplicate IDs, local assets, device data and hosting security-header configuration.
- Chromium responsive layout harness: 253/253 combinations passed across 11 primary/detail views and 23 viewport widths (320, 360, 390, 430, 480, 600, 768, 769, 800, 900, 1024, 1100, 1101, 1152, 1200, 1248, 1280, 1281, 1300, 1360, 1361, 1440, 1920 CSS pixels). It detected no horizontal overflow of the tested application shell/views and confirmed mobile device/search controls remain within the viewport.

## What is not certified

- The Chromium harness rendered real view markup with the CSS, but it did not execute a full live-origin end-to-end journey through the entire app JavaScript. Direct navigation to the local test server was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- Service-worker caching/offline behavior has not been browser-tested end-to-end in this environment.
- No physical iPhone, iPad or Android device test was performed. Responsive layout coverage is not a substitute for hardware/browser testing.
- This is not an independent penetration test or security certification.

## Deployment and access limits

Publish the contents of the `PICLAB` folder to an HTTPS static host, following `GITHUB_PAGES_DEPLOYMENT.md` for GitHub Pages. A first successful online visit is required before offline app-shell caching can work. Offline availability is limited to cached app assets and bundled content; a first visit without internet and any future live/server-backed features require connectivity.

Profile, XP and progress remain in the local browser storage on each device. They do **not** sync automatically between PC and phone. Users can use the existing export/import backup functionality to move data manually; automatic synchronization would require a separate authenticated backend.

For future static-asset updates, increment `CACHE_VERSION` near the top of `service-worker.js` so existing installs refresh their caches. GitHub Pages does not apply repository `_headers` or Vercel `vercel.json` response-header configuration; deployment-specific security headers depend on the chosen host.
