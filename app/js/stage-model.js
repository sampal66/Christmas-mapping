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
  // Planned white gift boxes (not bought yet): cubes standing on the sideboard top.
  boxes: [
    { id: 'box1', x0: 1.25, y0: 0.05, size: 0.30 },
    { id: 'box2', x0: 1.60, y0: 0.00, size: 0.40 },
  ],
  rightStrip: { depth: 0.8 },
  fixtures: { sconce: { y: 1.25, z: 1.85 }, securityCamera: { z: 2.15 } },
  // Tripod in the kitchen behind the bar (owner measured 3.5 m, head 1.45 m). x and the tree position come from
  // fitting this model to the tripod-top photo (edges agree within ≈5–10 cm).
  projector: { pos: [0.0, 3.5, 1.45], throwRatio: 1.35, res: [1920, 1080] },
  counter: { y: 2.9, z: 1.06 },
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

/** Projector camera aimed at the middle of the stage's angular extent (yaw/pitch can be overridden). */
export function projectorCamera(m, override = {}) {
  const pj = m.projector;
  const ang = keyPoints(m).map((k) => anglesTo(pj.pos, k.p));
  const mid = (vals) => (Math.min(...vals) + Math.max(...vals)) / 2;
  return makeCamera({
    pos: pj.pos,
    yaw: override.yaw ?? mid(ang.map((a) => a.yaw)),
    pitch: override.pitch ?? mid(ang.map((a) => a.pitch)),
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

/** The Mapper layout (same format as layout.js) generated from the model. */
export function layoutFromModel(m, cam = projectorCamera(m)) {
  const { room, sideboard: sb, tree, star } = m;
  const W = room.wallWidth;
  const eye = m.projector.pos;

  const [wz0, wz1] = clipZ(cam, (a, b) => wallRect(0, W, a, b), 0, room.ceiling);
  const [bz0, bz1] = clipZ(cam, (a, b) => wallRect(sb.x0, W, a, b), sb.height, room.ceiling);
  const stripDepth = clipDepth(cam, W, m.rightStrip.depth, sb.height, room.ceiling);
  const [rz0, rz1] = clipZ(cam, (a, b) => rightWallRect(W, 0, stripDepth, a, b), sb.height, room.ceiling);
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
    ...m.boxes.map((b, i) => {
      const face = (a, c) => wallRect(b.x0, b.x0 + b.size, a, c, b.y0 + b.size);
      const [z0, z1] = clipZ(cam, face, sb.height, sb.height + b.size);
      return { id: b.id, label: `Gift box ${i + 1}`, color: i % 2 ? '#ba68c8' : '#f06292', res: [256, 256], occlude: true, quad: toPx(cam, face(z0, z1)) };
    }),
    { id: 'tree', label: 'Tree', color: '#aed581', res: [768, 1024], occlude: true,
      quad: toPx(cam, billboard(eye, tree.x, tree.y, treeRadiusAt(tree, tz0), tz0, tz1)), mask: treeMask(tree, tz0, tz1) },
    { id: 'star', label: 'Star', color: '#ffd54f', res: [256, 256],
      quad: toPx(cam, billboard(eye, tree.x, tree.y, star.size / 2, starBottom, star.topZ)) },
  ];
  return { version: 1, audioOffsetMs: 0, zones };
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

/** Field of view (degrees) the stage needs from the projector spot, and the widest throw ratio that covers it. */
export function requiredThrowRatio(m) {
  const ang = keyPoints(m).map((k) => anglesTo(m.projector.pos, k.p));
  const span = (vals) => Math.max(...vals) - Math.min(...vals);
  const h = span(ang.map((a) => a.yaw)), v = span(ang.map((a) => a.pitch));
  const [rw, rh] = m.projector.res;
  // Small-angle-safe: the image must contain both spans around its centre.
  const trH = 1 / (2 * Math.tan(h / 2));
  const trV = (rh / rw) / (2 * Math.tan(v / 2));
  return { hDeg: h * 180 / Math.PI, vDeg: v * 180 / Math.PI, maxThrowRatio: Math.min(trH, trV) };
}
