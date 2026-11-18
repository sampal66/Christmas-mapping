# WP-08c · Story polish: owner notes on the built story scenes

**PRD:** C1, C2 · **Depends on:** WP-08 (merged, PR #15) · **Estimated session size:** medium

## Goal
Fix the five things the owner saw on the live show (2026-11-18) so the story scenes look natural: whole ears, pets
that arrive and leave instead of popping in, a cat perch that reads as a real object, and a natural way for Connor
to bring the star back to the tree.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/CONTROL.md` (WP-08 and WP-08b handoffs)
- `docs/SCRIPT.md` §03 rows s03, s07, s10 (cues and line lengths)
- `docs/DESIGN_SYSTEM.md` §06 (motion and safety limits)
- `docs/BOX_SPECS.md` (the real boxes)
- Code: `app/js/scenes/stage.js`, `scenes/s03-star-escapes.js`, `scenes/s07-honey-pot.js`, `scenes/s10-finale.js`
  (wave only), `scenes/star-story.js` (`drawReturn`, `carryProgress`, `RETURN_PATH`), `fx/clips.js` (`drawClip`),
  `fx/stage.js` / `fx/index.js` (`boxFaces`, for the box light)

## Owner notes and the fix to build

1. **Dogs' ears are cut.**
   - Cause (verified): the generated clips let the ears drift past the top of the video frame, so the tips are
     missing from the clips themselves. The start frames have margin (Connor 27 px); clip-prep's 12 px pad was
     clamped at 0. The app only shows it.
   - Fix without new credits: in `fx/clips.js`, an optional `topFade` (≈ 4 % of the frame height) fades the top
     rows to transparent so the cut reads as a soft tip rather than a flat line. Use it for every pet clip whose
     colour half has content in row 0 (check with the bbox script idea in the WP-08 handoff).
   - Real fix (needs ElevenLabs + owner OK for credits): re-run the dog idle/talk/look-up clips with the camera
     framed wider. List the clips and the credit cost; don't generate without the owner's go-ahead.
2. **Pets pop in from nowhere** (s03 start, s10 wave, and their exits).
   - Build a "star-dust" arrival in `stage.js`: a short gold sparkle swirl converges on each pet's slot (≈ 1.2 s,
     staggered), and the pet fades in from the swirl's centre as it lands.
   - Exits are the reverse: the pet dissolves into sparkles that rise toward the sky.
   - This matches the show's star theme and the s06 swarms. Respect the flash limits (soft, ≤ 2.5 accents/s).
   - Optional: Connor can walk on with his `s07-connor-carry` walk loop if the speed matches the stride (see note 5).
3. **The cats look like they stand on nothing** (the boxes are unlit in the story scenes).
   - Light the gift tower softly in s03, s05, s07, s08 and the s10 wave: a dim warm wash on the box faces
     (`box1`, `box1Side`, `box2`, `box2Side`, level ≈ 0.12–0.18), a faint ribbon, and a slightly brighter top-edge
     rim where the cats stand.
   - It should read as "a gift tower in the dark" and never pull focus from the pets or the star: no pulsing above
     once per bar, nothing brighter than the pets.
4. **Box specs for the owner's cardboard build:** done in `docs/BOX_SPECS.md` (this WP only reads it).
5. **Connor walking the star to the tree looks unnatural.**
   - Now: he slides along the floor with a walk-in-place loop for 20 s (carry → fly), then the star flies up.
     The feet skate because the move speed doesn't match the stride.
   - Build: a short carry instead.
     - After `s07-connor-brave`, Connor takes a few steps toward the tree, with the move speed matched to the walk
       cycle's stride (measure it from the clip) and eased at both ends.
     - Then he lifts his head (his `pet-connor-lookup`), and the star rises from his mouth in a sparkle arc to the
       tree tip, while everyone looks up.
   - This changes `RETURN_PATH.end` / the carry timing in `star-story.js`: keep `fly` and `settle` on their cues,
     so SCRIPT §03 lines (carry +1/+5/+10) still land.
   - Show the owner a screenshot sequence before finishing.

## Out of scope
New ElevenLabs generations (unless the owner OKs the ear re-takes), audio/mix (WP-08b), the automatic pre-check
(WP-12), changes to cues or the script.

## Acceptance
- [ ] Ears end in a soft tip (or re-taken clips, if the owner approved them).
- [ ] Every pet arrives and leaves with the star-dust effect (s03, s05, s07, s08, s10 wave).
- [ ] The gift tower is softly lit in the story scenes, the cats visibly stand on it, and the flash check passes.
- [ ] Connor's carry is short, with no foot skating; the star rises from his mouth to the tree tip on the `fly` and
      `settle` cues.
- [ ] Smoke test passes; a screenshot sequence for s03 and s07 has been sent to the owner.
- [ ] PRD status, ARCHITECTURE §07, the CONTROL board and handoff are updated.
