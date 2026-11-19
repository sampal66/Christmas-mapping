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
