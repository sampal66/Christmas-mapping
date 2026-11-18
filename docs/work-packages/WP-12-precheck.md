# WP-12 · Automatic show pre-check (before the owner's manual scene review)

**PRD:** success metrics · **Depends on:** WP-08b and WP-08c merged (everything assembled) · **Estimated session size:** medium

## Goal
One command that plays the whole assembled show headless and produces a short report plus a contact sheet. It
catches the mechanical problems (missing clips or files, things drawn in the wrong place, timing drift, safety,
performance) before the owner sits down to check each scene by eye (owner request, 2026-11-18).

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/CONTROL.md` (WP-08, WP-08b, WP-08c handoffs)
- `docs/SCRIPT.md` §01, §03 (cues), `docs/DESIGN_SYSTEM.md` §06 (safety limits)
- Code: `tools/smoke-test.js`, `tools/flash-check.js`, `tools/master-mix.js` (cue table logic), `app/js/scenes/index.js`,
  `scenes/stage.js`, `fx/clips.js`

## Build
`tools/precheck.js` (Node + the preinstalled Playwright; no new dependencies). It writes `precheck/report.md` and
`precheck/sheet-<scene>.png`; both are scratch output and never committed. The report checks:
1. **Assembly:** every scene loads with no console errors.
   - Every clip id a scene asks for exists in `app/assets/clips/` (or is listed as media-pack only).
   - Every `sw.js` SHELL file exists, and the `VERSION` was bumped since `main`.
2. **Script ↔ picture:** for each SCRIPT §03 line, at `cue + offset` the speaking pet is playing a talk or action
   clip, not idle. Lines whose speaker isn't on stage are listed.
3. **Placement:** at each cue, every drawn pet is inside its zone, not over the tree mask, and standing on its floor
   or tower line (± a few px).
   - Clips with content in the top row of the frame (cut ears) are flagged.
4. **Timeline:** the total length matches the scene sum, holds sit where expected, and the cut cues exist.
   - If `master-mix.m4a` is supplied (`--mix <file>`), its length matches the timeline (± 0.2 s).
   - The voice-line times from `tools/master-mix.js` match the scene cues.
5. **Safety:** run the flash check and include its summary (flashes/s, brightness jumps, hold seams).
6. **Performance:** render cost per scene (avg and worst ms per frame), flagged above a budget (e.g. 33 ms worst).
   Headless is a software raster, so note that real fps is confirmed on the iPad in WP-09.
7. **Contact sheet:** per scene, a strip of frames at every cue (+1 s), at 2× scale, for the owner's manual review.

Add `npm`-free usage to `CLAUDE.md`'s test line (`node tools/precheck.js [--mix file]`), and call it from the QA
step in AGENTS §03 (run it before asking the owner to review scenes).

## Out of scope
Fixing what it finds (those go to their own WPs), on-wall calibration (WP-09), audio rendering (WP-08b).

## Acceptance
- [ ] `node tools/precheck.js` runs in one go, writes the report and contact sheets, and exits non-zero on a
      failure (missing clip, console error, flash failure, length mismatch).
- [ ] The report is short: a summary table first, then details only for what failed or is flagged.
- [ ] Contact sheets sent to the owner after the first full run.
- [ ] AGENTS §03, CLAUDE.md, the CONTROL board and handoff are updated.
