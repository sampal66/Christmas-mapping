# WP-08b · Master mix + idle music box

**PRD:** C4, C5, M8 · **Depends on:** WP-05, WP-06 (merged); WP-08 helpful but not required (the mix follows
SCRIPT §03 offsets, which WP-08's visuals follow too) · **Estimated session size:** medium

## Goal
One `master-mix.m4a` for the whole show (music + every voice line + sound effects), rendered in the cloud and handed
to the owner for the on-device media pack. The app also plays the s00 music-box loop while idle and after the
finale, so the show never drops into silence.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06 (**privacy**: 🔒 lines say the real name), §07, §08
- `docs/CONTROL.md` (WP-05, WP-06 handoffs: where the audio lives, the iPad storage plan)
- `docs/SCRIPT.md` §01, §03 (cue + offset of every line), §06 (sound effects), §07 (silence check)
- `docs/TREATMENT.md` §04 **Master-mix running order** table only
- `docs/DESIGN_SYSTEM.md` §08 (audio: loudness, no impulsive sounds)
- `assets/CREDITS.md` (music sources)
- Code: `app/js/audio.js` (MasterClock), `app/js/main.js` (pre-show / end handling only), `app/js/media.js` (API),
  each scene's `cues` (to turn `cue + offset` into show time)

## Build
1. **Collect sources** (cloud only, never committed): music from the CREDITS links (Commons transcoded URLs work from
   the cloud) and the ElevenLabs originals; voice take A of every line and the sound effects from the ElevenLabs
   flows named in the WP-06 handoff. Generate nothing new unless a file is truly missing (owner OK first).
2. **Mix script** `tools/master-mix.js` (Node + ffmpeg in the cloud; not an app dependency): reads the running order
   and a cue table (scene start + cue time + offset per line, built from the scene files and SCRIPT §03), places every
   file, ducks the music ≈ 6–8 dB under speech with soft ramps, fades scene tails, normalises to the DESIGN_SYSTEM §08
   loudness, checks for no clipping or sudden peaks, and writes `master-mix.m4a` (AAC ≈ 128 kbps). The script and its
   tables are committed; **the audio is not**.
3. Listen-check report: list every line's start time, plus the overlaps or gaps found; render a short preview
   per scene for the owner.
4. **Idle loop:** the app plays a media-pack file `music-box-loop` (≈ 0.4 MB) while no show is playing and after the
   finale fades out (soft fade-in, stops on Play). No file → silent, no errors. Smoke test covers it with a tiny
   test file.
5. Hand the owner `master-mix.m4a` + `music-box-loop.m4a` (SendUserFile) with steps to add them to the media pack.

## Out of scope
Scene visuals (WP-08). Changing the script, cues or music choices. Committing any audio (the 🔒 lines contain the
name).

## Acceptance
- [ ] `master-mix.m4a` delivered to the owner; length = the show timeline; no clipping; the voices sit on their cues.
- [ ] The idle music-box loop plays in pre-show and after the finale; smoke test passes.
- [ ] No audio or personal data in the diff; CREDITS, DESIGN_SYSTEM §09 (media pack files), CONTROL board + handoff
      updated.
