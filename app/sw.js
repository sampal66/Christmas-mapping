// Service worker: cache-first app shell so the show opens with no network on show night.
// Bump VERSION whenever any shell file changes, or the iPad keeps serving the old copy.
// The smoke test fails if a .html/.css/.js file in app/ is missing from SHELL.
// Media-pack files live in IndexedDB, not here, and never go over the network.
const VERSION = 'v9';
const CACHE = `christmas-mapper-${VERSION}`;
const SHELL = [
  './',
  'index.html',
  'model.html',
  'beats.html',
  'style.css',
  'manifest.webmanifest',
  'icon.svg',
  'icon-180.png',
  'icon-512.png',
  'js/main.js',
  'js/beats-tool.js',
  'js/scenes/beatmaps.js',
  'js/audio.js',
  'js/effects.js',
  'js/homography.js',
  'js/layout.js',
  'js/media.js',
  'js/model-store.js',
  'js/model-view.js',
  'js/timeline.js',
  'js/stage-model.js',
  'js/palette.js',
  'js/fx/index.js',
  'js/fx/util.js',
  'js/fx/cues.js',
  'js/fx/sky.js',
  'js/fx/lines.js',
  'js/fx/tree.js',
  'js/fx/bursts.js',
  'js/fx/stage.js',
  'js/fx/transitions.js',
  'js/fx/title.js',
  'js/fx/constellations.js',
  'js/fx/points3d.js',
  'js/fx/fireworks3d.js',
  'js/fx/megatree.js',
  'js/fx/atlas.js',
  'js/fx/cosmos.js',
  'js/fx/stars.js',
  'assets/atlas/orion.png',
  'assets/atlas/canisMajor.png',
  'assets/atlas/canisMinor.png',
  'assets/atlas/felis.png',
  'js/scenes/index.js',
  'js/scenes/common.js',
  'js/scenes/placeholder.js',
  'js/scenes/star-story.js',
  'js/scenes/s00-preshow.js',
  'js/scenes/s01-wall-wakes.js',
  'js/scenes/s02-tree-alive.js',
  'js/scenes/s04-magic-boxes.js',
  'js/scenes/s06-constellations.js',
  'js/scenes/s09-real-star.js',
  'js/scenes/s10-finale.js',
  'fonts/mountains-of-christmas-latin-700-normal.woff2',
  'fonts/playfair-display-latin-400-italic.woff2',
  'fonts/playfair-display-latin-400-normal.woff2',
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
