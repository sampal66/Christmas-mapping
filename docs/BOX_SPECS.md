# Gift-box specs (owner's cardboard build)

> The two gift boxes that form the "gift tower" on the sideboard: the projection maps light onto them and the cats
> sit on top of them in the story scenes. Measurements come from the stage model (`app/js/stage-model.js`, `boxes`),
> which generated the default zones. Build them to these sizes so the default mapping fits with little adjustment.

| | |
|---|---|
| **Status** | v1 (2026-11-18) |
| **Related** | [STAGE_SURVEY](STAGE_SURVEY.md) · [DESIGN_SYSTEM §07 zones](DESIGN_SYSTEM.md) |

## 01 · The two boxes

| Box | Size (W × D × H) | Where it sits | Zones it carries |
|---|---|---|---|
| **Big box** (`box2`, bottom) | **40 × 40 × 40 cm** cube | On the sideboard, its back against the wall, its left edge **1.55 m** from the left end of the main wall (the doorway jamb); right edge ≈ 15 cm from the right corner | front face + left side face |
| **Small box** (`box1`, top) | **30 × 30 × 30 cm** cube | Centred on top of the big box: 5 cm in from the big box's left, right and back edges (base 1.19 m above the floor) | front face + left side face; its top is where the cats sit |

Top of the tower: 0.79 m (sideboard) + 0.40 m + 0.30 m = **1.49 m** above the floor.

## 02 · Build notes

- **Material:** white cardboard. Matte is important: gloss throws hot spots back at the audience. If the board is
  shiny or printed, give the two visible faces a coat of **flat white** paint.
- **Visible faces:** from the projector (left, 1.45 m up) each box shows its **front** and its **left side**. Keep
  those faces clean, flat and seam-free; put tape seams on the back, right side or underneath.
- **Edges:** sharp, straight edges help the mapping line up (the zones are the box faces' corners). Avoid rounded or
  crushed corners on the front and left edges.
- **No decoration:** leave them plain white. The ribbons, lids and colours are projected (s04 box chaos, s10).
- **Stability:** a bit of weight inside the big box (a book or a bag of rice) keeps the tower steady, since the pets
  and the baby are around. Fix the small box to the big one with double-sided tape or a hidden strip underneath.
- **Real lids not needed:** the "lid pops" in s04 are projected.

## 03 · If the sizes have to change

Changing a size or position is fine. Update `boxes` in `app/js/stage-model.js` (size, `x0`, `y0`, `z0`), open
**Room model → "Use in Mapper"** to regenerate the zones, then fine-tune the corners in Calibrate mode on the real
wall (WP-09). Note: the stage survey found the big box's right shoulder slightly outside the default image; check it
when the projector arrives.

## Changelog
- **2026-11-18** — v1: sizes and placement from the stage model; build notes for the owner's white-cardboard boxes.
