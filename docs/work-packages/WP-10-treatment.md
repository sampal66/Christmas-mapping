# WP-10 · Show treatment + design system review

**PRD:** C1, C4, C6, C7 (narrows the show before they're built) · **Depends on:** WP-00 (merged) ·
**Estimated session size:** medium (planning/coordination session: **docs only, no code**)

## Goal
Turn the scene list in PLAN §6 into a **story you can follow**: a short treatment with a clear spine, character
arcs and a beat-by-beat timeline (music, zones, length). Also check the design system against what a projector
on a real wall can do. That way the script (WP-06), characters (WP-04) and scenes (WP-03, WP-08) are all built
to one agreed plan.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06 (copyright, safety, privacy), §07 (credits)
- `docs/PRD.md` §03, §04, §5.2, §07, §08
- `docs/PLAN.md` §1 (stage), §4 (cast and look), §5 (audio), §6 (show outline), §7 (timeline)
- `docs/DESIGN_SYSTEM.md` all sections (it's the review subject), skim §10
- `docs/CONTROL.md` "Open decisions"
- No code, no images or media.

## Build
This is a conversation with the owner. Ask focused questions (a few at a time, with options and a recommendation)
and write the answers down as you go. Don't write the Spanish script yet.

1. **Spine.** Agree a one-line logline and the 3-act shape: why losing the star matters, what each pet wants,
   how the plot builds, and how the story lands on the live star moment.
2. **Arcs.** One line per character: start → change → end (e.g. Connor: scared of noise → brave carrier of the
   star). Each story beat must move at least one arc. Cameos (Steamboat Willie Mickey, Shepard Pooh) need a reason
   to appear.
3. **Length and pacing.** Challenge the ≈12 min total for an audience with a baby and a noise-sensitive dog.
   Propose a target (e.g. 8–10 min) and the light-show/story balance. Note how much of a scene can be cut
   on the night if attention drops.
4. **Beat sheet.** For every scene: id, title, purpose, what happens (2–4 lines), zones used, music
   (title + public-domain status, or "original/ElevenLabs"), length, narration yes/no (≤ 1–2 lines, no script),
   characters on screen, cue points.
5. **The live star moment (s09).** Who does what, the cue to start, what the projection does while waiting,
   how Continue is triggered, and a fallback if the baby isn't in the mood.
6. **Design system review.**
   - Check the style against projection limits: black = no light, painted backgrounds and film grain read poorly
     on a wall, and fine detail is lost at that distance.
   - Propose concrete changes to palette, line weight, character style, typography, motion and audio style.
   - Check every zone has a clear role in at least one scene.
   - Apply only the changes the owner approves.
7. **Write it down.**
   - New `docs/TREATMENT.md`: logline, arcs, beat sheet table, live-moment plan, cut list.
   - Update PLAN §4 and §6, PRD §07 and DESIGN_SYSTEM to match (changelog line in each).
   - Record decisions in ARCHITECTURE §07 only if they affect the build.
8. **Re-plan the board.** Adjust the WP-03, WP-04, WP-05, WP-06 and WP-08 briefs/board rows if scenes, music or
   lengths changed (e.g. renamed scenes, new placeholder durations).

## Out of scope
Code, the Spanish script text (WP-06), any ElevenLabs generation (no credits are spent), downloading media.

## Acceptance
- [ ] `docs/TREATMENT.md` exists, and the owner has approved the logline, arcs, beat sheet and live-moment plan.
- [ ] Total target length agreed. Every scene has music with a licence status, zones, and a length.
- [ ] DESIGN_SYSTEM updated with the approved changes (changelog line), and still consistent with PLAN §4.
- [ ] PLAN §6, PRD §07 and the affected WP briefs match the treatment.
- [ ] No personal data (`{BABY}` only). CONTROL board + handoff updated. Draft PR opened.
