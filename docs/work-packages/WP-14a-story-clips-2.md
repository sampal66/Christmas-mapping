# WP-14a · Story clips round 2: no more frozen pets, Pooh and Santa

**PRD:** C2, C3 · **Depends on:** WP-12 merged · **Estimated session size:** medium
**Budget:** ≤ 25,452 credits (owner approved the Recommended package, 2026-11-19). Stop and ask before going over.

## Goal
No pet and no Pooh is ever a still picture on the wall, and Santa gets a proper close pass and a goodnight wave.
These are items A1–A8 of [WP-12-review-and-proposals](WP-12-review-and-proposals.md) §3, plus the free fix F1.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07, §08
- `docs/CONTROL.md` (handoffs: WP-04b, WP-08, WP-08c, WP-12)
- [WP-12-review-and-proposals](WP-12-review-and-proposals.md) §1 (R1–R4), §2 (F1), §3 (A1–A8)
- `docs/work-packages/WP-04b-story-clips.md`: Steps and Status (flow, start frames, the 10 s trick)
- Code: `app/js/scenes/stage.js`, `app/js/fx/clips.js`, `tools/clip-prep.sh`, `tools/clip-alpha.js`;
  the tracks in `scenes/s03-…`, `s05-…`, `s07-…`, `s08-…`, `s10-finale.js`

## Build
1. **Generate** (ElevenLabs flow `63DYIGTm4n0F8ectFnlO`, kling-2.5-turbo, one take each, default settings, no re-runs):

   | # | Id | Length | Start frame |
   |---|---|---|---|
   | A1 | `pet-<pet>-lookloop` ×4 | 5 s, seamless | last frame of each `pet-<pet>-lookup` (extract with ffmpeg, upload) |
   | A2 | `s07-pooh-hold` | 5 s, loop | last frame of `s07-pooh-float` |
   | A3 | `s07-pooh-wave` | 5 s | same frame as A2 |
   | A4 | `s05-connor-peek` | 5 s, loop | last frame of `s05-connor-hide` |
   | A5 | `s10-santa-swoop` | 10 s | the Santa start frame |
   | A6 | `s03-gandalf-ready` | 5 s | the Gandalf start frame |
   | A7 | `s05-orion-yawn` | 5 s, must end back in the idle pose | the Orion start frame |
   | A8 | `s10-santa-goodnight` | 5 s | the Santa start frame |

   Show the owner the takes before wiring. Report the spend.
2. **Prep** each clip with `clip-prep.sh` (`--loop` for the loops), measure its `FRAME` row, and add it to
   `CLIP_FILES` and the `sw.js` SHELL.
3. **Wire:**
   - `stage.js`: a look-up chains into its look-loop after the look-up clip's length (new event helper, e.g. `lookHold`).
   - Pooh: hold loop from ≈ `found − 2`, then the wave as he floats away.
   - Connor's peek loop after the hide clip.
   - Gandalf's anticipation before the bat; Orion's yawn on s05-orion-01.
   - Santa: the swoop on the s10 sleigh path, and the goodnight wave at `title`.
   - **F1:** keep the s10 pets on stage until ≈ wave + 13 s, so Orion finishes his line.
4. Bump `sw.js` VERSION. Run `node tools/smoke-test.js` and `node tools/precheck.js`: section 3b must show **no
   frozen stretch ≥ 8 s**, and R4 must be gone. Send the owner the contact sheets.

## Out of scope
Part B characters (WP-14b), audio (WP-15), the right wall and cottage textures (WP-13a/b), dog re-takes (reserve).

## Acceptance
- [ ] 11 clips generated within budget; spend reported; owner saw the takes.
- [ ] Pre-check passes with 0 frozen stretches ≥ 8 s; Orion's line is spoken with the pets on stage.
- [ ] Render cost of s10 not worse than +5 ms worst headless (the Santa swoop is ≤ its drawn size).
- [ ] Smoke test passes; PRD C2/C3 status, ARCHITECTURE §07 and the CONTROL board + handoff updated.
