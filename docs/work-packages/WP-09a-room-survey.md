# WP-09a · Guided room survey in the app

**PRD:** M1–M4, C1 · **Depends on:** WP-16 merged · **Estimated session size:** medium–large (→ split into WP-09b if
the report/suggestions grow) · **Credits:** 0

## Why (owner, 2026-11-21: first projector test)
The projector arrived and the picture is good. But the test was done without boxes and without clearing the wall, and it showed:
- No room for Alaska.
- The right wall is barely used.
- A big tree shadow falls right of the tree, where the dogs stand.
- The projected star lands on the topper's shadow, not on the topper.
- The painting is in the middle of the picture.

The owner wants a proper survey of the space, done **inside the app, with instructions**, so the boxes, the stage and
the projector position can be worked out from real numbers. **The painting comes down for the show** (owner,
2026-11-22), so it is not modelled.

## Goal
A **Survey** mode on the Room model page (`app/model.html`). The owner walks through it on the iPad with a tape measure:
- one step per card, each with plain instructions, a small diagram and live checks;
- at the end, a report of what fits and what to change;
- every value fills the existing spatial model, so the Mapper's zones follow.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06, §08 → `docs/CONTROL.md`
- `docs/STAGE_SURVEY.md` §01, §03a, §03d, §05, §06 (what is already known, plus the old checklist this replaces)
- `app/js/stage-model.js` (STAGE_MODEL, projectorCamera, layoutFromModel, coverage)
- `app/js/model-view.js`, `app/js/model-store.js`, `app/model.html`
- `app/js/scenes/stage.js` (`stageLayout`, `row`, `REACH`: the floor span the dogs need)
- `docs/BOX_SPECS.md` only for the box-size section

## Build
1. **Survey wizard** on `model.html`: Survey / Model tabs, progress saved on the device (try/catch around storage).
   Steps, each with what to measure, where to measure from (the doorway jamb is x = 0, the wall is y = 0, the floor is
   z = 0), a diagram, units in cm, a sanity range and a "skip / not sure" option:
   1. Clear the wall: painting down, take a photo from the projector spot (stays on the iPad).
   2. Main wall: width from the jamb to the corner, ceiling height.
   3. Sideboard: left and right edge x, depth, height.
   4. **Obstacles that stay** on the sideboard (plant, letter board, figurine…): x, width, height each, as a list.
   5. Tree: trunk x and its distance from the wall, widest diameter and its height, bare tip height, star top and star size.
   6. Right wall: usable length, table height, sconce position.
   7. Projector: lens position (x, y, z). **Throw check**: project a full-white frame, measure the image width on the
      wall, then compute the throw ratio from it (no spec sheet guess).
   8. Boxes: real sizes if bought, or **"suggest sizes"** (step 9).
2. **Model additions** in `stage-model.js`:
   - `obstacles` list;
   - **tree shadow**: the tree cone and the star projected from the lens onto the wall plane, as a polygon in stage pixels;
   - the free floor span on the sideboard top, minus the shadow and the obstacles.
   Add the shadow as a layout zone (occluder, nothing drawn) and make `stageLayout` start the dogs' floor span at
   the right edge of the shadow and the obstacles, not only the tree. Keep the WP-16 `row()` / `REACH` logic.
3. **Report card** at the end:
   - shadow width on the wall;
   - free floor span vs. what Alaska + Connor need (from `REACH`), with the margin;
   - the tower top length vs. what the cats + guest + chimney need;
   - star alignment;
   - coverage of the wall, the right wall and the tree.
   Then **suggestions**:
   - box sizes and x positions that fit the dogs (stage moved right toward the corner when needed);
   - a projector position that shrinks the shadow over the stage (try a small grid of positions within the room limits
     and show the best two, with how much shadow each removes).
4. **On-wall check**: a button projects markers at the model's predicted points (sideboard corners, tree tip, star,
   box corners, shadow edge). The owner checks each one lands on the real thing, or nudges it. Nudges feed back into the
   model, or are recorded for the WP-09 calibration.
5. **Export / import** the survey as JSON (measurements only, no photos or personal data). The owner sends it to the
   next session.
6. `STAGE_SURVEY.md` §05/§06 point to the in-app survey; `sw.js` VERSION bump.

## Out of scope
Camera auto-calibration, the story-scene frame-rate fix (WP-16b), the tree light show (WP-17), new art or clips,
buying boxes.

## Acceptance
- [ ] The survey can be completed end to end on iPad-sized Safari (screenshots at 1180×820), with instructions,
      a diagram and checks on every step; it resumes after a reload.
- [ ] The report shows the shadow, the floor and tower margins, and box and projector suggestions; with the current
      default model it reproduces the problem seen on the wall (dogs in the shadow).
- [ ] The on-wall markers draw at the model's points; the export/import round-trips.
- [ ] `node tools/smoke-test.js` passes; `node tools/precheck.js` PASS (0 overlaps).
- [ ] ARCHITECTURE §07 decision, STAGE_SURVEY updated, CONTROL board + handoff, draft PR.
