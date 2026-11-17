# WP-11 · s04 box chaos + s05 Mickey drawn in stars + scene audit

**PRD:** C1, C2, C3 · **Depends on:** WP-03, WP-05, WP-06 (merged) · **Estimated session size:** medium (split if the audit finds a lot)

## Goal
Owner notes (2026-11-17), to be built exactly:
1. **s04 Cajas mágicas is too flat** ("just lights"). It must be **chaotic and impressive**: the pets have dived into the
   boxes and are searching everywhere for the star, so a **mess of objects bursts out of the boxes**: Christmas objects,
   pet objects and cameo objects, tumbling, spinning and arcing out on the music. Still no star.
2. **s05: when Mickey whistles the clue, Mickey also appears as a constellation**: the 1928 Mickey drawn in stars,
   **moving** (whistling, then pointing up at the sky) as he gives the clue.
3. **Audit**: the previous scene session built the s06 rollercoaster but missed other beats. Check every built scene
   against what TREATMENT §04 says happens, and list anything missing.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/TREATMENT.md` §03 (arcs), §04 (beat sheet: the "What happens" column is the spec), §05 (live star), §07 (zones)
- `docs/DESIGN_SYSTEM.md` §02 (projection), §03 (palette), §05 (characters: 1928 Mickey only), §06 (motion and safety limits)
- `docs/SCRIPT.md` §06 (sound effects: all `s04-sfx-*`, `s05-sfx-whistle`)
- Code: `app/js/scenes/s04-magic-boxes.js`, `app/js/scenes/index.js` (s05 placeholder), `app/js/fx/points3d.js` and
  `app/js/fx/constellations.js` (the star-figure tech from s06), `app/js/fx/bursts.js`, `app/js/scenes/beatmaps.js` (s04 entry)

## Build
1. **Audit first (short):** for s01, s02, s04, s06, s09 and s10, compare the scene code with TREATMENT §04 "What happens"
   and the owner notes in the CONTROL handoff log. Write a table in this brief ("Audit result": beat, built yes/partly/no,
   fix). Fix small misses in this session. Larger ones become a follow-up brief (WP-11b) on the board.
2. **s04 box chaos** (keep the 1:15 length; the **music, beat map and cues were already replaced in WP-06**: new
   original box-chaos romp, 132 bpm, cues box1-open 14.76, box2-open 25.66, cut 43.82, finale 56.57, out 71.11; build
   the visuals to these):
   - Objects erupt from both boxes on the beat, in waves that build to the finale: Christmas objects (baubles, candy
     canes, bows, bells, tinsel, a toy train, nutcracker, wrapped mini-gifts); pet objects (yarn ball, rubber bone, fish
     toy, collar with a tag, a slipper); cameo objects (a honey pot, a red balloon, a 1928 steamboat captain's hat and
     ship's wheel). Physics-y arcs, spin, bounce on the stage line, pile-up, sparkles.
   - Hints that the pets are inside: boxes wobble and jump, lids pop, tails/ears flick out. Use placeholders shaped for
     WP-04's clips (WP-04 adds the real "pets rummaging in boxes" clips; add those shots to its shot list on the board).
   - Look: no "MS Paint". Objects are illustrated sprites with a warm cream rim and additive glow (DESIGN_SYSTEM §05),
     either ElevenLabs-generated art (owner OKs the credit cost first, AGENTS §07) or carefully drawn in code
     with gradients and highlights. Check the result in screenshots against the dusk base.
   - Safety: no flashes > 3/s, keep `tools/flash-check.js` passing.
   - Sound (made in WP-06, SCRIPT §06): `s04-sfx-boxopen`, `-spring`, `-rummage` (bed), `-tumble`, `-wobble`, `-flurry`.
     Sync the object waves to them; the WP-06 draft mix placed them at 3/8/11.5 s (wobbles), bursts on the cues, tumbles
     and flurries every ≈ 3–4 s in the busy sections. WP-08 sets final volumes.
3. **s05 Mickey constellation** (the s05 scene is otherwise WP-08's; build this moment as a reusable piece WP-08 places):
   - Proposal (confirm with the owner): at `mickey-in` the old-film frame shows Mickey; as he whistles, the frame dissolves
     into stars and **Mickey becomes a star figure on the wall** (point swarm like s06, line art between stars, 1928 design:
     pie-cut eyes, no gloves, round ears, shorts). He bobs to the whistle, then **raises his arm and points up**; the
     pointing hand's star trails a line up into the sky (a lead-in to s06). Fades by `mickey-out`.
   - Animate with a few keyframed star poses blended over time (time-based, `local` only), synced to `s05-sfx-whistle`.
   - Only the 1928 Steamboat Willie design (public domain). Never a modern Mickey shape (gloves, colour, modern face).
4. Smoke test, flash check, screenshots of s04 (three moments) and the Mickey figure (whistle pose + point pose).

## Audit result (2026-11-17)
Built scenes compared with TREATMENT §04 "What happens" and the owner notes in the CONTROL handoff log. Character
animation (pets, Santa, Mickey's clip) is WP-04/08 everywhere and is not counted as a miss.

| Scene | Beat (TREATMENT §04 / owner notes) | Built | Fix |
|---|---|---|---|
| s01 | Light lines trace the wall edges, sideboard top, both boxes, tree outline; footlights warm up; snow on the wall spills onto the right wall | yes | none (the sideboard top is the `stage` strip trace; its front is out of the beam) |
| s01 | Welcome line to `{BABY}` | n/a | voice placed in the master-mix (WP-08) |
| s02 | Colour waves climb the tree on the beat, spirals, ornament pops, star gold at the climax, soft wall echo | yes | none (mega-tree layers, shockwaves, helix, ornament pops, plasma + halo at `star-glow`) |
| s04 | Boxes light face by face, open with sparkles, jack-in-the-box spring, footlights chase | yes | — |
| s04 | **Owner: chaos**, objects burst out, pets inside, still no star | **no → built here** | `fx/toys.js` + s04 rewrite (this WP) |
| s04 | Gandalf pops out of a box; Alaska peeking | partly | ear/tail placeholders at the box tops; real "rummaging" clips → WP-04 shot list |
| s05 | **Owner: Mickey drawn in stars**, whistles and points up | **no → built here** | `fx/mickey-stars.js`, placed in the s05 placeholder at `mickey-in` |
| s06 | Whole wall becomes a starry sky; constellations draw star by star (Orion, Canis Major + Minor, Felis); glint by the North Star slips away; shooting stars; snow on the right wall; tree sparkle | yes | none |
| s06 | **"Pets as constellations (line-art)"**: Orion the cat smiles when Orion forms, each pet "is" its constellation | **no** | larger: → **WP-11b** (pet star figures with the Mickey pose tech) |
| s09 | Star bows twice, fades to a gold halo; dim starfield; tree dark; seamless hold | yes | none |
| s10 | Warm ripple from the lit star, footlights burst, sleigh path, soft fireworks, family constellation, "¡Feliz Navidad!", fade to the starfield | yes | Santa + sleigh and the pets' wave are clips (WP-04/08) on the drawn sleigh trail |

**Quality pass (owner, same session: "is the review only for the gifts?"):** the table above checks that each beat
exists; a screenshot review then judged how full each scene looks. s02, s06 rich; s09 quiet on purpose. Upgraded here:
- **s10 finale:** fireworks now build like a real display (singles → downbeat volleys → barrage with gold willow
  canopies → a crown of five willows), bigger shells, plus gold spark fountains on the floor line (`sparkFountain`).
- **s01 opening:** gold comets chase round the traced outlines on the beat (`edgeRunners`); a drone swarm rises from
  the floor into a turning 3D snowflake on the snow swell (`cloudSnowflake`), becomes a star on the second swell,
  then falls away as snow.

Small fix made here: `tools/flash-check.js` now also renders story placeholders that carry finished pieces (s05 Mickey).

## Out of scope
- The pets' animated clips (WP-04), placing voices and the mix (WP-08), new music.
- Changing scene lengths, beat maps or cue times.

## Acceptance
- [x] Audit table written; small misses fixed; any large ones in a WP-11b brief on the board.
- [x] s04 reads as a joyful mess of Christmas, pet and cameo objects bursting from the boxes, building to the finale.
- [x] Mickey star figure whistles and points up in s05, 1928 design only, ready for WP-08 to place.
- [x] Flash check and smoke test pass; screenshots checked.
- [x] TREATMENT/PRD/ARCHITECTURE notes, CONTROL board + handoff updated; draft PR.
