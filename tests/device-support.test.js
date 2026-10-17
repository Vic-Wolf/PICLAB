import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('responsive header keeps MCU selection and search available on phones', () => {
  const html = read('index.html');
  const css = read('css/device-support.css');
  assert.match(html, /device-target-label">PIC18F4520</);
  assert.doesNotMatch(html, /PIC18F4550|PIC18F45K22/);
  assert.match(html, /id="header-search-btn"/);
  assert.match(html, /href="css\/device-support\.css"/);
  assert.match(css, /@media \(max-width: 768px\)/);
  assert.match(css, /\.header-center\s*\{[^}]*display:\s*flex\s*!important/s);
  assert.match(css, /\.app-sidebar\s*\{[^}]*top:\s*calc\(var\(--piclab-mobile-header-height\)/s);
  assert.match(html, /aria-controls="app-sidebar"/);
  assert.match(html, /aria-expanded="false"/);
});

test('PWA manifest is installable and its icons exist', () => {
  const html = read('index.html');
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
  for (const icon of manifest.icons) {
    assert.ok(existsSync(resolve(root, icon.src.replace(/^\.\//, ''))), `missing manifest icon ${icon.src}`);
  }
  assert.ok(existsSync(resolve(root, 'assets/icons/apple-touch-icon.png')));
});

test('offline service worker caches app shell, modules, styles, icons and data', () => {
  const sw = read('service-worker.js');
  for (const asset of [
    './index.html', './manifest.webmanifest', './css/device-support.css',
    './js/app.js', './js/ui/navigation.js', './data/quiz.json',
    './assets/icons/piclab-192.png', './assets/icons/piclab-512.png'
  ]) assert.ok(sw.includes(`"${asset}"`), `service worker must precache ${asset}`);
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.match(sw, /caches\.match\(scopedUrl\('\.\/index\.html'\)\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  const shell = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  assert.ok(shell, 'service worker must declare a static app-shell list');
  const assets = [...shell[1].matchAll(/["'](\.\/[^"']+)["']/g)].map(match => match[1]);
  assert.ok(assets.length >= 50, 'app shell should include the bundled learning modules and resources');
  for (const asset of assets) {
    assert.ok(existsSync(resolve(root, asset.replace(/^\.\//, ''))), `missing offline asset ${asset}`);
  }
});

test('touch targets, iPhone viewport, and standalone install controls are present', () => {
  const html = read('index.html');
  const css = read('css/device-support.css');
  const app = read('js/app.js');
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /id="install-app-btn"/);
  assert.match(css, /@media \(pointer: coarse\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /100dvh/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(app, /beforeinstallprompt/);
  assert.match(app, /Add to Home Screen/);
  assert.match(app, /serviceWorker\.register/);
});

test('mobile navigation drawer toggles accessibility state and keyboard isolation', async () => {
  const { navigationController } = await import('../js/ui/navigation.js');
  const attributes = {};
  const makeClassList = () => {
    const items = new Set();
    return {
      add: name => items.add(name),
      remove: name => items.delete(name),
      contains: name => items.has(name),
      toggle: (name, force) => {
        const next = force === undefined ? !items.has(name) : Boolean(force);
        if (next) items.add(name); else items.delete(name);
        return next;
      }
    };
  };
  let focused = false;
  const sidebar = {
    classList: makeClassList(), inert: true,
    querySelector: () => ({ focus: options => { focused = options?.preventScroll === true; } })
  };
  const backdrop = { classList: makeClassList() };
  const toggle = { setAttribute: (key, value) => { attributes[key] = value; } };
  const priorWindow = globalThis.window;
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  navigationController.sidebarContainer = sidebar;
  navigationController.backdrop = backdrop;
  navigationController.mobileToggleBtn = toggle;

  try {
    navigationController.toggleMobileNav();
    assert.equal(sidebar.classList.contains('mobile-open'), true);
    assert.equal(sidebar.inert, false);
    assert.equal(backdrop.classList.contains('active'), true);
    assert.equal(attributes['aria-expanded'], 'true');
    assert.equal(attributes['aria-label'], 'Close navigation menu');
    assert.equal(focused, true);

    navigationController.closeMobileNav();
    assert.equal(sidebar.classList.contains('mobile-open'), false);
    assert.equal(sidebar.inert, true);
    assert.equal(backdrop.classList.contains('active'), false);
    assert.equal(attributes['aria-expanded'], 'false');
    assert.equal(attributes['aria-label'], 'Open navigation menu');
  } finally {
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    navigationController.sidebarContainer = null;
    navigationController.backdrop = null;
    navigationController.mobileToggleBtn = null;
  }
});
