# Design System — Christmas Mapping Show

> The visual and sonic rules for everything we project or play, plus the Mapper app UI.
> Living document. Related: [PRD](PRD.md) · [ARCHITECTURE](ARCHITECTURE.md) · [AGENTS](AGENTS.md)

| | |
|---|---|
| **Status** | v1.2 — reviewed for the LCD projector and an adult audience; all WP-10 changes approved by the owner ([TREATMENT §08–§09](TREATMENT.md)) |
| **Last updated** | 2026-11-17 |

---

## 01 · Brand identity

**"A storybook Christmas, painted with light."**
- **Feel:** classic hand-drawn Christmas animation from the 1940s–50s: warm, soft, bouncy, nostalgic.
  Real cel-style character animation (AI-generated clips, TREATMENT §09) over **flat graphic scenery and glowing
  light effects**. No painted backgrounds and no full-frame film grain: on a wall they read as muddy, noisy light.
- **Personality:** cosy, funny, tender. The pets are the comedy; the light show is the wonder;
  the baby is the heart.
- **Not:** neon or EDM-style, glossy 3D, modern Disney/Pixar look, fast cuts or strobe.
- **Audience:** made for the **adults** (8–10 family members). `{BABY}` is the guest of honour, not the target
  audience, so big light changes and soft fireworks are welcome within the §06 limits.

## 02 · Projection fundamentals (read first)

1. **Black is not quite "no light" (LCD projector).** The HAPPRUN H1's black glows faintly, so the whole image
   rectangle shows on the wall in a dark room ([STAGE_SURVEY §03e](STAGE_SURVEY.md)).
   - Scenes sit on a dim **`dusk`** base with sparse stars or snow, so the rectangle reads as "night sky".
   - Never hold a long all-black frame with one small element. **Fade to the pre-show starfield, never to black.**
   - Pure `night` is used only outside the wall (doorway, ceiling spill) and in masks.
   - A dim warm lamp behind the audience hides the remaining glow.
   - Character clips are still rendered on pure black (§09), and the app composites them over the base.
2. **The wall is the screen.** The white matte wall shows colours accurately. Dark or saturated colours look dim,
   so lean on mid-to-light tones.
3. **The tree eats light.** Only the flocked white tips reflect. Use saturated, bright colours and bold bands or
   sparkles on the tree; fine detail disappears.
4. **Avoid big full-white fills.** They wash out the room, dazzle the audience and reveal light spill.
   Full white is for short accents only (≤ 1 s).
5. **Respect the edges.** Content should touch object edges exactly. Tracing outlines with light is the core
   "mapping" effect.
6. **Projector limits:** ~300 lumens, 1080p over ~2.6 m (≈1.35 mm per pixel). Character lines **≥ 6 px** at final
   size, light traces 6–10 px with a glow, 4 px absolute minimum. Text smaller than 48 px won't read.
7. **Colour check:** cheap LCDs mute deep blue and red and tint whites green. Check the palette on the wall in WP-09
   and nudge `cranberry`/`plum` if they look dim.

## 03 · Colour palette

| Token | Hex | Use |
|---|---|---|
| `night` | `#000000` | masks, off-wall areas (doorway, ceiling spill) |
| `dusk` | `#0E1430` | the dim night-sky base for scenes (LCD glow, §02) — value to be checked on the wall in WP-09 |
| `snow` | `#F4F7FF` | snow, highlights, outlines |
| `gold` | `#FFC94A` | stars, ribbons, magic, the star |
| `candle` | `#FFB066` | warm glows, firelight |
| `cranberry` | `#E8475F` | ribbons, Santa reds, accents |
| `pine` | `#4CC38A` | holly, tree waves |
| `ice` | `#7FD3FF` | winter sky, frost, Connor's eyes |
| `plum` | `#B07CFF` | night-sky magic, gift box 2 |
| `rose` | `#FF8FB8` | gentle/tender moments, the baby's scene |
| `sepia` | `#E9D3A8` | vintage frames and title cards |

- **Scene palettes:** each scene uses at most 3–4 tokens, plus `snow` and `night`.
- **Tree waves:** full hue sweeps are allowed in the light-show scenes only.

## 04 · Typography (projected)

| Role | Font | Notes |
|---|---|---|
| Title cards | **Mountains of Christmas** (Google Fonts, Apache 2.0), bold | vintage, festive; **≥ 96 px**, two lines allowed, 4–6 px light stroke/glow |
| Secondary titles and names | **Playfair Display** (OFL), italic | elegant storybook; ≥ 72 px |
| Small captions | Playfair Display, regular | ≥ 48 px; use rarely |

Text is always light on black, short (≤ 6 words), and on screen for at least 3 s.
Spanish text uses proper accents and `¡ ¿`.

## 05 · Characters

Style: classic 1940s hand-drawn cel look (reference: the approved Gandalf style test, TREATMENT §09). **Warm light
cream rim** outlines instead of dark ink (dark ink vanishes on the dusk base), 2–3 flat tones plus a soft highlight,
big expressive eyes, rubber-hose bounce in motion. **Lifted darks:** no fill below ≈35% lightness; Connor's black
fur → blue-grey `#5A6478`, Orion's dark brown → caramel `#B07A4A`. Clips are rendered on pure black; props (the star,
sparkles) are drawn in code, not in the clip.

| Character | Look (model-sheet notes) | Personality → acting |
|---|---|---|
| **Connor** (husky, the biggest) | black-and-white coat, white head that reads as "bald", ice-blue eyes `#7FD3FF`, big plume tail | gentle giant, timid; flinches at noise (ears flat, hides behind a box), brave at the climax |
| **Alaska** (pomsky) | blonde/cream `#E8C890` fluff, like a giant Pomeranian, brown eyes, curled plume tail | overexcited boss: bouncy, points, gives orders, tail always wagging |
| **Orion** (tabby cat) | brown tabby stripes, yellow-green eyes `#C8D86A`, lip lifted on one side (missing tooth) | grumpy but lovable: slow blinks, eye-rolls, secretly helps |
| **Gandalf** (Russian Blue, the youngest) | sleek grey `#8C96A3`, big ears, huge yellow-green eyes | most playful mischief-maker: pounces, bats the star, zoomies |
| **Mickey (1928)** | *Steamboat Willie* design only: black and white, no gloves, pie-cut eyes | whistles the clue (*Steamboat Bill*, 1910, PD) in s05; appears in a small "old film" frame (static vignette and scratches, **no flicker**) |
| **Pooh (Shepard)** | E.H. Shepard book illustration style: no red shirt, pencil-and-wash look | floats up on his balloon (as in the 1926 book) with the star stuck in his honey pot (s07) |

- **Not allowed:** modern Disney Mickey (gloves, colour), Disney's red-shirt Pooh, Paddington, or any other
  copyrighted character.
- Model sheets live in `assets/characters/<name>/` (front, side, ¾, 4 expressions, walk cycle keys).

## 06 · Motion

- **Use the 12 principles of animation:** squash and stretch, anticipation, follow-through, arcs, ease-in/out.
- **Timing:** light-show effects land **on the beat**. Story beats move at storytelling pace (no rush).
- **Easing:** `easeInOutSine` for glows and washes, `easeOutBack` for pops, `linear` only for chases and snow.
- **Transitions:** iris wipes, page-turns, snow swirls and fades through black. No hard cuts.
- **Intensity:** the audience is adult, so bold colour changes, big washes and firework blooms are fine, as long as
  they stay inside the limits below.
- **Safety limits (non-negotiable):**
  - No flashes faster than **3 per second**.
  - No full-frame brightness jump bigger than 50% in under 0.5 s.
  - Fireworks bloom and fade (≥ 0.8 s); no bangs on the soundtrack.

## 07 · Zone usage

| Zone | Role | Typical content |
|---|---|---|
| `wall` | big canvas | snow, sky, edge traces, fireworks |
| `backdrop` | scenery behind the stage; the characters' set | night sky, title cards, photo frames; pets walk on a ground line just above the (black, non-reflecting) sideboard top |
| `stage` | thin strip at the sideboard top (the front is out of the beam) | footlights only |
| `box1…n` | gift boxes | faces light up, "open", characters peek out |
| `tree` | the star of the light show | colour waves, sparkles, spirals, ornament pops |
| `star` | tree top | glow, the star's arrival, the finale spotlight |
| `rightStrip` | ambience | snow spill, glow continuation |

Which scene uses which zone: [TREATMENT §07](TREATMENT.md).

## 08 · Audio style

- **Narrator:** bright, warm storyteller, classic Disney-Christmas feel, neutral Latin American Spanish.
  Calm pace, a smile in the voice. Short lines (≤ 15 s each).
- **Music:** instrumental public-domain Christmas repertoire (orchestral, music box, light big-band).
- **Sound effects:** soft and cartoony (sleigh bells, sparkles, paw pats, whoosh, "boing"). Nothing sharp or loud.
- **Never use** (the real pets react): bangs or explosions, dog barks or whines, meows, doorbells or knocks, squeaky
  toys. Fireworks are visual, with at most a soft musical swell.
- **The pets talk** (owner): character voices in neutral Latin American Spanish, animated-feature style; the narrator
  frames the story. Speech only, never realistic barks or meows.
- **Animation quality** (owner): no "MS Paint" look. Characters and Santa use real animation (TREATMENT §09); code is
  for mapped light effects only, built with additive glow, soft particles and motion trails, never flat fills.
- **Mix:**
  - The music can be **full and fairly loud** (owner): master target about **−16 LUFS** integrated, peaks ≤ −1 dBTP,
    and **no sudden loud transients** (keep the dynamic range gentle; set the soundbar level in rehearsal).
  - Music ducks about 8 dB under narration.

## 09 · Asset specs

| Asset | Format | Notes |
|---|---|---|
| Character cut-outs | PNG with transparency, 2× the target size | one file per body part when puppeted |
| Character clips | MP4/H.264 on **pure black** or HEVC with alpha | ≤ 10 s, 30 fps |
| Backgrounds | PNG/JPG, zone resolution × 2 | flat graphic shapes and soft gradients |
| Audio | WAV for masters, M4A/AAC for the app | 48 kHz |
| Naming | `kebab-case`, `<scene>-<thing>-<variant>` | e.g. `s03-gandalf-pounce-a.png` |

## 10 · Mapper app UI

- Dark panel `rgba(18,22,34,0.92)`, text `#EEF2FF`, accent `#FFD54F`, 1 px borders at 15% white, radius 9–14 px.
- System font, 15 px. Touch targets ≥ 40 px; calibration handles 56 px.
- Each zone has an ID colour (see `app/js/layout.js`), used for its calibration grid and handles.
- The UI must be hideable (Hide ✕, top-left corner to restore), because whatever is on screen is projected.

## Changelog
- **2026-11-17** — §04: Mountains of Christmas is Apache 2.0 (not OFL); both fonts are bundled in `app/fonts/` (WP-03).
- **2026-11-17** — v1.2: owner approved TREATMENT §08 #3–8: no painted backgrounds or grain, lines ≥ 6 px, light rims, lifted darks, titles ≥ 96 px, colour check.
- **2026-11-17** — v1.1 (WP-10): LCD black → `dusk` base and fade to starfield; adult audience; louder music with no
  impulsive sounds; banned pet-trigger sfx. Further style changes proposed in TREATMENT §08.
- **2026-11-16** — v1: palette, typography, characters, motion safety limits, zone roles, audio and asset specs.
