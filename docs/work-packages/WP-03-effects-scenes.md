# WP-03 · Effects library + light-show scenes

**PRD:** C1 (visual parts of s00, s01, s02, s04, s06, s10) · **Depends on:** WP-01 merged ·
**Estimated session size:** large → may be split into WP-03a (effects) and WP-03b (scenes)

## Goal
Build a reusable library of projection effects and the light-show scenes, timed to placeholder durations
(the real music comes in WP-05; scenes must accept a `cues` list so timings can be re-aligned later).

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/DESIGN_SYSTEM.md` §02, §03, §04, §06, §07 (palette, motion safety, zone roles)
- `docs/ARCHITECTURE.md` §4.4 (scene interface)
- Code: `app/js/effects.js`, `app/js/timeline.js`, `app/js/scenes/index.js`

## Build
1. `app/js/fx/`: small time-based effect functions. All are pure, take `(ctx, w, h, t, opts)`, and use palette
   tokens from a new `app/js/palette.js`.
   - edge trace (outline drawing on), snowfall (layers), twinkle stars, tree colour waves, spiral, sparkle burst,
     box face sequencer, footlights chase, soft firework (bloom + fade, no strobe), iris and fade transitions,
     title card (Mountains of Christmas / Playfair Display, loaded via Google Fonts with a system fallback).
2. **Scenes** in `app/js/scenes/`, using placeholder music lengths from PLAN §6:
   - `s00-preshow`, `s01-wall-wakes`, `s02-tree-alive`, `s04-magic-boxes`, `s06-interlude`, `s10-finale`.
     The finale is visuals only; the pets' wave comes in WP-08.
3. **Cue support:** each scene exports `cues: [{ t, name }]`, and the effects key off cue names, so re-timing
   to real music only edits numbers.
4. **Safety check helper:** `tools/flash-check.js`.
   - Renders scenes headless and measures the frame-to-frame average luminance change.
   - Fails if there are more than 3 flashes per second (DESIGN_SYSTEM §06).
   - Add it to the smoke test.

## Out of scope
Characters (WP-04/08), narration and music files (WP-05/06).

## Acceptance
- [ ] All six scenes play in Show mode at ≥ 55 fps in headless Chromium (log the average frame time).
- [ ] `flash-check` passes for every scene.
- [ ] Screenshots of each scene checked (one mid-scene frame each).
- [ ] PRD C1 progress, CONTROL board + handoff updated.
