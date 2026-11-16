# AI Agents Guide — Christmas Mapping Show

> How AI agents (Claude cloud sessions and the AI tools they drive) work on this project: roles, workflow,
> rules and limits. **Every agent reads this first.** Related: [PRD](PRD.md) · [DESIGN_SYSTEM](DESIGN_SYSTEM.md) ·
> [ARCHITECTURE](ARCHITECTURE.md) · [PLAN](PLAN.md)

| | |
|---|---|
| **Status** | v1 |
| **Last updated** | 2026-11-16 |

---

## 01 · Overview

The project is developed almost entirely by AI agents, directed by the owner from an iPad or phone.
- **Claude** writes code, docs and scripts, and orchestrates the content tools.
- **ElevenLabs** produces voice, music, sound effects and character art.
- **The owner** decides, reviews and tests on the real wall.

Agents must keep the show **safe, legal, private and on schedule** (Dec 24, 2026).

## 02 · Agent roles

| Agent | Purpose | Key tools | Trigger |
|---|---|---|---|
| **Code agent** (Claude session) | Build the Mapper app, scenes and effects | repo, Bash, Playwright | on demand |
| **Docs agent** (Claude session) | Keep PRD / DESIGN_SYSTEM / ARCHITECTURE / PLAN / SCRIPT current | repo | after every decision or feature |
| **Content agent** (Claude + ElevenLabs MCP) | Narration, sfx, music, character model sheets and clips | ElevenLabs connector | when a scene's assets are needed |
| **Research agent** (Claude + web) | Hardware, public-domain sources, technique lookups | WebSearch, Firecrawl | on demand |
| **QA agent** (Claude session) | Smoke tests, performance checks, safety-limit review | `tools/smoke-test.js`, screenshots | before every PR |

One Claude session usually plays several roles. Spawn sub-agents only when the owner asks.

## 03 · Workflow

```
 task received → read docs (this file first) → plan briefly → build → test (smoke + screenshot)
      → update docs + changelogs → commit on the working branch → push → PR (draft) → owner reviews/tests
```

1. **Branch:** work on the session's `claude/...` branch; never push to `main` directly.
2. **Small, reviewable commits**, with messages that explain the *why*.
3. **Test before pushing:** run `node tools/smoke-test.js` (it serves `app/` and checks for errors). For visual
   changes, take a screenshot and look at it.
4. **Docs are part of done.** Update the PRD feature status, record decisions in ARCHITECTURE §07, and add a
   changelog line in each document you touch.
5. **PR:** one draft PR per branch, with a description of what changed and how it was tested. The owner merges.

## 04 · Example task prompt

```
/agent code
Implement the show timeline (PRD M5–M7).
Requirements:
- timeline.js scheduler keyed to the master <audio> clock (ARCHITECTURE §4.4)
- hold points with a Continue button
- audio delay slider saved in layout.audioOffsetMs
- add a Show mode to the panel; smoke test passes; update PRD status
```

## 05 · Tools and integrations

| Tool | Use | Notes |
|---|---|---|
| GitHub (MCP + git) | code, PRs | public repo `sampal66/Christmas-mapping` |
| Playwright + Chromium | headless testing, screenshots, MP4 frame capture | preinstalled; don't reinstall |
| ElevenLabs MCP | TTS, music, sfx, images, video | **costs credits**: see §07 |
| WebSearch / Firecrawl | research | verify licences of any downloaded media |
| GitHub Pages | hosting the app | deploys from `main` |

## 06 · Rules and best practices

### Project rules (hard)
1. **Language:** code, comments, docs and UI in **English**. Only the narration (and on-screen show text) is in
   **Spanish**: neutral Latin American, "Disney dub" style.
2. **Privacy:** the repo is **public**.
   - **Never commit** the baby's name, family photos, personal audio, or other personal details.
   - Use `{BABY}` in scripts and docs; personal media goes in the on-device media pack.
3. **Copyright:** only original work, public-domain works or properly licensed assets.
   - **Allowed cameos:** *Steamboat Willie* Mickey (1928 design) and E.H. Shepard-style Pooh only.
   - **Not allowed:** modern Disney or Pixar designs, Paddington, copyrighted songs (*Rudolph*, *Frosty*,
     *Sleigh Ride*, *White Christmas*…).
   - Record the source and licence of every downloaded asset in `assets/CREDITS.md`.
4. **Safety:** respect the motion limits in DESIGN_SYSTEM §06 (no flashes > 3/s, no loud bangs). A baby and a
   noise-sensitive dog are in the audience.
5. **No new dependencies or build tools** without the owner's approval. The app must stay "open and run".
6. **Target device:** iPad Air 5 Safari (iPadOS 27) at 1920×1080 output, 60 fps. Avoid APIs Safari lacks.

### Coding style
- ES modules, `const`/`let`, small pure functions, early returns. No frameworks.
- Effects and scenes draw only into the zone canvas they receive. No global DOM work inside draw calls.
- Time-based animation only: use the `t`/`local` arguments, never frame counts (needed for MP4 export).
- Wrap `localStorage` and IndexedDB access in try/catch.
- Comments explain *why*, not *what*.

## 07 · Safety and limits (credits and money)

- **ElevenLabs credits are limited** (Standard plan).
  - Always confirm with the owner before music generation, video generation, or any batch over ~2 minutes of audio.
  - Use the default number of takes. Never re-run a generation just to retry.
  - Prefer public-domain recordings for carols.
- **Never** spend money, change account settings, or make the repo private or public without explicit approval.
- **Never** put credentials or API keys in the repo.
- Don't push to `main`, force-push, or rewrite history on shared branches.

## 08 · Definition of done

- [ ] It works on the target (iPad Safari), or a known limitation is documented.
- [ ] `node tools/smoke-test.js` passes, with no console errors.
- [ ] Visual changes have been checked in a screenshot.
- [ ] It respects the DESIGN_SYSTEM safety limits and palette.
- [ ] Docs are updated (PRD status, ARCHITECTURE decisions, changelogs).
- [ ] No personal data or unlicensed assets are in the diff.
- [ ] It's in a draft PR with a test description.

## 09 · Future enhancements
- Scene preview thumbnails rendered by the QA agent on every PR.
- Automatic credit-usage report from the ElevenLabs connector.
- An auto-calibration agent (projected pattern + iPad camera).

## Changelog
- **2026-11-16** — v1: roles, workflow, hard rules (privacy, copyright, safety, language), credits policy, DoD.
