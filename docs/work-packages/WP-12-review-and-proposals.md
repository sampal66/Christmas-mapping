# WP-12 · Show review, proposed fixes and enhancement proposals

> **Owner decision (2026-11-19): the Recommended package (§7) is approved, including the §5 rule change.** It is split into sessions WP-14a, WP-14b, WP-13a, WP-13b and WP-15 (see CONTROL). Items outside the package (A9–A11, B5, B6, P4–P7) stay proposals.
>
> Original note: The owner picks items. Credits are
> spent only after approval (AGENTS §07). Some characters need a rule change (§5).
> Sources: the first full pre-check run (`node tools/precheck.js`, 2026-11-18), the CONTROL handoffs, and the
> scene code. Times are show times (m:ss) on the 11:57 timeline.

**Budget (owner, 2026-11-18):** 59,890 ElevenLabs credits left. Up to **40,000** for new generations, about
**20,000 kept in reserve** for fixes after the wall check (WP-09, projector ~Nov 27). The wider-framed dog re-takes
(≈ 14k) come out of the reserve, not the 40k.

**Effort units used below:**
- **Credits**: ElevenLabs. Reference prices: kling-2.5-turbo 5 s ≈ 2,121, 10 s ≈ 4,242; gpt-image start frame
  ≈ 190 per take; sound effect ≈ 100; short voice line ≈ 100–200; music piece ≈ 1,000 (estimated from WP-05).
- **Sessions**: one Claude work-package session each (≈ one evening of review for the owner).
- **Owner time**: building, measuring and reviewing.

## Contents
1. [Review: what the pre-check found](#1--review-what-the-pre-check-found)
2. [Free fixes (code only, 0 credits)](#2--free-fixes-code-only-0-credits)
3. [Animation proposals (ElevenLabs clips)](#3--animation-proposals-elevenlabs-clips)
4. [Sound and music proposals](#4--sound-and-music-proposals)
5. [New public-domain characters (needs a rule change)](#5--new-public-domain-characters-needs-a-rule-change)
6. [Projection enhancements: right wall, boxes, new objects](#6--projection-enhancements-right-wall-boxes-new-objects)
7. [Packages and budget](#7--packages-and-budget)
8. [Suggested schedule to Dec 24](#8--suggested-schedule-to-dec-24)

---

## 1 · Review: what the pre-check found

The pre-check **passes**. Nothing is broken: no console errors, every clip is present, the flash limits hold, the
timeline is consistent and every pet stands exactly on its line. What it found is about how the show *feels*:

| # | Finding | Where | Why it matters | Fix |
|---|---|---|---|---|
| R1 | **The pets are frozen for ≈ 49 s.** All four sit on the last frame of their look-up clip. | s08, 8:46–9:36 | The emotional heart of the show (the message to `{BABY}`) has four still pictures on the wall. | A1 (clips) or F2 (free fallback) |
| R2 | **More frozen stretches** of 9–17 s: Alaska and Orion after the star escapes, Connor crouched after hiding, all four after the star flies home. | s03 3:12–3:31 · s05 5:16–5:33 · s07 8:19–8:36 | Same "still picture" effect, just shorter. | A1, A4 |
| R3 | **Pooh is a still for 22.5 s**, including while he speaks his only line. His single 10 s clip ends 13 s into s07. | s07, 7:37–7:59 | The cameo the family will look at most closely is frozen while he talks. | A2, A3 |
| R4 | **Orion speaks after the pets have left.** The pets dissolve at wave + 4.6 s; his line "…Bueno. Admito que esto sí valió la pena" starts at wave + 8. | s10, ≈ 11:14 | His character arc pays off to an empty stage. | F1 (free) |
| R5 | Speakers not drawn while talking: the s06 lines (the pets are star portraits there) and the s10 sleigh lines (the pets arrive later). | s06, s10 | These are by design (voice-over). Nothing to fix. | — |
| R6 | **Render cost** is over 33 ms per frame at worst, headless: s10 ≈ 53 ms (family portrait + fireworks), s06 ≈ 42 ms, s04 ≈ 35 ms. | s04, s06, s10 | Headless uses a slow software renderer, so the iPad may be fine. If it drops frames, these scenes stutter. | F4 (check in WP-09) |
| R7 | 29 of 32 clips have ear tips touching the top edge of the frame. | most pet clips | Already softened by the 4 % fade (WP-08c). Re-takes only if it reads badly on the wall. | Reserve (dog re-takes ≈ 14k) |
| R8 | **Open listen-check items** from WP-08b, not yet confirmed by the owner: a short loud burst at 4:23.9 (s04), drum kits in s01/s10, the s08 swell placement, the music-box loop seam. | audio | A burst could startle the baby or the dog. | F5 |
| R9 | The right wall shows only plain dusk sky in 6 of 10 scenes (s02–s05, s07, s08). | right wall strip | About 13 % of the picture is idle half the show. | P1, P2 (§6) |

## 2 · Free fixes (code only, 0 credits)

These need no approval for credits. Together they make one code session (**WP-13**), best done before the
projector arrives.

| # | Fix | What changes on the wall | Effort | Risk |
|---|---|---|---|---|
| F1 | **s10: keep the pets on stage until Orion has finished.** Exit at ≈ wave + 13 s (still before `cut`). Alternative: move his line to wave + 4.5 s. | The pets wave, Orion delivers his grudging "it was worth it", *then* they rise away in star dust. | 0.1 session | Very low. Check the exit still clears before the family portrait. |
| F2 | **Never leave a pet frozen** (fallback if A1 isn't approved): after a look-up has held for ≈ 6 s, cross-fade back to the breathing idle loop. | Pets keep breathing and blinking, but they look ahead instead of up at the star. | 0.3 session | Low. Weaker than A1, because they stop looking at the star. |
| F3 | **Pooh's bob while he holds the star** (fallback if A2 isn't approved): a gentle sway and balloon bob in code instead of a dead stop. | Pooh drifts slightly while frozen. Better than a still, but his mouth doesn't move. | 0.1 session | Low. |
| F4 | **Performance safety valves**, ready to switch on in WP-09 if the iPad drops frames: family portrait 4,900 → 3,500 lights; fewer s04 toy tosses; lower firework count. | Nothing changes unless needed. | 0.3 session | Low. |
| F5 | **Audio listen-check fixes**: lower the s04 burst at 4:23.9 (sfx gain or a slower fade-in); swap the s10 Jingle Bells to a concert-band take if the drum kit feels wrong; move the s08 swell. Re-render the master mix. | Softer, safer sound for the baby and the dog. | 0.5 session (needs the owner's ears first) | Low. The re-render must pull the sources again (IDs in the WP-08b handoff). |
| F6 | **Pre-check after WP-09** with the calibrated layout (today it uses the default layout). | Catches anything the real wall geometry moves. | 0.1 session | — |

## 3 · Animation proposals (ElevenLabs clips)

All clips reuse the start frames already picked (or the last frame of an existing clip), so they need **no new
images** unless noted. Each clip goes through the existing pipeline: `clip-prep.sh` → stacked alpha → `FRAME`
measured → wired on its cue. One take each, default settings, no re-runs.

| # | Scene · time | Today | After | Credits | Effort | Risk |
|---|---|---|---|---|---|---|
| **A1** | s03, s05, s07, **s08** (all the R1/R2 stretches) | The look-up clip ends and the pet freezes. | **One seamless 5 s "look-up breathing" loop per pet** (4 clips). The pet keeps looking up at the star, breathing, blinking, with an ear twitch. One set fixes every frozen look-up in the show, and s08's heart moment gains the most. | 8,484 | 0.5 session to wire | **Low.** Same characters and start pose. The seam is crossfaded. Gandalf's look-up is subtle already. |
| **A2** | s07 · 7:37–7:59 | Pooh is a still while he hands the star down and speaks. | **Pooh holding the star:** a 5 s hold loop with balloon bob, a kind look down, and the mouth moving softly on his line. | 2,121 | 0.2 session | **Low.** Shepard-style Pooh already generated fine. |
| **A3** | s07 · 7:56–8:03 | Pooh just fades out. | **Pooh waves goodbye** as he floats up and away. | 2,121 | 0.2 session | Low. |
| **A4** | s05 · 5:16–5:33 | Connor freezes crouched after hiding. | **Connor peeks out, trembling a little** (loop), until he looks up at Mickey's point. It plays his fear arc. | 2,121 | 0.2 session | Low. |
| **A5** | s10 · 10:14–10:24 | Santa is a small (200 px) sleigh loop. | **Santa's close swoop:** a bigger, nearer pass with Santa waving, for "¡Miren! ¡Es Santa!". | 4,242 | 0.3 session | **Medium.** Reindeer legs and harness can glitch. A bigger clip costs render time, and s10 is already the heaviest scene. |
| **A6** | s03 · 2:50–3:04 | Gandalf looks up, then talks. | **Gandalf's anticipation:** wiggle, eyes locked on the star, a paw swats the air. It sets up the bat. | 2,121 | 0.2 session | Low. |
| **A7** | s05 · 5:00 | Orion talks on his talk loop. | **Orion's eye-roll and yawn** ("¿Otro? Despiértenme cuando termine"), returning to idle on its own. | 2,121 | 0.2 session | Low. |
| **A8** | s10 · 11:34 (`title`) | No Santa at the end. | **Santa's goodnight wave:** the sleigh turns over the tree and Santa waves once under the last "¡Feliz Navidad!". | 2,121 | 0.2 session | Medium. Santa's face and hands are up close. |
| A9 | s00 pre-show | Code-drawn idle sky. | **Wind-up music box loop:** an original vintage music box with a tiny turning star (new start frame, 2 takes). | 4,622 | 0.4 session | Medium. New design; a 10 s loop must be seamless. |
| A10 | s04 · 3:45 (`box2-open`) | Orion's ears only. | **Orion leaps out of box 2.** | 2,121 | 0.2 session | Medium. Must line up with the real box top. Superseded by B1 if Part B is approved. |
| A11 | s05 · 5:24–5:39 | Drone-swarm Mickey (code, already approved by the owner). | **Steamboat Willie-era Mickey film loop** on the drone film screen. | 2,501 | 0.3 session | **High.** Image providers blocked every Mickey prompt (WP-04b). One attempt, stop at the first block. |

## 4 · Sound and music proposals

Every audio change ends with **one master-mix re-render** (0.5 session: pull the sources again, render, check
loudness −16 LUFS / −1.5 dBTP and the jump report). Batch all audio changes into one re-render.

| # | What | Where | What we gain | Credits | Effort | Risk |
|---|---|---|---|---|---|---|
| S1 | **Listen-check fixes** (F5) | s01, s04, s08, s10 | No startling burst; drums only where they suit. | 0 | in F5 | Low |
| S2 | **"Twinkle, Twinkle, Little Star" on celesta / music box** (1806 text, traditional melody, public domain) | s09: the baby places the real star (replacing the bell loop), or s00 as the idle tune | The show is about a star, and this is the tune every child knows. It's the most moving musical moment we can add for a baby. | ≈ 1,000 (or 0 with a public-domain recording) | 0.5 session: new beat map with `tools/beats.js`, keep the 12 s hold loop seamless, re-render | Low. Music generation needs the owner's OK (AGENTS §07). |
| S3 | **Santa's voice: a soft "¡Jo, jo, jo! ¡Feliz Navidad!"** | s10 sleigh (with A5) or title (with A8) | Santa finally speaks to the family. | ≈ 200 (new voice design + 1 line) | 0.2 session | Low-medium. It must stay soft: no booming laugh (baby and dog, DESIGN_SYSTEM §08). |
| S4 | **Soft sound effects for new characters**: wooden "tock" steps for the Nutcracker (B1), a soft cookie "hop" for the Gingerbread Man (B3) | s04 | Every new animation lands with a sound, like the rest of s04. | ≈ 200 | in the re-render | Low |
| S5 | (optional) **Pooh's goodbye line**: "¡Adiós, amigos! ¡Feliz Navidad!" in the existing Pooh voice | s07 with A3 | His wave gets words. | ≈ 100 | 0.1 session | Low. Check it doesn't overlap the next line. |

## 5 · New public-domain characters (needs a rule change)

The owner asked for free-to-use children's characters beyond the two allowed cameos. Status below is for the US,
where works published in 1930 or earlier are public domain as of 2026. Other countries count life + 70 years. The
show is a private family screening, so the risk is low either way.

Rules for every item:
- Use the **original book look**, never a later studio version.
- No trademarked names on screen.
- Record each source in `assets/CREDITS.md`.

Each needs a new start frame (2 takes ≈ 380) plus one 5 s clip, so **≈ 2,501 credits** and ≈ 0.3 session to wire.

| # | Character (source) | Scene · time | What it adds | Risk |
|---|---|---|---|---|
| **B1** | **Nutcracker soldier** (Hoffmann 1816, Tchaikovsky 1892) | s04 · 3:45, out of box 2 | Toys coming alive is the box scene's idea. It also links to the Nutcracker waltz in s06. Replaces A10. | Low. Use an original design (red coat, tall hat). |
| **B2** | **The Velveteen Rabbit** (Williams / Nicholson, 1922) | s08 · 8:40 | A worn toy rabbit by the pets, its ears twitch as it "becomes Real". The book is about a child's first toy, a quiet echo of the message. | Low. |
| **B3** | **The Gingerbread Man** (folk tale, 1875) | s04 · 4:36 (`finale`) | Hops out of box 1, waves and runs off while the dogs' heads turn. | Low. |
| **B4** | **Peter Rabbit** (Beatrix Potter, 1902) | s10 · 11:06 (`wave`) | Waves goodbye with the pets: a first-year baby-book classic. | Medium. Describe him in the prompt without naming him; no name on screen. |
| B5 | **Piglet / Tigger** (Milne / Shepard, 1926 / 1928) | s07 · 7:39 | Pooh's friend waves with him. | Medium-high: providers may block it. Stop at the first block. |
| B6 | **Cheshire Cat** (Carroll / Tenniel, 1865) | s06 · 6:44 | A grin appears beside Felis on Gandalf's "¡Un gato! ¡Ese soy yo!". | Low-medium. Tenniel cross-hatching, not pink stripes. |
| B0 | ***Hey Diddle Diddle*** (nursery rhyme): the cow jumps over the moon as a star-swarm figure | s06 sky ride | A nursery-rhyme laugh in the sky. | **0 credits** (code, like the pet portraits). Better still with the moon disc (P4). |

Not recommended:
- Minnie and early Pluto: providers block Disney characters, as they did Mickey.
- Felix and Raggedy Ann: trademarks are still active.
- Popeye and Tintin: the rights holders still enforce their rights, and neither suits a baby.
- Still forbidden: Rudolph, Frosty, Paddington, *The Snowman*.

**Draft rule change for AGENTS §06** (apply only after owner approval):
> **Allowed cameos:** *Steamboat Willie* Mickey (1928 design), E.H. Shepard-style Pooh, and these public-domain
> characters in their original book look: the Nutcracker, the Velveteen Rabbit, the Gingerbread Man, Beatrix
> Potter's Peter Rabbit (no name on screen), Shepard-style Piglet and Tigger, Tenniel's Cheshire Cat, and Mother
> Goose nursery-rhyme figures. Never a later studio design. Record each source in `assets/CREDITS.md`.

## 6 · Projection enhancements: right wall, boxes, new objects

Today's stage: a wall with a right-hand strip, the real tree (masked black, its star zone on top), and a gift tower
of two white cardboard cubes (40 + 30 cm, BOX_SPECS). The cats stand on the tower and the dogs at its foot. s04
opens the box lids, and every story scene places pets by the tower's edges.

| # | Idea | What the family sees | Credits | Effort | Risk | Verdict |
|---|---|---|---|---|---|---|
| **P1** | **Give the right wall a job in every scene.** Today it shows plain sky in 6 of 10 scenes. Examples: s03, a falling-star trail when the star escapes; s04, a soft toy rain sliding down the strip; s05, a row of hanging stockings that sway when the jingle plays (Connor's fright); s07, the star's path home; s08, a slow aurora curtain; s10, the sleigh's trail entering from the right. | The whole picture is alive; the action wraps around the corner of the room. | 0 | 1 session (code) | Low. Keep it calm: one gentle motion at a time, inside the flash limits. | **Recommended** |
| **P2** | **Theatre curtains**: projected velvet curtains along the wall edges and the right strip open at s01 and close after the s10 title. The pre-show sits behind closed curtains. | A clear "the show starts / the show ends" moment, like a real theatre. | 0 | 0.5 session | Low. A slow open (≈ 4 s), never a fast sweep. | **Recommended** |
| **P3** | **The gift tower becomes a little cottage** in the story scenes: projected textures on the box faces (glowing windows, a door with a wreath, snow on the top edge, a chimney puff). The plain gift look stays for the light-show scenes. | The cats stand on a snowy roof. Connor's hide in s05 can read as "inside the house", with a window flickering. | 0 | 1 session | Low-medium. Textures must line up with the real boxes (check in WP-09). | **Recommended** (no hardware change) |
| P4 | **Add a white moon disc**: a 35–40 cm circle of foam board on the wall, upper right, as a new zone `moon`. | A real 3D moon: Pooh floats in front of it (s07); the cow jumps over it (B0, s06); Santa's sleigh crosses it (s10); a soft glow in s08. | 0 | Owner: 30 min build. Claude: stage model + new zone + 3 scene hooks ≈ 1 session, plus WP-09 calibration. | Medium. It must sit inside the projector frame and clear of the tree; decide after the wall check. | **Optional, after WP-09** |
| P5 | **Add a small third box** (20 cm white cube) on the floor: the baby's own present. | It opens in s08 and releases a glow (or the Velveteen Rabbit, B2). | 0 | Owner: 20 min. Claude: zone + s08 hook ≈ 0.5 session. | Medium. Floor space by the dogs is tight; the box may block their feet. | Optional |
| P6 | **Replace the boxes with a cardboard fireplace / mantel** (stockings, Santa down the chimney). | A strong Christmas image. | 0 | Owner: 3–4 h build. Claude: redo s04 (built on box lids), the stage layout (cats on the tower, dogs at its foot) and many clip positions ≈ 3+ sessions, plus a pre-check and wall check. | **High.** It breaks finished, owner-approved work 5 weeks before the show. | **Not recommended.** P3 gives the "house" feel for free. |
| P7 | **Sideboard front / footlights**: the `stage` zone is out of the projector frame in the default layout. | Footlights along the furniture edge. | 0 | Check in WP-09 only. | — | Revisit at the wall check |

## 7 · Packages and budget

All packages fit inside the 40k cap and leave the 20k reserve untouched.

| Package | Contents | Credits | Sessions (Claude) | Owner time |
|---|---|---|---|---|
| **Free (do anyway)** | F1–F6, P1, P2, P3 (+ B0 if the rule change passes) | 0 | ≈ 3.5 | Review sheets + listen check (≈ 1–2 h) |
| **Lean** | A1–A4: every frozen moment + Pooh | **14,847** | +1 | Review clips (≈ 30 min) |
| **Recommended** | A1–A8 (25,452) + B1–B4 (10,004) + S2 Twinkle (≈ 1,000) + S3 Santa voice (≈ 200) + S4 sfx (≈ 200) | **≈ 36,856** (contingency ≈ 3,144) | +2.5 (generation, wiring, one mix re-render) | Approve the rule change, pick frames for 4 new characters, review (≈ 2 h) |
| **Recommended without Part B** | A1–A8 + S2 + S3 | **≈ 26,652** (≈ 13k left for later) | +2 | ≈ 1.5 h |

Not in any package: A9, A10, A11, B5, B6. Swap them in for items of similar cost if wanted. For example, B5 + B6
(5,002) can replace A7 + A8 (4,242).

## 8 · Suggested schedule to Dec 24

| When | Work | Notes |
|---|---|---|
| Nov 19–21 | Owner picks the items and approves (or declines) the §06 rule change. **WP-13** (free fixes F1–F4, P1–P3) | WP-13 doesn't wait for the credit decisions. |
| Nov 20–26 | **WP-14**: approved generations → clips → wiring. Pre-check + contact sheets to the owner. | Generate in priority order (A1 first), so whatever is approved first lands first. |
| Nov 24–26 | **WP-15 audio**: listen-check fixes, Twinkle, Santa voice, sfx → one master-mix re-render | Needs the owner's listen check before it starts. |
| Nov 27+ | **WP-09 wall check** with the real projector: calibration, fps on the iPad (F4 if needed), ears (re-takes from the 20k reserve), P4 moon decision, pre-check with the calibrated layout (F6) | |
| Dec | Rehearsals ×3 (PRD success metric), small fixes from the reserve | Keep ≥ 10k of the reserve until Dec 20. |
