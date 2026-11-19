# WP-15 · Audio round 2: listen-check fixes, Twinkle Twinkle, Santa's voice, new sfx + master-mix re-render

**PRD:** C4, C5 · **Depends on:** WP-14a and WP-14b merged; the owner's listen-check notes · **Estimated session size:** medium
**Budget:** ≤ 1,400 credits (owner approved, 2026-11-19). Music generation is pre-approved for this one piece only.

## Goal
One new master mix with the owner's listen-check fixes, *Twinkle, Twinkle, Little Star* under the baby's star
moment, a soft Santa line, and sound effects for the new characters. These are items F5 and S1–S4 of
[WP-12-review-and-proposals](WP-12-review-and-proposals.md) §2 and §4.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07, §08 · `docs/DESIGN_SYSTEM.md` §08 (sound: no impulsive sounds)
- `docs/CONTROL.md` (handoffs: WP-05, WP-06, WP-08b, WP-14a/b) · `docs/SCRIPT.md` §02, §03 (s10), §06
- Code: `tools/master-mix.js`, `tools/show-table.js`, `tools/beats.js`, `app/js/scenes/beatmaps.js`, `scenes/s09-real-star.js`

## Build
1. **F5:** apply the owner's notes (s04 burst at 4:23.9, s01/s10 drum kits, the s08 swell, the music-box seam).
2. **S2, Twinkle:** a celesta / music-box *Twinkle, Twinkle, Little Star*, ElevenLabs music, 1 take, at 120 bpm 4/4,
   so the s09 hold loop (scene 0:08–0:20) still loops on the bar. Re-run `tools/beats.js` and update the s09 beat
   map; keep the hold seam check passing. Note it in CREDITS.md.
3. **S3, Santa:** design a warm, soft Santa voice (adult actor, neutral Latin American Spanish). One line in
   SCRIPT §03, s10: `s10-santa-01` "¡Jo, jo, jo! ¡Feliz Navidad!", placed on the swoop (A5). Never booming.
4. **S4, sfx:** a soft wooden "tock" march for the Nutcracker, a soft "hop" for the Gingerbread Man; add them to
   the `SFX` table.
5. **Re-render:** pull every source again (IDs in the WP-08b handoff), render `master-mix.m4a` (−16 LUFS,
   −1.5 dBTP, no jumps over 6 dB that the owner hasn't approved), make the scene previews. Send them to the owner
   (media pack only, never committed). Run `node tools/precheck.js --mix <file>`.

## Out of scope
New visuals; any other music.

## Acceptance
- [ ] Spend ≤ 1,400 credits; pre-check with `--mix` passes (length matches the timeline).
- [ ] Hold seam and flash checks pass; the owner listened to the previews.
- [ ] SCRIPT, CREDITS, the CONTROL board and handoff updated.
