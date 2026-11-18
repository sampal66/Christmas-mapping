# Control Board — Christmas Mapping Show

> The single place that tracks **what is being built, in which session, and what's next**.
> Big parts are built in **separate Claude sessions**, one work package (WP) each, so no session's context
> window gets large. Rules: [AGENTS.md §03a](AGENTS.md#03a--session-strategy-small-context-windows).

**Show date:** 2026-12-24 · **Last updated:** 2026-11-18 · **Live app:** https://sampal66.github.io/Christmas-mapping/

---

## Board

| WP | Title | Depends on | Status | Session / PR | PRD IDs |
|---|---|---|---|---|---|
| WP-00 | Project structure, docs, Mapper v0 | — | ✅ done (PR #1) | this setup session | M1–M4 |
| WP-01 | [Show timeline, audio sync, hold points](work-packages/WP-01-timeline.md) | WP-00 | ✅ done (PR #1) | setup session | M5, M6, M7, M11 |
| WP-02 | [Media pack + offline mode](work-packages/WP-02-media-offline.md) | WP-00 | ✅ done (PR #2) | `claude/wp-02-media-offline` | M8, M9 |
| WP-03 | [Effects library + light-show scenes](work-packages/WP-03-effects-scenes.md) | WP-01, WP-10 | ✅ done (PR #6) | `claude/wp-03-effects-scenes` | C1 (s00, s01, s02, s04, s06, s09, s10) + owner notes (3D swarm, mega-tree, box tower, atlas art) |
| WP-04 | [Character pipeline](work-packages/WP-04-characters.md): model sheets, clip layer (`fx/clips.js`), s04 rummaging clips; Mickey film + Santa sleigh after the credit upgrade | WP-03, WP-10, ElevenLabs connector | ✅ done (PR #11) | `claude/wp-04-characters` | C2, C3 |
| WP-04b | [Story acting clips + Alaska tail, Mickey film, Santa sleigh](work-packages/WP-04b-story-clips.md) (32 clips, ≈ 75k of the 125,959 credits that must last the whole project) | WP-04 merged | ✅ done (PR #13) | `claude/charming-ritchie-iqlwbf` | C2, C3 |
| WP-05 | [Music sourcing + beat maps](work-packages/WP-05-music-beats.md): PD military-band carols, Musopen Tchaikovsky, ElevenLabs music box + 3 underscores; beat maps (auto + tap tool) applied to the light-show scenes | WP-03, WP-10 | ✅ done (PR #7) | `claude/wp-05-music-beats` | C5, C1 beat sync |
| WP-06 | [Spanish script + narration and pet voices](work-packages/WP-06-script-voices.md) (`docs/SCRIPT.md`, ≈3 min of speech; TREATMENT §03–§04) | WP-10 | ✅ done (PR #8) | `claude/wp-06-script-voices` | C4 |
| WP-07 | MP4 export tool | WP-01 | ⚪ needs brief | — | M10 |
| WP-08 | [Story scenes s03, s05, s07, s08 + the pets' wave in s10](work-packages/WP-08-story-scenes.md): places the WP-04b clips on SCRIPT §03 cues around the star motion; s08 26–45 s visual beat (silence check) | WP-04b, WP-06 | ✅ done (PR #15) | `claude/hopeful-knuth-uibswc` | C1, C2, C3, C6, C7 |
| WP-08b | [Master mix + idle music box](work-packages/WP-08b-master-mix.md): one cloud-rendered `master-mix.m4a` (music + voices + sfx, never committed) + the s00 music-box loop while idle/after the finale | WP-05, WP-06 | 🟢 in review: mix rendered + handed over (code PR #15; render + limiter fix this PR) | `claude/wp-08b-master-mix` | C4, C5, M8 |
| WP-08c | [Story polish: owner notes](work-packages/WP-08c-story-polish.md): soft ear tips (clips cut at the top), star-dust arrivals/exits, softly lit gift tower under the cats, a short natural Connor carry | WP-08 | 🟡 in review (draft PR) | `claude/jolly-newton-qtuh8g` | C1, C2 |
| WP-12 | [Automatic show pre-check](work-packages/WP-12-precheck.md): one command, whole show headless → report + contact sheets, before the owner's manual scene review | WP-08b, WP-08c | ⚪ waiting | — | success metrics |
| WP-10 | [Show treatment + design system review](work-packages/WP-10-treatment.md) → [TREATMENT.md](TREATMENT.md) | WP-00 | ✅ done (PR #5) | `claude/wp-10-treatment` | C1, C4, C6, C7 |
| WP-11 | [s04 box chaos + s05 Mickey drawn in stars + scene audit](work-packages/WP-11-box-chaos-mickey-stars.md) (owner notes 2026-11-17) | WP-03, WP-06 | ✅ done (PR #9) | `claude/wp-11-box-chaos-mickey-stars` | C1, C2, C3 |
| WP-11b | [s06 pets as star figures](work-packages/WP-11b-pet-constellations.md) (audit miss: "pets as constellations", Orion smiles) | WP-11 | ✅ done (PR #10) | `claude/wp-11b-pet-constellations` | C1, C2 |
| WP-11c | [s06 atlas art from *Urania's Mirror*](work-packages/WP-11c-urania-art.md) (owner: current plates distorted, grid unwanted) | WP-11b | ✅ done (PR #10, same session) | `claude/wp-11b-pet-constellations` | C1 |
| WP-09 | On-wall calibration + rehearsal checklist | projector arrives (~Nov 28) | ⚪ waiting | — | success metrics |

Status keys: 🟢 ready to start · 🔵 in progress · 🟡 in review (PR open) · ✅ done · ⚪ waiting on a dependency · ⏸️ deferred

**Order agreed with the owner (2026-11-17): WP-06 ✅ → WP-11 → WP-04 → WP-08** (WP-11b ✅, WP-11c ✅) (script and voices fix shot content and timings, so the
character clips are made once at the right length; WP-08 needs both). **Owner notes (2026-11-17):** s04 box chaos and the s05 Mickey star figure → WP-11 (also audits every built scene against TREATMENT §04). WP-09 runs when the projector arrives (~Nov 27); WP-07 fills any gap.

WP-01 and WP-02 can run **in parallel** (they touch different files). **WP-10 comes before WP-03/04/05/06/08**: it fixes
the story, timeline and style they build on ([TREATMENT.md](TREATMENT.md)). Merge each PR before starting a WP that depends on it.

## How to start a WP session (copy-paste)

Open a **new** Claude session on the `sampal66/Christmas-mapping` repo and paste:

```
Work package WP-XX. Read CLAUDE.md, then docs/CONTROL.md and docs/work-packages/WP-XX-*.md only
(open other docs just for the sections that brief links to). Build exactly what the brief says, follow the
Definition of Done, then update docs/CONTROL.md (status + handoff note) and open a draft PR.
```

## Handoff log

Newest first. Each session appends **≤ 5 lines**: what was done, what's left, and any gotchas for the next session.

- **2026-11-18 · WP-08b render** — Pulled every source (music flow `ppF1…`, sfx flow `EjbT…`, 46 voice lines from `dn8q…`; Commons music as **.ogg transcodes**, originals 429) → `master-mix.m4a` 11:57.0, −16 LUFS, −1.5 dBTP, no missing sources/overlaps; + `music-box-loop.m4a` (20 s, bar-grid loop) + 10 scene previews → owner (media pack only). Nothing new generated.
  Fix: `master-mix.js` now limits after loudnorm (first render −0.8 dBTP failed the check). **Take A = the earlier-created generation** of each voice node's pair (newest-first listings put it 2nd). `s10-todos-01` = 4 clips layered 0/40/60/120 ms.
  **Owner listen-check:** 4:23.9 (s04, short −11 dBFS burst after a quiet bed; 3:39.2 is just s04 starting after silence), drum kits in s01/s10, s08 swell placement (`from: 0`), music-box seam. Sources live in a scratch dir only: a re-render must pull them again (IDs above + CREDITS).

- **2026-11-18 · WP-08c** — Ear tips: `EAR_FADE` (top 4 % fades) on every pet clip (s04 peeks too); all but 3 s04 clips touch row 0. Star-dust arrivals/exits in `drawPets` (s03/s05/s07/s08/s10 wave); `towerGlow` lights the tower in the story scenes and the s10 wave. s07: Connor says his line (talk loop), walks 1.5 stride-matched cycles (clip time ← distance, `carryWalk`), looks up at `fly`; the star rises in a sparkle arc to the tip by `settle`. `sw.js` v26. Smoke + flash check pass.
  **Left:** owner chose the fade for now; only if it looks wrong on the wall: wider dog re-takes (Connor + Alaska idle/talk/lookup = 6 clips ≈ 2.3k credits each ≈ 14k; s07/s10 dog action clips also touch the top); then re-measure `FRAME` and drop `EAR_FADE` for those clips. Check Connor's walk end vs the tree on the real wall (WP-09): `WALK.cycles`.

- **2026-11-18 · WP-08 close-out** — PR #15 merged (owner). Owner review of the live show → **WP-08c** brief (ears cut in the clips themselves: tips past the video's top edge, start frames are fine; pop-in entrances; dark boxes make the cats float; Connor's 20 s floor slide skates). Owner asked for an **automatic pre-check** once everything is assembled → **WP-12** brief. **`docs/BOX_SPECS.md`**: 40 cm + 30 cm white cubes for the owner's cardboard build.
  Order: WP-08b (when ElevenLabs is back) and WP-08c in any order → WP-12 → owner's manual scene check → WP-09 on the wall.

- **2026-11-18 · WP-08b (same session) + portraits** — Idle music box (`idle-music.js`, smoke-tested) and `tools/master-mix.js` (tested on stand-ins) done. **Left:** reconnect ElevenLabs (signed out: voices, sfx, underscores, s04/s09 music, music box live there), retry Commons for O Christmas Tree + Waltz (429; Carol, Silent Nights, Jingle Bells downloaded), render with `--src <dir> --out <dir> --previews`, hand over master-mix + music-box-loop.
  Owner asked for **star-swarm portraits**: s06 pets now ≈1,100-light swarms of their cartoon art (`fx/portrait-swarm.js`, `fx/pet-portraits.js`; `pet-stars.js` removed); s10 ends on a ≈4,900-light **family portrait** (owner chose to commit the points; photo not kept). Rebuild with `tools/portrait.js` (header lists options; family used cut-out → face sharpen → 'led' mode, faces as focus ellipses, baby 10×).
  Cost: s10 worst ≈56 ms headless (was 43): if the iPad drops frames, regenerate the family portrait with fewer points (3,500). Drive download hosts were added to this environment for the photo.

- **2026-11-18 · WP-08** — s03/s05/s07/s08 built (`scenes/s03-…`, `s05-…`, `s07-…`, `s08-…`; placeholder.js removed) + s10 wave, on the new **`scenes/stage.js`**: pets drawn on the wall between the sky and the star (`mid` hook in star-story; motion unchanged), dogs on the floor by the tower, cats on the tower top, Pooh's pot / Connor's mouth on the star's path. s08 26–45 s: pets' constellations twinkle + star warms. `sw.js` v22. Render ≈ 5–8 ms avg headless.
  Owner (this session): **one fixed size per pet** (Connor 1, Alaska 0.75, Orion = Gandalf 0.5; change only for depth); per-clip `FRAME` table (measured from each clip's first frame) keeps size/spot across clips: re-measure if a clip is re-cut.
  Owner sent the **closing family photo** (figures only: no wands, owl, background). Not in git (privacy). `photoToConstellation` now ignores transparent pixels → owner makes a cut-out on the iPad (Photos: erase the wands + owl with Clean Up, then lift the subject → PNG), names it `family…`, adds it to the media pack.
  Timing notes: the Gandalf bat clip starts at bat −3 (swipe 2.5 s in lands on `bat`; his line starts bat −5.5 on the talk loop); Pooh's clip starts at pooh-in +3 so the pot is held out at `found`. Default layout: the wall's bottom edge is above the sideboard top, so feet sit on the wall's bottom edge; check on the real wall (WP-09).
  Gotcha: never glob-expand into an ffmpeg command line (`-i $f.mp4` with a glob overwrote clips once here; restored from git).

- **2026-11-18 · WP-04b follow-up** — PR #13 merged (owner). Mickey re-tested with a prompt stating *Steamboat Willie* is public domain since 2024: blocked on gpt-image **and** FLUX 2 Pro → stop trying; s05 keeps the drone Mickey. Credits ≈ 58.8k left after the tests (owner saw 59,890 before them). Wrote the **WP-08** (story scenes, visuals) and **WP-08b** (master mix + idle loop) briefs; WP-08 split in two to keep sessions lean.

- **2026-11-18 · WP-04b** — Owner picked start frames (Connor 3, Alaska 2, Orion 3, Gandalf 1, Santa 1, Pooh 2) → 28 new clips in `app/assets/clips/` (12 pet idle/talk/look-up, 10 actions incl. Pooh 10 s, 4 waves, Alaska tail, Santa sleigh); kinds (loop / once-and-hold) in the WP-04b brief Status table. Wired: s04 Alaska tail, s10 sleigh rides the sparkle trail. **Mickey: no clip** (provider blocked 3 prompts, incl. one stating *Steamboat Willie* is public domain since 2024) → s05 keeps the drone film screen. `sw.js` v21.
  Credits: ≈ 68.4k spent (worst case; ≈ 2.3k of it is blocked image runs that may be refunded) → owner confirmed **59,890 credits left** (2026-11-18). Owner: leave the small flaws as they are. Spares #30–32 unused.
  For WP-08: pets face right (`flip` for left); talk loops are cut to line length; look-ups and actions hold their last frame. `s03-alaska-nooo` has a tiny stray fragment near her paw at ≈1.2 s (masked Kling prop); `pet-gandalf-lookup` is subtle.
  Gotchas: kling's start frames are text-only (no reference wired). `creative_generate_video` can't set 10 s: create the node with `estimate_only`, `creative_update_node` `duration_secs: 10`, then `creative_run_flow_nodes`. Estimates leave empty stub nodes on the flow. The app now pre-caches ≈ 16 MB of clips: check iPad storage in WP-09. Each clip frame is re-keyed in JS: keep clips no bigger than drawn (sleigh is 200 px; s10 ≈ 22/49 ms headless avg/worst).

- **2026-11-18 · WP-04 fix** — Owner TV review: animations good, but black boxes behind them. Clips are now **stacked alpha** (`tools/clip-alpha.js`: colour on top, flood-filled matte below; `clip-prep.sh` calls it) and `fx/clips.js` rebuilds a transparent frame (re-keyed after each seek). Same 4 clips re-prepped (≈ 0.5 MB each). `sw.js` v20.
  Owner: **125,959 ElevenLabs credits must last the whole project** → WP-04b brief written with a budget (≈ 75k, stop at 80k; ≈ 38k left unallocated).

- **2026-11-18 · WP-04** — Brief written + approved; owner capped spend at the 18.8k credits left (upgrade later). Model sheets picked (Connor 2, Alaska 1, Orion 1; Gandalf = style test #4) → `assets/characters/`. `fx/clips.js`: blob-loaded `<video>` per clip, `'screen'` blend, re-seeked to scene time; media pack overrides `app/assets/clips/<id>.mp4`. `tools/clip-prep.sh` (black crush, crop, 540 px, CRF 28, `--loop` crossfade).
  s04: Gandalf ears + pop (peaks on `box1-open`), Connor tail (loop), Orion ears in; placeholders stay as fallback. ≈15.9k credits spent.
  Left (WP-04b, after upgrade): Alaska tail (Kling **blocked** "rump wiggles": prompt tail only), Mickey film (then `film: false`), Santa sleigh, ≈29 story clips.
  Gotchas: Safari won't play `<video>` from SW cache hits → load as blob. Box 2's right shoulder is off the wall zone in the default layout. A wired reference image more than doubles gpt-image cost.

- **2026-11-17 · WP-11b** — `fx/pet-stars.js` `petStars(...)`: the four pets as small **3D drone swarms** (owner review x2). Volumes are ellipsoids, tubes and cones with markings painted per point. Drawn by its own `renderDrones`: small crisp drones (coloured core, no white centre), about 220–250 per pet, far side dimmer. **Silhouettes only, no faces** (owner). Orion: hunched → tail up + heart glow. Connor: looks up. Alaska: "hmph" toss. Gandalf: pounce.
  s06 `PETS` table: each pet forms from its constellation's cloud at cue + 7.5–9 s, right of the figures, and flies back by next cue − 1 s. Timing, cues and beat map unchanged. Flash check passes; ≈1–2 ms per pet headless. `sw.js` v16.
  **WP-11c (same session, owner):** the atlas art is now *Urania's Mirror* (1824), grid-free, soft lines, 800 px grey+alpha PNGs. Star `u,v`/`aspect` re-read in `fx/constellations.js`; Felis is fitted to the cat (the card marks no stars on it). Gotcha: Commons serves only **standard thumbnail sizes** (960/1280/1920/3840) to cloud machines; originals return 429.
  Not the cartoon pets: those are WP-04 (ElevenLabs clips).

- **2026-11-17 · WP-11** — Audit table in the brief (all beats built except s04 chaos, s05 star Mickey → done here; s06 pets-as-constellations → **WP-11b** brief).
  s04: `fx/toys.js` (20 code-drawn sprites: Christmas/pet/cameo, cream rim + baked glow; analytic toss → bounce → rest; lid pops, ear/tail placeholders) on the **wall** zone; waves on cues/bars + a toy every beat in busy sections, floor clears at `cut`/`out`.
  s05: `fx/mickey-stars.js` `mickeyStars(ctx,w,h,t,age,{x,y,size,film})`: drone film screen → 3D drone-swarm 1928 Mickey (whistle bob, notes) → points up, fingertip trail to the sky; placed at `mickey-in` via the placeholder's new `drawBackdrop`. **Owner: please confirm the Mickey proposal + look in the PR screenshots.**
  Flash check passes (s05 now included); s04 render ≈13 ms avg / 25 ms worst headless (wall zone now drawn by s04): if the iPad drops frames, lower the per-beat tosses in `WAVES`.
  Owner PR note: Mickey must be a **drone swarm with depth**, not a dotted outline → rebuilt as ≈1.4k drones in 3D volumes (face mask, pie-cut eyes, shorts, shoes), camera swings in while he forms.
  Owner asked for a quality pass beyond s04: s10 fireworks build to a barrage + willow crown + floor fountains; s01 edge comets + drone snowflake → star → falls as snow. s01 ≈15/27 ms, s10 ≈18/30 ms headless (avg/worst).
  Gotchas: toys land left of the tower on the wall bottom; the tree (occluding) hides those passing behind it, on purpose. `sw.js` v13.

- **2026-11-17 · WP-06** — Brief + `docs/SCRIPT.md` (approved v1.0): 46 lines (3 🔒 name lines), cues `cue + offset`, ≈ 2:48 speech. Owner: male narrator, narrator says s08, name spoken in audio only.
  Voices: 6 custom ElevenLabs voices (ids in SCRIPT §02), accent rule = neutral Latin American / Mexican-dub, never Castilian (`[neutral Mexican Spanish accent]` tag, `eleven_v4`). All lines generated, 2 takes, flow `dn8qdkhzXGF04J2wbJVl`; ≈ 9.1k credits.
  Owner picked take A for all lines (optional lines kept). Same session (owner): all 13 sound effects generated (SCRIPT §06, ≈1.3k credits). Left: export the A takes + sound effects as `<id>.m4a` into the media pack; WP-08 places them. Then WP-04 (character clips) uses the line lengths.
  Owner, same session: **new s04 box-chaos music** (s04 cues + beat map re-timed to it) and **s09 bell hold loop** (beat map 120 bpm 4/4, loop file 15.97–27.97), 4 box-search sfx; ≈1.7k credits. Master-mix rows in TREATMENT §04.
  Silence check (owner ask, SCRIPT §07): music covers every scene; overlaps fixed by nudging 4 offsets; WP-08 must add a visual beat in s08 26–45 s and loop the s00 music box when idle/after the end.
  **iPad storage (owner: as little as possible):** WP-08 renders ONE `master-mix.m4a` in the cloud (music + all voices + sfx, AAC ≈ 128 kbps ≈ 12 MB; it contains the 🔒 name lines, so media pack only), plus the s00 music-box loop (≈ 0.4 MB) and the closing family photo, pre-shrunk (or pre-converted to star points). No per-line files on the iPad.
  Gotchas: audio is NOT in git (🔒 lines say the real name; never write it in any file). The connector's usage endpoint needs extra permissions (balance unreadable). A voice description with "kid" is blocked by ElevenLabs safety: describe an adult actor doing a cartoon voice.

- **2026-11-17 · WP-05** — Music sourced (all USAF Band, PD): s01 O Christmas Tree, s02 **Carol of the Bells**, s06 Waltz of the Flowers, s08 Silent Nights, s10 Jingle Bells → `assets/CREDITS.md` + master-mix order in TREATMENT §04. Beat maps in `app/js/scenes/beatmaps.js` (s01, s02, s06, s09, s10); cues re-timed to musical moments; s02 → 1:24, s10 → 1:56. `tools/beats.js` (auto beats, `--subdivide` for waltzes, self-test in smoke) + `app/beats.html` tap tool.
  Same session (owner go-ahead): ElevenLabs originals, 1 take each (≈4.6k credits): s04 Sugar Plum (celesta, 72 bpm 2/4, beat map applied), music-box loop (exactly 90 bpm, mix starts at 1.64 s), s03/s05/s07 underscores. s06 atlas art now grows out of the stars (radial feathered reveal). Demo reels sent (not committed).
  Left: owner listens for drum hits (s01, s10) and the loop seam, checks downbeats in the tap tool, assembles `master-mix` from TREATMENT §04.
  Gotchas: Wikimedia returns 429 for original files from the cloud; standard `/transcoded/…/X.mp3.ogg` works. Recordings are not committed. If the loop is generated, re-run `tools/beats.js` on it and replace the s09 entry.

- **2026-11-17 · WP-03** — `app/js/fx/` (pure `(ctx,w,h,t,opts)` effects), `palette.js`, fonts bundled in `app/fonts/`; scenes s00 (pre-show), s01, s02, s04, s06,
  s09 (hold, seamless 12 s loop), s10 (+ `projectedStar` checkbox, family constellation from media file `family…`); s03/s05/s07/s08 are timed placeholders.
  Show panel: **Cut ⏭**, fps readout. `tools/flash-check.js` (in the smoke test) passes: worst 2 flashes/s (box faces), max jump 0.37.
  Gotcha: headless here caps at ~43 fps even on `main` (software compositor); render cost is 3–15 ms/frame avg (s10 worst 27 ms). **Check real fps on the iPad (WP-09).**
  Next: WP-04/WP-05 briefs; WP-08 replaces `storyPlaceholder(...)` entries in `scenes/index.js` and uses `env.from()` to place clips.
  Owner note (same session): **all light-show animation moves to the beat**. Each scene has `beats` + `beatGrid()`; tempos are placeholders.
  → The **WP-05 brief must deliver a beat map** per light-show scene (beat times → `beats.times`, plus re-timed `cues`); WP-08 underscores start cues on beats.
  Owner notes 2: motion felt forced → beat motion now flows (speed 1±0.35, soft accents). Stars + fireworks are now a **3D drone-show point swarm**
  (`fx/points3d.js`: s06 sky → Orion → Canis → Felis → lost star; s10 sparks → family/heart → "¡Feliz Navidad!"; `fx/fireworks3d.js`). Demo reels in `demo/` (not committed).
  Owner notes 3: **boxes stacked** (small on big; model `boxes[].z0`), zones `box1Side`/`box2Side` (front + left side lit; tops are slivers);
  **mega-tree** (`fx/megatree.js`, layered patterns); constellations get star-atlas figure art + nebula. Render cost is up (s10 ≈18–31 ms
  software raster): **if the iPad drops frames in WP-09, lower N in s06/s10, firework `count`, or mega-tree `rings`.** Saved Room-model edits keep old box positions.
  Owner notes 4: constellations use the **real Jamieson atlas engravings** (1822, PD; plates 24–26 from Commons) as tinted cards in the swarm's 3D view;
  star positions read off the plates (`fx/constellations.js`, `app/assets/atlas/`). Next: merge PR #6, then WP-05 (brief written) in a new session.
  Owner notes 5: s06 is a **rollercoaster**: rides (`fx/cosmos.js`: warp field, aurora, galaxy, comets, tree meteors) between calm pauses;
  dimmed engraved Spanish labels (`atlasLabel`). Rides are the costliest frames (software ≈30–55 ms): check on the iPad in WP-09.
  Owner notes 6: realistic stars (`fx/stars.js`: spectral colours, spikes, scintillation) everywhere; the **lost star's journey** is drawn:
  s03 escape (5-point → night star → sky), s06 rests in each constellation, s07 pot → carried → flies → 5-point (`scenes/star-story.js`).
  **WP-08 must keep this motion** and place Pooh/Connor on it (paths in star-story.js). Hub requirements in PLAN §2.

- **2026-11-17 · WP-10** — `docs/TREATMENT.md`: owner decisions (adult audience, 10–15 min → ≈12, tradition + Santa + constellations
  spine, both cameos tiny, Papá taps Continue), arcs, beat sheet with music licence/zones/cues, live-moment plan, cut list (→ ≈10 min).
  PLAN §4–6, PRD §04/§07, DESIGN_SYSTEM v1.1 (LCD black → `dusk` base, louder music with no impulsive sounds), ARCHITECTURE §07, WP-03 brief updated.
  Owner approved everything. s09 moved to WP-03. Next: WP-03 (light-show scenes); write WP-04/WP-05 briefs.
  Owner PR notes: no photos (one photo → closing constellation), pets talk, full Santa and sleigh, no "MS Paint" look → TREATMENT §09.
  Style test: owner liked Gandalf #4; the clip works on black; keep props (star) in code. Creator plan for WP-04.
  Gotcha: WP-04 and WP-05 still need briefs (copy `_TEMPLATE.md`, source everything from TREATMENT §03–§04).

- **2026-11-16 · Room model** (same session, owner's request). `stage-model.js` (metric stage + projector pinhole) generates the
  default zones; `model.html` shows projector/top/side views + fit; "Use in Mapper" pushes zones. Checked against the
  tripod-top photo. The model files are in `sw.js` `SHELL` (VERSION v2). New zones (e.g. box side faces) go in
  `layoutFromModel()`.

- **2026-11-16 · Stage survey** (done in the WP-02 session at the owner's request). The owner's room photos were measured
  → `docs/STAGE_SURVEY.md`; PLAN §1 and the `layout.js` defaults were updated. Main points: the tape values hold (tree 2.0 m,
  sideboard 0.79 m); the counter is off-axis at ≈3.1–3.4 m, so the star top is cropped (fix: box riser or smaller star); the sideboard front is out of the image.
  Photos are NOT committed (privacy). Next: owner tape-measures (survey §05). WP-10 should read survey §02–§03.

- **2026-11-16 · WP-10 brief** (written in the WP-02 session at the owner's request). New planning WP: show treatment
  (spine, arcs, beat sheet, live-star plan) + design system review, before the script and scene builds. WP-03, WP-04
  and WP-06 now wait on it. Run it as a docs-only conversation with the owner.

- **2026-11-16 · WP-02** — `media.js` (IndexedDB `christmas-mapping-media`/`files`: put/get/list/remove/objectUrl), panel
  "Media pack" (multi-file add, list + delete, storage used), `sw.js` cache-first shell + manifest/icons, `.gitignore`
  privacy guard. `master-mix` now drives the show clock (temporary music loader removed). Smoke test covers import,
  reload, delete and an offline reload. Gotcha: **bump `VERSION` in `sw.js`** on any app change, and add new files to
  `SHELL` (the smoke test fails otherwise). Not yet tested on the real iPad (Add to Home Screen + airplane mode).

- **2026-11-16 · WP-01** (built in the setup session at the owner's request). `audio.js` MasterClock (audio or silent clock,
  latency = `layout.audioOffsetMs`), `timeline.js` (scenes + holds), Show mode panel, sync test, 2 placeholder scenes
  with a hold at 0:15. Smoke test covers play, hold, continue and delay persistence. Gotchas: a hold stays active once
  reached until Continue; `jumpTo` releases holds before the target. Music loading is temporary until WP-02.

- **2026-11-16 · WP-00** — Docs (PRD, DESIGN_SYSTEM, ARCHITECTURE, AGENTS, CONTROL), Mapper v0 (calibrate/test/demo),
  smoke test, Pages workflow. Owner must merge PR #1 and enable Pages (Settings → Pages → Source: GitHub Actions).
  Decisions: the repo stays public and personal photos stay on the device; Orion = tabby, Gandalf = Russian Blue;
  the script is deferred.

## Open decisions / waiting on owner

- ✅ Animation approach A chosen; style test passed (Gandalf #4, kling-2.5-turbo ≈2.1k credits per 5 s clip). Owner will buy **Creator** (121k/mo) for the character work. **Check the ElevenLabs credit balance**: ≈30 clips ≈ 45–65k credits on the cheaper video models (TREATMENT §09).
- ✅ Projector decided: HAPPRUN H1 (throw ratio 1.4) on the tripod at 3.5 m, head 1.45 m; buy Nov 27. See [STAGE_SURVEY §03e](STAGE_SURVEY.md).
- ✅ LCD-black design note: handled in DESIGN_SYSTEM §02 (`dusk` base, fade to starfield). Check the `dusk` value on the wall in WP-09.
- Tape-measure the remaining items in [STAGE_SURVEY §05](STAGE_SURVEY.md) (star size, counter height).
- ✅ PR #1 merged and GitHub Pages enabled: https://sampal66.github.io/Christmas-mapping/
- WP-08c ear tips: owner (2026-11-18) keeps the soft fade for now; wider-framed dog re-takes (Connor + Alaska idle/talk/lookup, 6 clips ≈ 14k credits) only if the fade doesn't read well on the real wall (WP-09).
- Reconnect the ElevenLabs connector with full permissions (from a PC). This blocks WP-04 and WP-05.
- More pet photos (full body, side view) for WP-04.
- Soundbar model (for WP-01 delay defaults; optional).
- WP-05: OK the drum kits in s01/s10 Jingle Bells (or swap s10 to a concert-band version); listen to the music-box loop seam.
