# Show Treatment — Christmas Mapping Show

> The story and running order everything else is built to: logline, character arcs, beat sheet, the live star
> moment, the cut list and the design review. Written in WP-10. **No script text here**: the Spanish lines are WP-06.
> Related: [PRD](PRD.md) · [PLAN §6](PLAN.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [STAGE_SURVEY](STAGE_SURVEY.md)

| | |
|---|---|
| **Status** | v1.2 — **approved by the owner** (2026-11-17) |
| **Last updated** | 2026-11-17 |

---

## 01 · Owner decisions (2026-11-17)

| Topic | Decision |
|---|---|
| **Audience** | The show is made **for the adults** (8–10 family members). `{BABY}` (≈3 months) will see it and is the guest of honour, but she isn't the target audience. |
| **Intensity** | Bigger light changes and soft "pyrotechnic" fireworks are welcome. The music can be **full and fairly loud**, but with **no loud bangs or sudden sounds** (Connor, the real dog, is noise-sensitive). Photosensitivity limits stay (DESIGN_SYSTEM §06). |
| **Length** | **10–15 min.** Target **≈12 min** plus the pre-show loop and the open-ended live hold. |
| **Spine** | A mix of two ideas: by family tradition **the youngest places the star**, and the star's light is **how Santa finds the house**. The search goes up into the night sky and **the constellations**, in a classic Disney-style light show. |
| **Cameos** | **Both, tiny** (≤ 15 s each, cuttable): Steamboat Willie Mickey (1928) and E.H. Shepard-style Pooh. |
| **Live moment** | **Papá taps Continue himself, afterwards.** The projection waits on a soft loop for as long as it takes. |
| **Photos** (owner, PR review) | **No family photos on screen.** Instead, **one family photo becomes a constellation** at the end: its outline is drawn in stars. The photo stays in the on-device media pack and is turned into star points on the device, never in git. |
| **Pet voices** (owner, PR review) | **The pets talk**, in animated-feature style (references for tone only: *The Lion King*, *The Secret Life of Pets*). Each pet has its own Spanish character voice; the narrator frames the story. |
| **Santa** (owner, PR review) | Santa appears **in his sleigh with reindeer, crossing the sky** in the finale: a full animated character, not a silhouette. |
| **Animation quality** (owner, PR review) | **No "MS Paint" look.** Code animation is fine for stars and light effects, but characters, Santa and hand-drawn effects need real animation. Production approach: §09 (decision pending). |

## 02 · Logline and 3-act shape

> **On `{BABY}`'s first Christmas Eve, Gandalf bats the star into the night sky. By family tradition the youngest
> of the house must place it, and its light shows Santa the way. The four pets chase it through the
> constellations to bring it home in time.**

| Act | Scenes | Shape |
|---|---|---|
| **1 · Wonder and loss** | s01–s03 | The wall wakes up and the tree comes alive. The pets decorate. The narrator sets the stakes: the youngest places the star, and its light guides Santa. Gandalf plays with the star and it shoots up and out into the sky. |
| **2 · The search** | s04–s07 | The boxes first (Alaska's plan): the star isn't there. Then the clues: Connor is spooked by jingle bells, and an old film flickers on where Mickey whistles "follow the stars". The whole wall becomes the sky and the constellations draw themselves, the pets' own among them. Pooh floats up on his balloon with the star stuck in his honey pot. Connor carries it home past Santa's jingling sleigh bells. The star settles above the tree. |
| **3 · Heart, live star, finale** | s08–s10 | Family photos and a message for `{BABY}`. The projected star bows out and **Papá and `{BABY}` place the real one**. The tree lights come on, Santa's sleigh crosses the sky guided by the star, fireworks, the pets wave goodbye. |

**Why it lands on the live moment:** the whole story delivers the star to "the youngest of the house". The
projected star can only take the story to the top of the tree; the last step has to be real.

## 03 · Character arcs

Each story beat moves at least one arc (see the "Arcs moved" column in §04).

| Character | Start | Change | End |
|---|---|---|---|
| **Gandalf** (Russian Blue, youngest pet) | careless mischief-maker: the star is a toy | owns the mistake and leads the sky search (fastest, best jumper) | gently hands the star over for the youngest of the house |
| **Connor** (husky) | scared of noise: flinches and hides at jingle bells | finds he can carry the star home through Santa's sleigh bells | proud hero, tail high, in the finale |
| **Alaska** (pomsky) | bossy, plans everything ("search the boxes!") | her plan fails, and she listens to the clue | shares the lead; organises the goodbye wave |
| **Orion** (tabby) | grumpy: "Christmas is too much fuss" | finds his own constellation (Orion) in the sky | a rare smile; purrs next to the tree in the finale |
| **Mickey** (1928 cameo) | *why he's there:* an old Christmas film reel flickers on in the backdrop (the "old film" look is his) | whistles the clue (the tune of *Steamboat Bill*, 1910, public domain) and points up | the film iris-closes |
| **Pooh** (Shepard cameo) | *why he's there:* floating up to the sky on his balloon in search of honey, as in the 1926 book | finds the star stuck in his honey pot and hands it down | drifts away happy |

**Constellations in s06** (line-art, drawn in code):
- **Orion** (real constellation) for Orion the cat
- **Canis Major** (with Sirius) for Connor, the big dog
- **Canis Minor** for Alaska (she is not pleased about "minor")
- **Felis**, the forgotten cat constellation of 1799, for Gandalf
- the **North Star** in Ursa Minor: the lost star is hiding next to it

**Voices (owner):** the pets talk, with short lines in neutral Latin American Spanish, "Disney dub" style. Casting notes
for WP-06: Connor, a deep, soft, shy gentle giant; Alaska, fast, bossy, a little diva; Orion, a dry, grumbly drawl;
Gandalf, a bright, giggly, hyperactive kid. Mickey only whistles; Pooh gets one gentle line. Speech, not animal
sounds: still no realistic barks or meows (the real pets react).

## 04 · Beat sheet

Times are placeholders for the scene builds (WP-03/08). Real music edits re-time them through `cues`.
**Total ≈ 12:15** (s01–s10, with the live hold counted at ≈1:00). Speech ≈ 3 min: narrator ≈ 1:15 plus short pet
dialogue in s03, s05, s07 and s10 (the "Narration" column lists the narrator only).

| Id | Title | Purpose | What happens | Zones | Music (licence status) | Length | Narration | On screen | Cue points |
|---|---|---|---|---|---|---|---|---|---|
| **s00** | Pre-show: starfield | Settle the room; hide the LCD glow rectangle | Slow twinkling dusk starfield, light snow on the right-wall strip. "Press play" is operator-only (UI hidden). | wall, backdrop, rightStrip | *O Christmas Tree*, music-box arrangement (trad., PD composition; PD/CC0 recording or original ElevenLabs arrangement) | loop | no | — | `loop` |
| **s01** | La pared despierta | The mapping "wow": the room itself comes alive | Light lines trace the wall edges, the sideboard top, both boxes and the tree outline; footlights warm up; snow begins on the wall and spills onto the right wall. | all | Soft magical intro, then *O Christmas Tree* (PD composition; PD recording) | 1:00 | yes, 1 line: welcome to `{BABY}`'s first Christmas Eve | — | `trace`, `snow`, `welcome`, `cut`, `out` |
| **s02** | El árbol cobra vida | The tree as the light-show star | Colour waves climb the tree on the beat, spirals, ornament pops; the star zone glows gold at the climax. | tree, star, wall (soft echo) | *Carol of the Bells* instrumental (Leontovych 1914, PD composition; the 1936 English lyrics are not used; PD/CC0 recording, e.g. US military band) | 1:30 | no | — | `build`, `drop`, `spiral`, `cut`, `star-glow`, `out` |
| **s03** | La estrella se escapa | Set up the stakes and the loss | The pets decorate (Alaska bossing, Orion grumbling). The narrator: the youngest places the star; its light guides Santa. Gandalf bats the star: it bounces off a box, up the tree and out across the wall into the sky. The star zone goes dark. | backdrop, box1, box2, tree, star, wall, stage (footlight) | Original underscore + soft sfx (ElevenLabs) | 1:15 | yes, 2 lines | all 4 pets | `pets-in`, `tradition`, `bat`, `escape`, `out` |
| **s04** | Cajas mágicas | Light show that is also Alaska's (failed) plan | The gift boxes light face by face to the music. Each one "opens" with sparkles: Gandalf pops out of one, a jack-in-the-box spring of light from another, but no star. Footlights chase. | box1, box2, backdrop, stage | *Dance of the Sugar Plum Fairy* (Tchaikovsky 1892, PD; CC0 recording e.g. Musopen, verify) | 1:15 | no | Gandalf, Alaska (peeking) | `box1-open`, `box2-open`, `cut`, `finale`, `out` |
| **s05** | ¿Dónde está la estrella? | Clues; Connor's fear; Mickey | Alaska regroups the team. A soft jingle spooks Connor behind a box (comic). Orion grumbles. An old film flickers on in the backdrop: Mickey whistles and points up, "follow the stars". | backdrop, box1, box2, stage | Original underscore; Mickey whistles *Steamboat Bill* (1910, PD; original whistle recording/ElevenLabs sfx) | 1:00 | yes, 1–2 lines | all 4 pets, Mickey | `regroup`, `jingle`, `mickey-in`, `mickey-out`, `out` |
| **s06** | Constelaciones | Full-wall wonder; the sky search | The whole wall becomes a starry sky. Constellations draw themselves star by star: Orion (Orion the cat smiles), Canis Major and Minor, Felis. A gold glint by the North Star moves away; shooting stars; snow on the right wall. | wall, backdrop, tree (soft sparkle), star, rightStrip | *Waltz of the Flowers* (Tchaikovsky 1892, PD; CC0 recording, verify), edited | 1:30 | yes, 1 line (intro) | pets as constellations (line-art) | `sky`, `orion`, `canis`, `felis`, `cut`, `glint`, `out` |
| **s07** | El tarro de miel | Find the star; Connor's brave moment | Pooh floats up on his balloon; the star glows inside his honey pot; he hands it down. Santa's sleigh bells jingle (softly) as Connor carries the star across the stage past the boxes. The star flies up and settles just above the tree tip. | backdrop, box1, box2, tree, star, wall | Original underscore + soft sleigh bells (ElevenLabs) | 1:15 | yes, 2 lines | Pooh, all 4 pets | `pooh-in`, `found`, `carry`, `fly`, `settle`, `out` |
| **s08** | Para ti, `{BABY}` | The heart: first Christmas | No photos. Gentle snow; the pets gather on the stage and look up; the star above the tree glows warmer as "¡Feliz primera Navidad, `{BABY}`!" is said by Papá and Mamá. Ends: "only one thing is missing… the real star". | backdrop, wall (dim snow), star (soft) | *Silent Night* (Gruber 1818, PD; PD/CC0 instrumental recording) | 1:00 | yes, 2 lines (the message; possibly recorded by Papá and Mamá, on-device only) | all 4 pets (quiet) | `gather`, `message`, `missing`, `out` |
| **s09** | La estrella de verdad (**live**) | The real star goes on with `{BABY}` | See §05. The projected star bows and fades to a soft gold halo at the tip; dim starfield; the tree zone stays dark. **Hold** until Papá taps Continue. | star (halo), backdrop, rightStrip (dim) | *O Christmas Tree* music-box loop (same as s00) | hold (~1:00) | no | — | `bow`, `hold` |
| **s10** | Gran final | Celebration | Tree lights are already on (plugged in during s09). A light ripple and footlights burst; **Santa in his sleigh with reindeer** flies across the sky, following the star; soft fireworks bloom and fade across the wall; the pets wave goodbye from the stage. **Closing image: the stars gather into the family constellation** (drawn from one family photo) with "¡Feliz Navidad!". Fade to the starfield (s00), never to black. | all | *Jingle Bells* (Pierpont 1857, PD) into *We Wish You a Merry Christmas* (trad., PD) or *Joy to the World* (PD); PD/CC0 recordings | 1:30 | yes, goodbye lines (pets + narrator) | all 4 pets, Santa + sleigh | `ripple`, `sleigh`, `fireworks`, `wave`, `family-constellation`, `title`, `out` |

**Owner notes (2026-11-17, WP-06 session) → [WP-11](work-packages/WP-11-box-chaos-mickey-stars.md):**
- **s04 must be chaotic, not just lights:** the pets have dived into the boxes searching for the star, and a mess of
  Christmas, pet and cameo objects bursts out on the music. Impressive, still no star.
- **Music (same day, made in WP-06):** s04 gets a new original chaotic-but-delightful cartoon-orchestra romp (busy, not
  loud) plus soft box-search sounds (rummage bed, tumbles, wobbles, toy flurries); the s09 live hold gets a warm,
  bell-driven "magic train journey" loop (original, in that spirit; no film melody). The s00 pre-show keeps the music box.
- **s05: Mickey also appears drawn in stars**, a moving constellation of the 1928 Mickey that whistles and points up as
  he gives the clue.
- **Built in WP-11:** s04 objects (20 kinds) burst from the boxes in waves on the cues and bars, bounce and pile up
  left of the tower, sparkle away at `cut` and `out`; lids pop, ears/tails peek (placeholders for WP-04's clips).
  s05: at `mickey-in` the film frame, a flat screen of drones, flies apart into a **3D drone-swarm Mickey** (solid
  volumes: sphere head, thick ears, tube limbs; owner: drone-show depth), who whistles with notes, then points up
  while a few drones drift up from his fingertip into the sky (owner: subtle), gone by `mickey-out`. s06 pets as star figures: built in WP-11b (see below).
- **s06 pets as star figures (WP-11b):** in each calm pause, after the stars have formed, a few drones peel off the
  constellation and re-form beside it, in the open sky right of the figures, as that pet: a small **3D drone swarm** with depth
  (owner: no dotted outlines; smaller than the constellations). The atlas engravings no longer show the plates' coordinate grid (owner). Orion is grumpy,
  looks up at his constellation, then gives a slow lopsided smile (one lip lifted). Connor lies down, lifts his head and his plume tail sways.
  Alaska sits proud and unimpressed beside Canis Minor (nose up, eye-roll, "hmph", wagging tail). Gandalf
  stalks, wiggles and pounces towards Felis and the lost star. Each flies back into the swarm before the next ride.
  Quality pass: s01 gets edge comets and a drone snowflake → star on its swells; s10 fireworks build to a barrage and
  a willow crown, with spark fountains on the floor line.

**Music as sourced (WP-05, details and licence evidence in `assets/CREDITS.md`).** All chosen recordings are US Air Force
Band works (public domain as US federal works), from music.af.mil via Wikimedia Commons:
s01 *O Christmas Tree* (Airmen of Note, jazz big band) · s02 **Carol of the Bells** (Band of the Rockies) · s06 *Waltz of
the Flowers* (Concert Band; its soft theme → tutti → peak shape carries the rollercoaster: the canis ride lands on the
tutti, the cut ride on the peak) · s08 *Silent Nights* (Band of the Rockies) · s10 *Jingle Bells* (Band of Mid-America,
whole track; s10 is now 1:56). s04 *Sugar Plum*, the s00/s09 music-box loop and the three story underscores are ElevenLabs originals (owner go-ahead,
1 take each). **Open:** an owner listen for drum hits in s01/s10 and for the loop seam.

**Master-mix running order (draft).** Each scene's excerpt starts at its scene start; fade the tail over the scene's
last 4 s (`out` → end); the story scenes' underscores fill s03, s05, s07.

| Scene | Show length | Recording excerpt (file time) |
|---|---|---|
| s01 | 1:00 | O Christmas Tree 0:00–1:00, fade from 0:56 |
| s02 | 1:24 | Carol of the Bells 0:00–1:24 (section ends 1:22) |
| s03 | 1:15 | s03 underscore (ElevenLabs), whole |
| s04 | 1:15 | **Box-chaos romp** (original ElevenLabs cartoon orchestra, 132 bpm; owner 2026-11-17, replaces Sugar Plum), whole |
| s05 | 1:00 | s05 underscore (ElevenLabs), whole |
| s06 | 1:30 | Waltz of the Flowers 1:28.94–2:58.94, fade from 2:54.9 |
| s07 | 1:15 | s07 underscore (ElevenLabs), whole |
| s08 | 1:00 | Silent Nights, 1:00 chosen by ear under the narration |
| s09 | 0:22 + hold | **bell "magic train" loop** (original ElevenLabs, 120 bpm 4/4; owner 2026-11-17) from file 7.97 s; the hold loops scene 0:08–0:20 = file 15.97–27.97 (6 bars) |
| s10 | 1:56 | Jingle Bells, whole track |

**Licence note:** every composition above is public domain. Each **recording** still needs a verified licence
(PD, CC0 or a US federal work) in `assets/CREDITS.md` (WP-05). Original/ElevenLabs items cost credits:
three short underscores (s03, s05, s07), a handful of sfx, and possibly the music-box loop.

## 05 · The live star moment (s09)

| Step | Who | What the projection does |
|---|---|---|
| **Cue in** | — | s08 ends on the narrator: "only one thing is missing…". The projected star at the tip pulses gently twice (a bow, ≥ 1 s per pulse) and fades into a soft gold halo. |
| **Hold** (open-ended) | Papá lifts `{BABY}` and, together, they place the real star (25 cm, on its spiral holder; top at 2.03 m). Mamá (or a guest) plugs in the tree lights once the star is on. | Dim dusk starfield on the backdrop and right-wall strip; the **tree zone stays dark** so Papá and `{BABY}` aren't lit in the face. The halo marks where the star goes (it helps in the dark). Music-box loop, quiet, seamless. |
| **Continue** | Papá hands `{BABY}` back, walks to the iPad and taps **Continue**. | s10 starts with a warm ripple up the tree from the lit star. |

**Fallbacks**
- `{BABY}` is asleep or fussy: Papá (or Mamá) places the star alone ("for `{BABY}`"), then Continue as normal.
- The star won't sit on the holder: leave it in Papá's hand, then Continue. In s10 the projected star returns
  (a `projectedStar` option in s10, off by default).
- The tree lights fail: Continue anyway; s10 still works with projection only.
- Rehearse it twice in the dress rehearsal (PLAN §7, week 6), with the tripod legs taped and the path to the iPad clear.

## 06 · Cut list (on the night)

The operator jumps to a scene's `cut` cue (or the next scene) if attention drops. Story beats stay whole so the plot holds.

| Priority | Scene | Cut | Saves |
|---|---|---|---|
| 1 | s04 Cajas mágicas | jump to `cut` (skip the second box sequence) | ≈0:30 |
| 2 | s06 Constelaciones | jump to `cut` after Orion (skip Canis/Felis) | ≈0:40 |
| 3 | s02 El árbol cobra vida | jump to `cut` (shorter build) | ≈0:30 |
| 4 | s05 Mickey | skip `mickey-in`→`mickey-out` (cameo is optional) | ≈0:15 |
| 5 | s01 La pared despierta | jump to `cut` after the welcome line | ≈0:20 |
| never | s03, s07, s08, s09, s10 | — | — |

All cuts: ≈12:15 → ≈10:00, which is still inside the agreed 10–15 min.

## 07 · Zone roles (every zone has a job)

| Zone | Used in | Role |
|---|---|---|
| `wall` | s01, s02, s03, s06, s07, s08, s10 | sky, snow, edge traces, the star's flight, fireworks |
| `backdrop` | s00, s03–s10 | the characters' "set": the pets walk on a ground line at the sideboard/wall join; photos; Mickey's film |
| `stage` | s01, s03, s04, s05, s07, s10 | thin footlight strip only (the sideboard front is out of the beam, survey §03) |
| `box1`, `box2` (+ `…Side` faces; stacked tower, owner 2026-11-17) | s01, s03, s04, s05, s07, s10 | faces light up, "open"; pets hide and peek from behind them |
| `tree` | s01, s02, s06, s07, s10 | colour waves and sparkles; **dark** during s09 |
| `star` | s02, s03, s06, s07, s08, s09, s10 | glow, the escape, the return, the halo for the real star |
| `rightStrip` | s00, s01, s06, s09, s10 | ambient snow and stars continuing round the corner |

**Note:** characters can't stand on the black sideboard top (it doesn't reflect). They stand on a drawn ground line
just above it on the backdrop, and peek from behind the boxes.

## 08 · Design system review

Checked against the HAPPRUN H1 (LCD, throw ratio 1.4, ≈2.6 × 1.46 m image at 3.5 m, ≈1.35 mm per pixel) and the
real room ([STAGE_SURVEY](STAGE_SURVEY.md) §02–§03e). **Applied** = already written into DESIGN_SYSTEM because it
follows directly from an owner decision. All proposals were approved by the owner on 2026-11-17.

| # | Area | Finding | Change | State |
|---|---|---|---|---|
| 1 | Black | LCD black glows: the whole image rectangle shows faintly on the wall and spill (survey §03e). "Black = no light" isn't true here. | Scenes sit on a dim **dusk** base with sparse stars; fade to the starfield, never to black. Pure `night` only outside the wall (doorway, ceiling spill). Use a dim warm lamp behind the audience. | **Applied** (new token `dusk` proposed) |
| 2 | Audience and audio | The show is for adults; the dog is noise-sensitive. | Allow bigger light changes and firework blooms within the flash limits. Music full and fairly loud (master ≈ −16 LUFS); **no impulsive sounds**: no bangs, barks, meows, doorbells or squeaky toys. | **Applied** |
| 3 | Backgrounds and grain | Painted backgrounds turn into muddy, low-contrast light on a wall; a full-frame film grain reads as dirt and shimmer, and makes the LCD glow worse. | Flat graphic shapes, soft gradients, silhouettes and light-line traces. The old-film look stays only inside Mickey's small frame, as a static vignette and scratches, **with no flicker**. | **Approved** |
| 4 | Line weight | At ≈1.35 mm/px a 3 px line is ≈4 mm: thin from 3–4 m away, and the warp softens it further. | Character lines ≥ 6 px at final size; light traces 6–10 px with a glow; 4 px absolute minimum. | **Approved** |
| 5 | Character outlines | Dark-brown ink (#2B1D14) emits almost nothing, so on a dark base the outline vanishes. | Characters get a warm light rim (`sepia`/`candle`) instead of dark ink when on the dusk base; dark ink only over lit scenery. | **Approved** |
| 6 | Dark fur | Connor's black and Orion's dark brown would project as holes. | Lift darks: Connor's black → blue-grey `#5A6478`; Orion's brown → caramel `#B07A4A`. No character fill below ≈35% lightness. | **Approved** |
| 7 | Typography | The backdrop is ≈730 px wide; "¡Feliz primera Navidad, `{BABY}`!" at 120 px doesn't fit on one line. Mountains of Christmas has thin strokes. | Titles ≥ 96 px, two lines allowed, with a 4–6 px light stroke/glow; fonts bundled with the app for offline use. | **Approved** |
| 8 | Colour | Cheap LCDs mute deep blue and red and tint whites green. | Keep the palette; check it on the wall with the test patterns in WP-09 and nudge `cranberry`/`plum` if they look dim. | **Approved** (check in WP-09) |
| 9 | Zones | The `stage` zone is a 31 px strip. | Footlights only (already in §07); every zone has a role (§07 above). | Applied (docs) |

## 09 · Animation production review (owner's main worry)

The owner doesn't want an "MS Paint" look. The honest split: what code does well, and what it doesn't.

| Element | Code (canvas) | Verdict |
|---|---|---|
| Mapped light: edge traces, tree waves, box faces, footlights, snow, stars, constellations, fireworks, halo | Can look professional *if* it's built with additive glow, soft particles, bloom and motion trails, never flat fills. Video can't do these: they must land exactly on the real tree, boxes and edges. | ✅ keep in code, with a quality bar |
| Characters acting and talking (4 pets, Pooh, Mickey), Santa's sleigh | Cut-out puppets moved in code look stiff and cheap: exactly the worry. | ❌ not code |
| Hand-drawn effects (magic poofs, honey splash, the star's escape trail with character) | Possible in code, but they read as "generated". | ⚠️ video clips or sprite sheets |

**Options for characters**

| | Approach | Look | Cost and risk |
|---|---|---|---|
| **A (recommended)** | **Painted model sheets → AI image-to-video clips** (ElevenLabs), 5–10 s each, on pure black; lip-sync for talking shots; the app composites them into the backdrop and box zones | real animated-feature motion | **Video credits** (≈25–40 clips for s03, s05, s07, s10; the biggest spend in the project); keeping characters consistent from shot to shot; little fine control |
| B | Motion comic: high-quality painted stills with parallax, blinks, camera moves; the voices carry the story | elegant storybook, but not "animated" | cheapest; reliable |
| C | Pro skeletal/mesh puppet rig (Spine/Live2D-style) | smooth cut-out (better than code puppets, not Disney) | new tools needed (owner approval); rigging time |

**Decision (owner, 2026-11-17): A.** The family constellation closes the finale (confirmed). Style-test spend approved.

**Style test log:** 4 Gandalf stills (gpt-image-2.5, ≈760 credits) done in the ElevenLabs flow "Christmas mapping – style test".
Video price per ≈5 s clip (estimates): kling-2.5-turbo ≈2,100 · ltx-v2-fast ≈1,450 · wan-2.6 ≈3,000 · seedance-v2-fast ≈7,300 ·
seedance-v2.5 ≈14,000 credits. **At ≈30 clips even the cheap models need ≈45–65k credits**: check the plan's balance before WP-04.

**Result (2026-11-17):** owner likes the still style (Gandalf #4 chosen as the reference). Test clip: kling-2.5-turbo, 5 s, 1080p,
2,121 credits. The character stays on model, the motion is bouncy cel-style, and the background stays pure black (it composites
cleanly). Weak spot: props can glitch (the star jumped back in mid-clip), so **keep props in code** (the star, sparkles) and let
clips carry only the character. Budget: Starter has ≈37k credits left, not enough for ≈30 clips plus voices; the owner will move to
**Creator (121k/mo)** for this project if needed. Plan: ~30 clips × ≈2.1k ≈ 64k + voices/sfx ≈ 15k, plus a few re-takes.
Gotcha: the session network needs `elevenlabsusercontent.com` allowed to download results (added to the environment).

**Original recommendation:** A for every character shot and Santa, with B as the fallback for any shot that fails; code only for the mapped light
effects, held to the quality bar above. **First, a style test before committing:** (1) a free code FX test page
(glow, sparkles, star trace, constellation) with screenshots; (2) with the owner's OK on credits, one Gandalf model
sheet plus one 5 s clip on black, judged on the real projector or the TV.

## Changelog
- **2026-11-17** — WP-11b: s06 pet star figures built as 3D drone swarms; atlas grid lines removed (owner review) (note under §04).
- **2026-11-17** — WP-11: s04 box chaos and the s05 star Mickey built; audit → WP-11b (s06 pet star figures).
- **2026-11-17** — Owner: new s04 box-chaos music and s09 bell loop (master-mix rows updated); music box stays on s00.
- **2026-11-17** — Owner notes: s04 box chaos, s05 Mickey constellation (→ WP-11).
- **2026-11-17** — WP-05: music as sourced + master-mix running order in §04; s02 is 1:24, s10 1:56 (whole Jingle Bells).
- **2026-11-17** — Owner: the star's journey is visible throughout. It turns into a night-sky star when batted off (s03), crosses each constellation in s06, is found in Pooh's pot, carried by Connor (s07), and becomes the five-point star again on the tree (WP-03 draws the motion; WP-08 adds the characters around it).
- **2026-11-17** — s06 (owner): rollercoaster pacing, explosive cosmic rides between calm constellation pauses; real atlas engravings with dimmed Spanish names (WP-03).
- **2026-11-17** — §07: the gift boxes are a stacked tower (small on big), front and side faces mapped (WP-03, owner).
- **2026-11-17** — v1.2: owner approved everything (arcs, beat sheet, design review, animation approach A).
- **2026-11-17** — v1.1 (owner PR notes): no family photos → one photo becomes the closing constellation; the pets talk; Santa's full sleigh in the finale; §09 animation production review.
- **2026-11-17** — v1 (WP-10): owner decisions, logline, arcs, beat sheet, live-moment plan, cut list, zone roles, design review.
