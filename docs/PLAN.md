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
| Wall | 2.10 m wide, 2.20 m to ceiling | white and matte; the painting comes down |
| Tree | 2.0 m tall, Ø 0.9 m, flocked white tips, cool-white LEDs | left, next to the hallway |
| Sideboard ("stage") | 1.07 w × 0.79 h × 0.41 d m | pushed against the right wall |
| Right wall | — | a narrow strip near the corner can get ambient effects (snow, glow) |
| Projector | **HAPPRUN H1** (native 1080p) | about 3.5 m back, centred |

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
| HAPPRUN H1 Native 1080P | buy on Black Friday (≈ USD 60) | keystone 0, manual focus |
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

| Character | Who | Design notes | Personality |
|---|---|---|---|
| **Connor** | husky, the biggest | black and white, white head that looks "bald", ice-blue eyes, big fluffy tail | gentle giant, timid, **scared of loud noises**, brave when it counts |
| **Alaska** | pomsky | blonde/cream, looks like a giant Pomeranian, brown eyes, plume tail | overexcited, **rules the house**, bossy leader |
| **Orion** | European common cat (tabby) | brown tabby, yellow-green eyes, lip lifted on one side (missing tooth) → permanent grumpy look | grumpy but lovable |
| **Gandalf** | Russian Blue, the youngest | sleek grey, big ears, huge yellow-green eyes | the most playful, **mischief-maker** |
| Cameos | public-domain versions only | *Steamboat Willie* Mickey (1928, B&W) and Pooh as drawn by E.H. Shepard | short helper moments |

**Making them:** pet photos → AI model sheets in the classic style → cut-out puppets animated in code, plus a few
AI image-to-video actions on black. The star element (a gold star like the real one) is shared by story and finale.

## 5. Audio

- **Narrator:** bright, warm storyteller, classic Disney-Christmas feel, **neutral Latin American Spanish**
  (dubbing accent). Short lines only; about 2–3 minutes of speech in total.
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
- **Baby-friendly and Connor-friendly:** moderate volume, **no loud bangs**, no fast strobe. Fireworks are soft and fading.

## 6. Show outline (≈ 12 min, light show first, story in short beats)

| # | Scene | Type | Zones | ≈ Time |
|---|---|---|---|---|
| 0 | **Pre-show**: slow starfield, "press play" | loop | wall | — |
| 1 | **La pared despierta**: lines trace the wall, sideboard and boxes; snow begins. Narrator welcomes everyone to `{BABY}`'s first Christmas | light + 1 line | all | 1:00 |
| 2 | **El árbol cobra vida**: colour waves climb the tree to *Carol of the Bells* | light show | tree, star | 1:30 |
| 3 | **Story beat 1**: the pets get the house ready; Gandalf plays with the star… and it's gone | story | stage, backdrop, boxes | 1:00 |
| 4 | **Cajas mágicas**: the gift boxes light face by face to the *Nutcracker* (*Dance of the Sugar Plum Fairy*) | light show | boxes, backdrop | 1:30 |
| 5 | **Story beat 2**: Alaska organises the search; Connor gets spooked by jingle bells (comic); Orion grumbles; Mickey whistles a clue | story | stage, backdrop | 1:15 |
| 6 | **Interludio**: full-wall light show to *Jingle Bells* / *Deck the Halls*; snow spills onto the right wall | light show | all | 1:30 |
| 7 | **Story beat 3**: Pooh finds the star in his honey pot; brave Connor carries it; the star flies to the top of the tree | story | stage, tree, star | 1:15 |
| 8 | **Para ti, `{BABY}`**: gentle *Silent Night*, family photos in vintage frames, "¡Feliz primera Navidad, `{BABY}`!" from Papá and Mamá | tender | backdrop | 1:00 |
| 9 | **La estrella de verdad** (live): projected star fades; **Papá lifts `{BABY}` to place the real star**; someone plugs in the tree lights | **hold point** | star spotlight only | ~1:00 |
| 10 | **Gran final**: *Joy to the World* / *We Wish You a Merry Christmas*, soft fireworks, the pets wave goodbye, "¡Feliz Navidad!" | light show | all | 1:30 |

During the live moment (9) the projector shows only a soft glow on the tree top. That avoids lighting Papá and the baby
harshly or shining into their eyes.

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
