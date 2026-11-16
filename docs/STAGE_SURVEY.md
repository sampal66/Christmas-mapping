# Stage Survey — Christmas Mapping Show

> Geometry of the real room, worked out from the owner's photos (2026-11-16), and what it means for the projector
> and the zones. Related: [PLAN §1](PLAN.md#1-the-stage-measured) · [DESIGN_SYSTEM §07](DESIGN_SYSTEM.md) ·
> `app/js/layout.js`

| | |
|---|---|
| **Status** | v1.2: photo estimates corrected by the view from the counter. **Confirm with a tape measure** (§05) |
| **Last updated** | 2026-11-16 |

The photos are **not in the repo**: they show the inside of the home, and the repo is public.

---

## 01 · Method

> **Correction (v1.2).** The first model (v1) misread the floor line in the straight-on photo. It under-estimated
> the sideboard (0.66 m) and the tree (1.77 m).
> - **Sideboard:** the view from the counter (`IMG_8518`), measured along the room corner (ceiling → sideboard top →
>   floor all lie on one vertical line at the same depth), gives a top height of **0.79 m**, exactly the tape value.
> - **Tree:** the horizon method gives **≈1.95–2.0 m** to the bare tip, matching the tape value.
>
> The **tape values are right**. The numbers below use them.

- **Which photos:** six were sent. Four used the 0.5× ultra-wide lens and are too distorted to measure. One
  straight-on 1× photo was measured.
- **Fitting:** a simple camera model was fitted to it using the wall width (2.10 m) and the sideboard depth (0.41 m)
  as known sizes.
- **Cross-check:** the model then predicted the **wall height as 2.18 m** against 2.20 m on the tape, so the fit is
  good to a few centimetres. The camera was about 3.2 m from the wall at 1.6 m height.
- **Accuracy:** expect ±5 cm on the main sizes. The tree is soft and irregular, so ±10 cm there.

## 02 · What the photos show (vs PLAN §1)

| Element | PLAN §1 | Photo estimate | Notes |
|---|---|---|---|
| Wall | 2.10 × 2.20 m | ✔ 2.10 × 2.18 m | Matte white. A **nail hole at ≈1.65 m, centre**: fill it. Painting already down. |
| Sideboard | 1.07 w × 0.79 h × 0.41 d | ✔ 0.79 h confirmed (corner method) | Against the right wall, left edge ≈1.03 m from the doorway jamb. |
| Sideboard surfaces | — | **black top, brown wood-grain drawers, black handles** | The top is a natural black (good). The front is a **poor screen**: dark, warm tint, visible grain. |
| Tree | 2.0 m tall, Ø 0.9 m | ✔ ≈1.95–2.0 m to the bare tip, Ø ≈1.0 m | Its axis is ≈0.4 m right of the doorway jamb, ≈0.45 m out from the wall. Its left side **overhangs the doorway by ≈0.1 m**. It currently **leans**: straighten and fix it before calibrating. Flocked tips catch colour; dark needles swallow it (a sparkly look). No lights on it yet. |
| Star (to be placed) | — | top ≈2.15–2.2 m | Assuming a 0.15–0.2 m star on the tip: **it nearly touches the ceiling.** |
| Gap tree ↔ sideboard | — | ≈0.15–0.2 m | |
| Right wall | "narrow strip" | large white wall | **Glass wall sconce** ≈0.8 m from the corner near the ceiling (keep it off; it will glow if spill reaches it). The dining table and chairs sit along this wall. |
| Corner | — | **security camera** at the top of the corner, cable down the corner | White, so it catches light. Its IR LEDs may glow in the dark. Decide whether it should record during the show. |
| Doorway (left) | open, dark | open, with a lit room and a TV beyond | Close the doors or switch off the lights beyond for the show. |
| Floor in front of the tree | — | the dog's favourite spot | It's below the beam, but it can make shadows if it stands up near the wall. |

## 03 · Projection consequences

**Coordinates:** heights are measured from the floor at the wall. *x* runs along the wall from the doorway jamb.

1. **The vertical budget is tight, and the star sets it.**
   - The tree stands ≈0.45 m in front of the wall, closer to the projector. So, from the projector's point of view,
     its top lands ≈15% higher on the wall than it really is.
   - The star top (≈2.18 m real) therefore needs the image to reach **≈2.35 m** in the wall plane (part of that falls
     on the ceiling, which is fine). The gift-box tops need it to start at **≈0.74 m**. That's **≈1.6 m of image
     height → ≈2.85 m width**.
   - With the H1's throw ratio of ≈1.35 (still to be verified) and the lens at ≈1.0 m:

   | Projector distance | Image | Wall span (box tops in) | Star top |
   |---|---|---|---|
   | 3.2 m | 2.37 × 1.33 m | 0.74–2.07 m | cut by ≈30 cm |
   | 3.5 m | 2.59 × 1.46 m | 0.74–2.20 m | cut by ≈15 cm |
   | 3.8 m | 2.81 × 1.58 m | 0.74–2.33 m | just fits |
   | 4.0 m | 2.96 × 1.67 m | 0.75–2.41 m | fits |

   - **The counter looks like ≈3.1–3.4 m** (§03b), so the full star won't fit as things stand. The levers, best first:
     - stand the boxes on a **≈15 cm white riser**: the image can start ≈0.9 m, which buys ≈15 cm
     - use a **smaller star** (≈10 cm)
     - let the projected star "land" just under the tip. The real star goes on live in scene 9; only a soft glow is
       needed there, and the tip itself (≈2.16 m projected) is close to the edge.
     - set up the projector further back if the counter allows
   - WP-10 decides how the star scenes use this.
2. **Lens height ≈0.9–1.3 m, tilted down slightly, keystone 0.**
   - The kitchen counter is a good spot. The app's corner-pin corrects the tilt.
   - A higher lens reduces the tree's "upward stretch" a little. It also keeps the beam above a lying dog and
     seated heads.
3. **The sideboard front can't really be lit.**
   - The image starts at ≈0.6 m, and the drawers run 0–0.66 m, so only the top ≈5 cm strip is reachable.
   - On top of that, the drawers are dark wood.
   - **Drop the "sideboard front" as a content zone.** The black top plus white gift boxes become the "stage".
     The `stage` zone stays in the layout only as a thin footlight strip.
4. **Parallax and shadows are small.**
   - From a centred projector the tree's shadow falls ≈10 cm to its left, into the doorway, where nobody sees it.
   - Box shadows on the backdrop are ≈1–2 cm.
   - Occlusion masks handle the rest.
5. **Spill.** At ≈2.8 m width the image overhangs the wall by ≈0.35 m on each side.
   - **Left:** the spill goes into the doorway and hallway. Keep it black (the `wall` zone starts at the jamb).
   - **Right:** it grazes the right wall from the corner out to ≈0.7–0.9 m. That's the `rightStrip` (ambient only;
     it is very stretched). Check whether it reaches the sconce.
6. **Audience placement.** Nobody should stand between the projector and the wall. Seat people to the sides of the
   projector or behind it. The dining chairs on the right work.

7. **Projector on the kitchen counter (owner has no tripod).**
   - The counter is ≈1 m high, which is in the recommended lens range, so no tripod is needed. Tilt the projector
     with a small wedge or book, put it at the back edge of the counter to gain distance, and clear the counter
     around it.
   - Its distance to the wall is still unknown. The photos taken there are ultra-wide, which suggests ≈3.2–3.5 m but
     can't be trusted. If it's under ≈3.7 m, use the box riser or accept a cropped star (point 1).
   - If the counter isn't centred on the wall, that's fine: the corner-pin corrects the trapezoid.
   - Keep it where nobody bumps it during the show: any knock means recalibrating.
8. **The dining table may clip the lower-right of the beam.**
   - The table sits near the corner, along the right wall. Its top (≈0.75 m, plus whatever is on it) can cut into
     the beam near the boxes and the right-wall strip.
   - Clear the table, or slide it back, for the show.
9. **The right wall:** see §03a.

## 03b · The view from the counter (projector spot)

From `IMG_8518`, taken at counter height:
- **It's off-axis.** The ceiling line slopes down toward the corner, the sideboard front looks like a trapezoid with
  its left end nearer, and a lot of the right wall is visible. So the counter sits **left of the wall's centre**
  (towards the tree and doorway), and the projector must be **turned ≈20–25° towards the corner**.
- **Distance: 2.9 m** to the wall (owner's tape). The photo estimate of 3.1–3.4 m was too long.
- **What off-axis means:**
  - The image lands as a trapezoid. The app's corner-pin corrects it, at the cost of some pixels and brightness on
    the far side.
  - With manual focus, one side may be slightly softer. Focus on the tree/sideboard area.
  - The tree's shadow falls almost straight behind it (good).
  - The right wall is hit less obliquely, so the right-wall strip gets wider and less stretched (good).
- **The dining table** (bottom right of the photo) is right at the edge of the beam's path: clear it for the show.

## 03c · What the projector must cover from the counter (2.9 m), and the purchase decision

The projector sits 2.9 m out, ≈0.1–0.5 m right of the doorway jamb, with the lens at ≈1.0 m. It must cover:
- across: the tree's left edge (it overhangs the doorway) to the right corner
- up and down: the box tops to the tree tip, or to the star top

| Case | Field of view needed | Max throw ratio |
|---|---|---|
| Star top in, boxes on the sideboard | ≈44° × 30° | **≤ 1.05** |
| Star top in, boxes on a 15 cm riser | ≈44° × 27° | ≤ 1.17 |
| Tree tip only (no star), riser | ≈44° × 23° | ≤ 1.25 |
| **HAPPRUN H1** (throw ratio ≈1.35, unverified) | gives ≈41° × 24° (2.15 × 1.21 m image) | ✗ short in both directions |

- **Before buying (Black Friday, Nov 27):** look for a native-1080p projector with a **throw ratio ≤ ≈1.05** (often sold
  as "short throw" or listed as "100″ at ≈2.3 m"). A 1.2 ratio works only with the riser and the star left out of the
  image.
- **If the H1 is kept:** the right-wall strip goes, the tree's left edge or the corner gets cropped, and the tree's top
  ≈20–30 cm (with the star) falls outside the image. The show then needs re-framing (a WP-10 decision).
- **Further back** (≥ 3.6 m) would also fix it, if there's a stable spot in line with the wall.

## 03a · Using the right wall

| Option | What you get | Cost / problems | Verdict |
|---|---|---|---|
| **Ambient strip** (current) | Snow, glow and "spill-over" on the first ≈0.7–0.9 m of the right wall next to the corner | Very stretched (grazing light), so it's only good for soft ambience | ✅ keep |
| Aim the projector into the corner | A two-wall "wrap" that feels immersive | Only ≈2.8 m of image for both walls, but the main wall alone needs 2.1 m plus the tree. The main wall gets oblique, and the tree shadow grows. | ❌ with one projector |
| A second projector for the right wall | A real second canvas: the wall above the table, ≈0.75–2.2 m high | Another purchase. The sconce sits in the middle of it. Two outputs from one iPad isn't simple. | later / next year |

## 04 · Zone defaults (stage pixels, 1920 × 1080)

`app/js/layout.js` defaults were recomputed (v1.2) for a **centred reference set-up**: 3.8 m, lens ≈1.0 m,
image ≈0.74–2.33 m (its top ≈0.13 m falls on the ceiling). The real counter is off-axis, so calibration will skew
these. They are starting points only. Calibrate mode moves them onto the real objects.

| Zone | Old default | New default | Why |
|---|---|---|---|
| wall | x 185–1735, y 0–1080 | x 244–1676, y 87–1049 | wider image; the ceiling is inside the image top |
| backdrop | y 0–939 | x 946–1676, y 87–1049 | from the ceiling down to the sideboard top |
| stage | 141 px strip | 31 px strip at the bottom | the drawers are below the image |
| tree | 664 × 1043 at x 185 | 774 × 948 at x 109, from y 132 | the tree is 0.45 m out (looks bigger), and overhangs the doorway |
| star | 120 × 110 at y 0 | 139 × 139 at y 0 | sits on the tip; it may poke above the image (§03 point 1) |
| box1 / box2 | assumed 0.30 / 0.40 m cubes | same, standing on the 0.79 m top | |
| rightStrip | x 1735–1920 | x 1676–1920 | follows the new wall edge |

## 05 · Tape-measure checklist (owner)

1. Sideboard: width, height (floor → top) and depth.
2. Tree with the star on: total height to the star's top, widest diameter, and how far the trunk is from the wall.
3. Distance from the kitchen counter (or wherever the projector will sit) to the wall, and the counter's height.
4. Right wall: distance from the corner to the sconce, and the sconce's height.
5. Gift boxes, once bought: sizes and where they sit on the sideboard top.
6. When the projector arrives: the throw at a known distance (image width at 3.0 m) to confirm the ≈1.35 ratio.

## 06 · Photos that would help (owner)

1. **From the projector spot:** camera on the counter where the projector will sit, at counter height, **1× lens
   (not 0.5×)**, landscape, whole wall in frame. This is close to what the projector will see.
   - Load it into the app's **Room photo preview** to pre-calibrate the zones before the projector arrives.
2. **The right wall, straight on,** from the middle of the room.
3. **A tape measure in shot** (or the measurements in §05).

Photos stay on the iPad or in chat; they are never committed.

## Changelog
- **2026-11-16** — v1.3: the counter is 2.9 m from the wall (taped); added the field-of-view / throw-ratio requirement (§03c) ahead of the projector purchase.
- **2026-11-16** — v1.2: counter view: sideboard 0.79 m and tree ≈2.0 m confirmed (v1 estimates were wrong); star budget redone; off-axis counter (§03b).
- **2026-11-16** — v1.1: counter placement, dining-table clipping, right-wall options (§03a), extra photos asked for.
- **2026-11-16** — v1: photo-based survey; projector distance, sideboard front, star budget and new zone defaults.
