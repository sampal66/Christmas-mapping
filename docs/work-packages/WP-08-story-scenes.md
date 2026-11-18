# WP-08 · Story scenes s03, s05, s07, s08 + the pets' wave in s10

**PRD:** C1, C2, C3, C6, C7 · **Depends on:** WP-04b (merged, PR #13), WP-06 (merged) · **Estimated session size:** large
(visuals only; the audio mix is **WP-08b**, its own session)

## Goal
The four story scenes stop being placeholders. The pets (and Pooh) act out SCRIPT §03 on the stage, in time with the
lines as they will sound in the master mix. The lost star keeps the motion it already has in `scenes/star-story.js`.
In s10 the pets wave goodbye.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/CONTROL.md` (this row, the WP-04b handoff)
- `docs/work-packages/WP-04b-story-clips.md` → **Status** section only (clip ids, loop vs once, facing)
- `docs/SCRIPT.md` §01 (how cues work), §03 rows s03, s05, s07, s08, s10 (**cue + offset + length = the timing
  source**), §07 (silence check: the s08 26–45 s visual beat)
- `docs/TREATMENT.md` §04 rows s03, s05, s07, s08, s10 ("What happens", zones)
- `docs/DESIGN_SYSTEM.md` §06 (motion limits)
- Code: `app/js/scenes/index.js` (the four `storyPlaceholder(...)` entries), `scenes/placeholder.js`,
  `scenes/star-story.js` (`drawEscape`, `drawReturn`, `drawWarmStar`: keep this motion), `fx/clips.js` (API:
  `drawClip`, `preloadClips`, `clipReady`), `scenes/common.js` (`from`, zone helpers), `scenes/s04-magic-boxes.js`
  (`peekClip`: an example of clip placement), `scenes/s10-finale.js` (`wave` cue only)

## Build
1. **Stage helper** (`scenes/stage.js`): places a pet clip standing on the ground line of a zone (default `backdrop`;
   the stage front for s07's walk), at a slot (left → right: Alaska, Connor, Orion, Gandalf, sized to their real
   relative heights: Connor biggest). One function picks the pet's clip at a scene time from a small timeline:
   `idle` loop by default, `talk` loop while that pet's line plays (cue + offset, ≈ s from SCRIPT §03), action clips
   (`once`, hold the last frame, then cross-fade back to idle over 0.3 s). Missing clip → the pet is simply not drawn
   (no errors). Pets enter with a soft fade/slide at the scene start and leave at `out`.
2. **Scenes** (one file each, replacing the placeholders in `index.js`; keep ids, durations and cues):
   - **s03** `pets-in` all four idle; Alaska's lines on `s03-alaska-boss` (6.0 s), the others on talk loops;
     `bat −5.5` `s03-gandalf-bat` (the star is batted on the `bat` cue: `drawEscape` already does it);
     `bat +1` `s03-alaska-nooo`; `escape +1` `s03-gandalf-oops`; all `lookup` as the star escapes.
   - **s05** `regroup` idle/talk; `jingle +2` `s05-connor-hide`; `jingle +7` `s05-gandalf-bells`; the drone Mickey
     stays as built (`mickeyStars`, `film: true`: no Mickey clip exists); the pets `lookup` when he points up.
   - **s07** `pooh-in` `s07-pooh-float` (10 s) high on the backdrop/wall, its pot where `drawReturn` shows the
     star; `carry +1` `s07-connor-brave`, then `s07-connor-carry` (loop) moved by code along `drawReturn`'s ground path
     so the star (drawn in code) rides at his mouth; `settle` all four `lookup`.
   - **s08** `gather` the pets walk/fade in and `lookup` (hold); `missing +6` `s08-gandalf-soft`. **Silence check:**
     26–45 s the pets' constellations (Orion, Canis Major/Minor, Felis from `fx/constellations.js`) twinkle softly
     above as a callback, and the star warms on the music swell (owner decision 2026-11-17).
   - **s10** `wave` each pet's `s10-<name>-wave` on the stage (staggered ≈ 0.3 s), gone before `cut`.
3. Drop the "llega en WP-08" caption: these scenes are no longer placeholders (`placeholder: false`, flash check
   covers them). Preload each scene's clips in `enter()`.
4. `sw.js` VERSION bump; new files in SHELL. Smoke test + flash check; screenshot every scene at its busiest moment
   and check the pets stand on the ground line, at sensible sizes, never over the tree.

## Out of scope
Audio: exporting the voices, the master mix and the idle music-box loop are **WP-08b**. New generations (the clip
library is done; use the ≈ 5k WP-08 reserve only for a missing shot, owner OK first). Changing cues, timings, music
or the star's paths. Mickey clips (the providers block them).

## Acceptance
- [ ] s03, s05, s07, s08 built (no placeholder caption); s10 wave added; every SCRIPT §03 line has its pet talking or
      acting on its cue.
- [ ] The star motion in `star-story.js` is unchanged and the pets/Pooh/Connor sit on it.
- [ ] s08 26–45 s has its visual beat.
- [ ] Smoke test + flash check pass; render cost per scene reported; screenshots checked.
- [ ] PRD C1/C6/C7 status, ARCHITECTURE §07 (stage helper), CONTROL board + handoff updated.

## Status (2026-11-18, end of session)
All acceptance items done (see the CONTROL handoff). Deviations from the steps above, on purpose:
- Pets are drawn on the **wall** zone (not the backdrop) so the star, drawn on the wall after them, stays in front of
  Connor's mouth and Pooh's pot. Cats sit on the gift tower's top (there is no room for four on the floor).
- s07: Alaska joins the cats on the tower so Connor's walk to the tree is clear; Connor faces left all scene.
- s03: `s03-gandalf-bat` starts at bat −3 (its swipe is 2.5 s in); the line starts at bat −5.5 on the talk loop.
- s07: Pooh's clip starts at pooh-in +3 and holds its last frame (pot held out) through `found`.
- Owner rule added: one fixed size per pet (Connor 1, Alaska 0.75, Orion = Gandalf 0.5), changed only for depth.
