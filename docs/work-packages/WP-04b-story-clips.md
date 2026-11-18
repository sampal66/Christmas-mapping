# WP-04b · Story acting clips (s03, s05, s07, s08, s10) + Alaska tail, Mickey film, Santa sleigh

**PRD:** C2, C3 · **Depends on:** WP-04 (merged; pipeline, model sheets, `fx/clips.js`, `tools/clip-prep.sh`) · ElevenLabs
connector · **Estimated session size:** large (≈ 35 generations; prep and checks are scripted)

## Goal
Every character shot the story scenes need exists as an on-model, transparent clip in `app/assets/clips/`, ready for
WP-08 to place with the voices. Generation stays inside the credit budget below: **125,959 credits must last the whole
project** (owner, 2026-11-18).

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07, §08
- `docs/CONTROL.md` (this row, latest handoff)
- `docs/work-packages/WP-04-characters.md` (style bible, pipeline, Status table; the shot list there is superseded by this one)
- `docs/DESIGN_SYSTEM.md` §05, §06, §09 · `docs/SCRIPT.md` §03 (line lengths only)
- Code: `app/js/fx/clips.js` (API only), `tools/clip-prep.sh`, `app/sw.js` (cache list)

## Budget (owner: 125,959 credits for everything that remains)
Measured prices: gpt-image still **190** (default 4 takes = **761** per node; text-only prompts, a wired reference image
more than doubles it), kling-2.5-turbo 1080p **2,121** per 5 s, **4,242** per 10 s.

| Item | Count | Credits |
|---|---|---|
| Start frames: 4 pets standing on the ground line (¾ view, facing right; re-used by every pet clip) | 4 nodes | 3,044 |
| Start frames: Pooh on his balloon, Mickey 1928, Santa + sleigh + reindeer | 3 nodes | 2,283 |
| Clips (table below): 31 × 5 s + 1 × 10 s | 32 | 70,005 |
| **WP-04b total** | | **≈ 75.3k** |
| Re-take reserve (≈ 10 %, only for a broken or blocked shot, owner OK each time) | | 7.5k |
| WP-08 reserve (missing/odd sfx, a re-recorded line) | | 5k |
| **Unallocated, keep for owner wishes after rehearsal** | | **≈ 38k** |

Rules: one run per shot, default takes, never re-run to retry (AGENTS §07). Before each batch, `estimate_only` and
report the running total. Stop and ask the owner if the WP total would pass **80k**.

## Shot list (32 clips)
Each pet is its own clip (single-character shots keep them on model); WP-08 places them side by side on the backdrop
ground line. Short lines with no special action play on the pet's **talk loop**. Loops get `--loop` in prep.

| # | Id | Gen | Start frame | Action (on black, locked camera) | Covers |
|---|---|---|---|---|---|
| 1–4 | `pet-<name>-idle` | 4 × 5 s | standing | breathing, blink, tail sway, small weight shift (loop) | every scene while others talk |
| 5–8 | `pet-<name>-talk` | 4 × 5 s | standing | talks animatedly, mouth moving, small gestures (loop) | s03 Orion ×2, Connor; s05 Alaska ×2, Orion ×2; s07 Gandalf, Alaska, Orion, Gandalf; s10 Gandalf, Connor, Orion, Alaska count-in |
| 9–12 | `pet-<name>-lookup` | 4 × 5 s | standing | looks up in quiet wonder, soft smile (loop) | s08 gather; s03 escape; s10 sleigh |
| 13 | `s03-alaska-boss` | 5 s | Alaska standing | points and gives orders, bossy bounce | s03-alaska-01 (6.0 s: hold last frame / talk loop) |
| 14 | `s03-gandalf-bat` | 5 s | Gandalf standing | wiggles, pounces, bats upward (star in code) | s03-gandalf-01 + bat |
| 15 | `s03-alaska-nooo` | 5 s | Alaska standing | reaches out, "¡nooo!", ears back | s03-alaska-02 |
| 16 | `s03-gandalf-oops` | 5 s | Gandalf standing | ears down, sheepish, then chest out and promise | s03-gandalf-02 + 03 |
| 17 | `s05-connor-hide` | 5 s | Connor standing | flinches at a sound, ducks and cowers, peeks | s05-connor-01 |
| 18 | `s05-gandalf-bells` | 5 s | Gandalf standing | bounces excitedly, ears up, looks around | s05-gandalf-01 |
| 19 | `s07-pooh-float` | 10 s | Pooh | floats up on his balloon, looks into his honey pot, lowers it gently (star in code) | s07 pooh-in → found |
| 20 | `s07-connor-brave` | 5 s | Connor standing | nervous, then puffs up, determined nod | s07-connor-01 + 02 |
| 21 | `s07-connor-carry` | 5 s | Connor standing | walks proudly, head high, mouth closed as if carrying (star in code; loop; code moves him) | s07 carry |
| 22 | `s08-gandalf-soft` | 5 s | Gandalf standing | gentle, offers with a paw, tender smile | s08-gandalf-01 |
| 23–26 | `s10-<name>-wave` | 4 × 5 s | standing | waves goodbye happily | s10 wave + "¡Feliz Navidad!" |
| 27 | `s04-alaska-tail` | 5 s | existing WP-04 frame (Alaska tail) | **tail only** wagging fast (loop). Don't say "rump", "hips" or "behind": Kling blocked that wording | s04 peeks |
| 28 | `s05-mickey-film` | 5 s | Mickey 1928 (b/w) | whistles, bobbing, then points up | s05 mickey-in (then `mickeyStars(..., { film: false })`) |
| 29 | `s10-santa-sleigh` | 5 s | Santa + sleigh | flying side view, Santa waves, reindeer gallop (loop; code moves it across the sky) | s10 sleigh |
| 30–32 | spare | 3 × 5 s | as needed | only for a shot the owner asks for after review | — |

Notes: Mickey's whistle is 8 s in SCRIPT §03, so the 5 s clip plays slowed to ≈ 0.75× or holds on the point-up pose, which is
cheaper than 10 s. The Pooh clip is the only 10 s shot. Styles: DESIGN_SYSTEM §05 (Mickey: *Steamboat Willie* 1928 design
only, black and white, no gloves; Pooh: E.H. Shepard 1926 pencil-and-wash, no red shirt; Santa: original design).

## Build
1. Flow: re-use "Christmas mapping – WP-04 characters" (`63DYIGTm4n0F8ectFnlO`).
2. Start frames (7 nodes) → owner picks one take each (show contact sheets) → pin with `creative_add_flow_asset_node`.
3. Clips in batches by scene; `estimate_only` first; check each with a frame strip before prep.
4. Prep every clip with `tools/clip-prep.sh <raw> <id> [--loop]` (stacked alpha: colour + matte; no black box).
5. Add ids to `CLIP_FILES` (`fx/clips.js`) and `sw.js` SHELL, bump `sw.js` VERSION; log in `assets/CREDITS.md`.
6. Wire only the three non-story shots: s04 Alaska tail (`CLIP_OF.pomTail`), s05 Mickey film (play in the film frame,
   then `film: false`), s10 sleigh across the sky on the `sleigh` cue. The story clips are placed by WP-08.

## Out of scope
Placing the story clips, voices, mix (WP-08). New dependencies. Changing timings, cues or music.

## Acceptance
- [ ] Owner picked the start frames; total spend reported and ≤ 80k.
- [ ] All shot-list clips prepped (stacked alpha) and committed; credits logged.
- [ ] Alaska tail, Mickey film and Santa sleigh wired and screenshot-checked; smoke test + flash check pass.
- [ ] CONTROL board + handoff (with the credit balance left) updated.

## Status (2026-11-18, end of session)
Owner picks: Connor take 3, Alaska 2, Orion 3, Gandalf 1, Santa 1, Pooh 2 (start frames saved in `assets/characters/`).
Mickey: **blocked** by the image provider twice (the 1928-mouse wording and a neutral one) → no clip; s05 keeps the
drone film screen. Pooh: blocked when the artist was named; the neutral re-try ("1920s storybook teddy bear") worked.
Spares #30–32 not used.

| Clip id | Kind (how WP-08 plays it) | Notes |
|---|---|---|
| `pet-<name>-idle` ×4 | loop | breathe, blink, tail |
| `pet-<name>-talk` ×4 | loop | cut to the line length |
| `pet-<name>-lookup` ×4 | once, hold last frame | ends looking up (Gandalf's look-up is subtle) |
| `s03-alaska-boss`, `s03-alaska-nooo`, `s03-gandalf-bat`, `s03-gandalf-oops` | once | star in code |
| `s05-connor-hide`, `s05-gandalf-bells` | once | |
| `s07-pooh-float` (10 s) | once | floats, looks in the pot, lowers it (star in code) |
| `s07-connor-brave` | once | |
| `s07-connor-carry` | loop | walk cycle in place; code moves him |
| `s08-gandalf-soft` | once | |
| `s10-<name>-wave` ×4 | once | Orion waves early, then sits |
| `s04-alaska-tail` | loop | wired (s04 `CLIP_OF.pomTail`) |
| `s10-santa-sleigh` | loop | wired: rides the s10 sparkle trail |

All pets face right (¾ view); use `flip: true` for the other direction.
