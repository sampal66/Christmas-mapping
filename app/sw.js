// Service worker: cache-first app shell so the show opens with no network on show night.
// Bump VERSION whenever any shell file changes, or the iPad keeps serving the old copy.
// The smoke test fails if a .html/.css/.js file in app/ is missing from SHELL.
// Media-pack files live in IndexedDB, not here, and never go over the network.
const VERSION = 'v1';
const CACHE = `christmas-mapper-${VERSION}`;
const SHELL = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'icon.svg',
  'icon-180.png',
  'icon-512.png',
  'js/main.js',
  'js/audio.js',
  'js/effects.js',
  'js/homography.js',
  'js/layout.js',
  'js/media.js',
  'js/timeline.js',
  'js/scenes/index.js',
  'js/scenes/s00-test-a.js',
  'js/scenes/s00-test-b.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('christmas-mapper-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      // Files added after install (e.g. a new scene before VERSION is bumped) are cached on first use.
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
