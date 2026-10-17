# Publish PICLAB on GitHub Pages

This build is a static website and can be published without a backend.

## 1. Create the repository

Create a repository on GitHub. For a free GitHub account, use a public repository for GitHub Pages publishing.

## 2. Upload the correct files

1. Download and extract `PICLAB_CROSS_DEVICE_READY.zip`.
2. Open the extracted `PICLAB` folder.
3. Upload the **contents of that folder** to the repository root, not the outer `PICLAB` folder itself.
4. Check that `index.html`, `manifest.webmanifest`, `service-worker.js`, `css/`, `js/`, `assets/` and `.nojekyll` are directly visible at the root.
5. Commit the files to the `main` branch.

## 3. Enable Pages

In the repository, open **Settings → Pages**. Under the build/deployment source, choose **Deploy from a branch**, select `main` and `/(root)`, then save. Wait for GitHub Pages to display the published URL.

## 4. Verify on devices

Open the published URL on a desktop, a tablet and a phone. On the first visit, keep the device online and allow the page to finish loading so the service worker can cache the app shell and bundled learning resources. Reload once after the first visit.

- **Android/Chromium browsers:** use the browser menu or the Settings install button to install PICLAB when the browser offers installation.
- **iPhone/iPad:** open the site in Safari, tap Share, then tap **Add to Home Screen**. Open PICLAB online once before relying on its cached offline resources.

## 5. Updates and limitations

When you later update files, change the `CACHE_VERSION` string at the top of `service-worker.js` before publishing, so existing installs replace their offline cache. GitHub Pages does not apply the `_headers` file or Vercel response-header configuration; use a host that supports response headers if those headers are required.

The website can be opened through its public URL from other devices, but XP, profile and learning progress are stored in each device/browser separately. To move progress manually, use **Settings → Export Session to JSON File** on the source device and **Import Session from JSON** on the destination device. Automatic cross-device synchronisation needs a backend and user authentication; this static release does not provide it.
