# Christmas Mapper (v0)

A browser-based projection-mapping tool for the iPad. It has no build step: plain HTML, CSS and ES modules.

- **Calibrate**: pick a zone, then drag its 4 corners onto the real object (wall, backdrop, sideboard front,
  gift boxes, tree, star, right-wall strip). The tree also has an editable outline ("Edit outline").
  Tap a handle, then use the arrows for 1/2/10 px nudges. Changes save automatically on the device.
- **Test**: grid / full white / per-zone colours, for checking coverage and light spill.
- **Demo**: placeholder effects (snow, stars, tree colour waves, gift boxes, edge chase, star glow) to prove the pipeline.
- **Show**: Play/Pause, Restart, seek bar, jump to scene, **Continue** (releases a hold point), **Bluetooth audio
  delay** slider with a **sync test** (beep + flash once a second: move the slider until they match), and
  music from `master-mix` in the media pack (silent clock when it's missing). It shows a pre-show starfield until Play. Keys: `4` Show, space
  play/pause, `c` continue.
- **Media pack**: add private files (family photos, narration, the final mix) from the Files app. Each is stored
  under its name without the extension (`photo-1.jpg` → `photo-1`). Expected names: `master-mix` (the show soundtrack) and
  `music-box-loop` (pre-show music). The list shows sizes, a delete button and storage used.
  **Personal files never leave the device**: they live in the browser's IndexedDB on the iPad, are never uploaded,
  and must never be committed (the repo is public; `.gitignore` blocks `media/`, `*.private.*`, `assets/private/`).
- **Offline**: a service worker (`sw.js`) caches the app after the first visit, so it opens with no Wi-Fi. Use
  Share → **Add to Home Screen** for a fullscreen app. After changing any app file, bump `VERSION` in `sw.js`.
- **Room model** (`model.html`, linked under Layout file): a metric model of the stage and projector.
  It shows the projector, top and side views, whether the projector covers everything (throw ratio), and editable
  measurements. "Use in Mapper" loads zones generated from the model. The default zones also come from it.
- **Room photo preview**: put a photo of the wall behind the zones. The photo stays on the device and is never uploaded.
- **Layout file**: export/import the calibration as JSON.
- Scenes live in `js/scenes/` (running order and hold points in `js/scenes/index.js`); effects in `js/fx/`, colours in
  `js/palette.js`. Show also has **Cut ⏭** (jump to the current scene's `cut` cue, for the on-the-night cut list), a
  **Finale: projected star** checkbox (live-moment fallback) and an fps/draw-time readout.
- **Performance valves** (only if the fps readout drops on the wall): open the app once as
  `index.html?perf=portrait,toys,fireworks` (any of the three, or `all`). The choice is saved on the iPad, so the
  home-screen icon keeps it; `?perf=none` turns them off again. `portrait`: s10 family portrait 4,877 → 3,500 lights;
  `toys`: a third fewer s04 objects per toss wave; `fireworks`: a third fewer s10 shells (details in `js/perf.js`).
- **Gift-box tower:** the small box stands on the big one. Each box has two zones to calibrate, its front and its
  left side (`Gift box 1 · front`, `Gift box 1 · side`, …), so effects wrap round the corner.
- **Family portrait:** built in. The finale forms a star-swarm portrait of the family from light points in
  `js/scenes/family-portrait.js` (made once from a family photo with `tools/portrait.js`; the photo is not in the repo).
  No media-pack photo is needed.
- Hide the controls with **Hide ✕**. Tap the top-left corner to bring them back. Keys: `1/2/3` switch modes,
  `h` toggles the controls, the arrows nudge.

Run locally: `cd app && python3 -m http.server 8000`, then open http://localhost:8000.
