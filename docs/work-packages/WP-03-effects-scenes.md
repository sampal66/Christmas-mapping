# WP-03 · Effects library + light-show scenes

**PRD:** C1 (visual parts of s00, s01, s02, s04, s06, s09, s10; see [TREATMENT](../TREATMENT.md)) · **Depends on:** WP-01, WP-10 merged ·
**Estimated session size:** large → may be split into WP-03a (effects) and WP-03b (scenes)

## Goal
Build a reusable library of projection effects and the light-show scenes, timed to placeholder durations
(the real music comes in WP-05; scenes must accept a `cues` list so timings can be re-aligned later).

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/DESIGN_SYSTEM.md` §02, §03, §04, §06, §07 (palette incl. `dusk`, LCD-black rule, motion safety, zone roles)
- `docs/TREATMENT.md` §04 (beat sheet rows for your scenes: cues, zones, lengths), §05 (live moment), §07, §08
- `docs/ARCHITECTURE.md` §4.4 (scene interface)
- Code: `app/js/effects.js`, `app/js/timeline.js`, `app/js/scenes/index.js`

## Build
1. `app/js/fx/`: small time-based effect functions. All are pure, take `(ctx, w, h, t, opts)`, and use palette
   tokens from a new `app/js/palette.js`.
   - edge trace (outline drawing on), snowfall (layers), twinkle stars, tree colour waves, spiral, sparkle burst,
     box face sequencer, footlights chase, soft firework (bloom + fade, no strobe), iris and fade transitions,
     title card (Mountains of Christmas / Playfair Display, **bundled in `app/` for offline use**, system fallback),
     **dusk starfield base** (every scene sits on it and fades to it, never to black), **constellation line-art**
     (stars drawn on one by one, then joined), **star halo**, **photo → constellation** (turns one media-pack photo into star points on the device; the photo never
     leaves the iPad). Quality bar: additive glow, soft particles, motion trails, never flat fills (TREATMENT §09).
     Santa's sleigh is character animation (WP-04/08), not code.
2. **Scenes** in `app/js/scenes/`, with the placeholder lengths from TREATMENT §04:
   - `s00-preshow` (loop), `s01-wall-wakes` 1:00, `s02-tree-alive` 1:30, `s04-magic-boxes` 1:15,
     `s06-constellations` 1:30 (Orion, Canis Major/Minor, Felis, the North Star glint),
     `s09-real-star` (hold; star halo, dim sky, tree zone dark; Continue to leave), `s10-finale` 1:30.
   - The finale is visuals only (the pets' wave comes in WP-08). Give it a `projectedStar` option (off by default)
     for the live-moment fallback (TREATMENT §05), and end on the family-constellation cue.
3. **Cue support:** each scene exports `cues: [{ t, name }]`, and the effects key off cue names, so re-timing
   to real music only edits numbers. Use the cue names in TREATMENT §04, and always include `cut` and `out`
   (the on-the-night cut list jumps to `cut`).
4. **Safety check helper:** `tools/flash-check.js`.
   - Renders scenes headless and measures the frame-to-frame average luminance change.
   - Fails if there are more than 3 flashes per second (DESIGN_SYSTEM §06).
   - Add it to the smoke test.

## Out of scope
Characters (WP-04/08), narration and music files (WP-05/06).

## Acceptance
- [ ] All seven scenes play in Show mode at ≥ 55 fps in headless Chromium (log the average frame time).
- [ ] `flash-check` passes for every scene.
- [ ] Screenshots of each scene checked (one mid-scene frame each).
- [ ] PRD C1 progress, CONTROL board + handoff updated.
