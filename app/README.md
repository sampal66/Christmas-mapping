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
  under its name without the extension (`photo-1.jpg` → `photo-1`). Expected names: `master-mix`, `family-photo`, `photo-1…6`,
  `narration-*`. The list shows sizes, a delete button and storage used.
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
- **Family constellation:** the finale turns one media-pack photo whose name starts with `family` (e.g.
  `family-photo.jpg`) into star points on the iPad. Without it, a heart-shaped constellation is used.
- Hide the controls with **Hide ✕**. Tap the top-left corner to bring them back. Keys: `1/2/3` switch modes,
  `h` toggles the controls, the arrows nudge.

Run locally: `cd app && python3 -m http.server 8000`, then open http://localhost:8000.
