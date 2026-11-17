# Christmas Mapping — Project Plan (v2)

> Timeline and room notes. Source-of-truth docs: [PRD](PRD.md) (what/why) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) (look/sound/safety) ·
> [ARCHITECTURE](ARCHITECTURE.md) (how) · [AGENTS](AGENTS.md) (rules for AI agents).

A ~12 minute home projection-mapping show for Christmas Eve 2026. The show is **mostly light show**, with
**short story moments** in between. Narration is in Spanish (neutral, "Disney dub" accent) and everything
else in the project is in English. It is made for the family and the baby's **first Christmas**.
Development happens in Claude cloud sessions from an iPad, and the same iPad runs the show.

> **Privacy:** this repository is public. Personal details (the baby's name, family photos, narration audio
> that says her name) are **kept out of git**. Docs use the placeholder `{BABY}`. Personal media goes into a
> local "media pack" on the iPad (see §3), or into the repo only once it is made private.

---

## 1. The stage (measured)

```
 ceiling 2.20 m ┌──────────────────────── 2.10 m ────────────────────────┐┐
                │                                                         ││
                │   ★                 BACKDROP (wall above sideboard)     ││ right wall
                │  /▲\                  ≈1.07 × 1.41 m                    ││ (small strip,
     hallway    │ /▲▲▲\                                                   ││  ambient FX)
     doorway    │/▲▲▲▲▲\  TREE        ┌──────────────────────────────┐   ││
   (open, left) │▲▲▲▲▲▲▲\ 2.0 m tall  │ SIDEBOARD = STAGE  0.79 m    │   ││
                │  ▕▏      Ø 0.9 m    │ 1.07 w × 0.79 h × 0.41 d     │   ││
          floor └─────────────────────┴──────────────────────────────┴───┘┘
```

| Element | Size | Position |
|---|---|---|
| Wall | 2.10 m wide, 2.20 m to ceiling (photo check: 2.18 m ✔) | white and matte; the painting is down; fill the nail hole at ≈1.65 m |
| Tree | 2.0 m tall, Ø 0.9 m, flocked white tips, cool-white LEDs. **Photos confirm ≈2.0 m, Ø ≈1.0 m** | left; axis ≈0.4 m from the doorway jamb, ≈0.45 m out from the wall; overhangs the doorway ≈0.1 m |
| Sideboard ("stage") | 1.07 w × 0.79 h × 0.41 d m. **0.79 m height confirmed from photos** | pushed against the right wall; black top, dark wood drawers |
| Right wall | — | a narrow strip near the corner can get ambient effects (snow, glow) |
| Projector | **HAPPRUN H1** (native 1080p) | **tripod just behind the kitchen bar: 3.5 m from the wall (its furthest spot), head 1.45 m** (off-axis left). On the counter itself (2.9 m) it would need a throw ratio ≤ 1.18 ([survey §03d](STAGE_SURVEY.md)) |

> **Stage survey (2026-11-16):** the owner's photos were measured in [STAGE_SURVEY.md](STAGE_SURVEY.md). Main points:
> - the star needs ≈1.6 m of image height (≈4 m throw); the counter is closer, so plan a box riser or a smaller star
> - the sideboard front is out of the image and a poor surface: the gift boxes on the black top are the stage
> - mind the corner security camera and the right-wall sconce
>
> The numbers below are the original plan; the survey supersedes them where they differ.

**Projection geometry (HAPPRUN H1, throw ratio about 1.35, to be verified on arrival)**
- At 3.5 m the image is about **2.6 × 1.45 m**. It covers the whole 2.10 m width with some spare.
  The spare light falls into the dark hallway on the left and grazes the right wall, which we can use for ambient effects.
- The useful height is the sideboard top (0.79 m) up to the ceiling (2.20 m) = **1.41 m**. That fits the 1.45 m image
  almost exactly, and covers the tree from about 0.8 m up to the star. The lower tree, gifts and skirt glow
  with their own lights.
- **Projector height:** start with the lens at about 0.8 m (a small table or stool), level, then tilt slightly if needed.
  Keep keystone at 0. The app does all the correction.
- Tree lights stay **off** for the show until the finale (see scene 9).

**Extra set pieces (cheap, white = projectable)**
- **2–3 white gift boxes** of different sizes on the sideboard top. Cubes are the classic mapping trick:
  each face lights separately, presents "open", and characters pop out from behind them.
- Optional: a **white foam-board cut-out** (a small cottage or village silhouette) standing at the back of the sideboard
  as a 3D layer in front of the backdrop.

## 2. Hardware

| Item | Status | Notes |
|---|---|---|
| HAPPRUN H1 Native 1080P | buy on Black Friday (≈ USD 60). **Throw ratio 1.4 (manual) ✔ fits from the tripod at 3.5 m (≈1–2 cm lost at two unimportant corners).** The listing says 110 V ✔ | keystone 0, manual focus. From the counter (2.9 m) the show needs a **throw ratio ≤ ≈1.05**; the H1's ≈1.35 is too narrow ([survey §03c](STAGE_SURVEY.md)) |
| USB-C → HDMI adapter **with USB-C charging pass-through** | buy now (≈ USD 15) | needed for TV tests now |
| Samsung soundbar | have | Bluetooth from the iPad; the app has an **audio-delay slider** to fix Bluetooth lag |
| TV with HDMI | have | stands in for the projector until it arrives |
| iPad Air 5 (M1, iPadOS 27) | have | Stage Manager external display → true 1920×1080 output |

## 3. Software architecture

```
 cloud session (Claude) ──git──▶ GitHub ──deploy──▶ Mapper web app (Safari, works offline)
                                                       ├─ PREVIEW   scenes drawn over a photo of the wall
                                                       ├─ CALIBRATE drag zone corners on the real wall
                                                       └─ SHOW      timeline + audio, one tap
                                                       iPad ──USB-C/HDMI──▶ projector (or TV)
```

- **Zones** (each one is warped with its own corner pin):
  `wall` (full), `backdrop` (above sideboard), `stage` (sideboard front + top edge), `boxes` (one zone per visible face),
  `tree` (polygon mask), `star` (the top point), `rightStrip`.
- **Rendering:** per-zone canvases warped with CSS `matrix3d` homographies, plus masks (WebGL later if needed). **Black = no light**, so characters drawn on black need
  no transparency.
- **Content types:** (1) effects written as code: snow, chases, washes, sparkles, text, fireworks;
  (2) character clips/cut-outs on black.
- **Timeline engine:** scenes keyed to one master audio track. It has **hold points** that loop until the operator taps
  (for the live star moment).
- **Media pack:** personal files (photos, narration with the baby's name, the final mix) are loaded from the iPad
  (Files app) and stored on the device, never committed while the repo is public.
- **Safety net:** a cloud-rendered **1080p MP4** of the calibrated show, playable from Files or a USB stick
  (with a manual pause for the live moment).
- **Testing on the TV:** the TV shows exactly what the projector will show. We use it for output, timing,
  audio sync and the calibration UI against a flat "virtual wall". Real geometry is done on the actual wall
  once the projector arrives.

## 4. Cast and look

**Style:** classic hand-drawn Disney-era animation (1930s–50s): warm, bouncy, soft ink lines, painted backgrounds,
a light film-grain pass.
**Projection review (WP-10):** for the LCD projector the look leans to flat graphic shapes, bold lines and light
rims on a dim night-sky base, with no full-frame grain (⏳ owner to approve; see [TREATMENT §08](TREATMENT.md) and
[DESIGN_SYSTEM](DESIGN_SYSTEM.md)). The show is for the adults. The pets **talk** (character voices); characters and Santa get real animation, not code
puppets (production approach: [TREATMENT §09](TREATMENT.md)).

| Character | Who | Design notes | Personality |
|---|---|---|---|
| **Connor** | husky, the biggest | black and white, white head that looks "bald", ice-blue eyes, big fluffy tail | gentle giant, timid, **scared of loud noises**, brave when it counts |
| **Alaska** | pomsky | blonde/cream, looks like a giant Pomeranian, brown eyes, plume tail | overexcited, **rules the house**, bossy leader |
| **Orion** | European common cat (tabby) | brown tabby, yellow-green eyes, lip lifted on one side (missing tooth) → permanent grumpy look | grumpy but lovable |
| **Gandalf** | Russian Blue, the youngest | sleek grey, big ears, huge yellow-green eyes | the most playful, **mischief-maker** |
| Cameos | public-domain versions only | *Steamboat Willie* Mickey (1928, B&W) and Pooh as drawn by E.H. Shepard | ≤ 15 s each: Mickey whistles the clue from an old film (s05); Pooh's honey pot holds the star (s07) |

**Making them:** pet photos → AI model sheets in the classic style → cut-out puppets animated in code, plus a few
AI image-to-video actions on black. The star element (a gold star like the real one) is shared by story and finale.

## 5. Audio

- **Narrator:** bright, warm storyteller, classic Disney-Christmas feel, **neutral Latin American Spanish**
  (dubbing accent). Short lines only; about 1:45 of speech in total (WP-10).
- **Music:** instrumental public-domain classic American and European Christmas music, in English or instrumental:
  *Carol of the Bells* (instrumental), *Jingle Bells*, *Deck the Halls*, *We Wish You a Merry Christmas*,
  *O Christmas Tree*, *Joy to the World*, *God Rest Ye Merry Gentlemen*, *Silent Night*, plus **Tchaikovsky's
  Nutcracker** (perfect for light shows).
  - **Avoid** modern songs that are still copyrighted (*Sleigh Ride*, *Rudolph*, *Frosty*, *White Christmas*, …).
  - **Sources:**
    1. Public-domain recordings, e.g. **US military band** Christmas recordings (US federal works) and Musopen / CC0
       Nutcracker recordings. Free, and they spare ElevenLabs credits. Licence to be verified per track.
    2. ElevenLabs Music for original underscore, stingers and transitions.
- **Sound effects:** ElevenLabs (sleigh bells, sparkles, paws, magic whoosh, a soft "boing").
- **Adult audience, Connor-friendly:** the music can be full and fairly loud, but with **no loud bangs or sudden sounds**,
  no barks, meows or doorbells, and no fast strobe. Fireworks are visual, soft and fading.
- **Speech:** ≈3 min: narrator ≈1:15 plus short pet dialogue (beat sheet in [TREATMENT](TREATMENT.md)).

## 6. Show outline (≈ 12 min, agreed range 10–15 min)

The full beat sheet (purpose, zones, music licence, cues, cast) is in **[TREATMENT.md](TREATMENT.md)**, which wins if
this summary disagrees. Logline: *on `{BABY}`'s first Christmas Eve, Gandalf bats the star into the night sky; by
tradition the youngest places it, and its light guides Santa, so the pets chase it through the constellations.*

| # | Scene | Type | Zones | Music | ≈ Time |
|---|---|---|---|---|---|
| 0 | **Pre-show**: dusk starfield (never pure black: LCD glow) | loop | wall, backdrop, rightStrip | *O Christmas Tree* music box | — |
| 1 | **La pared despierta**: lines trace the room, snow begins; welcome to `{BABY}`'s first Christmas Eve | light + 1 line | all | *O Christmas Tree* | 1:00 |
| 2 | **El árbol cobra vida**: colour waves climb the tree | light show | tree, star | *Carol of the Bells* (instr.) | 1:30 |
| 3 | **La estrella se escapa**: pets decorate; the tradition and Santa's guiding light; Gandalf bats the star into the sky | story | backdrop, boxes, tree, star, wall | original underscore | 1:15 |
| 4 | **Cajas mágicas**: boxes open face by face (Alaska's plan), but no star | light show | boxes, backdrop, stage | *Sugar Plum Fairy* | 1:15 |
| 5 | **¿Dónde está la estrella?**: Connor spooked by jingle bells; Mickey's old film whistles "follow the stars" | story | backdrop, boxes | original + *Steamboat Bill* whistle | 1:00 |
| 6 | **Constelaciones**: the wall becomes the sky; Orion, Canis Major/Minor, Felis; a glint by the North Star | light show | wall, backdrop, star, rightStrip | *Waltz of the Flowers* | 1:30 |
| 7 | **El tarro de miel**: Pooh's honey pot holds the star; Connor carries it past the sleigh bells; it settles above the tree | story | backdrop, boxes, tree, star | original + soft sleigh bells | 1:15 |
| 8 | **Para ti, `{BABY}`**: no photos; the pets look up at the star, "¡Feliz primera Navidad!" from Papá and Mamá | tender | backdrop | *Silent Night* | 1:00 |
| 9 | **La estrella de verdad** (live): projected star bows to a halo; Papá and `{BABY}` place the real star; tree lights plugged in; **Papá taps Continue** | **hold point** | star halo, dim sky; tree dark | music-box loop | ~1:00 |
| 10 | **Gran final**: Santa in his sleigh crosses the sky, soft fireworks, pets wave; one family photo becomes a constellation, "¡Feliz Navidad!" | light show | all | *Jingle Bells* → *We Wish You…* / *Joy to the World* | 1:30 |

During the live moment (9) the tree zone stays dark, so Papá and the baby aren't lit in the face; only a soft gold
halo marks the tip. On-the-night cuts (to ≈10 min) are listed in [TREATMENT §06](TREATMENT.md).

## 7. Timeline to Christmas Eve

| Week | Dates | Goals |
|---|---|---|
| 1 | Nov 16–22 | ✅ Plan. **Mapper v0** (zones, calibration, test patterns, preview). Spanish script draft. Buy HDMI adapter; first TV test. |
| 2 | Nov 23–29 | **Buy HAPPRUN (Black Friday, Nov 27).** Character model sheets. Narrator voice. Timeline engine + audio sync. |
| 3 | Nov 30–Dec 6 | First calibration on the real wall. Scenes 1, 2, 4, 6 (code effects). Music sourced. |
| 4 | Dec 7–13 | Story beats 3, 5, 7 (characters). Narration generated. |
| 5 | Dec 14–20 | Scenes 8–10. Full run-throughs. **MP4 backup.** |
| 6 | Dec 21–24 | Dress rehearsal (practise the star moment!). **Show on Dec 24.** |

## 8. Repo structure

```
christmas-mapping/
├─ docs/            plan, script (guion), setup guide
├─ app/             Mapper web app
│  ├─ engine/       warping, masks, timeline, audio
│  └─ scenes/       one file per scene
├─ assets/          non-personal art, music, sfx
└─ tools/           cloud scripts (MP4 export)
```

## 9. Still open

- Make the repo **private**? It would then hold personal media. Hosting a private repo needs GitHub Pro for Pages,
  or a free alternative such as Cloudflare Pages.
- More photos of each pet (full body, side view) when convenient.
- A straight-on photo of the arranged wall (later).
- Soundbar model (later). Reconnect the ElevenLabs connector from a PC with full permissions.

## Changelog
- **2026-11-17** — §4, §5, §6 updated to the WP-10 treatment (new scene titles, music per scene, adult audience, live-moment operator).
