/* PICLAB offline app shell. Bump CACHE_VERSION whenever static assets change. */
const CACHE_VERSION = 'pic18f4520-only-2026-10-17-v1';
const SCOPE_TOKEN = new URL(self.registration.scope).pathname.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'root';
const CACHE_PREFIX = `piclab-${SCOPE_TOKEN}-shell-`;
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/components.css",
  "./css/device-support.css",
  "./css/design-system.css",
  "./css/main.css",
  "./css/pico.css",
  "./css/responsive.css",
  "./css/theme-polish.css",
  "./js/app.js",
  "./js/core/deviceManager.js",
  "./js/core/eventBus.js",
  "./js/core/security.js",
  "./js/core/state.js",
  "./js/core/storage.js",
  "./js/data/devices.js",
  "./js/data/experiments.js",
  "./js/data/lessons.js",
  "./js/data/peripherals.js",
  "./js/data/pins.js",
  "./js/data/registerExtensions.js",
  "./js/data/registers.js",
  "./js/pico/dialogue.js",
  "./js/pico/hints.js",
  "./js/pico/pico.js",
  "./js/pico/reactions.js",
  "./js/ui/modal.js",
  "./js/ui/navigation.js",
  "./js/ui/search.js",
  "./js/ui/theme.js",
  "./js/ui/views/challengesView.js",
  "./js/ui/views/helpView.js",
  "./js/ui/views/labDetailView.js",
  "./js/ui/views/labsView.js",
  "./js/ui/views/learnNotesView.js",
  "./js/ui/views/learningView.js",
  "./js/ui/views/lessonDetailView.js",
  "./js/ui/views/overviewView.js",
  "./js/ui/views/pinoutView.js",
  "./js/ui/views/placeholderViews.js",
  "./js/ui/views/progressView.js",
  "./js/ui/views/quizView.js",
  "./js/ui/views/registerView.js",
  "./data/faq.json",
  "./data/quiz.json",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/piclab-192.png",
  "./assets/icons/piclab-512.png",
  "./assets/icons/piclab-icon.svg",
  "./assets/images/trivia/adc.svg",
  "./assets/images/trivia/clock.svg",
  "./assets/images/trivia/memory.svg",
  "./assets/images/trivia/multiply.svg",
  "./assets/images/trivia/timer.svg",
  "./assets/images/trivia/uart.svg",
];
const scopedUrl = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urls = APP_SHELL.map(scopedUrl);
    // Cache each asset independently so one optional asset cannot block installation.
    const results = await Promise.allSettled(urls.map((url) => cache.add(url)));
    const failures = results.map((result, index) => result.status === 'rejected' ? urls[index] : null).filter(Boolean);
    if (failures.includes(scopedUrl('./index.html')) || failures.includes(scopedUrl('./js/app.js'))) {
      throw new Error(`Required PICLAB app-shell files failed to cache: ${failures.join(', ')}`);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(scopedUrl('./index.html'), response.clone());
        }
        return response;
      } catch {
        const cachedPage = await caches.match(scopedUrl('./index.html'));
        return cachedPage || new Response('PICLAB is offline and its app shell has not been cached yet. Reconnect and open the site once.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // Static-first gives fast repeat visits and makes bundled app data available offline.
  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('This PICLAB resource is not available offline yet.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
