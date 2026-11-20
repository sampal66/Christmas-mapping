# WP-16 · Pet spacing: every character gets its own space

**PRD:** C1, C2 · **Depends on:** WP-13b, WP-14b, WP-15 merged · **Estimated session size:** small–medium · **Credits:** 0 (generate nothing)

**Problem (owner, 2026-11-20):** in the whole show, Alaska stands behind Connor's tail. Each pet must have its proper
space and read clearly.

**Root cause (found 2026-11-20):** `app/js/scenes/stage.js` → `stageLayout()` puts Alaska relative to Connor:
`connorX = box[0] − 0.56·width('connor')` (just left of the big gift box) and
`alaskaX = connorX − 0.5·width('connor') − 0.2·width('alaska')` ("tucked in front of his shoulder"). The dogs face right
(flip false), so Connor's tail is on his left, exactly where Alaska stands, and `drawPets` draws back to front (orion,
gandalf, alaska, connor), so Connor covers her. Sizes: `PET_SIZE` (connor 1, alaska 0.75, cats 0.5); widths use `BODY`
from the idle clip's FRAME row, but talk/wave/carry clips are wider (FRAME rows in the same file).

## Goal
Redistribute the slots so no pet overlaps another in any scene. Keep the existing intent: the dogs on the floor between
the tree and the gift tower (closer to the tower), the cats on the tower top (`towerAt`), sizes unchanged, left → right
still Alaska, Connor, Orion, Gandalf (or propose a better order to the owner first if the space forces it).

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06, §08 → `docs/CONTROL.md`
- `app/js/scenes/stage.js` (stageLayout, drawPets, FRAME/BODY/PET_SIZE)
- `app/js/fx/stage.js` only where the tower/guest spots are defined (`GUESTS`, chimney spot, `drawGuest`)
- Any scene that overrides a pet position (grep `slot` / `.x =` in `app/js/scenes/`: s03, s05, s07 carry path
  `carryWalk`, s08, s10 wave)
- `tools/precheck.js` (section 3 · Placement). DESIGN_SYSTEM only if the layout section is needed.

## Build
1. Compute the floor slots from the free floor span (tree's right edge → big box's left edge, from the zone geometry),
   using each dog's widest clip extent (not just idle) plus a small gap, so Alaska stands clearly left of Connor's
   tail. If the span is too small at the default layout, shrink the gap first; never resize the pets; report the margin.
2. Check every scene that moves a dog (s05 Connor hide/peek, s07 Connor carry walk, s03/s10 entrances and the wave,
   star-dust arrive/leave) still lines up with the new slots, and that the carry path / star positions that depend on
   Connor's position still meet (s07 mouth ↔ star path uses `CONNOR_MOUTH_UP`).
3. Cats and the WP-14b guests on the tower (Nutcracker/Gingerbread in s04, Velveteen in s08, rabbit in s10) and the
   WP-13b chimney must not overlap the cats either; check, fix only if they do.
4. Add an automatic overlap check to `tools/precheck.js` (section 3 · Placement): at each cue + 1 s, flag any two drawn
   pets whose clip bounding boxes overlap by more than a few % of the smaller one. It must pass after the change.
5. Bump `sw.js` VERSION (another session may merge first: then merge main and take max + 1).

## Out of scope
New clips or art, pet sizes, audio, scene timing.

## Acceptance
- [ ] `node tools/smoke-test.js` passes.
- [ ] `node tools/precheck.js` PASS with the new overlap check at 0 flags (no `--mix` needed; the owner's mix is unchanged).
- [ ] A contact sheet / screenshot per story scene (s03, s05, s07, s08, s10) sent to the owner showing Alaska clear of Connor.
- [ ] ARCHITECTURE §07 decision + changelog; CONTROL board + handoff updated; draft PR. The owner merges.
