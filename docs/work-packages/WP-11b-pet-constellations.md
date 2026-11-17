# WP-11b · s06 pets as star figures (constellation line-art)

**PRD:** C1, C2 · **Depends on:** WP-11 (merged) · **Estimated session size:** small–medium

## Goal
TREATMENT §04 lists "pets as constellations (line-art)" on screen in s06, and §03 says Orion the cat smiles when his
constellation forms. The WP-11 audit found this missing. Add each pet as a star figure that appears beside (or grows
out of) its constellation in s06's calm pauses: Orion (tabby) by Orion, Connor by Canis Major, Alaska by Canis Minor
(looking unimpressed), Gandalf by Felis.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/TREATMENT.md` §03 (arcs, the constellation list), §04 row s06
- `docs/DESIGN_SYSTEM.md` §05 (pet looks), §06 (constellation art, drone-show style, safety)
- Code: `app/js/fx/mickey-stars.js` (pose → parts → fixed point counts → `renderCloud`; reuse this pattern),
  `app/js/scenes/s06-constellations.js` (the formation sequence and the calm pauses), `app/js/fx/points3d.js`

## Build
1. Generalise the Mickey pose tech into a small helper (or copy the pattern) for four simple pet line figures:
   sitting cat (Orion; one lifted lip = the smile), husky lying down (Connor, plume tail), pomsky sitting proud
   (Alaska), Gandalf mid-pounce. 2–3 poses each, a tiny motion (tail flick, ear twitch, Orion's slow smile).
2. In s06, during each calm pause (after the stars and the atlas art), the pet figure forms beside its constellation
   from the swarm and fades before the next ride. Keep the existing timing, cues and beat map.
3. Smoke test, flash check, screenshots of all four.

## Out of scope
- The pets' cartoon clips (WP-04), voices/mix (WP-08), changing s06 timing or the atlas art.

## Acceptance
- [ ] Four pet star figures appear in s06's pauses, each with a small move; Orion smiles.
- [ ] Flash check and smoke test pass; render cost of s06 not noticeably higher (it is already the costliest scene).
- [ ] PRD status, TREATMENT note, CONTROL board + handoff updated.
