# WP-13a · Right wall in every scene + theatre curtains + performance valves

**PRD:** C1 · **Depends on:** WP-12 merged (can run alongside WP-14b) · **Estimated session size:** medium · **Credits:** 0

## Goal
The right wall strip is never idle, the show opens and closes with projected theatre curtains, and the heavy
scenes have ready switches in case the iPad drops frames. These are items P1, P2 and F4 of
[WP-12-review-and-proposals](WP-12-review-and-proposals.md) §2 and §6.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08 · `docs/DESIGN_SYSTEM.md` §06 (motion and safety limits)
- [WP-12-review-and-proposals](WP-12-review-and-proposals.md) §2 (F4), §6 (P1, P2)
- Code: `app/js/scenes/common.js` (`skyBase`, `SKY_ZONES`), `scenes/index.js`; the scenes that leave `rightStrip`
  to the sky (s02, s03, s04, s05, s07, s08); `s00-preshow.js`, `s01-wall-wakes.js`, `s10-finale.js` (end only)

## Build
1. **P1, right wall:** one calm, music-led motion per scene on `rightStrip`:
   - s02: a slow sparkle drift up the strip.
   - s03: a falling-star trail at `escape`.
   - s04: a soft toy rain sliding down.
   - s05: hanging stockings that sway on `jingle`.
   - s07: the star's path home.
   - s08: a slow aurora.

   Add `'rightStrip'` to each scene's zones.
2. **P2, curtains:** a `fx/curtains.js` drape (velvet, gold trim, soft folds) on the wall edges and the right
   strip. Closed in the pre-show, opening over ≈ 4 s at the start of s01, closing after the s10 title. Slow ease
   only; no fast sweep.
3. **F4, valves:** a `PERF` table (family portrait 4,900 → 3,500 lights, s04 tosses per beat, firework count),
   default off. Document how to switch each one on in WP-09.
4. `node tools/flash-check.js` must pass (no added flashes). Smoke test + `node tools/precheck.js`; screenshots
   of s05 and s01 (curtains) to the owner.

## Out of scope
Box textures and the cow over the moon (WP-13b), clips (WP-14a/b), audio.

## Acceptance
- [ ] `rightStrip` drawn by every scene; flash check passes; render cost not worse than +3 ms worst per scene.
- [ ] Curtains closed in the pre-show, open at s01, closed after s10.
- [ ] Smoke test + pre-check pass; docs, the CONTROL board and handoff updated.
