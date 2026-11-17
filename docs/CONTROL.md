# Control Board — Christmas Mapping Show

> The single place that tracks **what is being built, in which session, and what's next**.
> Big parts are built in **separate Claude sessions**, one work package (WP) each, so no session's context
> window gets large. Rules: [AGENTS.md §03a](AGENTS.md#03a--session-strategy-small-context-windows).

**Show date:** 2026-12-24 · **Last updated:** 2026-11-17 · **Live app:** https://sampal66.github.io/Christmas-mapping/

---

## Board

| WP | Title | Depends on | Status | Session / PR | PRD IDs |
|---|---|---|---|---|---|
| WP-00 | Project structure, docs, Mapper v0 | — | ✅ done (PR #1) | this setup session | M1–M4 |
| WP-01 | [Show timeline, audio sync, hold points](work-packages/WP-01-timeline.md) | WP-00 | ✅ done (PR #1) | setup session | M5, M6, M7, M11 |
| WP-02 | [Media pack + offline mode](work-packages/WP-02-media-offline.md) | WP-00 | ✅ done (PR #2) | `claude/wp-02-media-offline` | M8, M9 |
| WP-03 | [Effects library + light-show scenes](work-packages/WP-03-effects-scenes.md) | WP-01, WP-10 | ✅ done (PR #6) | `claude/wp-03-effects-scenes` | C1 (s00, s01, s02, s04, s06, s09, s10) + owner notes (3D swarm, mega-tree, box tower, atlas art) |
| WP-04 | Character pipeline: 4 pets + Mickey 1928 + Shepard Pooh + **Santa and sleigh**; approach pending (TREATMENT §09: AI video clips recommended, not code puppets) | WP-03, WP-10, ElevenLabs connector | ⚪ needs brief | — | C2, C3 |
| WP-05 | [Music sourcing + beat maps](work-packages/WP-05-music-beats.md): PD military-band carols, Musopen Tchaikovsky, ElevenLabs music box + 3 underscores; beat maps (auto + tap tool) applied to the light-show scenes | WP-03, WP-10 | 🟡 in review (s04 music + ElevenLabs items open) | `claude/wp-05-music-beats` | C5, C1 beat sync |
| WP-06 | Spanish script (`docs/SCRIPT.md`) + narration and **pet voices** (≈3 min of speech; TREATMENT §03–§04) | WP-10, owner go-ahead | ⏸️ deferred by owner | — | C4 |
| WP-07 | MP4 export tool | WP-01 | ⚪ needs brief | — | M10 |
| WP-08 | Story and tender scenes (s03, s05, s07, s08) + the pets' wave in s10 | WP-04, WP-06 | ⚪ waiting | — | C1, C6, C7 |
| WP-10 | [Show treatment + design system review](work-packages/WP-10-treatment.md) → [TREATMENT.md](TREATMENT.md) | WP-00 | ✅ done (PR #5) | `claude/wp-10-treatment` | C1, C4, C6, C7 |
| WP-09 | On-wall calibration + rehearsal checklist | projector arrives (~Nov 28) | ⚪ waiting | — | success metrics |

Status keys: 🟢 ready to start · 🔵 in progress · 🟡 in review (PR open) · ✅ done · ⚪ waiting on a dependency · ⏸️ deferred

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

- **2026-11-17 · WP-05** — Music sourced (all USAF Band, PD): s01 O Christmas Tree, s02 **Carol of the Bells**, s06 Waltz of the Flowers, s08 Silent Nights, s10 Jingle Bells → `assets/CREDITS.md` + master-mix order in TREATMENT §04. Beat maps in `app/js/scenes/beatmaps.js` (s01, s02, s06, s09, s10); cues re-timed to musical moments; s02 → 1:24, s10 → 1:56. `tools/beats.js` (auto beats, `--subdivide` for waltzes, self-test in smoke) + `app/beats.html` tap tool.
  Left: **s04 Sugar Plum** has no PD/CC0 recording (Commons ones are CC BY/BY-SA); ElevenLabs music-box loop + 3 underscores not generated (need go-ahead); owner listens for drum hits (s01, s10) and checks downbeats in the tap tool; beat-sync reel with audio not made.
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
- Reconnect the ElevenLabs connector with full permissions (from a PC). This blocks WP-04 and WP-05.
- More pet photos (full body, side view) for WP-04.
- Soundbar model (for WP-01 delay defaults; optional).
- Go-ahead for the script (WP-06).
- WP-05: pick s04 *Sugar Plum* (options: Musopen "European Archive" LP transfer, licence unclear in the US; an ElevenLabs original arrangement; or a US Marine Band recording the owner downloads); OK the drum kits in s01/s10 Jingle Bells (or swap s10 to a concert-band version); go-ahead for the ElevenLabs music-box loop + 3 underscores.
