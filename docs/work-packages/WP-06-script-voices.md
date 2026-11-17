# WP-06 · Spanish script + narration and pet voices

**PRD:** C4 · **Depends on:** WP-10 (merged), WP-05 (merged: scene lengths and cues are final) · **Estimated session size:** medium

## Goal
A complete Spanish script (`docs/SCRIPT.md`) for the ≈12-min show: narrator plus short pet dialogue, timed to the
existing scene cues. Then a cast of ElevenLabs voices (narrator + 4 pets + Pooh) and the generated lines,
**only after the owner confirms the credit cost**. The script fixes shot content and timings for WP-04 and WP-08.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §07, §08
- `docs/TREATMENT.md` §01 (decisions), §02 (logline), §03 (arcs + casting notes), §04 (beat sheet, cue names)
- `docs/DESIGN_SYSTEM.md` §05 (characters), §08 (audio style), §09 (asset specs/naming)
- Code (cue times only): `app/js/scenes/index.js` (s03/s05/s07/s08 placeholders), the `cues` arrays in
  `s01-wall-wakes.js`, `s06-constellations.js`, `s10-finale.js`

## Build
1. **Draft `docs/SCRIPT.md`** (Spanish lines, English stage notes):
   - neutral Latin American Spanish, "Disney dub" style; narrator lines ≤ 15 s each; pet lines short (≤ 6 s).
   - Narrator ≈ 1:15, pets ≈ 1:45, total speech ≈ 3 min (TREATMENT §04). Leave the light-show scenes (s02, s04, s09) silent.
   - Each line has an **id** (`s03-alaska-01`), speaker, scene cue it starts on (`cue + offset`), an estimated
     duration, the Spanish text and an English gloss for the owner.
   - Every line must move an arc from TREATMENT §03. Mickey only whistles; Pooh gets one gentle line.
   - **`{BABY}`** wherever the baby's name is spoken; never the real name. Lines with `{BABY}` are flagged
     **personal**: they are generated/recorded on-device only and never committed (s08 may be Papá and Mamá's own voices).
   - A casting table: voice description per character (from TREATMENT §03 casting notes) + model choice.
   - A credit estimate (characters × model rate × takes) for the owner.
2. **Review the script with the owner** and apply their edits.
3. **Confirm the credit cost with the owner** (AGENTS §07) before any voice design or speech generation.
4. After the go-ahead: design/pick the voices (ElevenLabs), generate the non-personal lines (default takes),
   record the chosen voice ids in SCRIPT.md, and note the takes picked. Audio is not committed (same rule as WP-05).
5. Update PRD C4, ARCHITECTURE §07 (decisions) and the CONTROL board + handoff.

## Out of scope
- Placing lines in scenes or building the narration track / ducking (WP-08 places them; the master mix is the owner's).
- Character animation (WP-04); new music (WP-05).
- Changing scene lengths or cues; if a line doesn't fit, note it for WP-08 instead.

## Acceptance
- [ ] `docs/SCRIPT.md` covers s01, s03, s05, s06, s07, s08, s10 with ids, cues, durations, Spanish + gloss.
- [ ] No real name anywhere in the diff; `{BABY}` lines flagged personal.
- [ ] Casting table + credit estimate; owner approved the script and the cost before generation.
- [ ] Voice ids and picked takes recorded (or the generation step handed off as WP-06b if not approved yet).
- [ ] Smoke test passes.
- [ ] PRD C4, ARCHITECTURE §07, changelogs and the CONTROL board + handoff updated.
