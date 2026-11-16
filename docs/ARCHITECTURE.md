# Architecture — Christmas Mapping Show

> How the system is built and how the parts connect. Living document; record decisions in §07.
> Related: [PRD](PRD.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [AGENTS](AGENTS.md)

| | |
|---|---|
| **Status** | v1 — Mapper v0 built; timeline, audio, media pack and export designed, not yet built |
| **Last updated** | 2026-11-16 |

---

## 01 · System overview

```
 ┌──────────── content creation (cloud) ────────────┐        ┌──────────── show night (home) ────────────┐
 │ Claude cloud session ── code, scenes, docs        │        │                                            │
 │ ElevenLabs ── narration, sfx, music, char. art    │  git   │  iPad Air 5 · Safari                       │
 │ Public-domain sources ── carol recordings          │ ─────▶ │   Mapper app (GitHub Pages, offline cache) │
 │ tools/ ── smoke tests, MP4 export (headless)       │ Pages  │   + media pack (local, IndexedDB)          │
 └───────────────────────────────────────────────────┘        │      │ USB-C→HDMI          │ Bluetooth      │
                                                              │      ▼                     ▼                │
                                                              │  HAPPRUN H1 projector   Samsung soundbar    │
                                                              │      ▼                                      │
                                                              │  wall · sideboard · boxes · tree · star     │
                                                              └────────────────────────────────────────────┘
```

## 02 · Tech stack

| Layer | Choice | Why |
|---|---|---|
| App | **Vanilla HTML/CSS + ES modules**, no build step, no runtime dependencies | edit from an iPad, nothing to install, easy to host |
| Warping | **CSS `matrix3d` homography** on one `<canvas>` per zone | GPU-composited in Safari, simple, precise |
| Drawing | Canvas 2D per zone (effects, sprites, video frames) | enough for 2D animation at 1080p |
| Audio | HTML `<audio>` (one master track) + Web Audio for effect previews | the audio clock drives the show |
| Storage | `localStorage` (calibration), IndexedDB (media pack) | per-device, private, offline |
| Hosting | GitHub Pages via Actions (`.github/workflows/pages.yml`) | free; deploys `app/` from `main` |
| Tests | Playwright + preinstalled Chromium (`tools/smoke-test.js`) | headless check from cloud sessions |
| Export | Headless Chromium frame stepping + ffmpeg (planned) | deterministic 1080p MP4 backup |
| Content AI | ElevenLabs (TTS, music, sfx, image/video), via the MCP connector | one place for credits |

## 03 · Project structure

```
christmas-mapping/
├─ CLAUDE.md                 entry point for Claude sessions → docs/AGENTS.md
├─ README.md
├─ docs/
│  ├─ PRD.md                 what and why
│  ├─ DESIGN_SYSTEM.md       look, sound, safety rules
│  ├─ ARCHITECTURE.md        this file
│  ├─ AGENTS.md              rules for AI agents
│  ├─ PLAN.md                timeline and room notes
│  └─ SCRIPT.md              (planned) Spanish narration script with {BABY} placeholder
├─ app/                      the Mapper web app (deployed as-is)
│  ├─ index.html, style.css
│  └─ js/
│     ├─ main.js             UI, modes, handles, render loop
│     ├─ homography.js       quad ↔ rectangle math, CSS matrix3d
│     ├─ layout.js           default zones, stage size
│     ├─ effects.js          calibration pattern and demo effects
│     ├─ (planned) timeline.js   scene scheduler, hold points, clock
│     ├─ (planned) audio.js      master track, delay offset
│     ├─ (planned) media.js      media pack import (IndexedDB)
│     └─ (planned) scenes/       one module per scene (s00-preshow.js … s10-finale.js)
├─ assets/                   (planned) non-personal art, PD music, sfx
├─ tools/
│  ├─ smoke-test.js          headless app test
│  └─ (planned) export-mp4.js
└─ .github/workflows/pages.yml
```

## 04 · Core concepts

### 4.1 Stage and zones
- **Stage:** a fixed logical canvas of **1920 × 1080** (projector native), scaled to fit the window.
- **Zone:** a region mapped onto one physical surface. Each zone owns an offscreen-sized canvas (`res`),
  drawn in its own flat coordinates, then warped onto its `quad` with a homography.
- **Draw order:** the `layout.zones` array order (bottom → top).
  - `occlude: true` fills the zone's mask black first, so light from lower zones doesn't spill onto that object.
  - `mask` is an optional polygon in unit coordinates (0..1) of the zone; drawing is clipped to it (e.g. the tree).

### 4.2 Layout file (calibration), `version: 1`
```json
{
  "version": 1,
  "audioOffsetMs": 0,
  "zones": [
    { "id": "tree", "label": "Tree", "color": "#aed581", "res": [768, 1024],
      "quad": [[185,37],[849,37],[849,1080],[185,1080]],
      "occlude": true, "mask": [[0.5,0],[0.6,0.18], "..."], "hidden": false }
  ]
}
```
- Saved to `localStorage["christmas-mapping.layout.v1"]` on every change. Exportable as `mapping-layout.json`.
- The JSON contains no personal data, so it's safe to commit as `assets/layouts/dining-room.json` after calibration.

### 4.3 Modes
| Mode | What renders | Handles |
|---|---|---|
| Calibrate | ID-coloured grid and label per zone; tree outline | corners, move, mask points; arrow nudge |
| Test | grid / white / zone colours | — |
| Demo | `demoEffects[zoneId]` placeholder effects | — |
| Show *(planned)* | timeline scenes, synced to audio | — |

### 4.4 Timeline engine (planned, M5–M7)
```js
// scenes/s02-tree.js
export default {
  id: 's02-tree', start: 60.0, duration: 90.0,      // seconds on the master track
  zones: ['tree', 'star', 'wall'],
  enter(ctx) {},                                    // preload sprites
  draw(zoneId, ctx2d, w, h, t, local) {},           // t = show time, local = t - start
};
```
- **Clock:** `showTime = audio.currentTime + audioOffsetMs / 1000`. Every frame, each active scene draws the
  zones it owns. Zones without an active scene render black.
- **Hold points:** `{ at: 640.0, loop: [632.0, 640.0] }`. The audio and visuals loop that segment until the
  operator taps **Continue** (live star moment).
- **Operator controls:** Play, Pause, Restart, Jump to scene, Continue (hold), audio-delay slider (±500 ms).
  A test tone and flash help set the delay by eye and ear.

### 4.5 Media pack (planned, M8)
- Personal files (family photos, narration WAVs that say the baby's name, the final mix) are **never in git**.
- They are imported on the iPad via `<input type="file" multiple>` and stored in IndexedDB as Blobs, keyed by
  logical name (e.g. `photo-1`, `narration-s01`, `master-mix`). Scenes request media by name, with a placeholder
  fallback when it's missing.

### 4.6 MP4 export (planned, M10)
- `tools/export-mp4.js` loads the app in headless Chromium with `?render=1&layout=<json>`. It replaces the
  clock with a deterministic frame counter (30 or 60 fps), captures each stage frame, and pipes it to ffmpeg
  with the master audio.
- Output: `show-1080p.mp4` for iPad Files playback or a USB stick in the projector.

## 05 · Data flow (show night)

1. Open the app (cached) → load the layout from `localStorage` → load the media pack from IndexedDB.
2. The operator checks calibration (Test → White) and sets the audio delay.
3. Show → Play: the audio clock starts, and scenes render into the zones.
4. At the hold point, the show loops softly until Continue. The live star moment happens.
5. Finale → end card → pre-show loop.

## 06 · Scalability and reuse
- The app is content-agnostic: new walls are just new `layout` files, and new shows are new `scenes/` folders.
- **WebGL path (future):** if Canvas 2D can't hold 60 fps on the iPad, swap per-zone canvases for a single WebGL
  renderer that does the warp in shaders (same layout file).
- **Auto-calibration (future):** project a Gray-code pattern and photograph it with the iPad camera.

## 07 · Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-11-16 | Vanilla JS, no build | iPad-only development; zero tooling |
| 2026-11-16 | CSS `matrix3d` warping instead of WebGL (for now) | simpler, GPU-composited, enough for 8 zones |
| 2026-11-16 | Audio element as master clock | sync stays correct even if frames drop |
| 2026-11-16 | Personal media in IndexedDB, not git | the repo is public |
| 2026-11-16 | GitHub Pages from `main` | free hosting for a public repo |
| 2026-11-16 | Public-domain recordings for carols | saves ElevenLabs credits; legal clarity |

## Changelog
- **2026-11-16** — v1: documented Mapper v0 as built; designed timeline, media pack and export.
