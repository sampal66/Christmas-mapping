# WP-09b · Guided calibration from the survey

**PRD:** M1–M4, C1 · **Depends on:** WP-09a merged + the owner's setup done on the wall (projector spot locked, survey
exported) · **Then:** WP-09 rehearsal checklist · **Estimated session size:** medium · **Credits:** 0

## Why
Phase 3 of the owner's setup flow (2026-11-22): **projector position → survey → calibrate from there**. WP-09a gives a
locked projector spot and a measured model, and the zones are generated from it. They will be close but not exact:
the tape measure, the lens and the tree's real shape all add error. This WP turns the existing free-form Calibrate mode
into a guided pass that starts from the model and fixes what's left in a few minutes, and that can be redone quickly
on show night if the tripod gets knocked.

## Goal
A **Calibrate (guided)** flow: zone by zone, the projector draws the model's outline over the real object, and the
owner nudges it until it sits right. Corrections are kept as small offsets on top of the model, so a later
re-measurement doesn't throw the hand work away.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06, §08 → `docs/CONTROL.md`
- `docs/work-packages/WP-09a-room-survey.md` (what the survey produces) and its handoff line in CONTROL
- `app/js/main.js` (Calibrate mode: handles, corners, mask points, nudge, save), `app/js/effects.js`
  (`calibrationPattern`)
- `app/js/stage-model.js` (`layoutFromModel`, the occluder zones from WP-09a: `shadow`, `starShadow`, `obstacleN`, flagged
  `occluder: true`), `app/js/model-store.js` (setup progress key), `app/js/survey.js` (`analyse`: margins for the checks)
- `app/js/scenes/stage.js` only to check the dogs' slots after calibration

## Build
1. **Start from the model**: one tap builds the layout from the saved survey (WP-09a), then the guided steps.
2. **Guided order**:
   1. main wall corners;
   2. sideboard top line (the floor);
   3. tree outline (mask points, from the tip down);
   4. **star**: the projected star centred on the real topper, not its shadow (preview the s03 star);
   5. each box (front, then side);
   6. right-wall strip;
   7. the shadow and obstacle zones.
   Each step shows the outline of that zone only, in a high-contrast colour, with big arrow and nudge buttons (iPad) and
   a "looks right" button.
3. **Offsets, not overwrites**: save each zone's corrections as per-corner deltas over the model layout. "Re-measure"
   keeps them; "Reset zone" drops them.
4. **Checks after calibration**:
   - a quick scene preview strip (s03 dogs on the floor, s05, s07 tower, s10 wave) so the owner sees the dogs clear
     of the shadow and of each other;
   - re-run `stageLayout` and show the floor and tower margins (as in the WP-09a report).
5. **Show-night quick re-check**: a 1-minute mode that projects just the corner markers and the star, to confirm
   nothing moved.
6. Make sure the control panel can be hidden from the projected image during the show (the first test projected it
   on the right wall), or note how in the rehearsal checklist.
7. `sw.js` VERSION bump; app/README how-to.

## Out of scope
Camera auto-calibration, new art, the frame-rate fix (WP-16b), the tree light show (WP-17).

## Acceptance
- [ ] The guided pass runs from the saved survey on iPad-sized Safari, each step shows only its zone, and offsets
      survive a model re-measure.
- [ ] The star step centres the projected star on the topper position from the survey.
- [ ] The scene preview and margins show after calibration; the quick re-check mode works.
- [ ] `node tools/smoke-test.js` passes; `node tools/precheck.js` PASS (0 overlaps).
- [ ] ARCHITECTURE §07 decision, app/README, CONTROL board + handoff, draft PR. The owner checks it on the real wall.
