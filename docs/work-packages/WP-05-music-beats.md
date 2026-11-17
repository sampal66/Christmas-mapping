# WP-05 · Music sourcing, master mix plan and beat maps

**PRD:** C5 (+ beat sync for C1) · **Depends on:** WP-03 merged (PR #6), WP-10 · **Estimated session size:** large → may split
into WP-05a (sourcing + licences) and WP-05b (beat maps + tap tool)

## Goal
Every scene in TREATMENT §04 has a chosen, licence-verified recording or original piece, and every light-show scene
moves to its real music through a beat map (`beats.times`) and re-timed `cues`. Nothing else in the scenes changes.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07 (credits rules), §08
- `docs/TREATMENT.md` §04 (music column, lengths, cues), §06 (cut list)
- `docs/DESIGN_SYSTEM.md` §06 (beat feel, accent cap) and §08 (audio: ≈ −16 LUFS, **no impulsive sounds**)
- `docs/ARCHITECTURE.md` §4.4 (scene interface, beat grid)
- Code: `app/js/fx/cues.js` (`beatGrid`), one scene for the pattern (`app/js/scenes/s02-tree-alive.js`: `beats`, `cues`),
  `app/js/scenes/index.js`, `app/js/audio.js` (master clock), `app/js/main.js` (Show panel, only where adding the tool)

## Owner decisions already made (2026-11-17)
- Sources approved: **US military band recordings** (public domain as US government works) for the carols,
  **Musopen** for the two Tchaikovsky pieces (check each recording's licence: PD or CC0 only), **ElevenLabs** for the
  music-box loop and the three short original underscores (credits OK for music; reconnect the connector first).
- Network: the owner approved adding the exact download hosts these sources need to the environment's allowlist
  (`update_environment`, exact hosts only). Wikimedia Commons is already allowed. Wikimedia's robot policy needs a contact in
  the User-Agent: use `ChristmasMappingShow/1.0 (https://github.com/sampal66/Christmas-mapping)`, prefer standard thumbnail/
  transcode sizes, and go slowly (they rate-limit).
- Beat maps: **auto-detect + correct**, with an in-app **tap tool** so the owner can fix drift by ear.

## Build
1. **Shortlist and verify** one recording per music cue in TREATMENT §04 (s00/s09 music-box loop, s01, s02, s04, s06,
   s08, s10; underscores s03, s05, s07). For each: source URL, performer, licence evidence, length, tempo, and a note on any
   impulsive sounds (cymbal crashes, drum hits) that break DESIGN_SYSTEM §08. Record everything in `assets/CREDITS.md`.
   Prefer files the owner can keep on the device; **don't commit large audio** unless the owner agrees (repo size).
2. **ElevenLabs originals** (after the connector is reconnected; confirm with the owner before each music generation,
   default takes only): the music-box *O Christmas Tree* loop (seamless, 12 s multiple, 90 bpm 3/4 to match the s09 loop),
   and the three underscores.
3. **Master mix plan**: a running order with each piece's in/out points and crossfades matching the scene lengths in
   `scenes/index.js` (or adjust the scene `duration`s to the music). The owner assembles or approves `master-mix`.
4. **Beat maps**: a small offline script (`tools/beats.js`, Node, no new dependencies: decode WAV/PCM, onset-energy
   detection, tempo estimate, phase fit) that prints `times` per scene; plus an **in-app tap tool** (Show panel or
   a `beats.html` page: play a track, tap with the beat, nudge, export the times).
5. **Apply**: set each light-show scene's `beats = { times: [...], perBar }` and re-time its `cues` to musical moments
   (cues snap to beats automatically). Keep s09's loop a whole number of bars. Run `node tools/flash-check.js`.

## Out of scope
Character clips (WP-04/08), narration and pet voices (WP-06), new visual effects (WP-03 is done), MP4 export (WP-07).

## Acceptance
- [ ] Every music cue has a verified source (or an approved ElevenLabs original) listed in `assets/CREDITS.md`.
- [ ] No recording with impulsive sounds is used without the owner's OK.
- [ ] Beat maps applied to s01, s02, s04, s06, s09, s10; a screen recording or reel shows effects landing on the beat.
- [ ] Tap tool works on iPad Safari; smoke test and flash check pass.
- [ ] PRD C5 status, TREATMENT §04 licence column, CONTROL board + handoff updated.
