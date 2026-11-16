# Control Board — Christmas Mapping Show

> The single place that tracks **what is being built, in which session, and what's next**.
> Big parts are built in **separate Claude sessions**, one work package (WP) each, so no session's context
> window gets large. Rules: [AGENTS.md §03a](AGENTS.md#03a--session-strategy-small-context-windows).

**Show date:** 2026-12-24 · **Last updated:** 2026-11-16

---

## Board

| WP | Title | Depends on | Status | Session / PR | PRD IDs |
|---|---|---|---|---|---|
| WP-00 | Project structure, docs, Mapper v0 | — | ✅ done (PR #1) | this setup session | M1–M4 |
| WP-01 | [Show timeline, audio sync, hold points](work-packages/WP-01-timeline.md) | WP-00 | ✅ done (PR #1) | setup session | M5, M6, M7, M11 |
| WP-02 | [Media pack + offline mode](work-packages/WP-02-media-offline.md) | WP-00 | 🟢 ready | — | M8, M9 |
| WP-03 | [Effects library + light-show scenes](work-packages/WP-03-effects-scenes.md) | WP-01, WP-10 | ⚪ waiting on WP-10 | — | C1 (s00, s01, s02, s04, s06, s10 visuals) |
| WP-04 | Character pipeline (model sheets → puppets) | WP-03, WP-10, ElevenLabs connector | ⚪ waiting | — | C2, C3 |
| WP-05 | Music and sfx sourcing (public domain + ElevenLabs) | — | ⚪ waiting (owner OK on credits) | — | C5 |
| WP-06 | Spanish script (`docs/SCRIPT.md`) + narration | WP-10, owner go-ahead | ⏸️ deferred by owner | — | C4 |
| WP-07 | MP4 export tool | WP-01 | ⚪ needs brief | — | M10 |
| WP-08 | Story, tender and finale scenes (s03, s05, s07, s08, s09) | WP-04, WP-06 | ⚪ waiting | — | C1, C6, C7 |
| WP-10 | [Show treatment + design system review](work-packages/WP-10-treatment.md) | WP-00 | 🟢 ready (**next**) | — | C1, C4, C6, C7 |
| WP-09 | On-wall calibration + rehearsal checklist | projector arrives (~Nov 28) | ⚪ waiting | — | success metrics |

Status keys: 🟢 ready to start · 🔵 in progress · 🟡 in review (PR open) · ✅ done · ⚪ waiting on a dependency · ⏸️ deferred

WP-01 and WP-02 can run **in parallel** (they touch different files). **WP-10 comes before WP-03/04/06/08**: it fixes
the story, timeline and style they build on. Merge each PR before starting a WP that depends on it.

## How to start a WP session (copy-paste)

Open a **new** Claude session on the `sampal66/Christmas-mapping` repo and paste:

```
Work package WP-XX. Read CLAUDE.md, then docs/CONTROL.md and docs/work-packages/WP-XX-*.md only
(open other docs just for the sections that brief links to). Build exactly what the brief says, follow the
Definition of Done, then update docs/CONTROL.md (status + handoff note) and open a draft PR.
```

## Handoff log

Newest first. Each session appends **≤ 5 lines**: what was done, what's left, and any gotchas for the next session.

- **2026-11-16 · WP-10 brief** (written in the WP-02 session at the owner's request). New planning WP: show treatment
  (spine, arcs, beat sheet, live-star plan) + design system review, before the script and scene builds. WP-03, WP-04
  and WP-06 now wait on it. Run it as a docs-only conversation with the owner.

- **2026-11-16 · WP-01** (built in the setup session at the owner's request). `audio.js` MasterClock (audio or silent clock,
  latency = `layout.audioOffsetMs`), `timeline.js` (scenes + holds), Show mode panel, sync test, 2 placeholder scenes
  with a hold at 0:15. Smoke test covers play, hold, continue and delay persistence. Gotchas: a hold stays active once
  reached until Continue; `jumpTo` releases holds before the target. Music loading is temporary until WP-02.

- **2026-11-16 · WP-00** — Docs (PRD, DESIGN_SYSTEM, ARCHITECTURE, AGENTS, CONTROL), Mapper v0 (calibrate/test/demo),
  smoke test, Pages workflow. Owner must merge PR #1 and enable Pages (Settings → Pages → Source: GitHub Actions).
  Decisions: the repo stays public and personal photos stay on the device; Orion = tabby, Gandalf = Russian Blue;
  the script is deferred.

## Open decisions / waiting on owner

- Merge PR #1 and enable GitHub Pages.
- Reconnect the ElevenLabs connector with full permissions (from a PC). This blocks WP-04 and WP-05.
- More pet photos (full body, side view) for WP-04.
- Soundbar model (for WP-01 delay defaults; optional).
- Go-ahead for the script (WP-06).
