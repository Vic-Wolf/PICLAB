# PICLAB

PICLAB is a static, browser-based educational website for learning the Microchip PIC18 family. It includes structured lessons, a device-aware pin explorer, SFR/register inspection, ten experiment-manual pages, PICO guidance, challenges, quizzes, and local progress tracking.

## Run locally

Requires Python 3 or another static HTTP server. Do not open `index.html` directly because PICLAB uses JavaScript ES modules.

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.



## Cross-device and offline use

PICLAB uses a responsive application shell for phones (including narrow 320px screens), tablets, laptops and desktops. The mobile header identifies the fixed PIC18F4520 target and exposes global search, and the navigation drawer supports touch, keyboard, Escape-to-close and focus handling. The interface includes iOS safe-area support and touch-sized controls.

PICLAB is also configured as an installable Progressive Web App (PWA). Deploy it on an HTTPS static host (GitHub Pages, Vercel or Cloudflare Pages), visit it online at least once so the service worker can cache the app shell, and then use **Settings → Install / Add to Home Screen**. On iPhone/iPad, open the site in Safari, tap Share, then choose **Add to Home Screen**. Cached app files and bundled learning content can be available offline after the first successful visit; features that require uncached resources or a live connection cannot be guaranteed offline. After changing static files in a deployment, bump `CACHE_VERSION` in `service-worker.js` so browsers refresh the offline cache.

**Important:** The live website can be opened from any device with its public URL, but learning progress, profile and XP remain stored in each browser's LocalStorage. This release does not provide an online account or automatic cross-device synchronisation. Use **Settings → Export Session to JSON File** on one device and **Import Session from JSON** on another to transfer a backup manually. Automatic syncing would require a separately configured backend and authentication/database service.

## Project layout

- `index.html` — application shell
- `css/` — design system, components, responsive layouts, touch sizing and light/dark themes
- `manifest.webmanifest`, `service-worker.js`, `assets/icons/` — installable PWA setup and offline app-shell caching
- `js/core/` — central state, event bus, input/state validation, persistence and device management
- `js/data/` — device, pin, register, peripheral, lesson and experiment datasets
- `js/ui/` — navigation, search and workspace views
- `js/pico/` — PICO learning companion
- `assets/images/trivia/` — original PICLAB trivia illustrations
- `data/` — help/FAQ and quiz data
- `tests/` — regression/security tests
- `_headers`, `vercel.json` — recommended security headers for supported static hosts
- `GITHUB_PAGES_DEPLOYMENT.md` — publishing steps for GitHub Pages
- `.nojekyll` — serve the project as static files without Jekyll processing

## Current feature scope

The standalone Simulator and Circuit Lab have intentionally been removed. Each of the ten experiments has a dedicated internal page with aim/objectives, apparatus, theory, connections, procedure, example code, code explanations, viva questions and conclusion. The activities are learning/manual pages, not executable hardware simulation.

## Local profile and privacy

The profile, XP, quiz results and progress are stored in the current browser's LocalStorage. This is **not account authentication** and does not synchronise data between devices or users. Anyone with access to the same browser profile can inspect or edit its local data. Do not enter passwords or sensitive personal information. If a multi-user deployment is needed, add a backend authentication and database layer before presenting profiles as private accounts.

## Deployment security

This is a static front-end application with no backend API or server-side authentication. The deployment headers included in `_headers` and `vercel.json` provide defence-in-depth for supported hosts. The site contains no runtime third-party JavaScript dependencies. Validate the headers on the actual hosting platform after deployment; GitHub Pages does not apply Netlify `_headers` files. Enable HTTPS through the hosting provider.

## Testing

Run the local regression and security tests with Node.js 18+:

```bash
npm test
```

Run the source syntax/module checks with:

```bash
npm run check
```

These automated checks do not replace a professional penetration test or a live-hosting test.

## Technical references and content rights

Use the official Microchip documentation linked from Help & Docs when checking device-specific facts, register maps, electrical limits and peripheral timing. Hardware facts and Microchip marks remain subject to their owners' rights. Ensure you have permission to redistribute institution-supplied manuals/diagrams before publishing them; this distribution uses the written experiment content supplied for this project and generated PICLAB illustrations, and does not include the original manual figures.

## Original project work

PICLAB's original interface, PICO companion, learning flow, UI code and authored explanations are project work. Adapt the copyright notice and license to the actual owner before publication. This repository should not claim ownership of Microchip device facts, trademarks or third-party documentation.


## Device data coverage
PICLAB supports only the PIC18F4520. Its 40-pin DIP mapping and curated SFR set are intended for education; the SFR list is not exhaustive. Other PIC device profiles are not selectable or supported in this site.

## Release candidate security review
See `SECURITY_AUDIT.md` for tests and limitations. This package has source-level security hardening and regression tests. The Challenges interactions also passed a focused Chromium DOM smoke test; the full site has **not** undergone a live-hosting end-to-end test or an independent professional penetration test.


## Shared visual theme

PICLAB uses a shared CSS design system in `css/design-system.css`. It is intentionally framework-free: the project uses HTML, CSS and vanilla JavaScript, so it does not add React or a styled-components dependency. Shared CSS custom properties define the palette, spacing, corner radii, typography and light/dark surface colours; reusable rules apply consistent styling to cards, buttons, form controls, focus states and code. The stylesheet is loaded after the other styles and is included in the offline app shell. To adjust the site-wide theme, edit the tokens near the top of that file rather than changing individual views.
