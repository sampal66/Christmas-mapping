# WP-09a · Projector placement + guided room survey (in the app)

**PRD:** M1–M4, C1 · **Depends on:** WP-16 merged · **Next:** WP-09b (guided calibration) · **Estimated session size:**
large → if it grows, stop after phase A + the survey cards and hand the report/suggestions to WP-09b · **Credits:** 0

## Why (owner, 2026-11-21: first projector test)
The projector arrived and the picture is good. But the test was done from a guessed spot, without boxes and without clearing the wall, and it showed:
- No room for Alaska.
- The right wall is barely used.
- A big tree shadow falls right of the tree, where the dogs stand.
- The projected star lands on the topper's shadow.
- The painting is in the middle of the picture.

The owner wants one guided flow in the app (2026-11-22): **1) find the proper projector position, 2) survey the space
with the tape from that position, 3) calibrate from there** (step 3 = WP-09b). **The painting comes down for the show**,
so it is not modelled.

## Goal
A **Setup** flow on the Room model page (`app/model.html`), on the iPad with the projector on. Each step is one card
with plain instructions, a small diagram and live checks. Everything it learns fills the existing spatial model
(`stage-model.js`), so the Mapper's zones follow.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06, §08 → `docs/CONTROL.md`
- `docs/STAGE_SURVEY.md` §01, §03a–§03e, §05, §06 (known room facts, projector specs, old checklist)
- `app/js/stage-model.js`, `app/js/model-view.js`, `app/js/model-store.js`, `app/model.html`
- `app/js/scenes/stage.js` (`stageLayout`, `row`, `REACH`: the floor span the dogs need)
- `app/js/main.js` only where Calibrate / Test draw on the projector output (to reuse it for the wall guides)
- `docs/BOX_SPECS.md` only for the box-size section

## Build

### Phase A · Find the projector position (projector on, few measurements)
1. **Rough room card** (5 numbers, cm): wall width, sideboard right/left edge + height, tree trunk position, star top,
   and the free floor area where a tripod can stand (the room limits).
2. **Candidate spots**: the model tries a grid of tripod positions and lens heights within the room limits and
   ranks them by:
   - tree shadow over the stage area (dogs + gift tower);
   - coverage of the main wall, the tree and the right-wall strip;
   - obliqueness / keystone;
   - whether the needed throw fits the lens (zoom range from STAGE_SURVEY §03e).
   Show the best 3 on the top/side views, with plain trade-offs ("shadow 12 cm onto the stage, right wall 0.6 m").
3. **Live wall guides** (projected while the owner moves the tripod):
   - the full-frame border and a level grid (to square and level the image);
   - the **stage target**: the area the dogs and boxes need, filled softly, so the real tree shadow can be seen
     against it;
   - the predicted shadow outline.
   The owner moves the projector until the frame covers the wall edges and the real shadow stays off the target, then taps **Lock spot**.
4. **Throw check** at the locked spot: project a white frame, measure its width on the wall, then compute the throw
   ratio (and zoom setting) from it.

### Phase B · Survey from the locked spot (tape measure)
5. Cards, each with where to measure from (the doorway jamb is x = 0, the wall is y = 0, the floor is z = 0), units
   in cm, a sanity range and "skip / not sure":
   - lens position (x, y, z);
   - main wall and ceiling;
   - sideboard (edges, depth, height);
   - **obstacles that stay** on the sideboard (plant, letter board, figurine…) as a list (x, width, height);
   - tree (trunk x and distance from the wall, widest diameter and its height, bare tip, star top and size);
   - right wall (usable length, table height, sconce);
   - boxes (real sizes, or "suggest").
6. **Model additions** (`stage-model.js`):
   - `obstacles`;
   - **tree shadow**: the cone and the star projected from the lens onto the wall plane, as a polygon in stage pixels,
     added to the layout as an occluder zone (nothing drawn);
   - free floor span = the sideboard top minus the shadow and the obstacles. `stageLayout` starts the dogs' span at
     their right edge (keep the WP-16 `row()` / `REACH`).
7. **Report card**:
   - shadow width on the wall;
   - floor span vs. what Alaska + Connor need (`REACH`), with the margin;
   - tower top vs. cats + guest + chimney;
   - star alignment;
   - coverage.
   **Suggestions**: box sizes and x positions that fit the dogs (stage moved toward the corner when needed).
8. **Export / import** the setup as JSON (measurements only, no photos or personal data); the progress resumes after a
   reload (try/catch around storage). `STAGE_SURVEY.md` §05/§06 point to the in-app flow; `sw.js` VERSION bump.

## Out of scope
Phase C calibration (WP-09b), camera auto-calibration, the frame-rate fix (WP-16b), the tree light show (WP-17), new
art or clips, buying boxes.

## Acceptance
- [ ] Phase A ranks spots for the current default model and reproduces the problem seen on the wall (the dogs in the
      shadow from the test spot); a better spot is suggested with its numbers.
- [ ] The wall guides draw on the projector output: border, level grid, stage target, shadow outline.
- [ ] The survey can be done end to end in iPad-sized Safari (screenshots at 1180×820) and resumes after a reload; the
      report and suggestions show; export/import round-trips.
- [ ] `node tools/smoke-test.js` passes; `node tools/precheck.js` PASS (0 overlaps).
- [ ] ARCHITECTURE §07 decision, STAGE_SURVEY updated, CONTROL board + handoff, WP-09b brief checked, draft PR.
