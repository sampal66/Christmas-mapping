# PRD — Christmas Mapping Show

> Product Requirements Document. **What** we are building and **why**. Living document: update it when a
> decision changes. Related: [DESIGN_SYSTEM](DESIGN_SYSTEM.md) · [ARCHITECTURE](ARCHITECTURE.md) ·
> [AGENTS](AGENTS.md) · [PLAN (timeline)](PLAN.md)

| | |
|---|---|
| **Status** | v1 — requirements agreed, build in progress |
| **Show date** | December 24, 2026 (evening) |
| **Last updated** | 2026-11-17 |

---

## 01 · Product overview

| | |
|---|---|
| **Product name** | Christmas Mapping Show ("Show de Luces de Navidad") |
| **Tagline** | A hand-drawn Christmas light show on our own dining-room wall, for `{BABY}`'s first Christmas. |
| **Description** | A ~12-minute home projection-mapping show. A budget projector, driven by an iPad web app, paints light, colour and classic-style cartoon characters onto a white wall, a sideboard, gift boxes and a real Christmas tree. It is mostly a light show, with three short story beats starring the family's four pets, a few public-domain Disney cameos, Spanish narration, and a live finale where the real star goes on the tree. |

## 02 · Problem

Projection-mapping shows normally need expensive projectors, desktop software (MadMapper, Resolume) and
animation skills. The family wants a magical, personal Christmas moment using only:
- an iPad, a ~USD 60 projector and a soundbar they already have;
- AI help (Claude cloud sessions for code, ElevenLabs for voice, music and images);
- about 5 weeks of evenings, developed from a phone or iPad.

## 03 · Goal

Deliver a reliable, delightful, baby-safe show on Dec 24 that:
1. runs from **one tap** on the iPad, with a backup that also works;
2. looks like **classic hand-drawn Christmas animation** mapped precisely onto the real objects;
3. feels **personal**: the pets as characters, and a message for the baby's first Christmas;
4. can be **re-used** for future mapping projects (the Mapper app is generic, the show is content).

## 04 · Target users

| User | Need |
|---|---|
| **Operator** (Papá, on the iPad) | Calibrate quickly, press play, handle the live star moment, recover from mistakes without a laptop. |
| **Audience** (8–10 adults) | The show is made for them: be charmed for ≈12 minutes; big light, full music, but no sudden loud sounds. |
| **The baby** (≈3 months) | Guest of honour in the story and the live star moment; not the target audience. Never lit in the face. |
| **Future self** | Reuse the app and pipeline for other walls and occasions. |

> User need: *"I want to point a cheap projector at my wall, line it up from my iPad, tap play, and have my
> family watch our pets come alive around our Christmas tree."*

## 05 · Core features

### 5.1 Mapper app (iPad, Safari)
| ID | Feature | Priority | Status |
|---|---|---|---|
| M1 | Zones with per-zone corner-pin warping (wall, backdrop, sideboard front, gift boxes, tree, star, right-wall strip) | Must | ✅ v0 |
| M2 | Editable polygon outline (mask) for the tree; occlusion so light doesn't spill onto objects | Must | ✅ v0 |
| M3 | Calibrate / Test / Demo modes; arrow nudging; auto-save on the device; JSON export/import | Must | ✅ v0 |
| M4 | Room-photo preview (photo stays on the device) | Should | ✅ v0 |
| M5 | **Show timeline** synced to one master audio track; play / pause / seek / restart | Must | ✅ WP-01 |
| M6 | **Audio-delay slider** to compensate Bluetooth soundbar lag (+ beep/flash sync test) | Must | ✅ WP-01 |
| M7 | **Hold points**: the show waits (looping) until the operator taps (live star moment) | Must | ✅ WP-01 |
| M8 | **Media pack**: load personal photos and narration from the iPad's Files app, stored locally | Must | ✅ WP-02 |
| M9 | Works offline once loaded (no Wi-Fi needed on show night) | Should | ✅ WP-02 |
| M10 | 1080p **MP4 export** of the calibrated show as a backup | Must | ⏳ |
| M11 | Pre-show idle loop | Should | ✅ WP-01 (starfield) |
| M12 | **Room model**: a spatial model of the real stage and projector that generates the default zones and checks projector fit | Should | ✅ stage survey |

### 5.2 Show content
| ID | Feature | Priority | Status |
|---|---|---|---|
| C1 | 11 scenes (see §07 and [TREATMENT](TREATMENT.md)), ≈12 minutes (10–15), light show first | Must | ⏳ light-show scenes built (s00, s01, s02, s04, s06, s09, s10 visuals; WP-03); story scenes s03/s05/s07/s08 are timed placeholders (WP-08); s04 box chaos + s05 drone Mickey built, s01/s10 polished (WP-11); s06 pet star figures → WP-11b |
| C2 | 4 pet characters in classic hand-drawn style (Connor, Alaska, Orion, Gandalf) | Must | ⏳ |
| C3 | Public-domain cameos: *Steamboat Willie* Mickey (1928) and E.H. Shepard-style Pooh | Should | ⏳ star-figure Mickey (1928 design) built for s05 (WP-11); clips WP-04 |
| C4 | Spanish narration: bright, warm storyteller, neutral Latin American accent, plus pet character voices; ≈3 min of speech in total | Must | 🔵 WP-06: script approved ([SCRIPT.md](SCRIPT.md)); 6 voices cast, all lines generated; take picks pending |
| C5 | Instrumental public-domain Christmas music, plus original stingers and effects | Must | 🟡 WP-05: every music cue sourced (PD USAF Band recordings + ElevenLabs originals, assets/CREDITS.md); owner listening checks + master-mix assembly left |
| C6 | Tender first-Christmas message from Papá and Mamá; no photos on screen, but one family photo becomes the closing constellation (processed on device) | Must | ⏳ |
| C7 | Live finale: real star placed with the baby, tree lights plugged in, big closing | Must | ⏳ |

### 5.3 Out of scope
- Commercial use or public performances.
- Copyrighted characters or music (modern Disney designs, Paddington, *Rudolph*, *Frosty*, *Sleigh Ride*…).
- Smart-plug or DMX automation (the tree lights are plugged in by hand).
- Multi-projector setups.

## 06 · Constraints and non-functional requirements

| Area | Requirement |
|---|---|
| **Hardware** | HAPPRUN H1 (native 1080p, ~300 ANSI lumens) at ~3.5 m; iPad Air 5 (M1, iPadOS 27) via USB-C → HDMI; Samsung soundbar over Bluetooth. |
| **Budget** | Projector ≤ USD 100 (target ~USD 60) + adapter ~USD 15. ElevenLabs Standard plan; small top-ups only. |
| **Performance** | 60 fps target, never below 30 fps on the iPad Air 5 during the show. |
| **Reliability** | The show must survive a browser reload (calibration persists) and has an MP4 fallback. |
| **Safety (baby + dog)** | No flashes faster than 3 per second; no sudden loud sounds; moderate master volume; soft, fading fireworks. |
| **Privacy** | The repo is public: no baby name, family photos or personal audio in git. Placeholder `{BABY}`. |
| **Legal** | Only original, public-domain, or properly licensed assets. |
| **Language** | Narration in Spanish; everything else (code, docs, UI) in English. |

## 07 · Show structure (summary)

> *On `{BABY}`'s first Christmas Eve, Gandalf bats the star into the night sky. By tradition the youngest places it,
> and its light guides Santa, so the four pets chase it through the constellations to bring it home in time.*

| # | Scene | Type |
|---|---|---|
| 0 | Pre-show dusk starfield | loop |
| 1 | La pared despierta: the wall wakes up | light + narration |
| 2 | El árbol cobra vida: the tree comes alive (*Carol of the Bells*) | light show |
| 3 | La estrella se escapa: Gandalf bats the star into the sky | story |
| 4 | Cajas mágicas: the boxes open (*Nutcracker*), but no star | light show |
| 5 | ¿Dónde está la estrella?: Connor's fright; Mickey's clue | story |
| 6 | Constelaciones: the wall becomes the sky (*Waltz of the Flowers*) | light show |
| 7 | El tarro de miel: Pooh's honey pot; Connor carries the star home | story |
| 8 | Para ti: first-Christmas message (no photos) | tender |
| 9 | La estrella de verdad: **live** real star + tree lights; Papá taps Continue | hold point |
| 10 | Gran final: Santa's sleigh, soft fireworks, goodbye; one family photo as a constellation | light show |

Target ≈12 min (agreed range 10–15). The beat sheet, live-moment plan and cut list are in
[TREATMENT.md](TREATMENT.md); timings in [PLAN.md §6](PLAN.md). The full script is in [SCRIPT.md](SCRIPT.md).

## 08 · Success metrics

- ✅ Calibration on the real wall takes **< 15 minutes**, and alignment error is within ~1 cm at the zone edges.
- ✅ Full run-through with **zero crashes** on 3 consecutive rehearsals.
- ✅ Audio and visuals in sync within **±50 ms** after the delay calibration.
- ✅ ElevenLabs spend stays inside the plan plus at most one small top-up.
- ❤️ The family watches to the end, the baby isn't startled, and someone asks to see it again.

## 09 · Risks

| Risk | Mitigation |
|---|---|
| iPad can't output true 16:9 full screen | Stage Manager external display; MP4 fallback played full screen. |
| Bluetooth audio lag | Delay slider (M6); wired option as backup. |
| AI-generated character consistency | Model sheets first; code-animated cut-outs; video only for short actions. |
| Credits run out | Public-domain music; short narration; prioritise must-have scenes. |
| Projector arrives late / defective | Develop and test on the TV and in photo preview; Amazon return window. |
| Tree too bright or green | Tree lights off until the finale; the flocked tips take colour well. |

## Changelog
- **2026-11-17** — WP-11: C1/C3 status (s04 box chaos, s05 star Mickey; WP-11b for s06 pet figures).
- **2026-11-17** — WP-06: C4 script drafted in SCRIPT.md.
- **2026-11-17** — WP-05: C5 status (music sourced, beat maps applied to s01, s02, s06, s09, s10).
- **2026-11-17** — WP-03: C1 progress (effects library + seven light-show scenes built; story scenes are placeholders).
- **2026-11-17** — WP-10 owner notes: C4 pet voices, C6 photo → constellation, no photos on screen.
- **2026-11-17** — WP-10: §04 audience is the adults; §07 new scene titles and logline from TREATMENT; C1/C4 targets.
- **2026-11-16** — M12 room model added and done (stage survey session).
- **2026-11-16** — M8, M9 done (WP-02).
- **2026-11-16** — M5, M6, M7, M11 done (WP-01).
- **2026-11-16** — v1 created from the agreed plan (pets cast, HAPPRUN, measured room, live star finale).
