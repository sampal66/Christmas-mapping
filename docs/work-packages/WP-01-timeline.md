# WP-01 · Show timeline, audio sync, hold points

**PRD:** M5, M6, M7, M11 · **Depends on:** WP-00 (merged) · **Estimated session size:** medium

## Goal
Add a **Show mode** that plays scenes on a timeline driven by one master audio track, with an audio-delay
offset for the Bluetooth soundbar and hold points for the live star moment.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06, §08
- `docs/ARCHITECTURE.md` §4.1, §4.3, §4.4
- Code: `app/js/main.js`, `app/js/effects.js`, `app/index.html` (no need to read `homography.js`)

## Build
1. `app/js/timeline.js`: scheduler.
   - Registers scene modules (`{ id, start, duration, zones, enter?, draw }`) as described in ARCHITECTURE §4.4.
   - For each zone, finds the active scene at `showTime` and calls its `draw`.
   - Zones without an active scene render black.
2. `app/js/audio.js`: master clock.
   - Wraps one `<audio>` element and exposes `showTime = currentTime + offset`.
   - Has a **silent fallback clock** (performance.now based) when no audio is loaded, so scenes can be developed without music.
3. **Hold points:** `{ at, loop: [from, to] }`.
   - When `showTime` reaches `at`, loop the segment (audio and visuals) until **Continue** is pressed.
4. **Show mode in the panel:**
   - Play/Pause, Restart, scene list (jump to scene), Continue, and a progress bar with the time.
   - An **audio delay** slider (−500…+500 ms) saved to `layout.audioOffsetMs`.
   - A **sync test** button: a beep plus a white flash in the `star` zone, once per second, to tune the delay.
5. **Pre-show loop (M11):** when stopped in Show mode, render a gentle starfield (reuse `effects.stars`).
6. `app/js/scenes/index.js` plus **two placeholder scenes**, so the timeline is testable:
   - `s00-test-a` (0–10 s: snow on the wall)
   - `s00-test-b` (10–20 s: tree waves), with a hold point at 15 s.
7. Extend `tools/smoke-test.js`: switch to Show, press Play, wait, and assert that time advances and there are no errors.

## Out of scope
Real scenes (WP-03), media import (WP-02), MP4 export (WP-07).

## Acceptance
- [ ] Show mode plays the placeholder scenes; jumping and restarting work; the hold point loops until Continue.
- [ ] Changing the audio delay visibly shifts the visuals against the beep; the value persists after reload.
- [ ] Works with no audio file (silent clock).
- [ ] The smoke test passes. Screenshot of Show mode checked.
- [ ] PRD M5/M6/M7/M11 status updated; ARCHITECTURE §4.4 matches what was built; CONTROL board + handoff updated.
