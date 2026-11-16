# Christmas Mapping — Project Plan (v1, draft for agreement)

A 10–12 minute home projection-mapping show for Christmas Eve 2026, in Spanish,
made for the family and the baby's first Christmas. Developed in Claude cloud
sessions from an iPad; the same iPad runs the show.

---

## 1. The stage (from the room photos)

```
        ceiling (~2.4 m)
 ┌──────────────────────────────────────────┐ ← corner (camera top-right)
 │                                          │
 │   [ projected area ≈ 2.7 × 1.5 m ]       │
 │                                          │
 │    /\                   ┌────────────┐   │
 │   /  \   TREE           │ SIDEBOARD  │   │
 │  /    \  (left)         │ (stage top)│   │
 │ /______\                │            │   │
 │   ||                    └────────────┘   │
 └──────────────────────────────────────────┘ floor
   doorway edge                       right side wall (sconce)
```

- **Wall**: white, matte, about 2.5–3 m wide between the doorway edge and the corner. Great surface.
- **Right**: the sideboard moves toward the corner. Its top is the **stage** where characters stand.
  The wall above it is the **backdrop** (scenery, windows, the night sky).
- **Left**: the tree, between the doorway edge and the sideboard.
- **Projector**: about 3.5 m back, where the photos were taken. A budget mini projector
  (throw ratio about 1.2–1.4) gives an image about 2.5–2.9 m wide × 1.4–1.6 m tall (16:9).
  - That height can't cover floor-to-ceiling. We aim it at **about 0.6 m to 2.2 m above the floor**.
    That covers the sideboard top, the backdrop and most of the tree. The tree's base stays unlit
    (presents go there).
  - Place the projector on a shelf or stool about 1 m high. That avoids heavy tilt and
    keeps people's heads out of the beam.
- **To prepare**:
  - Take the framed painting down (or swap in a white card). It would muddy everything projected on it.
  - Turn off the sconce and the hallway lights.
  - Close the doorway or darken it.
  - A white or flocked tree, or one with few lights, takes projection best. A green tree works
    with strong colours.

## 2. Hardware (budget: as cheap as possible, < USD 100 total for the projector)

| Item | Target | Notes |
|---|---|---|
| Projector | ≤ USD 100 on Black Friday (Nov 27) | See checklist below. The Wowlink you found is fine if it drops to ≈ USD 50–60. |
| USB-C → HDMI adapter **with USB-C power pass-through** | ≈ USD 15–20 | Keeps the iPad charging during the show. |
| HDMI cable 1–2 m | often in the projector box | Wired only. No wireless mirroring for the show. |
| Speaker | anything you already have | Wired or Bluetooth from the iPad. The projector speaker is weak. |
| Extension cord | — | Projector + iPad charger. |

**Projector checklist (what matters for mapping, in order):**
1. **HDMI input.** Required.
2. **Auto keystone / auto focus can be switched OFF.** Required. Auto-correction ruins the mapping.
3. **Native 1080p** if the budget allows. Many "4K support" models are **native 720p**
   (the Wowlink/HY300 family is 720p). 720p is acceptable for this wall.
4. Brightness: ignore "lumen" marketing. In a dark room, any of these is OK for 2.7 m.
5. Bonus: a rotating base (like the Wowlink) makes aiming easy for future projects.

Examples to check on Black Friday:
- HY300 / HY320-class models (the Wowlink is one)
- "native 1080p" listings around USD 80–100, such as HAPPRUN, YGSKK and Fudoni GC888A

Always read "native resolution" in the spec table.

## 3. Software architecture

```
 cloud session (Claude)                 iPad Air 5 (Safari)              projector
 ─────────────────────                  ───────────────────              ─────────
 code + assets in GitHub  ──deploy──▶  Web app (GitHub Pages, PWA)  ──USB-C/HDMI──▶ wall
                                         ├─ CALIBRATE mode
                                         └─ SHOW mode
```

**The web app ("Mapper")**
- **Calibrate mode**: the projector shows outlines of each zone: `backdrop`, `stage` (sideboard top edge),
  `tree` (polygon mask) and `frame` (the whole projected area). You drag the corners and points
  on the iPad until they match the real objects. The positions are saved on the device.
  You can also export them so I can use them.
- **Show mode**: a timeline plays scenes. Each scene draws into one or more zones,
  in sync with one master audio track (narration + music + effects).
- **Rendering**: WebGL canvas with corner-pin (homography) warping per zone and polygon masks for the tree.
  **Black = no light**, so characters drawn on black need no transparency tricks.
- **Two kinds of content**:
  1. **Effects written as code**: snow, light chases on the edges, tree colour washes, ornaments
     popping, sparkles, text, fireworks. Fast to iterate on.
  2. **Pre-made video clips**: classic-style character animation on a black background,
     placed into a zone.

**Getting a full 16:9 picture from the iPad Air 5**
- A plain mirrored iPad screen (1.44:1) leaves side bars. That wastes about 20% of the width.
- **Plan A**: Stage Manager external display (supported on the M1 iPad Air). Safari runs full screen
  on the projector at 1920×1080. The iPad screen keeps the controls.
- **Plan B (safety net)**: I render the whole calibrated show into **one 1080p MP4** in the cloud,
  with the mapping baked in. You play it full screen from the iPad (Files app) or from a USB stick
  in the projector. This backup is produced before Christmas Eve no matter what.

## 4. Look and characters

- **Style**: classic hand-drawn animation. Rubber-hose 1930s cartoons and storybook watercolour,
  warm colours, a light film-grain / vignette pass.
- **Cast**:
  - **Our own characters, drawn in that style** (main cast, ideas to choose from):
    a teddy bear who lights the star, a little mouse with a scarf, a reindeer pup,
    a snowman narrator-helper.
  - **Public-domain cameos**: *Steamboat Willie* Mickey (1928, black & white) and Pooh as drawn
    by E.H. Shepard. **Not** Disney's red-shirt Pooh, and **not Paddington** (still under copyright).
    Their public-domain status is clear in the US and may differ by country. This is a private
    family show; we keep them as cameos.
- **How they get made**:
  1. ElevenLabs image generation for character model sheets (front/side poses) in the vintage style.
  2. Image-to-video for short actions (walk in, wave, jump, sit) on a **black background**.
  3. Simple moves (bobbing, blinking, walking across the stage) are done in code with cut-out art.
     This saves credits.

## 5. Audio (ElevenLabs, all Spanish)

- **Narrator**: one warm Spanish voice. Short lines only, about 2–3 minutes of speech across the show.
  The narrator *presents the light show* and addresses the baby by name.
- **Character voices**: a few short lines each (or none, if cartoon sounds and music tell it better).
- **Music**: original instrumental pieces in a "vintage orchestra / music box / big band" feel.
  Public-domain carols arranged fresh: *Noche de Paz*, *Campana sobre Campana*, *Los Peces en el Río*,
  *Jingle Bells*, *El Tamborilero*.
- **Sound effects**: sleigh bells, sparkles, footsteps, a magic "whoosh".
- **Credit budget**:
  - Narration ≈ 3 min of TTS: cheap.
  - Music is the expensive part. Aim for 4–5 tracks of 2–3 min, then loop or extend in editing.
  - Video generation may not fit the plan at all. Code animation covers the gaps.
- **Baby-friendly mix**:
  - Moderate volume, no sudden loud bangs.
  - **No fast strobe flashes**: fireworks fade in and out instead of flickering.

## 6. Show outline (≈ 12 min) — first draft

| # | Scene | Zones | Time | Content |
|---|---|---|---|---|
| 0 | **Pre-show** | all | loop | A soft "starfield" waiting screen. Press play. |
| 1 | **La pared despierta** | frame, backdrop | 1:00 | Lights trace the wall edges and the sideboard. Snow begins. Narrator: *"Esta noche, en esta casa, la Navidad tiene una invitada muy especial…"* (baby's name). |
| 2 | **El árbol cobra vida** | tree | 1:30 | Colour waves climb the tree. Ornaments pop to the music. The star lights at the top. |
| 3 | **Se abre el telón** | stage, backdrop | 1:00 | A theatre curtain opens above the sideboard. The vintage title card *"Show de Luces de Navidad"* appears with film flicker. |
| 4 | **La estrella perdida** (story pt. 1) | stage, backdrop, tree | 2:30 | Our characters discover the tree's star is missing. They search; the backdrop becomes a snowy village. |
| 5 | **Interludio musical** | all | 1:30 | Mapping-only light show to a carol: wall panels, tree pulses, sideboard outline. No characters. |
| 6 | **La estrella perdida** (story pt. 2) | stage, tree | 2:00 | Public-domain cameo(s) help. The star flies onto the tree. |
| 7 | **Para ti, pequeña** | backdrop | 1:00 | A gentle lullaby moment. Name in lights, stars, a short message from mom and dad. |
| 8 | **Gran final** | all | 1:30 | Big carol, soft fireworks (no strobe), *"¡Feliz Navidad!"* from the family. |

## 7. Timeline to Christmas Eve

| Week | Dates | Goals |
|---|---|---|
| 1 | Nov 16–22 | Agree plan. Pick the projector. Build **Mapper v0** (calibrate + test patterns). Write the Spanish script. |
| 2 | Nov 23–29 | **Buy projector (Black Friday Nov 27).** Set up the room. First calibration on the real wall. Character designs. Pick the narrator voice. |
| 3 | Nov 30–Dec 6 | Scenes 1, 2, 3, 5 (code effects). Narration generated. Show timeline engine. |
| 4 | Dec 7–13 | Character scenes 4 and 6. Music tracks. |
| 5 | Dec 14–20 | Scenes 7–8. Full run-throughs on the wall. Polish timing. **Render the MP4 backup.** |
| 6 | Dec 21–24 | Dress rehearsal. Spare day for fixes. **Show on Dec 24.** |

## 8. Repo structure (planned)

```
christmas-mapping/
├─ docs/            plan, script (guion), shot list, setup guide
├─ app/             the Mapper web app (calibrate + show)
│  ├─ scenes/       one file per scene (code-driven effects)
│  └─ engine/       warping, masks, timeline, audio sync
├─ assets/
│  ├─ characters/   model sheets, cut-outs, clips (black bg)
│  ├─ audio/        narration, music, sfx (final master track)
│  └─ video/        AI clips
└─ tools/           cloud scripts: MP4 export of the calibrated show
```

## 9. Open questions

1. **Baby's name** (and what the family calls her) for the narration. Also how mom and dad want to be named.
2. Main cast: pick 2–3 from the ideas in §4, or describe your own.
3. Story: is *"La estrella perdida"* good, or do you prefer another?
4. Narrator voice: female or male? Warm grandparent tone, or bright storyteller tone?
5. ElevenLabs: the connector needs to be reconnected with full permissions (see the note in chat)
   so I can check credits and generate audio.
