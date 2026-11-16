# Christmas Mapper (v0)

A browser-based projection-mapping tool for the iPad. It has no build step: plain HTML, CSS and ES modules.

- **Calibrate**: pick a zone, then drag its 4 corners onto the real object (wall, backdrop, sideboard front,
  gift boxes, tree, star, right-wall strip). The tree also has an editable outline ("Edit outline").
  Tap a handle, then use the arrows for 1/2/10 px nudges. Changes save automatically on the device.
- **Test**: grid / full white / per-zone colours, for checking coverage and light spill.
- **Demo**: placeholder effects (snow, stars, tree colour waves, gift boxes, edge chase, star glow) to prove the pipeline.
- **Show**: Play/Pause, Restart, seek bar, jump to scene, **Continue** (releases a hold point), **Bluetooth audio
  delay** slider with a **sync test** (beep + flash once a second: move the slider until they match), and temporary
  music loading (the file stays on the device). It shows a pre-show starfield until Play. Keys: `4` Show, space
  play/pause, `c` continue.
- **Room photo preview**: put a photo of the wall behind the zones. The photo stays on the device and is never uploaded.
- **Layout file**: export/import the calibration as JSON.
- Scenes live in `js/scenes/` (running order and hold points in `js/scenes/index.js`).
- Hide the controls with **Hide ✕**. Tap the top-left corner to bring them back. Keys: `1/2/3` switch modes,
  `h` toggles the controls, the arrows nudge.

Run locally: `cd app && python3 -m http.server 8000`, then open http://localhost:8000.
