# Architecture — Christmas Mapping Show

> How the system is built and how the parts connect. Living document; record decisions in §07.
> Related: [PRD](PRD.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [AGENTS](AGENTS.md)

| | |
|---|---|
| **Status** | v1 — Mapper v0, timeline/audio and media pack + offline built; export designed, not yet built |
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
│  ├─ CONTROL.md             work-package board + handoff log
│  ├─ work-packages/         one self-contained brief per WP
│  ├─ PLAN.md                timeline and room notes
│  └─ SCRIPT.md              Spanish narration + pet dialogue script with {BABY} placeholder
├─ app/                      the Mapper web app (deployed as-is)
│  ├─ index.html, style.css
│  └─ js/
│     ├─ main.js             UI, modes, handles, render loop
│     ├─ homography.js       quad ↔ rectangle math, CSS matrix3d
│     ├─ layout.js           default zones, stage size
│     ├─ effects.js          calibration pattern and demo effects
│     ├─ palette.js          DESIGN_SYSTEM §03 colour tokens (rgb/rgba/mix helpers)
│     ├─ fx/                 effect library: pure (ctx, w, h, t, opts) functions, cue sheets, beat grid,
│     │                      3D point clouds (points3d.js) and 3D fireworks (fireworks3d.js)
│     ├─ timeline.js         scene scheduler, hold points
│     ├─ audio.js            master clock (audio or silent), latency, sync beep
│     ├─ media.js            media pack (IndexedDB)
│     └─ scenes/             index.js (running order + holds) + one module per scene
│  └─ fonts/                 bundled title fonts (offline) + licences
├─ assets/                   non-personal art, PD music, sfx; CREDITS.md; layouts/
├─ tools/
│  ├─ smoke-test.js          headless app test (runs flash-check.js too)
│  ├─ flash-check.js         renders every scene; fails on > 3 flashes/s or > 50% jumps; logs render cost
│  ├─ serve.js               static server shared by the tools
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
| Show | pre-show starfield → timeline scenes synced to the clock; sync test | — |

### 4.4 Timeline engine and scenes (built: WP-01 engine, WP-03 scenes)
```js
// scenes/s02-tree.js
export default {
  id: 's02-tree', start: 60.0, duration: 90.0,      // seconds on the master track
  zones: ['tree', 'star', 'wall'],
  enter(ctx) {},                                    // preload sprites
  draw(zoneId, ctx2d, w, h, t, local) {},           // t = show time, local = t - start
};
```
- **As built (WP-03):** a scene module exports `{ id, title, duration, zones, cues: [{ t, name }], enter?(), draw(zoneId,
  ctx, w, h, t, local, env) }`; `scenes/index.js` lays the starts end to end in running order, so re-timing one scene
  never moves the others by hand. `env.zone` is the zone being drawn and `env.from(otherZone, u, v)` maps a point of
  another zone into this zone's 0..1 coordinates (e.g. sparkles rising out of box 2 on the backdrop). Effects key
  off cue names through `cueSheet(cues, grid)`, so music re-timing only edits numbers. **Beat sync:** each light-show
  scene exports `beats: { bpm, perBar, offset?, times? }` and builds `beatGrid(beats)`. All motion runs on
  `grid.warp()` (a clock that surges on each beat), brightness accents use `pulse()`/`barPulse()`, progress uses
  `steps()` (one eased step per beat), and cues snap to the nearest beat. Today `bpm` is a placeholder; WP-05
  fills `times` with the real beat times of each recording (scene-local seconds), and nothing else changes. Every scene has `out`; scenes on the
  cut list have `cut` (Show panel **Cut ⏭** jumps to it). s09 declares `hold: { loop: [from, to] }`, which
  `index.js` turns into the timeline hold. s00 (pre-show) is drawn whenever the show isn't playing. Sky zones (`wall`,
  `rightStrip`) that no scene owns get the dusk starfield, never black. s10 has `options.projectedStar` (Show-panel
  checkbox, saved in `localStorage` `christmas-mapping.show.v1`) and reads one media-pack photo named `family…` to
  build the closing constellation on the device (heart-shaped fallback when it's missing).
- **Clock** (`audio.js`, `MasterClock`): `showTime = mediaTime − audioOffsetMs / 1000`. Here `audioOffsetMs` is the
  Bluetooth latency (0–500 ms) and delays the visuals. `mediaTime` comes from the `<audio>` element, or from a silent
  `performance.now()` clock when no music is loaded. Every frame, each active scene draws the
  zones it owns. Zones without an active scene render black.
- **Hold points:** `{ at: 640.0, loop: [632.0, 640.0] }`. The audio and visuals loop that segment until the
  operator taps **Continue** (live star moment).
- **Operator controls:** Play, Pause, Restart, Jump to scene, Continue (hold), audio-delay slider (±500 ms).
  A test tone and flash help set the delay by eye and ear.

### 4.5 Media pack and offline (built, M8/M9 — WP-02)
- Personal files (family photos, narration WAVs that say the baby's name, the final mix) are **never in git**
  (`.gitignore` blocks `media/`, `*.private.*`, `assets/private/`).
- They are imported on the iPad via the panel's **Media pack** section (`<input type="file" multiple>`) and stored
  by `app/js/media.js` in IndexedDB (`christmas-mapping-media`, store `files`) as Blobs keyed by logical name =
  file name without extension (`photo-1.jpg` → `photo-1`). API: `put`, `get → Blob|null`, `list`, `remove`,
  `objectUrl(name)` (cached; `null` when missing, so scenes draw a placeholder). Every call is try/catch'd and the
  panel shows a clear message when storage is blocked. The panel also shows `navigator.storage.estimate()` and asks
  for `navigator.storage.persist()` after an import.
- `master-mix`, when present, is loaded into the MasterClock at startup (and after import/delete); otherwise the
  clock runs silent. This replaces WP-01's temporary music loader.
- **Offline:** `app/sw.js` precaches the app shell (HTML, CSS, JS, manifest, icons) cache-first under a versioned
  cache name (`christmas-mapper-vN`) and deletes old caches on activate. **Bump `VERSION` in `sw.js` whenever a
  shell file changes**, or the iPad keeps the old copy. The smoke test fails if a `.html/.css/.js` file is missing
  from `SHELL`. `app/manifest.webmanifest` + icons enable "Add to Home Screen" (fullscreen, landscape).

### 4.7 Room model (built, M12)
- `app/js/stage-model.js` holds the measured stage in metres: wall, right wall, sideboard, tree (cone), star, gift
  boxes, fixtures and the projector pose and throw ratio. Data comes from [STAGE_SURVEY](STAGE_SURVEY.md).
  - **World axes:** origin = floor at the doorway jamb on the main-wall plane; x along the wall, y into the room,
    z up.
  - **Projector:** a pinhole camera, focal length = throw ratio × 1920 px, auto-aimed at the middle of the stage's
    angular extent.
  - **`layoutFromModel()`** projects each object's front plane into stage pixels and returns a normal layout:
    - zones are clipped so the handles stay inside the image
    - the tree mask is generated from the cone
    - the hidden sideboard strip starts `hidden`
  - **`coverage()`** and **`requiredThrowRatio()`** check the projector fit.
- **`layout.js` `defaultLayout()` = `layoutFromModel(loadModel())`.** Hand-written default quads are gone.
  `model-store.js` keeps the owner's edits on the device.
- **`app/model.html`** (Room model page):
  - shows a projector view, a top view and a side view
  - shows the fit (needed vs actual throw ratio) and editable numbers
  - "Use in Mapper" writes the generated zones into the saved layout
- **When the projector arrives:** enter its real distance, height and throw ratio, press "Use in Mapper", then
  fine-tune in Calibrate.
- **Limits:** front faces only (the box side faces are not zones yet). The tree and star are vertical cards facing
  the projector. Lens offset is ignored (only the field of view matters for coverage).

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
| 2026-11-16 | Repo stays public (open source); personal photos and audio stay on-device | owner decision |
| 2026-11-16 | Build in work packages, one per session | keeps context windows small (AGENTS §03a) |
| 2026-11-16 | Cache-first service worker with a hand-kept, versioned shell list | show night must work with no Wi-Fi; a smoke-test check keeps the list complete |
| 2026-11-16 | `master-mix` from the media pack drives the show clock | one source of truth for the final mix; no per-session file picking |
| 2026-11-16 | Default zones are generated from a metric room model, not hand-placed | one set of measurements drives the zones, coverage checks and the projector choice; re-aiming is just new numbers |
| 2026-11-17 | Every scene exports a `cut` cue (and `out`); the operator can jump to it on the night | lets the show shrink from ≈12 to ≈10 min without breaking the story (TREATMENT §06) |
| 2026-11-17 | Scenes end on, and sit over, the dim `dusk` starfield, never pure black | the LCD projector's black glows; a night-sky base hides the rectangle (DESIGN_SYSTEM §02) |
| 2026-11-17 | s09 (live star) is built with the effects scenes in WP-03, not WP-08 | it's effects only (halo, dim sky, loop); the story WP gets lighter |
| 2026-11-17 | Scene starts are computed from durations in running order; story scenes get timed placeholders | the master timeline and cut list can be rehearsed now, and WP-08 just swaps the placeholder modules |
| 2026-11-17 | Scenes get an `env` with `from(zone, u, v)` (homography between zones) | effects line up across zones (sparkles from a box onto the backdrop, ripples from the star) and follow calibration |
| 2026-11-17 | Unowned sky zones draw the dusk starfield; the backdrop stays transparent over the wall's sky | no black gaps between scenes and no seam where the backdrop sits on the wall |
| 2026-11-17 | Glows are cached sprites/gradients with additive blending; titles are cached bitmaps | keeps hundreds of soft particles and blurred text inside the iPad frame budget |
| 2026-11-17 | Safety is tested, not eyeballed: `tools/flash-check.js` measures per-zone luminance at 20 fps | DESIGN_SYSTEM §06 limits are non-negotiable (baby and dog in the audience) |
| 2026-11-17 | Every light-show animation is driven by a per-scene beat grid (warp clock, accents, beat-stepped progress, beat-snapped cues) | owner: the show should move to the music; one `beats` entry per scene swaps placeholder tempo for the real beat map |
| 2026-11-17 | Beat motion uses a smooth speed modulation (1 ± 0.35 per beat) and soft-attack accents, not eased surges | owner: the stepped surges looked forced |
| 2026-11-17 | Stars and fireworks are 3D point clouds (`fx/points3d.js`, `fx/fireworks3d.js`): perspective projection, slow rotation, staggered curved morphs | owner wants the drone-show look; one swarm re-forming keeps transitions continuous |
| 2026-11-17 | Gift boxes stacked (small on big); the room model generates a zone per face the projector can see (`box1`/`box2` fronts, `box1Side`/`box2Side`) | owner: real box mapping uses several surfaces; from the projector (left, 1.45 m) the fronts and left sides are lit, tops are slivers |
| 2026-11-17 | The tree is a 3D cone of points with layered surface patterns (`fx/megatree.js`), mixed per point in one pass | owner wanted more dynamic tree effects; one draw per light keeps it affordable |
| 2026-11-17 | Constellations get dim star-atlas figure art (`fx/figures.js`) set back in depth, plus a nebula glow | owner: constellations looked flat and too simple |
| 2026-11-17 | Constellation art = real public-domain atlas engravings (Jamieson 1822), cut out and tinted, drawn as cards in the swarm's 3D view; star positions come from the same plates | owner wanted authentic star-atlas art; one image draw per figure is cheap |
| 2026-11-17 | Hold-loop visuals use periods that divide the loop length | the s09 loop seam is invisible (flash-check verifies it) |
| 2026-11-17 | Beat maps live in one data file, `scenes/beatmaps.js` (scene-local times, first beat = downbeat); scenes spread them into `beats` | the tap tool exports one entry, so fixing a map never touches scene code |
| 2026-11-17 | Fast or rubato pieces are tracked at the bar pulse and split evenly (`tools/beats.js --subdivide`) | tracking 170–200 bpm waltz beats directly drifts; bars are steady and land on the "one" |
| 2026-11-17 | s04 and s09 music replaced by new originals (owner); their cues and beat maps were re-derived with `tools/beats.js` and snapped to downbeats at the real section changes | the visuals stay locked to the music, and WP-11 builds on final timing |
| 2026-11-17 | On the iPad, voices and sfx are **baked into the single `master-mix`** (rendered in the cloud by WP-08 from the per-line files); per-line files exist only in the cloud/ElevenLabs | the iPad has very little storage (owner); one ≈ 12 MB file instead of ~70 clips, and one clock source |
| 2026-11-17 | Speech is one file per script line, named by its `SCRIPT.md` id (`s03-alaska-01`) and placed by WP-08 at `cue + offset`; lines that say `{BABY}` are 🔒 personal (real name typed only at generation time; audio in the media pack only) | re-takes swap one file without re-timing a scene; the real name never reaches git |
| 2026-11-17 | Recordings stay off the repo; `tools/beats.js` decodes WAV itself and other formats via the system ffmpeg | repo size and "no new dependencies"; ffmpeg is only an optional convenience for the offline tool |

## Changelog
- **2026-11-17** — WP-06: master-mix carries voices + sfx on the iPad (storage) (§07).
- **2026-11-17** — WP-06: new s04/s09 music re-timed (§07).
- **2026-11-17** — WP-06: speech files per script line, personal lines off-repo (§07); SCRIPT.md exists.
- **2026-11-17** — WP-05: beat maps in `scenes/beatmaps.js`, `tools/beats.js`, `beats.html` tap tool (§07).
- **2026-11-17** — WP-03 owner notes 3: stacked box tower with side faces, mega-tree, constellation figures (§07).
- **2026-11-17** — WP-03 owner notes: smooth beat feel; 3D point-cloud swarm and fireworks (§03, §07).
- **2026-11-17** — WP-03 (owner note): §4.4 beat grid for all light-show scenes; §07 decision.
- **2026-11-17** — WP-03: §03 fx/, palette, fonts, flash-check; §4.4 scene interface as built (cues, env, holds, placeholders); §07 decisions.
- **2026-11-17** — §07: `cut` cues, `dusk` base instead of black, s09 moves to WP-03 (WP-10 treatment).
- **2026-11-16** — §4.7 room model (stage-model.js, model.html); default zones are generated from it.
- **2026-11-16** — WP-02: media pack (IndexedDB) and offline service worker built; §4.5 updated.
- **2026-11-16** — WP-01: clock/timeline/holds built; Show mode documented.
- **2026-11-16** — v1: documented Mapper v0 as built; designed timeline, media pack and export.
