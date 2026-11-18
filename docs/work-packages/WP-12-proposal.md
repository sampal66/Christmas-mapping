# WP-12 · Proposed new ElevenLabs generations (≤ 40k credits)

## Proposed new ElevenLabs generations (≤ 40k credits)

> **Proposal only: nothing has been generated.** The owner approves the list (or parts of it) before any credits are
> spent (AGENTS §07). Budget (owner, 2026-11-18): 59,890 credits left → up to **40,000** for new generations, about
> **20,000** kept in reserve for fixes after the wall check (WP-09). The wider-framed dog re-takes (≈ 14k, CONTROL
> WP-08c) are part of that reserve, **not** of the 40k.

Based on the first full pre-check run (2026-11-18). The things it found that a generation would fix:
- **Frozen pets** (check 3b): a once-and-hold clip sits on its last frame, so a pet is a still picture on the wall.
  s08: all four pets frozen on their look-up for **≈ 49 s** (8:46–9:36). s07: four pets frozen 9–17 s after `fly`.
  s03: Alaska 16.5 s, Orion 12.5 s. s05: Connor 17.5 s crouched on `s05-connor-hide`.
- **Pooh is a still for 22.5 s** (7:37–7:59), including his only line: his single 10 s clip ends 13 s into s07.
- **Speakers not on stage** (check 2): the s06 lines (pets are star portraits there: by design), the s10 sleigh lines
  (pets arrive at `wave`: by design), and **s10-orion-01**, which is spoken after the pets have already dissolved
  (pets leave at `cut` − 3 ≈ wave + 4.6 s; his line is at wave + 8). That last one is a free code fix, see below.
- **Code-drawn fallbacks still carrying a moment:** s05 Mickey (drone swarm; providers blocked every image attempt),
  s04 pets (ears and tails only), the pre-show (s00, pure code).

Costs: kling-2.5-turbo 5 s ≈ 2,121, 10 s ≈ 4,242; gpt-image start frame ≈ 190 per take. Pet and Pooh clips reuse
the picked start frames (or the last frame of an existing clip), so they need no new images. One take each,
default settings, no re-runs (AGENTS §07). All motion is gentle, with no flashes or sudden moves (DESIGN_SYSTEM §06).

| # | Scene · time | What it adds | Model | Credits | Running total | Risk |
|---|---|---|---|---|---|---|
| 1 | s03, s05, s07, **s08** (8:46–9:36 and the stretches above) | **Look-up breathing loops**, one per pet (4 × 5 s, seamless): starts on each look-up clip's last frame, then soft breathing, blinks and ear twitches while looking up. Replaces every frozen look-up in the show; s08's heart moment gains the most. | kling-2.5-turbo, 4 × 5 s | 8,484 | 8,484 | Low: same characters and start frames; the loop seam is crossfaded by `clip-prep.sh --loop`. Gandalf's look-up is already subtle. |
| 2 | s07 · 7:37–7:59 (`found` → `carry`) | **Pooh holding the star**: a 5 s hold loop (bobbing on the balloon, looking down kindly, mouth moving softly for his line). | kling-2.5-turbo, 5 s | 2,121 | 10,605 | Low: E.H. Shepard-style Pooh already generated fine (WP-04b). |
| 3 | s07 · 7:56–8:03 (`carry` + 2 → + 9) | **Pooh waves goodbye** as he floats up and away (now he just fades). | kling-2.5-turbo, 5 s | 2,121 | 12,726 | Low. |
| 4 | s05 · 5:16–5:33 | **Connor peeking out, trembling a little** (loop), after the hide clip, until he looks up at Mickey's point. | kling-2.5-turbo, 5 s | 2,121 | 14,847 | Low. |
| 5 | s10 · 10:14–10:24 (`sleigh`) | **Santa's close swoop**: a bigger, nearer sleigh pass with Santa waving (today a 200 px loop), for "¡Miren! ¡Es Santa!". | kling-2.5-turbo, 10 s | 4,242 | 19,089 | Medium: reindeer legs and harness artefacts; a larger clip costs render time (keep it no bigger than drawn; s10 is already the costliest scene headless). |
| 6 | s03 · 2:50–3:04 (`tradition` + 11 → `bat`) | **Gandalf's anticipation**: wiggles, eyes locked on the star, a paw lifts and swats the air. Sets up the bat (today: look-up, then talk). | kling-2.5-turbo, 5 s | 2,121 | 21,210 | Low. |
| 7 | s05 · 5:00 (`regroup` + 6) | **Orion's eye-roll and yawn** ("¿Otro? Despiértenme cuando termine"), returning to idle on its own. | kling-2.5-turbo, 5 s | 2,121 | 23,331 | Low. |
| 8 | s10 · 11:34 (`title`) | **Santa's goodnight wave**: the sleigh turns over the tree and Santa waves once before flying off, under the last "¡Feliz Navidad!". | kling-2.5-turbo, 5 s | 2,121 | 25,452 | Medium: Santa's face and hands up close. |
| 9 | s00 pre-show (idle, before the show and after the finale) | **Wind-up music box loop**: an original vintage music box with a tiny turning star, to sit over the idle music-box tune. | gpt-image start frame (2 takes) + kling 10 s | 4,622 | 30,074 | Medium: a new design (owner picks the frame); a 10 s loop must be seamless. |
| 10 | s04 · 3:45 (`box2-open`) | **Orion leaps out of box 2** and lands beside it (today: ears only). | kling-2.5-turbo, 5 s | 2,121 | 32,195 | Medium: the clip must line up with the real box top (re-check in WP-09). |
| 11 | s05 · 5:24–5:39 (`mickey-in` → `mickey-out`) | **Steamboat Willie-era Mickey film loop** (1928 design, black and white, whistling at the wheel), shown on the drone film screen. | gpt-image start frame (2 takes) + kling 5 s | 2,501 | 34,696 | **High:** gpt-image and FLUX 2 Pro blocked every Mickey prompt (WP-04b), even ones stating the 1928 design is public domain. One attempt only and stop at the first block; the drone-swarm Mickey stays as the fallback. Never a modern design. |
| — | (unallocated) | Contingency inside the 40k: only for replacing one clip that comes out broken, and only with the owner's OK. | — | 5,304 | 40,000 | — |

**Suggested order** if the owner approves only part: 1 → 2 → 3 → 4 (≈ 14.8k fixes every frozen moment and Pooh),
then 5–8 (story extras, ≈ 10.6k), then 9–11 (nice-to-have and high-risk items).

**Free fixes found by the pre-check (no credits, a code WP):**
- s10: pets leave before Orion's line (wave + 8). Keep them on stage until ≈ wave + 13 (still before `cut`), or move
  the line to wave + 4.5.
- If item 1 is not approved, s08's frozen look-ups can cross-fade back to the idle loops after ≈ 6 s (the pets
  then look ahead instead of up at the star).

Not proposed: anything with modern Disney or Pixar designs, Paddington or copyrighted songs (AGENTS §06); a group clip
of all four pets (keeping four characters consistent in one generation is too risky for the budget).

## Part B · More public-domain characters for a baby's first Christmas (owner request, 2026-11-18)

> The owner asked for public-domain, free-to-use children's characters beyond the two allowed cameos.
> **This needs a rule change**: AGENTS §06 allows only Steamboat Willie Mickey and Shepard-style Pooh. Nothing below is
> used until the owner approves the change (draft wording at the end).
> Copyright status below is for the **US** (works published in 1930 or earlier are public domain as of 2026). Other
> countries count life + 70 years, so it can differ. The show is a private family screening, so the risk is low either way.
> Rules for every item: use the **original book or engraving look**, never a later studio version (Disney, Pixar,
> modern merchandise). Never use a trademarked logo or a modern product name in on-screen text. Record each character's
> source in `assets/CREDITS.md`. Same safety limits (DESIGN_SYSTEM §06) and the same cel-clip pipeline (stacked alpha).

### Candidates (ranked by fit with the story and the audience)

| # | Character · source (PD basis) | Scene · time | What it adds | Credits | Risk |
|---|---|---|---|---|---|
| B1 | **Nutcracker soldier**: Hoffmann 1816, Tchaikovsky 1892 | s04 · 3:45 (`box2-open`) | A wooden Nutcracker marches out of the box and salutes. Toys come alive, which is the box scene's idea, and it links to the Nutcracker music in s06. | start frame 2 × 190 + kling 5 s = **2,501** | Low. Use an original design (red coat, tall black hat), not a film version. |
| B2 | **The Velveteen Rabbit**: Margery Williams, illustrated by William Nicholson, 1922 | s08 · 8:40–9:00 (`gather`) | A worn toy rabbit nuzzles up by the pets and its ears twitch as it "becomes Real". The book is about a child's first toy, a quiet echo of the s08 message. Code adds the star dust. | **2,501** | Low. |
| B3 | **The Gingerbread Man**: folk tale, *St. Nicholas* magazine 1875 | s04 · 4:36 (`finale`) | A gingerbread cookie hops out of box 1, waves and runs off ("catch me"), while the dogs' heads turn. | **2,501** | Low. |
| B4 | **Peter Rabbit**: Beatrix Potter 1902 (PD in the US; Potter died 1943, so PD in life + 70 countries since 2014) | s10 · 11:06 (`wave`) | A small rabbit in a blue jacket, in Potter's watercolour style, waves with the pets. A classic first-year baby book. | **2,501** | Medium: the publisher holds trademarks on the name, and a provider may block "Peter Rabbit". Describe the character in the prompt without naming him; no name on screen. |
| B5 | **Piglet** (1926) / **Tigger** (1928): A.A. Milne, illustrated by E.H. Shepard (US PD since 2022 / 2024) | s07 · 7:39 (`found`) | Pooh's friend peeks over the balloon string, then waves goodbye with Pooh (pairs with items 2–3). | **2,501** | Medium-high: same legal basis as the Pooh we already use, but providers may treat it like Disney. Shepard look only, stop at the first block. |
| B6 | **Cheshire Cat**: Lewis Carroll, illustrated by John Tenniel, 1865 | s06 · 6:44 (`felis` + 3) | Next to Felis, a grin fades in before the cat appears, right on Gandalf's "¡Un gato! ¡Ese soy yo!". | **2,501** | Low-medium. Tenniel's cross-hatched style, not pink stripes. |
| B7 | **"Twinkle, Twinkle, Little Star"**: Jane Taylor 1806, traditional French melody | s00 pre-show / s09 hold loop | The show is about a star: a music-box or celesta *Twinkle Twinkle* under the baby's star moment (s09), or as the idle tune. | ElevenLabs music, ≈ 1,000 (estimate; confirm before generating, AGENTS §07) | Low. Music, not a character. A public-domain recording is an alternative. |
| — | **Free, no credits:** *Hey Diddle Diddle* (nursery rhyme), the cow jumping over the moon as an s06 drone-swarm constellation, built in code like the pet portraits | s06 sky ride | A nursery-rhyme laugh in the sky. | 0 (code WP) | None. |

Not recommended:
- **Minnie** (Steamboat Willie, 1928) and early **Pluto** (1930): public domain in the US, but providers block Disney characters as they did Mickey.
- **Felix the Cat** (early shorts are PD, but the trademark is active), **Raggedy Ann** (active trademark), **Tintin** and **Popeye** (aggressive rights holders, or not for babies).
- Still forbidden: Rudolph, Frosty, Paddington, *The Snowman*.

### How it fits the 40k

Each new character needs its own start frame (2 takes ≈ 380), because none is on file. Suggested mix (owner picks):

| Set | Items | Credits |
|---|---|---|
| Part A 1–8 (frozen-moment fixes + story extras) | 1–8 | 25,452 |
| Part B picks | B1 Nutcracker, B2 Velveteen Rabbit, B3 Gingerbread, B4 Peter Rabbit | 10,004 |
| Music | B7 Twinkle Twinkle (estimate) | ≈ 1,000 |
| **Total** | | **≈ 36,456** |
| Contingency inside the 40k | | ≈ 3,544 |

This drops Part A items 9–11 (pre-show music box, Orion out of box 2, Mickey film; 9,244), because B1/B3 do the box
scene better. If more of Part B is wanted, B5 and B6 (5,002) replace items 7–8 (Orion eye-roll, Santa goodnight
wave; 4,242).

### Draft rule change for AGENTS §06 (apply only after owner approval)

> **Allowed cameos:** *Steamboat Willie* Mickey (1928 design), E.H. Shepard-style Pooh, and these public-domain
> characters in their original book look: the Nutcracker, the Velveteen Rabbit, the Gingerbread Man, Beatrix
> Potter's Peter Rabbit (no name on screen), Shepard-style Piglet and Tigger, Tenniel's Cheshire Cat, and Mother Goose
> nursery-rhyme figures. Never a later studio design. Record each source in `assets/CREDITS.md`.
