// s05 (WP-11): Mickey as a drone-show swarm. As Mickey whistles the clue, his old-film frame (a flat screen of
// drones) flies apart and re-forms as a **3D figure of the 1928 Steamboat Willie Mickey** (public domain design only:
// round ears, pie-cut eyes, long snout, bare hands with no gloves, shorts with two buttons, rubber-hose limbs, thin
// tail), drone-show style like s06/s10 (owner, 2026-11-17: "a swarm of drones gives depth"). Every body part is a
// volume filled with identical light points (sphere head, thick ear discs, ellipsoid snout/body/shoes, tube limbs),
// and the camera sways so the depth reads. He bobs to the whistle, then raises his arm and points up; a stream of
// drones flows from his fingertip up into the sky (the lead-in to s06). A reusable piece WP-08 places.
//
// Keyframed joint poses are blended over time; each part keeps a fixed set of surface parameters (precomputed), so
// the swarm keeps its identity as the pose changes and can morph in from the film screen. Time-based only.
import { TAU, rand, clamp, lerp, easeInOutSine, easeOutBack, glowSprite, dot, additive } from './util.js';
import { renderCloud, morphClouds, projector } from './points3d.js';

// ---------- poses (figure units, y down, z away from the viewer; ≈ 2.2 units tall; he faces right, ¾ view) ----------
const WHISTLE = {
  head: [0.04, -0.56], tilt: 0.12,
  elbowL: [-0.4, 0.02], handL: [-0.19, 0.2],             // hands on hips
  elbowR: [0.38, 0.02], handR: [0.2, 0.2],
  footL: [-0.24, 0.86], footR: [0.24, 0.86],
  finger: 0,
};
const POINT = {
  head: [0.08, -0.6], tilt: -0.38,                        // looking up at the sky
  elbowL: [-0.4, 0.02], handL: [-0.19, 0.2],
  elbowR: [0.58, -0.22], handR: [0.8, -0.66],             // arm raised high, clear of the head
  footL: [-0.22, 0.86], footR: [0.28, 0.84],
  finger: 1,
};
const ANTICIPATE = {                                      // a little crouch and wind-up before the point
  ...WHISTLE, head: [0.0, -0.5], tilt: 0.3, elbowR: [0.42, 0.12], handR: [0.3, 0.32], footL: [-0.26, 0.86], footR: [0.26, 0.86],
};

function blend(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) {
    const va = a[key], vb = b[key];
    o[key] = Array.isArray(va) ? [lerp(va[0], vb[0], k), lerp(va[1], vb[1], k)] : lerp(va, vb, k);
  }
  return o;
}

function poseAt(age, T) {
  let p;
  if (age < T.anticipate) p = WHISTLE;
  else if (age < T.point) p = blend(WHISTLE, ANTICIPATE, easeInOutSine((age - T.anticipate) / (T.point - T.anticipate)));
  else p = blend(ANTICIPATE, POINT, clamp(easeOutBack(clamp((age - T.point) / 0.7))));
  // Whistling: the head bobs side to side and a foot taps, twice per second (rubber-hose bounce).
  const bob = (1 - clamp((age - T.anticipate) / 0.5)) * clamp((age - T.form) / 0.6 + 1);
  if (bob > 0) {
    const s = Math.sin(age * Math.PI * 2);
    p = { ...p, head: [p.head[0] + 0.03 * s * bob, p.head[1] - 0.025 * Math.abs(s) * bob], tilt: p.tilt + 0.12 * s * bob,
      footR: [p.footR[0], p.footR[1] - 0.06 * Math.max(0, Math.sin(age * Math.PI * 4)) * bob] };
  }
  return p;
}

// ---------- surface samplers: fixed parameters per part, placed each frame ----------
const GA = Math.PI * (3 - Math.sqrt(5));
/** Unit directions evenly over a sphere (Fibonacci lattice). */
const sphereDirs = (n) => Array.from({ length: n }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * GA;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
});
/** Points filling a unit disc (sunflower), two layers for thickness. */
const discPts = (n) => Array.from({ length: n }, (_, i) => {
  const r = Math.sqrt((i + 0.5) / n), a = i * GA;
  return [Math.cos(a) * r, Math.sin(a) * r, i % 2 ? 1 : -1];
});
/** Tube parameters: [f along the curve, angle round it]. */
const tubePts = (n, turns) => Array.from({ length: n }, (_, i) => [(i + 0.5) / n, i * GA * turns]);

const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const quad = (a, c, b, f) => [(1 - f) ** 2 * a[0] + 2 * (1 - f) * f * c[0] + f * f * b[0], (1 - f) ** 2 * a[1] + 2 * (1 - f) * f * c[1] + f * f * b[1]];

// Colours (palette tokens). The 1928 film is black and white; in light, his "black" (head, ears, body, limbs, hands)
// is cool ice, the face/muzzle warm cream (sepia), shorts plum with two gold buttons, shoes snow. Lifted, never dark.
const BLACK = 'ice', FACE = 'sepia';
const FACE_DIR = (() => { const v = [0.72, 0.12, -0.68]; const m = Math.hypot(...v); return v.map((x) => x / m); })();

// Part table: name, kind, point count, colour (or per-point colour fn), extra.
const PARTS = [
  { id: 'head', kind: 'sphere', n: 300 },
  { id: 'earL', kind: 'disc', n: 90, color: BLACK },
  { id: 'earR', kind: 'disc', n: 90, color: BLACK },
  { id: 'snout', kind: 'sphere', n: 100, color: FACE },
  { id: 'nose', kind: 'sphere', n: 22, color: BLACK },
  { id: 'eyeL', kind: 'eye', n: 40, color: BLACK },
  { id: 'eyeR', kind: 'eye', n: 40, color: BLACK },
  { id: 'mouth', kind: 'sphere', n: 14, color: 'rose' },
  { id: 'torso', kind: 'sphere', n: 150, color: BLACK },
  { id: 'shorts', kind: 'sphere', n: 130, color: 'plum' },
  { id: 'btnL', kind: 'sphere', n: 10, color: 'gold' },
  { id: 'btnR', kind: 'sphere', n: 10, color: 'gold' },
  { id: 'armL', kind: 'tube', n: 60, color: BLACK },
  { id: 'armR', kind: 'tube', n: 60, color: BLACK },
  { id: 'handL', kind: 'sphere', n: 24, color: BLACK },
  { id: 'handR', kind: 'sphere', n: 24, color: BLACK },
  { id: 'finger', kind: 'tube', n: 12, color: BLACK },
  { id: 'legL', kind: 'tube', n: 54, color: BLACK },
  { id: 'legR', kind: 'tube', n: 54, color: BLACK },
  { id: 'shoeL', kind: 'sphere', n: 60, color: 'snow' },
  { id: 'shoeR', kind: 'sphere', n: 60, color: 'snow' },
  { id: 'tail', kind: 'tube', n: 32, color: BLACK },
];
for (const p of PARTS) {
  p.par = p.kind === 'sphere' ? sphereDirs(p.n) : p.kind === 'disc' || p.kind === 'eye' ? discPts(p.n) : tubePts(p.n, p.id === 'tail' ? 0.3 : 1);
}
// The head's face patch (points turned towards the muzzle side) is cream, the rest "black".
PARTS[0].colors = PARTS[0].par.map(([x, y, z]) => (x * FACE_DIR[0] + y * FACE_DIR[1] + z * FACE_DIR[2] > 0.22 && y > -0.5 ? FACE : BLACK));
const N = PARTS.reduce((s, p) => s + p.n, 0);
const COLOR = new Array(N);
{ let k = 0; for (const p of PARTS) for (let i = 0; i < p.n; i++) COLOR[k++] = p.colors ? p.colors[i] : p.color; }

/** Place every point for a pose into `out` (Float32Array, x y z per point). Returns { hand, mouth } anchors. */
function place(p, out) {
  let k = 0;
  const put = (x, y, z) => { out[k * 3] = x; out[k * 3 + 1] = y; out[k * 3 + 2] = z; k++; };
  const H = p.head, tl = p.tilt;
  const onHead = (x, y) => { const [rx, ry] = rot2(x, y, tl); return [H[0] + rx, H[1] + ry]; };
  const ellipsoid = (part, c, rx, ry, rz, a = 0) => {
    for (const [x, y, z] of part.par) { const [ex, ey] = rot2(x * rx, y * ry, a); put(c[0] + ex, c[1] + ey, c[2] + z * rz); }
  };
  const tube = (part, a, ctrl, b, r, z0, z1, taper = 0) => {
    for (const [f, ang] of part.par) {
      const q = quad(a, ctrl, b, f), q2 = quad(a, ctrl, b, Math.min(1, f + 0.02));
      let nx = -(q2[1] - q[1]), ny = q2[0] - q[0]; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      const rr = r * (1 - taper * f);
      put(q[0] + nx * Math.cos(ang) * rr, q[1] + ny * Math.cos(ang) * rr, lerp(z0, z1, f) + Math.sin(ang) * rr);
    }
  };
  const P = Object.fromEntries(PARTS.map((q) => [q.id, q]));
  // head: a sphere of drones
  for (const [x, y, z] of P.head.par) { const [hx, hy] = onHead(x * 0.29, y * 0.28); put(hx, hy, z * 0.27); }
  // ears: thick discs, round, standing up from the top of the head
  for (const [id, ox, oy, oz] of [['earL', -0.25, -0.31, 0.08], ['earR', 0.19, -0.34, -0.02]]) {
    const [cx, cy] = onHead(ox, oy);
    for (const [x, y, s] of P[id].par) put(cx + x * 0.155, cy + y * 0.155, oz + s * 0.025 + x * 0.05);
  }
  // muzzle: a long rounded snout towards the viewer's right, nose ball at its tip
  { const [cx, cy] = onHead(0.3, 0.1); ellipsoid(P.snout, [cx, cy, -0.12], 0.21, 0.11, 0.12, tl + 0.12); }
  { const [cx, cy] = onHead(0.51, 0.04); ellipsoid(P.nose, [cx, cy, -0.15], 0.055, 0.045, 0.045); }
  // pie-cut eyes: tall ovals on the face with a wedge of drones missing (the wedge points sit in the centre)
  for (const [id, ox] of [['eyeL', 0.05], ['eyeR', 0.19]]) {
    const [cx, cy] = onHead(ox, -0.07);
    for (const [x, y] of P[id].par) {
      const a = Math.atan2(y, x), cut = Math.abs(((a - 0.6 + Math.PI) % TAU + TAU) % TAU - Math.PI) < 0.45;
      const s = cut ? 0.15 : 1;
      put(cx + x * 0.055 * s, cy + y * 0.1 * s, -0.27 + ox * 0.25);
    }
  }
  // mouth: a small puckered ball while whistling, a smile curve once he points
  {
    const [cx, cy] = onHead(0.38, 0.17);
    P.mouth.par.forEach(([x, y, z], i) => {
      if (p.finger < 0.5) put(cx + x * 0.035, cy + y * 0.035, -0.17 + z * 0.03);
      else { const f = i / (P.mouth.n - 1); const [sx, sy] = onHead(0.22 + 0.2 * f, 0.15 + 0.07 * Math.sin(f * Math.PI)); put(sx, sy, -0.17); }
    });
  }
  // body: a pear-shaped torso, round shorts, two buttons on the front
  ellipsoid(P.torso, [0, 0.04, 0], 0.18, 0.25, 0.14);
  ellipsoid(P.shorts, [0, 0.29, 0], 0.22, 0.13, 0.17);
  ellipsoid(P.btnL, [-0.07, 0.28, -0.17], 0.03, 0.03, 0.02);
  ellipsoid(P.btnR, [0.08, 0.28, -0.17], 0.03, 0.03, 0.02);
  // rubber-hose arms and legs (tubes), bare round hands (no gloves in 1928), a pointing finger
  tube(P.armL, [-0.15, -0.08], p.elbowL, p.handL, 0.04, 0.08, 0.12);
  tube(P.armR, [0.15, -0.08], p.elbowR, p.handR, 0.04, -0.06, -0.12);
  ellipsoid(P.handL, [p.handL[0], p.handL[1], 0.12], 0.065, 0.065, 0.06);
  ellipsoid(P.handR, [p.handR[0], p.handR[1], -0.12], 0.065, 0.065, 0.06);
  const tip = [p.handR[0] + 0.03 * p.finger, p.handR[1] - 0.17 * p.finger];
  tube(P.finger, p.handR, [(p.handR[0] + tip[0]) / 2, (p.handR[1] + tip[1]) / 2], tip, 0.02 * (0.3 + 0.7 * p.finger), -0.12, -0.13);
  tube(P.legL, [-0.09, 0.38], [-0.2, 0.62], p.footL, 0.045, 0.05, 0.05);
  tube(P.legR, [0.09, 0.38], [0.2, 0.62], p.footR, 0.045, -0.05, -0.05);
  ellipsoid(P.shoeL, [p.footL[0] - 0.06, p.footL[1] + 0.06, 0.05], 0.17, 0.08, 0.1, -0.08);
  ellipsoid(P.shoeR, [p.footR[0] + 0.09, p.footR[1] + 0.06, -0.05], 0.18, 0.08, 0.1, 0.06);
  // a thin tail curling up behind him
  tube(P.tail, [-0.18, 0.32], [-0.62, 0.58], [-0.64, 0.12], 0.016, 0.12, 0.2);
  return { hand: tip, mouth: onHead(0.38, 0.17) };
}

// ---------- the piece ----------
const live = { n: N, p: new Float32Array(N * 3), s: new Float32Array(N).fill(1) };
const screenCache = new Map();
/** The film frame as a flat screen of drones (or, with film = false, a loose cloud where the frame was). */
function screenCloud(aspect, film) {
  const key = `${aspect}|${film}`;
  if (screenCache.has(key)) return screenCache.get(key);
  const c = { n: N, p: new Float32Array(N * 3), s: new Float32Array(N).fill(1) };
  const hw = 0.95 * aspect, hh = 0.95;
  const cols = Math.ceil(Math.sqrt((N * hw) / hh)), rows = Math.ceil(N / cols);
  for (let i = 0; i < N; i++) {
    const gx = (i % cols) / (cols - 1), gy = Math.floor(i / cols) / (rows - 1);
    const jit = film ? 0.004 : 0.25;
    c.p.set([(gx - 0.5) * 2 * hw + (rand(i) - 0.5) * jit, (gy - 0.5) * 2 * hh + (rand(i + 0.3) - 0.5) * jit, (rand(i + 0.6) - 0.5) * (film ? 0.02 : 0.8)], i * 3);
  }
  screenCache.set(key, c);
  return c;
}

/** Default timing (seconds from `mickey-in`); the s05 whistle sfx is ≈ 8 s long from the cue. */
export const MICKEY_TIMING = { frame: 0, dissolve: 1.6, form: 4.4, anticipate: 7.6, point: 8.4, trail: 9.0, fade: 12.5, end: 15 };

/**
 * Draw the drone-swarm Mickey. age: seconds since `mickey-in`. opts: x, y (centre on the zone, 0..1), size (cloud
 * units → share of min(w, h)), alpha, timing (override MICKEY_TIMING), film (start from a drone "film screen";
 * WP-08 sets false once Mickey's clip plays in the frame, and the swarm gathers from a loose cloud instead).
 */
export function mickeyStars(ctx, w, h, t, age, opts = {}) {
  const T = { ...MICKEY_TIMING, ...(opts.timing || {}) };
  const { x = 0.5, y = 0.6, size = 0.2, alpha = 1, film = true } = opts;
  if (age < 0 || age > T.end || alpha <= 0.01) return;
  const A = alpha * (1 - easeInOutSine(clamp((age - T.fade) / (T.end - T.fade))));
  const S = Math.min(w, h) * size;
  const k = clamp((age - T.dissolve) / (T.form - T.dissolve));
  // The camera swings round while the swarm forms (drone shows reveal depth this way), then sways gently.
  const swing = 1 - easeInOutSine(k);
  const view = { cx: x, cy: y, scale: size, rotY: 0.42 * Math.sin(age * 0.5) - 0.9 * swing, rotX: 0.08 + 0.25 * swing, dist: 3.4 };

  const pose = poseAt(age, T);
  const anchors = place(pose, live.p);
  const screen = screenCloud(0.8, film);
  const cloud = k <= 0 ? screen : k >= 1 ? live : morphClouds(screen, live, k, { stagger: 0.5, lift: 0.7, seed: 23 });
  // On the film screen the drones are warm sepia; as they fly they take their figure colours.
  const color = k <= 0 ? 'sepia' : (i) => (rand(i * 1.7) < k * 1.15 ? COLOR[i] : 'sepia');
  const fadeIn = film ? clamp(age / 0.8) : clamp((age - T.dissolve) / 0.8);
  renderCloud(ctx, w, h, t, cloud, { ...view, size: 0.95, alpha: A * fadeIn, color, twinkle: 0.12 });

  const P = projector(w, h, view);
  // whistled notes: little clusters of gold drones floating up from his mouth
  const noteA = A * clamp((age - T.form + 0.6) / 0.8) * (1 - clamp((age - T.anticipate) / 0.6));
  if (noteA > 0.01) {
    const [mx, my] = P(anchors.mouth[0], anchors.mouth[1], -0.17);
    additive(ctx, noteA, () => {
      for (let j = 0; j < 4; j++) {
        const a = (age * 0.9 + j * 0.25) % 1;
        const nx = mx + S * (0.15 + 0.5 * a) + Math.sin(a * 6 + j) * S * 0.05, ny = my - S * 0.7 * a;
        noteGlyph(ctx, nx, ny, S * 0.16, Math.sin(a * Math.PI) * noteA, j % 2, Math.max(2.5, Math.min(w, h) / 260));
      }
    });
  }
  // pointing: a stream of drones flows from the fingertip up into the sky (the lead-in to s06)
  const tr = clamp((age - T.trail) / 2.2);
  if (tr > 0) {
    const [hx, hy] = P(anchors.hand[0], anchors.hand[1], -0.13);
    const ey = hy + (-0.02 * h - hy) * easeInOutSine(tr), ex = hx + w * 0.04 * easeInOutSine(tr);
    const len = Math.hypot(ex - hx, ey - hy), gap = Math.max(10, S * 0.06);
    const r = Math.max(2.5, Math.min(w, h) / 260) * 2.4;
    additive(ctx, A, () => {
      const gold = glowSprite('gold', 0.3), snow = glowSprite('snow', 0.3);
      for (let d = (age * gap * 3) % gap; d < len; d += gap) {
        const f = d / Math.max(1, len);
        ctx.globalAlpha = A * (0.5 + 0.5 * f);
        dot(ctx, f > 0.9 ? snow : gold, hx + (ex - hx) * f, hy + (ey - hy) * f, r);
      }
    });
  }
}

/** A musical note made of drones: an oval head, a stem and (for `flag`) a little flag. */
function noteGlyph(ctx, x, y, s, a, flag, r) {
  if (a <= 0.01) return;
  const sp = glowSprite('gold', 0.3);
  ctx.globalAlpha *= a;
  for (let i = 0; i < 6; i++) { const ang = (i / 6) * TAU; dot(ctx, sp, x + Math.cos(ang) * s * 0.35, y + Math.sin(ang) * s * 0.25, r * 2.2); }
  for (let i = 1; i <= 5; i++) dot(ctx, sp, x + s * 0.32, y - (i / 5) * s * 1.3, r * 2);
  if (flag) for (let i = 1; i <= 3; i++) dot(ctx, sp, x + s * (0.32 + i * 0.13), y - s * 1.3 + i * s * 0.15, r * 2);
  ctx.globalAlpha /= a;
}
