# WP-04 · Character pipeline: model sheets, clip layer, s04 rummaging, Mickey's film, Santa's sleigh

**PRD:** C2, C3 · **Depends on:** WP-03, WP-06, WP-10, WP-11 (merged); ElevenLabs connector · **Estimated session size:** large → split
(this WP = pipeline + 7 clips; the story-scene acting library is **WP-04b**, its own session, after the owner has judged
this WP's clips on the TV or projector)

## Goal
The characters exist as **on-model, painted 1940s cel animation clips on pure black** (TREATMENT §09, approach A), and the
app can play any clip inside a zone, in sync with show time. This WP proves the whole chain on the shots that already have
a place in built scenes: the s04 pets rummaging in the boxes, Mickey's old film in s05 and Santa's sleigh in s10. It also
writes the full shot list (below) that WP-04b generates for WP-08.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07, §08
- `docs/CONTROL.md` (WP-04 row, latest handoffs)
- `docs/TREATMENT.md` §09 (style test, model, prices), §04 rows s04, s05, s10 (beats only)
- `docs/DESIGN_SYSTEM.md` §05 (character looks), §06 (motion limits), §09 (asset specs)
- `docs/SCRIPT.md` §03 (line lengths for WP-04b's talking shots)
- Code: `app/js/scenes/s04-magic-boxes.js` (`PEEKS`, `drawPets`), `app/js/fx/toys.js` (`petPeek`),
  `app/js/scenes/index.js` (s05 `drawBackdrop`), `app/js/fx/mickey-stars.js` (opts `film`), `app/js/scenes/s10-finale.js`
  (`sleigh` cue only), `app/js/media.js` (API only), `app/sw.js` (cache list + version)

## Style bible (every prompt)
- **Look:** classic 1940s hand-drawn cel animation, painted, 2–3 flat tones + soft highlight, **warm light-cream rim line**
  (no dark ink), big expressive eyes, rubber-hose bounce. **Lifted darks:** nothing below ≈35 % lightness
  (Connor's black → blue-grey `#5A6478`, Orion's brown → caramel `#B07A4A`).
- **Background:** pure solid black `#000`, no floor, no shadow, no props, no text. Props (the star, sparkles, toys, boxes)
  are drawn in code; clips carry only the character (the test clip showed props glitching).
- **Reference:** Gandalf #4 from the style-test flow `DDHGtNXsnvZ5xlYpDsm8` ("Christmas mapping – style test (Gandalf)")
  is the style anchor for every model sheet.
- **Motion:** gentle, cel-style; no camera shake, no flashes, no fast strobing (DESIGN_SYSTEM §06). Locked camera, so the
  code can place the character on the ground line.
- **Characters (DESIGN_SYSTEM §05):** Connor husky (biggest, black-and-white, white "bald" head, ice-blue eyes `#7FD3FF`,
  plume tail) · Alaska pomsky (cream `#E8C890` fluff, brown eyes, curled plume tail) · Orion brown tabby (yellow-green eyes
  `#C8D86A`, lip lifted on one side) · Gandalf Russian Blue (sleek grey `#8C96A3`, big ears, huge yellow-green eyes) ·
  **Mickey: *Steamboat Willie* 1928 design only** (black and white, no gloves, pie-cut eyes, no colour) · **Pooh: E.H.
  Shepard 1926 book style only** (no red shirt, pencil-and-wash) · **Santa + sleigh + reindeer: original design**, red
  coat, warm and round, wooden sleigh with gold trim. No modern Disney designs, no Paddington.

## Pipeline
1. **Flow:** one ElevenLabs flow "Christmas mapping – WP-04 characters".
2. **Model sheets** (`gpt-image-2.5-sunburst`, Gandalf #4 wired as a reference image, 16:9, default takes): one sheet per
   character: front, side, ¾, 4 expressions, on black. The owner picks one take per character; it becomes that
   character's reference.
3. **Start frames** (same model, the picked sheet as reference): the shot's first pose, on black, framed as the clip.
   Re-use one start frame for several shots where the pose allows.
4. **Clips:** `kling-2.5-turbo` image-to-video (start frame wired), 5 s or 10 s (its only lengths), 16:9, 1080p
   (≈2.1k credits per 5 s, measured in the style test). **No lip-sync model**: talking shots prompt "talks animatedly"
   and are cut to the line length (cartoon mouths forgive this); a lip-sync test is optional, and WP-04b decides.
   One run per shot, default takes, **never a re-run to retry** (AGENTS §07): a failed shot falls back to the code
   placeholder or a still with code motion (approach B).
5. **Prep** (`tools/clip-prep.sh`, ffmpeg in the cloud only, not an app dependency): crush near-black to `#000`, crop to
   the character's bounding box over the whole clip, scale to ≤ 540 px tall, H.264 CRF ≈ 28, 30 fps, no audio, faststart;
   loop shots get a crossfaded seam. Target ≤ 0.6 MB per 5 s.
6. **Storage:** prepped clips are committed to `app/assets/clips/<id>.mp4` (they are original characters or public
   domain; no personal data) and pre-cached by `sw.js`, so the show stays "open and run" offline. A media-pack file with
   the same name overrides the committed one (re-takes without a deploy). Credits in `assets/CREDITS.md`.

## Build (this session)
1. **Brief approval:** show this brief and the credit estimate to the owner; generate nothing until they say OK.
2. **Clip layer** `app/js/fx/clips.js`: `loadClip(id)` (media pack first, then `assets/clips/`), `drawClip(ctx, id,
   local, { x, y, h, anchor, alpha, loop, rate, flip, clip: path })`. Composites with `'screen'` so the black vanishes;
   keeps one muted `playsinline` `<video>` per clip; plays while the show plays and **seeks to the scene time** when the
   drift is > 0.1 s or when paused/scrubbed (time-based, so MP4 export stays possible). Missing clip → returns `false`,
   and the caller draws its code placeholder. Wrap media access in try/catch; no DOM work inside draw beyond reusing the
   video element.
3. **Model sheets** for Connor, Alaska, Orion, Gandalf (sheet from #4), Mickey 1928, Shepard Pooh, Santa + sleigh →
   owner picks.
4. **s04 rummaging (5 clips)** → replace the `PEEKS` placeholders: each clip is masked at the box's top edge (the box
   face is mapped light, so the pet appears to be inside it); the code placeholder stays as the fallback.
5. **s05 Mickey's film (1 clip)** in the film frame (sepia tint, static vignette and scratches, **no flicker**); it
   dissolves into the drone Mickey at `mickey-in` + the whistle's end → call `mickeyStars(..., { film: false })` when
   the clip exists (drop the drone "film screen" stand-in).
6. **s10 Santa's sleigh (1 clip)**: an in-place flying loop; code moves it across the sky from the `sleigh` cue, with a
   code sparkle trail behind (the trail is not in the clip).
7. Prep, commit, `sw.js` version bump, smoke + flash check, screenshots of s04, s05, s10 with the clips.

## Shot list
Lengths: **gen** = generated clip length; **use** = what the scene plays (from SCRIPT §03 line lengths or the s04 peek
windows). "Loop" shots play repeatedly with a crossfaded seam.

### This WP (7 clips)
| # | Id | Scene / cue | Shot (on black) | Start frame | Gen | Use |
|---|---|---|---|---|---|---|
| 1 | `s04-gandalf-ears` | s04 5–7.8 s, `box1-open` −0.1, `cut` +2.2 | Gandalf's ears and eyes rise over an edge, swivel, duck | new | 5 s | 2.5–3 s × 3 |
| 2 | `s04-gandalf-pop` | s04 `box1-open` | Gandalf bursts up out of a box, arms up, grin, drops back | from #1 | 5 s | 2.5 s |
| 3 | `s04-connor-tail` | s04 9.2–11.3, 37–42.5, 59–67.5 | Connor's plume tail waving up out of a box (loop) | new | 5 s | loop ≤ 8.5 s |
| 4 | `s04-alaska-tail` | s04 18.5–24.5, `cut`+9.2…`finale`, 60–67.8 | Alaska's curled cream tail wagging fast (loop) | new | 5 s | loop ≤ 8 s |
| 5 | `s04-orion-ears` | s04 29–35.5, `cut` +5.8 | Orion's ears and grumpy eyes at an edge, slow blink, one ear flick | new | 5 s | 2.5–6.5 s |
| 6 | `s05-mickey-film` | s05 `mickey-in` +0 | 1928 Mickey (b/w) whistles a tune, bobbing, then points up to the sky | new | 10 s | 8 s whistle + point |
| 7 | `s10-santa-sleigh` | s10 `sleigh` | Santa waving in his sleigh, reindeer galloping in the air, side view (loop) | new | 10 s | loop, ≈12 s pass |

### WP-04b (story acting library for WP-08; ≈29 clips)
Each pet is its own clip, composited side by side on the backdrop ground line by code (single-character shots keep the
characters on model). Short lines without a special action play on the pet's **talk loop**.

| Group | Clips | Gen | Covers (SCRIPT §03) |
|---|---|---|---|
| Idle loops (breathe, blink, tail) | Connor, Alaska, Orion, Gandalf | 4 × 5 s | every scene while others talk |
| Talk loops (mouth moving, neutral-happy) | Connor, Alaska, Orion, Gandalf | 4 × 5 s | s03-orion-01/02, s03-connor-01, s05-alaska-01/02, s05-orion-01/02, s07-gandalf-01, s07-alaska-01, s07-orion-01, s07-gandalf-02, s10-gandalf-01, s10-connor-01, s10-orion-01 |
| Look-up loops (quiet wonder) | Connor, Alaska, Orion, Gandalf | 4 × 5 s | s08 gather; s03 escape; s10 sleigh |
| s03 actions | Alaska bossing + pointing (6.0 s) · Gandalf wiggle-pounce-bat (5.5 s + bat) · Alaska "¡nooo!" reach (2.0) · Gandalf "ups" ears down (2.9) · Gandalf promise, chest out (2.8) · Alaska leads off "¡primero, las cajas!" (2.9) | 10 + 10 + 4 × 5 s | s03 |
| s05 actions | Connor flinch → hides behind a box (4.8) · Gandalf bouncing "¡cascabeles!" (4.0) · Alaska "no es mi plan, pero es bueno" (5.6) | 3 × 5 s | s05 |
| s07 actions | Pooh floats up on his balloon, honey pot (6.7) · Pooh looks in the pot, hands it down (5.3) · Connor "¿yo?" → brave puff-up "¡yo puedo!" (3.1 + 3.3) · Connor walk loop carrying (star in code) | 10 + 10 + 5 + 5 s | s07 |
| s08 action | Gandalf, softly: "toma, chiquita" (2.8) | 5 s | s08 |
| s10 waves | each pet waves goodbye + "¡Feliz Navidad!" (1.5; Alaska counts in 4.0, Orion's 4.5 line) | 4 × 5 s | s10 `wave` |

## Credit estimate (owner to approve; AGENTS §07)
Prices: still 190, so ≈ 761 per image node of 4 default takes (measured); kling-2.5-turbo 1080p ≈2.1k per 5 s, ≈4.2k per 10 s.
The plan balance can't be read through the connector (permissions), so the owner checks it in ElevenLabs first.

| Item | Count | Credits |
|---|---|---|
| Model sheets (7 characters) | 7 nodes × 761 | ≈ 5.3k |
| Start frames (this WP) | ≈ 6 nodes | ≈ 4.6k |
| Clips (this WP): 5 × 5 s + 2 × 10 s | 7 | ≈ 18.9k |
| **This WP total** | | **≈ 28.8k** (actual so far ≈ 15.9k, see Status) |
| WP-04b start frames | ≈ 20 nodes | ≈ 15k |
| WP-04b clips: 25 × 5 s + 4 × 10 s | 29 | ≈ 69k |
| **WP-04b total** | | **≈ 84k** |
| **Both, + ≈ 10 % reserve for a few failed shots** | | **≈ 125k** |

Ways to spend less (owner's choice in WP-04b): drop the optional-line actions and look-up loops (−4 to −8 clips,
≈ −10–17k); approach B (painted still + code motion) for idle loops (−8 clips, ≈ −17k).

## Status (2026-11-18, end of session)
Owner approved the plan but capped this session at the **18,763 credits** left on the plan ("agree on the style and the
basis first; upgrade when really needed"). Spent ≈ 15.9k: 3 model sheets (2.3k, text-only: a wired reference image costs
≈ 430 per still instead of 190), 4 start-frame nodes (3.0k), 5 kling clips (10.6k, one **blocked** by Kling moderation).

| # | Clip | Result |
|---|---|---|
| 1 | `s04-gandalf-ears` | ✅ in app |
| 2 | `s04-gandalf-pop` | ✅ in app (starts 1.7 s before `box1-open` so the jump peaks on the cue) |
| 3 | `s04-connor-tail` | ✅ in app, loop; moved to box 2's left shoulder (its right shoulder runs off the wall zone) |
| 4 | `s04-alaska-tail` | ❌ blocked by the provider ("rump wiggles" wording); code sprite stays. Re-prompt: tail only, no rump/hips |
| 5 | `s04-orion-ears` | ✅ in app |
| 6 | `s05-mickey-film` | ⏸ after the credit upgrade (`mickeyStars` keeps `film: true` until then) |
| 7 | `s10-santa-sleigh` | ⏸ after the credit upgrade |

Prices measured: gpt-image still 190 (4 takes = 761), kling-2.5-turbo 5 s 1080p 2,121. Prepped clips ≈ 230–290 KB each.

## Out of scope
- Placing characters in s03, s05 (except Mickey), s07, s08 and the s10 wave, and voices/sfx/mix: **WP-08**.
- The story acting clips: **WP-04b**. Changing scene timings, cues, beat maps or music. New npm/build dependencies.
- s06 pet drone figures (done in WP-11b).

## Acceptance
- [ ] Owner approved this brief and its credit spend before any video generation.
- [ ] Seven model sheets picked; seven clips generated, prepped (≤ 0.6 MB per 5 s) and in `app/assets/clips/`; credits
      logged in `assets/CREDITS.md`.
- [ ] `fx/clips.js` plays clips in sync with show time (play, pause, scrub, Cut), screen-blended on the zone; a missing
      clip falls back to the code placeholder with no errors.
- [ ] s04 peeks use the clips, masked at the box tops; s05 Mickey film → drone Mickey with `film: false`; s10 sleigh
      crosses the sky on the `sleigh` cue.
- [ ] Smoke test + flash check pass; screenshots of s04, s05, s10 checked; `sw.js` version bumped.
- [ ] PRD C2/C3 status, TREATMENT §09 log, DESIGN_SYSTEM §09 (clip storage), CONTROL board (WP-04b row) + handoff updated.
