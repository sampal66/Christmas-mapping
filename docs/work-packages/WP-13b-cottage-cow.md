# WP-13b · Gift tower as a snowy cottage + the cow over the moon

**PRD:** C1 · **Depends on:** WP-13a merged · **Estimated session size:** small–medium · **Credits:** 0

## Goal
In the story scenes the gift tower reads as a little snowy cottage, and s06 gets a nursery-rhyme laugh: the cow
jumping over the moon as a star swarm. These are items P3 and B0 of
[WP-12-review-and-proposals](WP-12-review-and-proposals.md) §5–§6.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08 · `docs/DESIGN_SYSTEM.md` §02 (palette), §06
- [WP-12-review-and-proposals](WP-12-review-and-proposals.md) §5 (B0), §6 (P3)
- Code: `app/js/fx/stage.js` (`towerGlow`), `scenes/common.js` (`storyTower`), `fx/portrait-swarm.js`,
  `scenes/s06-constellations.js`, `tools/portrait.js`

## Build
1. **P3, cottage:** box faces in the story scenes (s03, s05, s07, s08) get a cottage texture.
   - Warm windows (one flickers when Connor hides in s05), a door with a wreath, snow along the top edges, a soft
     chimney puff above box 1.
   - The light-show scenes keep the gift look.
   - The cats still stand on the top edge, and `towerGlow` stays as the base.
2. **B0, the cow:** a cow mid-jump over a crescent moon as a star swarm (`tools/portrait.js` from an original
   line drawing made in code or SVG, no copied art). It forms during one s06 ride pause and fades before the next
   cue. Hey Diddle Diddle is a public-domain nursery rhyme, allowed by AGENTS §06.
3. Flash check, smoke test, pre-check; screenshots to the owner.

## Out of scope
A physical moon disc (P4, decide in WP-09), new clips, audio.

## Acceptance
- [ ] Cottage textures in the story scenes only; cats and dogs unchanged on their lines (pre-check placement).
- [ ] Cow swarm in s06 without breaking the beat map or flash limits.
- [ ] Docs, the CONTROL board and handoff updated.
