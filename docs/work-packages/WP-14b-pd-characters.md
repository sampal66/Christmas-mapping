# WP-14b · Public-domain characters: Nutcracker, Velveteen Rabbit, Gingerbread Man, Peter Rabbit

**PRD:** C2, C3 · **Depends on:** WP-14a merged · **Estimated session size:** medium
**Budget:** ≤ 10,004 credits (owner approved, 2026-11-19). Stop and ask before going over.

## Goal
Four public-domain children's characters join the show in their **original book look** (items B1–B4 of
[WP-12-review-and-proposals](WP-12-review-and-proposals.md) §5). AGENTS §06 now allows them.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06 (new cameo list), §07, §08
- `docs/CONTROL.md` (handoffs: WP-04b, WP-14a)
- [WP-12-review-and-proposals](WP-12-review-and-proposals.md) §5
- Code: `app/js/scenes/stage.js`, `app/js/fx/clips.js`, `scenes/s04-magic-boxes.js`, `s08-for-baby.js`, `s10-finale.js`

## Build
1. **Start frames** (gpt-image, 2 takes each, on black, the style of the existing cast): Nutcracker soldier
   (original design: red coat, tall black hat, wooden jaw); Velveteen Rabbit (worn plush, after Nicholson 1922);
   Gingerbread Man (iced cookie); a small rabbit in a blue jacket in Beatrix Potter's watercolour style (**do not
   name him in the prompt or on screen**). Never a studio design. The owner picks one take each.
2. **Clips** (kling-2.5-turbo 5 s, one take each), with the scene and time for each:
   - `s04-nutcracker-march`: marches out of box 2 at `box2-open` and salutes.
   - `s04-gingerbread-run`: hops out of box 1 at `finale`, waves and runs off.
   - `s08-velveteen-rabbit`: by the pets at `gather`, ears twitch.
   - `s10-rabbit-wave`: waves with the pets at `wave`.
3. Prep and wire them as in WP-14a. The s04 clips stand on the box tops; in s04 the code toy sprites are the
   fallback. Add each character's source and public-domain basis to `assets/CREDITS.md`.
4. Smoke test + `node tools/precheck.js` (placement: inside the zone, not over the tree). Send the owner the
   contact sheets.

## Out of scope
Piglet, Tigger, Cheshire Cat, Mickey (not in the package); sound effects (WP-15).

## Acceptance
- [ ] 4 characters generated within budget, owner-picked frames, sources in CREDITS.md.
- [ ] Pre-check passes; each new character is placed on its box or floor line.
- [ ] Smoke test passes; docs, the CONTROL board and handoff updated.

## Status (2026-11-19, end of session)
Spent **10,006 credits** (owner OK'd the 2 over budget; 34,438 → ≈ 24,432 left): 4 start-frame nodes × 2 takes
(gpt-image-2.5-sunburst, 1,523) + 4 kling-2.5-turbo 5 s clips (8,483). Flow `63DYIGTm4n0F8ectFnlO`. Owner picked the
frames (Nutcracker 1, Velveteen 2, Gingerbread 1, rabbit 2), saw the clip takes and OK'd wiring all four.

| Clip id | Kind | Wired |
|---|---|---|
| `s04-nutcracker-march` | once | s04 `box2-open` → +6.6 s, rises out of the **small box (tower top)**, sinks back in; nutcracker sprite = fallback |
| `s04-gingerbread-run` | once (ends empty) | s04 `finale`, small box top; no code sprite exists, so no fallback |
| `s08-velveteen-rabbit` | loop (4.5 s) | s08 `gather` + 0.6 → `out`, tower top between the cats, facing left |
| `s10-rabbit-wave` | once | s10 star-dust arrival with the pets, waves at `wave` + 1.2, leaves at + 6.6 |

Deviation: the Nutcracker stands on the small box, not box 2: box 2's top is hidden under box 1 and the box zones draw
over the wall, so on box 2 he was invisible (first pre-check sheet). Box 1's lid now also pops at `box2-open`.
Pre-check: PASS, 0 placement flags (guests checked like pets), 0 frozen ≥ 8 s; s10 worst 50 ms headless (was 57).
