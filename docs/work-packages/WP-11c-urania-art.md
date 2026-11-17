# WP-11c · s06 atlas art from *Urania's Mirror*

**PRD:** C1 · **Depends on:** WP-11b (merged) · **Estimated session size:** small–medium

## Goal
Replace the s06 constellation engravings (Jamieson 1822 plate crops, low-res, with coordinate grid lines) with the
grid-free **Urania's Mirror** cards (Sidney Hall, 1824, public domain). The owner found the current art distorted and
does not want the grid. The art should read as clean, smooth engraved line art behind the drone stars.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03a, §06, §08
- `docs/DESIGN_SYSTEM.md` §06 (constellation art, drone-show style)
- Code: `app/js/fx/atlas.js` (loading/tinting), `app/js/fx/constellations.js` (shapes: `src`, `aspect`, star `u,v`),
  `app/js/scenes/s06-constellations.js` (`ART` table), `assets/CREDITS.md` (atlas row)

## Build
1. **Get the scans.** Wikimedia Commons, `Category:Urania's Mirror`: Orion (plate 29, "best currently available
   version - 2014"), *Canis Major, Lepus, Columba Noachi & Cela Sculptoris*, *Monoceros, Canis Minor and Atelier
   Typographique*, and the card that carries **Felis** (check; if no card has Felis, keep the Jamieson Felis and say so).
   **Gotcha (WP-11b):** the Commons API and `upload.wikimedia.org` refused/rate-limited this cloud container, and the
   permission check blocked work-arounds. Ask the owner to download the files (largest JPG) and add them to the session
   (or to `assets/source/`, not served), or use another PD host (Library of Congress has the set).
2. **Convert to line art:** crop each figure, then turn the paper into transparency and keep the ink as **soft grey
   alpha** (no hard threshold: that was the "distorted" look). Downscale cleanly to ≈1000–1400 px on the long side,
   and remove the hand colouring and the star holes. Save as `app/assets/atlas/<name>.png` (same names, so the code is untouched).
3. **Re-read the star positions** (`u, v` in `fx/constellations.js`) off the new crops so the stars sit on the drawing,
   and set `aspect`. Check lines/anchors still form the same figures.
4. Optional (owner liked the idea): a faint **drone-point version** of the figure outline as an alternative look
   (sample the art's edges into a dim `cloudFigure`). Show both in screenshots; the owner picks.
5. Screenshots of each pause (side by side with the old art), flash check, smoke test.

## Out of scope
- s06 timing, the pets (WP-11b), the swarm itself.

## Acceptance
- [ ] No grid lines; the figures look smooth and undistorted on the wall at 1920×1080.
- [ ] Stars sit on the new drawings; names unchanged.
- [ ] CREDITS row updated (source, licence, what was changed); smoke test and flash check pass.
- [ ] PRD status, TREATMENT note, CONTROL board + handoff updated.
