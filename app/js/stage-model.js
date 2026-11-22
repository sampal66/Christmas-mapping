// Spatial model of the real stage (see docs/STAGE_SURVEY.md) and the projector, in metres.
// It generates the Mapper's default zones by projecting the real objects through a pinhole model of the
// projector. When the projector arrives, enter its real position and throw ratio and the zones follow.
//
// World axes: origin = floor at the doorway jamb, on the main-wall plane.
//   x → along the main wall toward the right corner, y → out of the wall into the room, z → up.

export const STAGE_MODEL = {
  version: 1,
  room: { wallWidth: 2.10, ceiling: 2.20, rightWallLength: 3.4 },
  sideboard: { x0: 1.03, x1: 2.10, depth: 0.41, height: 0.79 },
  // Tree: cone around a vertical axis. The tip is the bare top; the star sits on it.
  tree: { x: 0.55, y: 0.45, baseZ: 0.15, tipZ: 1.80, radius: 0.50 },
  star: { size: 0.25, topZ: 2.03 },
  // Planned white gift boxes (not bought yet), stacked as a gift tower (owner, 2026-11-17): the big box on the
  // sideboard, the small one centred on top. z0 = the box's base height (default: the sideboard top).
  // From the projector (left, 1.45 m up) each box shows its front and its left side; the tops are slivers.
  boxes: [
    { id: 'box1', x0: 1.60, y0: 0.05, z0: 1.19, size: 0.30 },
    { id: 'box2', x0: 1.55, y0: 0.00, size: 0.40 },
  ],
  // Things that stay on the sideboard top during the show (plant, letter board, figurine…), filled in by the survey
  // (WP-09a): x = left edge from the jamb, y = distance of their front from the wall (default: mid-depth).
  obstacles: [],
  rightStrip: { depth: 0.8 },
  fixtures: { sconce: { y: 1.25, z: 1.85 }, securityCamera: { z: 2.15 } },
  // Tripod in the kitchen behind the bar (owner measured 3.5 m, head 1.45 m). x and the tree position come from
  // fitting this model to the tripod-top photo (edges agree within ≈5–10 cm).
  // zoom: the throw-ratio range the lens offers ([min, max]; the H1 has a fixed 1.4 lens, STAGE_SURVEY §03e).
  projector: { pos: [0.0, 3.5, 1.45], throwRatio: 1.4, zoom: [1.4, 1.4], res: [1920, 1080] },
  counter: { y: 2.9, z: 1.06 },
  // Where a tripod can stand (the room limits for the spot search, WP-09a): x across, y from the wall, z = lens height.
  limits: { x: [-0.3, 1.5], y: [3.0, 3.5], z: [1.2, 1.7] },
};

// ---------- vector helpers ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Direction angles of a world point from an eye: yaw > 0 turns toward +x, pitch > 0 looks up.
export function anglesTo(eye, p) {
  const d = sub(p, eye);
  return { yaw: Math.atan2(d[0], -d[1]), pitch: Math.atan2(d[2], Math.hypot(d[0], d[1])) };
}

/** The world direction of a camera pixel (not normalised). */
export function rayDir(cam, u, v) {
  const a = cam.focalPx, b = u - cam.res[0] / 2, c = cam.res[1] / 2 - v;
  return [0, 1, 2].map((i) => cam.fwd[i] * a + cam.right[i] * b + cam.up[i] * c);
}

// Pinhole camera. focalPx = throwRatio × image width (throw ratio = distance / image width).
export function makeCamera({ pos, yaw, pitch, focalPx, res }) {
  const fwd = [Math.sin(yaw) * Math.cos(pitch), -Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch)];
  const right = [Math.cos(yaw), Math.sin(yaw), 0];
  const up = cross(fwd, right);
  return { pos, fwd, right, up, focalPx, res, yaw, pitch };
}

/** World point → [u, v] in camera pixels, or null when it is behind the camera. */
export function project(cam, p) {
  const d = sub(p, cam.pos);
  const z = dot(d, cam.fwd);
  if (z <= 0.01) return null;
  return [cam.res[0] / 2 + cam.focalPx * dot(d, cam.right) / z, cam.res[1] / 2 - cam.focalPx * dot(d, cam.up) / z];
}

// ---------- the stage's key points (used for aiming and coverage) ----------
export function keyPoints(m) {
  const { tree, star, sideboard: sb, room } = m;
  const pts = [
    { name: 'Star top', p: [tree.x, tree.y, star.topZ] },
    { name: 'Tree tip', p: [tree.x, tree.y, tree.tipZ] },
    { name: 'Tree left edge (1 m up)', p: [tree.x - treeRadiusAt(tree, 1.0), tree.y, 1.0] },
    { name: 'Wall top-left', p: [0, 0, room.ceiling] },
    { name: 'Corner top', p: [room.wallWidth, 0, room.ceiling] },
    { name: 'Sideboard top, front-right', p: [sb.x1, sb.depth, sb.height] },
  ];
  for (const b of m.boxes) pts.push({ name: `${b.id} top`, p: [b.x0 + b.size, b.y0 + b.size, sb.height + b.size] });
  return pts;
}

function treeRadiusAt(tree, z) {
  return Math.max(0, tree.radius * (tree.tipZ - z) / (tree.tipZ - tree.baseZ));
}

// How far (px) the worst key point falls outside the image; ≤ 0 means everything fits.
function overflow(m, cam) {
  const [w, h] = cam.res;
  let worst = -Infinity;
  for (const k of keyPoints(m)) {
    const q = project(cam, k.p);
    if (!q) return Infinity;
    worst = Math.max(worst, -q[0], q[0] - w, -q[1], q[1] - h);
  }
  return worst;
}

// Aim that keeps every key point as far inside the image as possible (coarse-to-fine search).
function bestAim(m, throwRatio) {
  const pj = m.projector;
  const ang = keyPoints(m).map((k) => anglesTo(pj.pos, k.p));
  const mid = (vals) => (Math.min(...vals) + Math.max(...vals)) / 2;
  let best = { yaw: mid(ang.map((a) => a.yaw)), pitch: mid(ang.map((a) => a.pitch)) };
  const camFor = (a) => makeCamera({ pos: pj.pos, ...a, focalPx: throwRatio * pj.res[0], res: pj.res });
  let bestO = overflow(m, camFor(best));
  for (const step of [2, 0.5, 0.1].map((d) => d * Math.PI / 180)) {
    for (let improved = true; improved;) {
      improved = false;
      for (const [dy, dp] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const a = { yaw: best.yaw + dy * step, pitch: best.pitch + dp * step };
        const o = overflow(m, camFor(a));
        if (o < bestO) { best = a; bestO = o; improved = true; }
      }
    }
  }
  return best;
}

/** Projector camera with the best-fit aim (yaw/pitch can be overridden). */
export function projectorCamera(m, override = {}) {
  const pj = m.projector;
  const aim = bestAim(m, pj.throwRatio);
  return makeCamera({
    pos: pj.pos,
    yaw: override.yaw ?? aim.yaw,
    pitch: override.pitch ?? aim.pitch,
    focalPx: pj.throwRatio * pj.res[0],
    res: pj.res,
  });
}

// ---------- planar surfaces (corners clockwise from top-left, as seen from the projector) ----------
const wallRect = (x0, x1, z0, z1, y = 0) => [[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]];
const rightWallRect = (x, y0, y1, z0, z1) => [[x, y0, z1], [x, y1, z1], [x, y1, z0], [x, y0, z0]];

// Vertical card through (cx, cy) facing the projector: approximates the tree and star silhouettes.
function billboard(eye, cx, cy, halfW, z0, z1) {
  const n = [eye[0] - cx, eye[1] - cy];
  const len = Math.hypot(n[0], n[1]) || 1;
  const t = [n[1] / len, -n[0] / len]; // points to image-right as seen from the eye
  const L = [cx - t[0] * halfW, cy - t[1] * halfW];
  const R = [cx + t[0] * halfW, cy + t[1] * halfW];
  return [[L[0], L[1], z1], [R[0], R[1], z1], [R[0], R[1], z0], [L[0], L[1], z0]];
}

// Shrinks a surface's z-range so its projected bottom/top edges stay inside the image.
// Off-image handles can't be dragged in Calibrate, so defaults keep them reachable.
function clipZ(cam, makeRect, z0, z1) {
  const H = cam.res[1];
  const bottomV = (z) => { const r = makeRect(z, z1); return Math.max(...[r[2], r[3]].map((p) => project(cam, p)?.[1] ?? Infinity)); };
  const topV = (z) => { const r = makeRect(z0, z); return Math.min(...[r[0], r[1]].map((p) => project(cam, p)?.[1] ?? -Infinity)); };
  let lo = z0, hi = z1;
  if (bottomV(z0) > H) {
    let a = z0, b = z1;
    for (let i = 0; i < 30; i++) { const c = (a + b) / 2; if (bottomV(c) > H) a = c; else b = c; }
    lo = b;
  }
  if (topV(z1) < 0) {
    let a = lo, b = z1;
    for (let i = 0; i < 30; i++) { const c = (a + b) / 2; if (topV(c) < 0) b = c; else a = c; }
    hi = a;
  }
  return [lo, hi];
}

// Shortens the right-wall strip so its far edge stays inside the image width.
function clipDepth(cam, x, depth, z0, z1) {
  const farU = (d) => Math.max(...[[x, d, z1], [x, d, z0]].map((p) => project(cam, p)?.[0] ?? Infinity));
  if (farU(depth) <= cam.res[0]) return depth;
  let a = 0.01, b = depth;
  for (let i = 0; i < 30; i++) { const c = (a + b) / 2; if (farU(c) > cam.res[0]) b = c; else a = c; }
  return a;
}

const toPx = (cam, rect) => rect.map((p) => {
  const q = project(cam, p) || [NaN, NaN];
  return [Math.round(q[0]), Math.round(q[1])];
});

// Cone silhouette in the tree quad's unit coords: tip at the top, widening to the quad's bottom edge.
function treeMask(tree, zb, zt) {
  const W = 2 * treeRadiusAt(tree, zb);
  const right = [], left = [];
  for (let i = 0; i <= 5; i++) {
    const z = zt - (zt - zb) * (i / 5);
    const v = (zt - z) / (zt - zb);
    const hw = treeRadiusAt(tree, z) / W;
    right.push([+(0.5 + hw).toFixed(3), +v.toFixed(3)]);
    left.unshift([+(0.5 - hw).toFixed(3), +v.toFixed(3)]);
  }
  return [...right, ...left.slice(0, -1)];
}

// ---------- shadows: what the tree, the star and the obstacles hide from the lens (WP-09a) ----------
/** Convex hull of 2-D points (monotone chain), counter-clockwise. */
export function hull(pts) {
  const p = pts.filter((q) => q && q.every(Number.isFinite)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const q of list) { while (out.length >= 2 && turn(out.at(-2), out.at(-1), q) <= 0) out.pop(); out.push(q); }
    out.pop();
    return out;
  };
  return [...half(p), ...half([...p].reverse())];
}

/** A world point cast from the lens onto the main-wall plane (y = 0), as [x, z]; null if it is behind the lens. */
export function toWall(eye, p) {
  const k = eye[1] / (eye[1] - p[1]);
  return eye[1] - p[1] > 0.01 ? [eye[0] + (p[0] - eye[0]) * k, eye[2] + (p[2] - eye[2]) * k] : null;
}

// Sample points on each occluding solid. The tree is a cone (rings from the base to the bare tip); the star a disc
// facing the lens; an obstacle a box on the sideboard top.
function solids(m) {
  const { tree, star, sideboard: sb } = m;
  const cone = [];
  for (let i = 0; i <= 8; i++) {
    const z = tree.baseZ + (tree.tipZ - tree.baseZ) * (i / 8), r = treeRadiusAt(tree, z);
    for (let a = 0; a < 24; a++) cone.push([tree.x + r * Math.cos(a * Math.PI / 12), tree.y + r * Math.sin(a * Math.PI / 12), z]);
  }
  const eye = m.projector.pos, sr = star.size / 2, sz = star.topZ - sr;
  const n = [eye[0] - tree.x, eye[1] - tree.y], len = Math.hypot(...n) || 1, t = [n[1] / len, -n[0] / len];
  const disc = [];
  for (let a = 0; a < 16; a++) {
    const c = Math.cos(a * Math.PI / 8) * sr;
    disc.push([tree.x + t[0] * c, tree.y + t[1] * c, sz + Math.sin(a * Math.PI / 8) * sr]);
  }
  const out = [{ id: 'tree', pts: cone }, { id: 'star', pts: disc }];
  (m.obstacles || []).forEach((o, i) => {
    const y0 = o.y ?? sb.depth / 2, d = o.depth ?? 0.1, pts = [];
    for (const x of [o.x, o.x + o.width]) for (const y of [y0, Math.max(0, y0 - d)]) for (const z of [sb.height, sb.height + o.height]) pts.push([x, y, z]);
    out.push({ id: `obstacle${i + 1}`, label: o.label, pts });
  });
  return out;
}

/** Each occluder's outline: `wall` = the shadow it casts on the main wall ([x, z] metres), `px` = its outline in
 *  stage pixels (the same region, seen from the lens). */
export function shadows(m, cam = projectorCamera(m)) {
  const eye = m.projector.pos;
  return solids(m).map(({ id, label, pts }) => ({
    id, label, wall: hull(pts.map((p) => toWall(eye, p))), px: hull(pts.map((p) => project(cam, p))),
  }));
}

/** [min, max] of a convex polygon along the first axis where it crosses the second axis = c (null: no crossing). */
export function spanAt(poly, c) {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((a[1] - c) * (b[1] - c) > 0) continue;
    const xs = a[1] === b[1] ? [a[0], b[0]] : [a[0] + (b[0] - a[0]) * (c - a[1]) / (b[1] - a[1])];
    for (const x of xs) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
  }
  return lo <= hi ? [lo, hi] : null;
}

// Sutherland–Hodgman: a polygon clipped to the image rectangle (so occluder handles stay reachable in Calibrate).
function clipToRect(poly, w, h) {
  let out = poly;
  for (const [inside, cut] of [
    [(p) => p[0] >= 0, (a, b) => [0, a[1] + (b[1] - a[1]) * (0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= w, (a, b) => [w, a[1] + (b[1] - a[1]) * (w - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= 0, (a, b) => [a[0] + (b[0] - a[0]) * (0 - a[1]) / (b[1] - a[1]), 0]],
    [(p) => p[1] <= h, (a, b) => [a[0] + (b[0] - a[0]) * (h - a[1]) / (b[1] - a[1]), h]],
  ]) {
    const src = out; out = [];
    src.forEach((b, i) => {
      const a = src[(i + src.length - 1) % src.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    });
  }
  return out;
}

/** Occluder zones (WP-09a): the tree + star shadow and each obstacle, as a box quad + polygon mask. Nothing is drawn
 *  in them; the stage layout keeps the characters out of them. */
function occluderZones(m, cam) {
  const [W, H] = cam.res;
  const sh = shadows(m, cam);
  const groups = [
    // Two zones, not one hull: a hull of the star and the cone would widen the shadow all the way down to the floor.
    { id: 'shadow', label: 'Tree shadow', color: '#78909c', px: sh[0].px },
    { id: 'starShadow', label: 'Star shadow', color: '#90a4ae', px: sh[1].px },
    ...sh.slice(2).map((o, i) => ({ id: o.id, label: `Obstacle ${i + 1}${o.label ? ` · ${o.label}` : ''}`, color: '#a1887f', px: o.px })),
  ];
  return groups.flatMap(({ px, ...z }) => {
    const poly = clipToRect(px, W, H);
    if (poly.length < 3) return [];
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs)), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    if (x1 - x0 < 2 || y1 - y0 < 2) return [];
    const mask = poly.map(([x, y]) => [+((x - x0) / (x1 - x0)).toFixed(4), +((y - y0) / (y1 - y0)).toFixed(4)]);
    return [{ ...z, res: [256, 256], occluder: true, quad: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], mask }];
  });
}

/** The Mapper layout (same format as layout.js) generated from the model. */
export function layoutFromModel(m, cam = projectorCamera(m)) {
  const { room, sideboard: sb, tree, star } = m;
  const W = room.wallWidth;
  const eye = m.projector.pos;

  const [wz0, wz1] = clipZ(cam, (a, b) => wallRect(0, W, a, b), 0, room.ceiling);
  const [bz0, bz1] = clipZ(cam, (a, b) => wallRect(sb.x0, W, a, b), sb.height, room.ceiling);
  const stripZ0 = m.rightStrip.z0 ?? sb.height;           // the dining table's height (survey), else the sideboard's
  const stripDepth = clipDepth(cam, W, m.rightStrip.depth, stripZ0, room.ceiling);
  const [rz0, rz1] = clipZ(cam, (a, b) => rightWallRect(W, 0, stripDepth, a, b), stripZ0, room.ceiling);
  const [sz0] = clipZ(cam, (a, b) => wallRect(sb.x0, sb.x1, a, b, sb.depth), 0, sb.height);
  const stageZ0 = Math.min(sz0, sb.height - 0.06); // keep at least a thin footlight strip
  const stageQuad = toPx(cam, wallRect(sb.x0, sb.x1, stageZ0, sb.height, sb.depth));
  // The drawers are usually below the image: then the strip starts hidden, clamped so its handles stay reachable.
  const stageOff = Math.min(stageQuad[0][1], stageQuad[1][1]) >= cam.res[1];
  const clampV = (q) => q.map(([u, v]) => [u, Math.min(v, cam.res[1])]);
  const [tz0, tz1] = clipZ(cam, (a, b) => billboard(eye, tree.x, tree.y, treeRadiusAt(tree, a), a, b), tree.baseZ, tree.tipZ);

  const starBottom = star.topZ - star.size;
  const zones = [
    { id: 'wall', label: 'Wall', color: '#4fc3f7', res: [1920, 1080], quad: toPx(cam, wallRect(0, W, wz0, wz1)) },
    { id: 'rightStrip', label: 'Right wall strip', color: '#9575cd', res: [256, 1024], quad: toPx(cam, rightWallRect(W, 0, stripDepth, rz0, rz1)) },
    { id: 'backdrop', label: 'Backdrop', color: '#81c784', res: [1024, 1200], quad: toPx(cam, wallRect(sb.x0, W, bz0, bz1)) },
    // The drawers sit mostly below the image (and are dark wood), so this is only a thin footlight strip.
    { id: 'stage', label: 'Sideboard front', color: '#ffb74d', res: [1024, 64], quad: clampV(stageQuad), occlude: true, ...(stageOff ? { hidden: true } : {}) },
    ...m.boxes.flatMap((b, i) => {
      const base = b.z0 ?? sb.height;
      const color = i % 2 ? '#ba68c8' : '#f06292';
      const front = (a, c) => wallRect(b.x0, b.x0 + b.size, a, c, b.y0 + b.size);
      const [z0, z1] = clipZ(cam, front, base, base + b.size);
      const out = [{ id: b.id, label: `Gift box ${i + 1} · front`, color, res: [256, 256], occlude: true, quad: toPx(cam, front(z0, z1)) }];
      // The side that faces the projector (left when the projector is left of the box). A face is only mapped
      // when the projector can see it.
      const leftSeen = eye[0] < b.x0, rightSeen = eye[0] > b.x0 + b.size;
      if (leftSeen || rightSeen) {
        const x = leftSeen ? b.x0 : b.x0 + b.size;
        // corners ordered as seen from the projector: back edge on the image-left for a left face
        const side = (a, c) => (leftSeen ? rightWallRect(x, b.y0, b.y0 + b.size, a, c) : rightWallRect(x, b.y0 + b.size, b.y0, a, c));
        const [s0, s1] = clipZ(cam, side, base, base + b.size);
        out.push({ id: `${b.id}Side`, label: `Gift box ${i + 1} · side`, color, res: [256, 256], occlude: true, quad: toPx(cam, side(s0, s1)) });
      }
      return out;
    }),
    { id: 'tree', label: 'Tree', color: '#aed581', res: [768, 1024], occlude: true,
      quad: toPx(cam, billboard(eye, tree.x, tree.y, treeRadiusAt(tree, tz0), tz0, tz1)), mask: treeMask(tree, tz0, tz1) },
    { id: 'star', label: 'Star', color: '#ffd54f', res: [256, 256],
      quad: toPx(cam, billboard(eye, tree.x, tree.y, star.size / 2, starBottom, star.topZ)) },
    ...occluderZones(m, cam),
  ];
  // meta: what the survey report needs (wall zone extent in metres, the right-wall strip kept, the camera aim).
  return { version: 1, audioOffsetMs: 0, zones, meta: { wallZ: [wz0, wz1], stripDepth, yaw: cam.yaw, pitch: cam.pitch } };
}

/** Which key points land inside the projected image (margin in pixels). */
export function coverage(m, cam = projectorCamera(m)) {
  const [w, h] = cam.res;
  return keyPoints(m).map(({ name, p }) => {
    const q = project(cam, p);
    const inside = !!q && q[0] >= 0 && q[0] <= w && q[1] >= 0 && q[1] <= h;
    return { name, px: q && q.map(Math.round), inside };
  });
}

/** Angular size of the stage from the projector spot, and the largest throw ratio that still covers every
 *  key point with the best aim (exact projection, found by bisection). */
export function requiredThrowRatio(m) {
  const ang = keyPoints(m).map((k) => anglesTo(m.projector.pos, k.p));
  const span = (vals) => Math.max(...vals) - Math.min(...vals);
  const fits = (tr) => {
    const aim = bestAim(m, tr);
    return overflow(m, makeCamera({ pos: m.projector.pos, ...aim, focalPx: tr * m.projector.res[0], res: m.projector.res })) <= 0;
  };
  let lo = 0.3, hi = 3;
  for (let i = 0; i < 25; i++) { const c = (lo + hi) / 2; if (fits(c)) lo = c; else hi = c; }
  return { hDeg: span(ang.map((a) => a.yaw)) * 180 / Math.PI, vDeg: span(ang.map((a) => a.pitch)) * 180 / Math.PI, maxThrowRatio: lo };
}
