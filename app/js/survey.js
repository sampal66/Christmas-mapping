// Room survey analysis (WP-09a): how well a projector spot works for the show, the best spots in the room limits, and
// gift-box sizes/positions that leave the dogs their floor. Everything runs through the same code the show uses
// (layoutFromModel → stageLayout), so the report says what the Mapper will actually do. Pure: no DOM.
import { layoutFromModel, projectorCamera, requiredThrowRatio, shadows, spanAt, coverage } from './stage-model.js';
import { stageLayout } from './scenes/stage.js';
import { unitToStage, stageToUnit } from './homography.js';

const clone = (o) => JSON.parse(JSON.stringify(o));
// The tree is soft and irregular: the tape is good to about ±10 cm on it (STAGE_SURVEY §01). A floor margin below this
// means the real shadow may still reach the dogs.
export const TREE_TOLERANCE = 0.10;

/** The scene env (as main.js builds it) for one zone of a layout. */
export function envFor(layout, z) {
  const byId = Object.fromEntries(layout.zones.map((o) => [o.id, o]));
  const toZone = (o, u, v) => { const [x, y] = unitToStage(o.quad, u, v); return stageToUnit(z.quad, x, y); };
  return {
    zone: z,
    from: (id, u, v) => (byId[id] && !byId[id].hidden ? toZone(byId[id], u, v) : null),
    occluders: () => layout.zones.filter((o) => o.occluder && !o.hidden).map((o) => o.mask.map(([u, v]) => toZone(o, u, v))),
  };
}

/** Everything the cards and the ranking need about the model's current projector spot. */
export function analyse(m, { fast = false } = {}) {
  const cam = projectorCamera(m);
  const layout = layoutFromModel(m, cam);
  const wall = layout.zones.find((z) => z.id === 'wall');
  const L = stageLayout(envFor(layout, wall), wall.res[0], wall.res[1]);
  const pxPerM = wall.res[0] / m.room.wallWidth;          // the wall zone is the wall rectangle: u is linear in x
  const sb = m.sideboard, pj = m.projector;
  const sh = shadows(m, cam);
  const floorShadow = spanAt(sh[0].wall, sb.height);
  // Star: where its shadow lands on the wall vs the topper itself (the first test lit the shadow, not the topper).
  const starC = sh[1].wall.reduce((a, p) => [a[0] + p[0] / sh[1].wall.length, a[1] + p[1] / sh[1].wall.length], [0, 0]);
  const cov = coverage(m, cam);
  const fwd = cam.fwd;
  // Bar: from behind the counter the beam's lowest ray (to the sideboard front) must clear the bar top.
  let barClear = null;
  const c = m.counter;
  if (c && pj.pos[1] > c.y) {
    const low = [sb.x1, sb.depth, sb.height];
    barClear = pj.pos[2] + (low[2] - pj.pos[2]) * (pj.pos[1] - c.y) / (pj.pos[1] - low[1]) - c.z;
  }
  const out = {
    cam, layout, L, pxPerM,
    floorMargin: L.margin.floor / pxPerM,                  // m of spare floor once the dogs stand clear of the shadow
    towerMargin: L.margin.tower / pxPerM,
    floorNeed: L.floorNeed / pxPerM,
    floorSpan: L.floorSpan.map((x) => x / pxPerM),
    shadowAtFloor: floorShadow,                            // [x0, x1] m on the wall at the sideboard top
    starShadowOffset: [starC[0] - m.tree.x, starC[1] - (m.star.topZ - m.star.size / 2)],
    covered: cov.filter((k) => k.inside).length, coverTotal: cov.length, cov,
    rightStrip: layout.meta.stripDepth,
    keystone: Math.acos(Math.min(1, Math.abs(fwd[1]))) * 180 / Math.PI,   // angle between the lens axis and the wall normal
    barClear,
  };
  if (!fast) {
    const req = requiredThrowRatio(m);
    out.maxThrowRatio = req.maxThrowRatio;
    out.zoomFloor = pj.zoom?.[0] ?? pj.throwRatio;
    out.throwFits = req.maxThrowRatio >= out.zoomFloor;
    out.zoomSetting = Math.min(req.maxThrowRatio, pj.zoom?.[1] ?? pj.throwRatio);
  }
  return out;
}

const cm = (v) => Math.round(v * 100);
/** Plain-language trade-offs for a spot. */
export function tradeOffs(a) {
  const f = a.floorMargin;
  const floor = f < 0 ? `shadow ${-cm(f)} cm onto the dogs' floor` : f < TREE_TOLERANCE ? `shadow only ${cm(f)} cm clear of the dogs (tree ±10 cm: at risk)` : `shadow ${cm(f)} cm clear of the dogs`;
  return [
    floor,
    `right wall ${a.rightStrip.toFixed(1)} m`,
    `keystone ${a.keystone.toFixed(0)}°`,
    a.throwFits === undefined ? null : a.throwFits ? `throw fits (needs ≤ ${a.maxThrowRatio.toFixed(2)})`
      : `image a bit small: needs a throw ratio ≤ ${a.maxThrowRatio.toFixed(a.zoomFloor - a.maxThrowRatio < 0.01 ? 3 : 2)}`,
    a.covered < a.coverTotal ? `${a.coverTotal - a.covered} key point(s) outside the image` : null,
    a.barClear !== null && a.barClear < 0.03 ? `beam hits the bar (${cm(a.barClear)} cm)` : null,
  ].filter(Boolean);
}

/** Higher is better. Floor clearance matters most (it is what the first wall test got wrong), then the throw fit. */
export function score(a) {
  const f = a.floorMargin;
  let s = Math.min(f, 0.2) * 100 * (f < 0 ? 4 : 2);         // cm, capped: past 20 cm extra clearance doesn't matter
  s += Math.min(a.towerMargin, 0.05) * 100 * (a.towerMargin < 0 ? 4 : 1);
  if (a.throwFits === false) s -= (a.zoomFloor - a.maxThrowRatio) * 400;   // a 0.02 miss ≈ two ceiling corners: mild
  // Losing the star or the tree tip is serious; a ceiling or sideboard corner (≈1–2 cm, STAGE_SURVEY §03e) is not.
  for (const k of a.cov) if (!k.inside) s -= /Star|Tree/.test(k.name) ? 25 : 4;
  s += Math.min(a.rightStrip, 0.8) * 10;
  s -= a.keystone * 0.3;
  if (a.barClear !== null && a.barClear < 0.03) s -= 50;
  return s;
}

const range = (lo, hi, n) => (n < 2 || hi <= lo ? [lo] : Array.from({ length: n }, (_, i) => +(lo + (hi - lo) * i / (n - 1)).toFixed(3)));

/** Tries a grid of tripod spots and lens heights within m.limits; best first. */
export function rankSpots(m, { nx = 7, ny = 3, nz = 3 } = {}) {
  const lim = m.limits;
  const out = [];
  for (const x of range(...lim.x, nx)) for (const y of range(...lim.y, ny)) for (const z of range(...lim.z, nz)) {
    const t = clone(m);
    t.projector.pos = [x, y, z];
    const a = analyse(t);
    out.push({ pos: [x, y, z], a, score: score(a) });
  }
  return out.sort((p, q) => q.score - p.score);
}

/**
 * Gift-box sizes and positions that leave the dogs their floor and the cats their tower top: tries the build sizes
 * (BOX_SPECS §03) and slides the tower toward the corner as far as needed. Best first; `ok` = both margins ≥ 0.
 */
export function suggestBoxes(m, { bigs = [0.40, 0.35, 0.30], smalls = [0.30, 0.25], step = 0.025 } = {}) {
  const end = Math.min(m.sideboard.x1, m.room.wallWidth);
  const cur = m.boxes.find((b) => b.id === 'box2')?.x0 ?? end - 0.55;
  const cands = [];
  for (const big of bigs) for (const small of smalls.filter((s) => s < big)) {
    for (let x0 = cur - 0.1; x0 + big <= end + 1e-6; x0 += step) {
      const t = clone(m);
      const inset = (big - small) / 2;
      t.boxes = [
        { id: 'box1', x0: +(x0 + inset).toFixed(3), y0: +inset.toFixed(3), z0: +(t.sideboard.height + big).toFixed(3), size: small },
        { id: 'box2', x0: +x0.toFixed(3), y0: 0, size: big },
      ];
      const a = analyse(t, { fast: true });
      cands.push({ boxes: t.boxes, big, small, x0, floor: a.floorMargin, tower: a.towerMargin, ok: a.floorMargin >= 0 && a.towerMargin >= 0 });
    }
  }
  // Prefer: fits, the dogs clear of the tree's ±10 cm, bigger boxes (bigger canvases), the least move from today.
  const rank = (c) => (c.ok ? 1000 : 0) + (c.floor >= TREE_TOLERANCE ? 500 : c.floor * 1000) + c.big * 300 + c.small * 100 - Math.abs(c.x0 - cur) * 50 + Math.min(c.tower, 0) * 1000;
  return cands.sort((p, q) => rank(q) - rank(p));
}
