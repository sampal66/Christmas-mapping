// Service worker: cache-first app shell so the show opens with no network on show night.
// Bump VERSION whenever any shell file changes, or the iPad keeps serving the old copy.
// The smoke test fails if a .html/.css/.js file in app/ is missing from SHELL.
// Media-pack files live in IndexedDB, not here, and never go over the network.
const VERSION = 'v34';
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
  'js/idle-music.js',
  'js/model-store.js',
  'js/model-view.js',
  'js/timeline.js',
  'js/stage-model.js',
  'js/survey.js',
  'js/setup-view.js',
  'js/palette.js',
  'js/perf.js',
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
  'js/fx/curtains.js',
  'js/fx/strip.js',
  'js/fx/stars.js',
  'js/fx/toys.js',
  'js/fx/mickey-stars.js',
  'js/fx/portrait-swarm.js',
  'js/fx/pet-portraits.js',
  'js/fx/cow-portrait.js',
  'js/fx/clips.js',
  'assets/atlas/orion.png',
  'assets/atlas/canisMajor.png',
  'assets/atlas/canisMinor.png',
  'assets/atlas/felis.png',
  'assets/clips/s04-gandalf-ears.mp4',
  'assets/clips/s04-gandalf-pop.mp4',
  'assets/clips/s04-connor-tail.mp4',
  'assets/clips/s04-orion-ears.mp4',
  'assets/clips/pet-alaska-idle.mp4',
  'assets/clips/pet-alaska-lookup.mp4',
  'assets/clips/pet-alaska-talk.mp4',
  'assets/clips/pet-connor-idle.mp4',
  'assets/clips/pet-connor-lookup.mp4',
  'assets/clips/pet-connor-talk.mp4',
  'assets/clips/pet-gandalf-idle.mp4',
  'assets/clips/pet-gandalf-lookup.mp4',
  'assets/clips/pet-gandalf-talk.mp4',
  'assets/clips/pet-orion-idle.mp4',
  'assets/clips/pet-orion-lookup.mp4',
  'assets/clips/pet-orion-talk.mp4',
  'assets/clips/s03-alaska-boss.mp4',
  'assets/clips/s03-alaska-nooo.mp4',
  'assets/clips/s03-gandalf-bat.mp4',
  'assets/clips/s03-gandalf-oops.mp4',
  'assets/clips/s04-alaska-tail.mp4',
  'assets/clips/s05-connor-hide.mp4',
  'assets/clips/s05-gandalf-bells.mp4',
  'assets/clips/s07-connor-brave.mp4',
  'assets/clips/s07-connor-carry.mp4',
  'assets/clips/s07-pooh-float.mp4',
  'assets/clips/s08-gandalf-soft.mp4',
  'assets/clips/s10-alaska-wave.mp4',
  'assets/clips/s10-connor-wave.mp4',
  'assets/clips/s10-gandalf-wave.mp4',
  'assets/clips/s10-orion-wave.mp4',
  'assets/clips/s10-santa-sleigh.mp4',
  'assets/clips/pet-alaska-lookloop.mp4',
  'assets/clips/pet-connor-lookloop.mp4',
  'assets/clips/pet-gandalf-lookloop.mp4',
  'assets/clips/pet-orion-lookloop.mp4',
  'assets/clips/s03-gandalf-ready.mp4',
  'assets/clips/s05-connor-peek.mp4',
  'assets/clips/s05-orion-yawn.mp4',
  'assets/clips/s07-pooh-hold.mp4',
  'assets/clips/s07-pooh-wave.mp4',
  'assets/clips/s10-santa-swoop.mp4',
  'assets/clips/s10-santa-goodnight.mp4',
  'assets/clips/s04-nutcracker-march.mp4', 'assets/clips/s04-gingerbread-run.mp4', 'assets/clips/s08-velveteen-rabbit.mp4', 'assets/clips/s10-rabbit-wave.mp4',
  'js/scenes/index.js',
  'js/scenes/common.js',
  'js/scenes/stage.js',
  'js/scenes/family-portrait.js',
  'js/scenes/star-story.js',
  'js/scenes/s00-preshow.js',
  'js/scenes/s01-wall-wakes.js',
  'js/scenes/s02-tree-alive.js',
  'js/scenes/s03-star-escapes.js',
  'js/scenes/s04-magic-boxes.js',
  'js/scenes/s05-where-is-the-star.js',
  'js/scenes/s06-constellations.js',
  'js/scenes/s07-honey-pot.js',
  'js/scenes/s08-for-baby.js',
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
