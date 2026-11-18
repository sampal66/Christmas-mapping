// s06 (WP-11b): the pets as drone-swarm star figures. TREATMENT §04 has "pets as constellations" in s06, and §03 says
// Orion the cat smiles when his constellation forms. During each calm pause a small drone swarm peels off the
// constellation and re-forms beside it as that pet: a **3D figure of light points in real depth**, drone-show style
// like the s05 Mickey (fx/mickey-stars.js) and the constellations (owner: depth, not dotted outlines; smaller than the
// constellations). It makes one small move, then flies back into the swarm before the next ride.
//   Orion (tabby)   sitting hunched and grumpy → looks up at his constellation → softens: chest up, tail rises (his
//                   "smile", told by posture), with a warm glow at his heart
//   Connor (husky)  lying down, lifts his head to look up, big plume tail sways
//   Alaska (pomsky) sitting proud, nose up, unimpressed: a "hmph" head toss, tail always wagging
//   Gandalf (Russian Blue) crouches, wiggles, pounces towards the constellation, lands
//
// Same tech as Mickey: keyframed poses are blended over time; every body part is a volume (Fibonacci-sphere
// ellipsoids, spiral tubes, cones) with a fixed point count, so the swarm keeps its identity as the pose changes and can
// morph in from (and back into) the constellation. Colours follow DESIGN_SYSTEM §05 with lifted darks; markings (tabby
// stripes, the husky's white face and belly) are painted through the swarm. **Silhouettes only** (owner): no eyes,
// mouths or whiskers, which can't read at this size; each pet acts with its whole body. Time-based only.
import { TAU, rand, clamp, lerp, easeInOutSine, easeOutBack, glowSprite, dot, additive } from './util.js';
import { morphClouds, projector } from './points3d.js';
import { rgb } from '../palette.js';

// ---------- pose helpers ----------
/** Blend two poses key by key (numbers and [x, y] pairs). */
export function blendPose(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) {
    const va = a[key], vb = b[key] ?? va;
    o[key] = Array.isArray(va) ? [lerp(va[0], vb[0], k), lerp(va[1], vb[1], k)] : lerp(va, vb, k);
  }
  return o;
}
/** Pose from keyframes [[time, pose, ease?]] (time-sorted): holds the first/last, eases between. */
function keyed(keys, age) {
  if (age <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, p1, ease = easeInOutSine] = keys[i], [t0, p0] = keys[i - 1];
    if (age < t1) return blendPose(p0, p1, clamp(ease(clamp((age - t0) / (t1 - t0)))));
  }
  return keys.at(-1)[1];
}
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
/** A gentle pulse 0 → 1 → 0 between a and b (for blinks, twitches). */
const pulse = (age, a, b) => (age > a && age < b ? Math.sin(Math.PI * (age - a) / (b - a)) : 0);

// ---------- volume samplers (fixed parameters per point count, cached) ----------
const GA = Math.PI * (3 - Math.sqrt(5));
const dirCache = new Map(), tubeCache = new Map();
/** Unit directions evenly over a sphere (Fibonacci lattice). */
function sphereDirs(n) {
  if (!dirCache.has(n)) dirCache.set(n, Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * GA;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  }));
  return dirCache.get(n);
}
/** Tube parameters: [f along the curve, angle round it] on a spiral, so the surface fills evenly. */
function tubePts(n) {
  if (!tubeCache.has(n)) tubeCache.set(n, Array.from({ length: n }, (_, i) => [(i + 0.5) / n, i * GA]));
  return tubeCache.get(n);
}
const quad = (a, c, b, f) => [(1 - f) ** 2 * a[0] + 2 * (1 - f) * f * c[0] + f * f * b[0], (1 - f) ** 2 * a[1] + 2 * (1 - f) * f * c[1] + f * f * b[1]];

const CAP = 600;
// Volumes are sampled at this share of their nominal point count (owner: the first swarms read as balls of light;
// fewer drones with sky between them read as a drone show). Feature points (eyes, nose, mouth) are never thinned.
const DENSITY = 0.58;
const thin = (n) => Math.max(4, Math.round(n * DENSITY));
/**
 * The pen writes a figure's points into its cloud, part by part. Every part has a fixed point count, so a figure
 * always has the same number of points in the same order; colours and the count are recorded on the first build.
 * Colours are a token or fn(local x, y, z) → token (for markings). `oy` lifts the whole figure (Gandalf's leap).
 */
function pen(st) {
  const P = st.live.p, S = st.live.s, rec = !st.colors, cols = rec ? [] : null;
  let k = 0;
  const api = { oy: 0 };
  const put = (x, y, z, c, s) => {
    if (k >= CAP) return;
    P[k * 3] = x; P[k * 3 + 1] = y + api.oy; P[k * 3 + 2] = z; S[k] = s;
    if (rec) cols.push(c);
    k++;
  };
  const tok = (c, a, b, d) => (typeof c === 'function' ? c(a, b, d) : c);
  return Object.assign(api, {
    /** Ellipsoid centred at c [x, y, z], radii r [rx, ry, rz], turned by `rot` in the picture plane; fuzz roughens it (fur). */
    ell(n, c, r, col, s = 1, rot = 0, fuzz = 0) {
      n = thin(n);
      sphereDirs(n).forEach(([x, y, z], i) => {
        const f = 1 + fuzz * (rand(i * 3.1 + n) - 0.5);
        const [ex, ey] = rot2(x * r[0] * f, y * r[1] * f, rot);
        put(c[0] + ex, c[1] + ey, c[2] + z * r[2] * f, tok(col, x, y, z), s);
      });
    },
    /** Tube along a quadratic curve a → ctrl → b (2D), z from z0 to z1, radius r tapering by `taper` towards b. */
    tube(n, a, ctrl, b, r, z0, z1, col, s = 1, taper = 0) {
      n = thin(n);
      for (const [f, ang] of tubePts(n)) {
        const q = quad(a, ctrl, b, f), q2 = quad(a, ctrl, b, Math.min(1, f + 0.02));
        let nx = -(q2[1] - q[1]), ny = q2[0] - q[0]; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
        const rr = r * (1 - taper * f);
        put(q[0] + nx * Math.cos(ang) * rr, q[1] + ny * Math.cos(ang) * rr, lerp(z0, z1, f) + Math.sin(ang) * rr, tok(col, f, ang, 0), s);
      }
    },
    /** Cone (an ear): round base centred at `base` (radius r, depth thickness rz) narrowing to `tip`. */
    cone(n, base, tip, r, z, col, s = 1, rz = 0.35) {
      n = thin(n);
      const ax = tip[0] - base[0], ay = tip[1] - base[1], L = Math.hypot(ax, ay) || 1, px = -ay / L, py = ax / L;
      for (const [f, ang] of tubePts(n)) {
        const g = Math.sqrt(f), rr = r * (1 - g);
        put(base[0] + ax * g + px * Math.cos(ang) * rr, base[1] + ay * g + py * Math.cos(ang) * rr, z + Math.sin(ang) * rr * rz, col, s);
      }
    },
    /** A short line of points (whiskers, lids, the mouth) in front of the face. */
    line(n, a, b, z, col, s = 1) {
      for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1); put(lerp(a[0], b[0], f), lerp(a[1], b[1], f), z, col, s); }
    },
    /** A polyline of points (curved mouth), evenly by index along the given points. */
    path(n, pts, z, col, s = 1) {
      for (let i = 0; i < n; i++) {
        const f = (i / (n - 1)) * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(f)), g = f - j;
        put(lerp(pts[j][0], pts[j + 1][0], g), lerp(pts[j][1], pts[j + 1][1], g), z, col, s);
      }
    },
    star(p, z, col, s = 2.2) { put(p[0], p[1], z, col, s); },
    done() { if (rec) { st.colors = cols; st.n = k; } },
  });
}

// ---------- Orion: sitting tabby, ¾ view facing left (towards his constellation) ----------
// Cream fur with caramel tabby stripes painted through the swarm, yellow-green eyes → gold, warm nose and lip.
const ORION_GRUMPY = { head: [-0.09, -0.24], tilt: -0.12, smile: 0 };   // hunched, head low
const ORION_LOOK = { head: [-0.11, -0.29], tilt: 0.28, smile: 0 };
const ORION_SMILE = { head: [-0.12, -0.3], tilt: 0.18, smile: 1 };
const ORION_KEYS = [[2.2, ORION_GRUMPY], [3.8, ORION_LOOK], [7, ORION_SMILE]];
const tabby = (x, y) => (Math.sin(y * 9 + x * 2.5) > 0.55 ? 'candle' : 'sepia');

function orion(pn, age) {
  const q = keyed(ORION_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const er = pulse(age, 5.2, 5.5) + pulse(age, 5.6, 5.9);
  const fl = Math.sin(age * 1.9) * 0.5 + 0.5 * Math.sin(age * 4.3) * pulse(age % 4.2, 0, 1.2);
  // body: a pear of drones, haunch on the near side, two front legs, tail curling round the front
  pn.ell(96, [0.06, 0.13, 0.02], [0.19, 0.25, 0.16], tabby);
  pn.ell(40, [0.15, 0.3, -0.1], [0.12, 0.13, 0.07], tabby);
  pn.tube(20, [-0.11, 0.12], [-0.12, 0.3], [-0.12, 0.45], 0.034, -0.07, -0.07, 'sepia');
  pn.tube(20, [-0.01, 0.15], [-0.02, 0.3], [-0.02, 0.45], 0.034, 0.07, 0.07, 'sepia');
  pn.ell(8, [-0.14, 0.46, -0.08], [0.045, 0.02, 0.035], 'sepia');
  pn.ell(8, [-0.04, 0.46, 0.06], [0.045, 0.02, 0.035], 'sepia');
  // the tail goes from wrapped round his paws (grumpy) to raised behind him (content)
  const sm = q.smile;
  const tip = [lerp(0.44, 0.4, sm) + 0.07 * fl, lerp(0.02, -0.3, sm) - 0.03 * fl];
  pn.tube(36, [0.2, 0.42], [lerp(0.58, 0.52, sm), lerp(0.5, 0.3, sm)], tip, 0.032, 0.02, 0.1, (f) => (Math.sin(f * 22) > 0.3 ? 'candle' : 'sepia'), 1, 0.35);
  // neck, head, ears, muzzle (head points a little finer so the face reads on top)
  pn.ell(30, [H[0] + 0.07, H[1] + 0.15, 0.01], [0.11, 0.09, 0.1], tabby, 0.9);
  pn.ell(76, [H[0], H[1], 0], [0.16, 0.14, 0.15], (x, y) => tabby(x * 0.16, y * 0.14 + 0.3), 0.8, q.tilt);
  pn.cone(16, hp(-0.09, -0.1), hp(-0.12, -0.23), 0.075, 0.02, 'sepia', 0.85);
  pn.cone(16, hp(0.06, -0.11), hp(0.1 + 0.03 * er, -0.24 + 0.04 * er), 0.075, 0.06, 'sepia', 0.85);
  pn.ell(22, [...hp(-0.09, 0.06), -0.09], [0.065, 0.045, 0.05], 'sepia', 0.8, q.tilt);
  return { glint: [0.0, 0.0, -0.1, 0.4 * sm * (0.85 + 0.15 * Math.sin(age * 5))] };   // a warm glow at his heart (purring)
}

// ---------- Connor: husky lying down, facing left, head up; black-and-white → ice coat, snow face and belly ----------
const CONNOR_REST = { head: [-0.36, -0.1], tilt: -0.08 };
const CONNOR_LOOK = { head: [-0.37, -0.18], tilt: 0.22 };
const CONNOR_KEYS = [[2.4, CONNOR_REST], [3.6, CONNOR_LOOK]];

function connor(pn, age) {
  const q = keyed(CONNOR_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const e = pulse(age, 4.6, 4.9) + pulse(age, 5.1, 5.4);
  const wag = 0.14 * Math.sin(age * 2.2);
  // long body lying flat (white belly), haunch, front legs stretched forward, hind paw
  pn.ell(118, [0.07, 0.02, 0], [0.33, 0.14, 0.16], (x, y) => (y > 0.35 ? 'snow' : 'ice'));
  pn.ell(36, [0.3, 0.08, -0.12], [0.13, 0.1, 0.06], 'ice');
  pn.tube(22, [-0.2, 0.12], [-0.4, 0.17], [-0.6, 0.19], 0.034, -0.08, -0.09, 'snow');
  pn.tube(22, [-0.22, 0.08], [-0.4, 0.12], [-0.58, 0.13], 0.034, 0.08, 0.09, 'snow');
  pn.ell(10, [0.18, 0.17, -0.12], [0.07, 0.025, 0.04], 'snow');
  // big plume tail curled up over his back, swaying (snow tip)
  const B = [0.38, -0.06], T = (dx, dy) => add(B, rot2(dx, dy, wag));
  pn.tube(48, B, T(0.3, -0.12), T(0.05, -0.3), 0.065, 0.06, 0.14, (f) => (f > 0.78 ? 'snow' : 'ice'), 1, 0.35);
  // head (ice crown, white "bald" face), long muzzle, pointy ears, eyes, nose
  const faceDir = [-0.75, 0.25, -0.6];
  pn.ell(80, [H[0], H[1], 0], [0.13, 0.11, 0.12], (x, y, z) => (x * faceDir[0] + y * faceDir[1] + z * faceDir[2] > -0.1 || y > 0.2 ? 'snow' : 'ice'), 1, q.tilt);
  pn.ell(30, [...hp(-0.16, 0.05), -0.05], [0.1, 0.05, 0.055], 'snow', 1, q.tilt + 0.08);
  pn.cone(16, hp(-0.05, -0.08), hp(-0.07 - 0.03 * e, -0.22 + 0.03 * e), 0.065, 0.01, 'ice');
  pn.cone(16, hp(0.06, -0.08), hp(0.08, -0.22), 0.065, 0.08, 'ice');
  return {};
}

// ---------- Alaska: pomsky sitting proud, nose up, unimpressed; blonde → gold coat, cream ruff and tail ----------
const ALASKA_PROUD = { head: [-0.06, -0.3], tilt: 0.25 };
const ALASKA_HMPH = { head: [-0.03, -0.31], tilt: 0.5 };
const ALASKA_KEYS = [[2.6, ALASKA_PROUD], [3.2, ALASKA_HMPH, easeOutBack], [4.6, ALASKA_HMPH], [5.6, ALASKA_PROUD]];

function alaska(pn, age) {
  const q = keyed(ALASKA_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const ef = pulse(age, 6.2, 6.5);
  const wag = 0.22 * Math.sin(age * TAU * 1.6);           // always wagging (a small area of points: no flash)
  // body, fluffy chest ruff, haunch, straight front legs
  pn.ell(88, [0.07, 0.15, 0.02], [0.17, 0.24, 0.15], 'gold');
  pn.ell(48, [-0.08, -0.08, -0.04], [0.13, 0.13, 0.12], 'sepia', 1, 0, 0.45);
  pn.ell(30, [0.14, 0.32, -0.1], [0.11, 0.12, 0.06], 'gold');
  pn.tube(20, [-0.1, 0.12], [-0.11, 0.3], [-0.11, 0.45], 0.034, -0.07, -0.07, 'gold');
  pn.tube(20, [0.0, 0.15], [-0.01, 0.3], [-0.01, 0.45], 0.034, 0.07, 0.07, 'gold');
  // curled plume tail over her back
  const B = [0.2, 0.0], T = (dx, dy) => add(B, rot2(dx, dy, wag));
  pn.tube(50, B, T(0.26, -0.1), T(0.02, -0.24), 0.055, 0.08, 0.14, 'sepia', 1, 0.3);
  // head, short muzzle, small pointy ears
  pn.ell(80, [H[0], H[1], 0], [0.13, 0.12, 0.12], 'gold', 1, q.tilt, 0.2);
  pn.ell(22, [...hp(-0.14, 0.04), -0.05], [0.07, 0.045, 0.05], 'sepia', 1, q.tilt);
  pn.cone(14, hp(-0.05, -0.09), hp(-0.06 - 0.03 * ef, -0.2), 0.058, 0.01, 'gold');
  pn.cone(14, hp(0.05, -0.09), hp(0.07, -0.2), 0.058, 0.07, 'gold');
  return {};
}

// ---------- Gandalf: Russian Blue, big ears, huge green eyes; crouch → wiggle → pounce → land ----------
const G_CROUCH = {
  head: [-0.34, 0.06], tilt: 0.05, S: [-0.2, 0.14], P: [0.16, 0.06], F1: [-0.36, 0.33], F2: [-0.28, 0.33],
  B1: [0.1, 0.33], B2: [0.22, 0.33], TC: [0.42, 0.0], TE: [0.58, 0.16], dy: 0,
};
const G_ANTIC = { ...G_CROUCH, head: [-0.32, 0.12], S: [-0.2, 0.19], P: [0.17, 0.03], F1: [-0.38, 0.33], dy: 0.02 };
const G_LEAP = {
  head: [-0.46, -0.14], tilt: 0.18, S: [-0.26, -0.06], P: [0.14, 0.02], F1: [-0.68, -0.04], F2: [-0.62, 0.05],
  B1: [0.42, 0.26], B2: [0.5, 0.19], TC: [0.4, -0.06], TE: [0.64, -0.13], dy: -0.16,
};
const GANDALF_KEYS = [[2.5, G_CROUCH], [3.0, G_ANTIC], [3.55, G_LEAP, easeOutBack], [3.9, G_LEAP], [4.5, G_CROUCH]];

function gandalf(pn, age) {
  const q = keyed(GANDALF_KEYS, age);
  const wig = clamp((age - 1.2) / 0.8) * (1 - clamp((age - 2.6) / 0.3)) * Math.sin(age * TAU * 2.5) * 0.03;
  const P = [q.P[0] + wig, q.P[1]], S = q.S;
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const fl = 0.06 * Math.sin(age * 3.1) * (age > 4.5 ? 1 : 0.4);
  pn.oy = q.dy;
  // sleek body: a thick tube from shoulders to hips, arched; four legs; tail streaming behind
  const mid = [(S[0] + P[0]) / 2, Math.min(S[1], P[1]) - 0.07];
  pn.tube(104, [S[0] - 0.03, S[1]], mid, [P[0] + 0.03, P[1]], 0.1, 0, 0, 'ice', 1, 0.15);
  const leg = (from, to, kx, ky, z) => pn.tube(18, from, [(from[0] + to[0]) / 2 + kx, (from[1] + to[1]) / 2 + ky], to, 0.028, z, z, 'ice');
  leg([S[0] - 0.02, S[1] + 0.05], q.F1, -0.03, 0, -0.07);
  leg([S[0] + 0.03, S[1] + 0.06], q.F2, -0.03, 0, 0.07);
  leg([P[0] - 0.03, P[1] + 0.05], q.B1, 0.07, -0.03, -0.07);
  leg([P[0] + 0.02, P[1] + 0.05], q.B2, 0.07, -0.03, 0.07);
  const TE = [q.TE[0] + fl * 0.3, q.TE[1] - fl];
  pn.tube(30, [P[0] + 0.08, P[1] - 0.03], q.TC, TE, 0.026, 0.02, 0.1, 'ice', 1, 0.3);
  // head, very big ears, huge eyes, nose, whiskers
  pn.ell(80, [H[0], H[1], 0], [0.12, 0.11, 0.11], 'ice', 1, q.tilt);
  pn.cone(20, hp(-0.06, -0.08), hp(-0.11, -0.25), 0.085, 0.01, 'ice');
  pn.cone(20, hp(0.06, -0.08), hp(0.1, -0.25), 0.085, 0.07, 'ice');
  return {};
}

// ---------- drawing: crisp individual drones ----------
// A drone is a small core in its own colour with a faint halo (no white centre, unlike the sky's glow sprite), so
// overlapping drones don't burn out into a white ball. Drones on the far side are smaller and dimmer: the shape reads
// in depth.
const droneCache = new Map();
function droneSprite(tok) {
  let c = droneCache.get(tok);
  if (c) return c;
  const R = 32;
  c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(R * 2, R * 2) : Object.assign(document.createElement('canvas'), { width: R * 2, height: R * 2 });
  const g = c.getContext('2d'), [r, gg, b] = rgb(tok);
  const lift = (v) => Math.round(v + (255 - v) * 0.35);  // a touch lighter in the core, still clearly coloured
  const grad = g.createRadialGradient(R, R, 0, R, R, R);
  grad.addColorStop(0, `rgba(${lift(r)},${lift(gg)},${lift(b)},1)`);
  grad.addColorStop(0.22, `rgba(${r},${gg},${b},0.85)`);
  grad.addColorStop(0.4, `rgba(${r},${gg},${b},0.12)`);
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grad; g.fillRect(0, 0, R * 2, R * 2);
  droneCache.set(tok, c);
  return c;
}
function renderDrones(ctx, w, h, t, cloud, view, { alpha = 1, color, twinkle = 0.12 } = {}) {
  if (alpha <= 0.002) return;
  const P = projector(w, h, view);
  const base = Math.max(1.6, Math.min(w, h) / 400);       // core ≈ 2.7 px on the 1080-tall wall
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < cloud.n; i++) {
    const [x, y, f] = P(cloud.p[i * 3], cloud.p[i * 3 + 1], cloud.p[i * 3 + 2]);
    if (f <= 0) continue;
    const depth = clamp((f - 0.88) / 0.24);              // 0 far side → 1 near side
    const tw = 1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(t * (1.3 + rand(i) * 1.7) + i));
    // feature drones (eyes, nose, mouth) are only a little bigger, or they swamp the face
    const r = base * (1 + (cloud.s[i] - 1) * 0.35) * (0.75 + 0.35 * depth) * 3.2;
    ctx.globalAlpha = ga * alpha * (0.3 + 0.6 * depth) * tw;
    ctx.drawImage(droneSprite(color(i)), x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = ga;
}

const PETS = { orion, connor, alaska, gandalf };
const state = {};
function petState(id) {
  if (!state[id]) {
    const mk = () => ({ n: CAP, p: new Float32Array(CAP * 3), s: new Float32Array(CAP).fill(1) });
    const st = { live: mk(), src: mk(), mix: mk(), colors: null, n: 0 };
    const pn = pen(st); PETS[id](pn, 0); pn.done();
    st.live.n = st.src.n = st.mix.n = st.n;
    state[id] = st;
  }
  return state[id];
}

/** Default timing (seconds from the figure's start): forms over `form`, flies back into the swarm over `out`. */
export const PET_TIMING = { form: 2.4, out: 2 };

/**
 * Draw one pet drone figure. age: seconds since it starts forming; end: seconds at which it is gone (it flies back
 * over the last PET_TIMING.out). opts: pet ('orion' | 'connor' | 'alaska' | 'gandalf'), x, y (centre, 0..1 of the
 * zone), size (figure units → share of min(w, h)), alpha, source: { cloud, cx, cy, scale } — the constellation swarm
 * and its view, so the figure's drones start out (and end up) in it.
 */
export function petStars(ctx, w, h, t, age, opts = {}) {
  const { pet = 'orion', x = 0.85, y = 0.35, size = 0.25, alpha = 1, end = 10, source } = opts;
  const T = { ...PET_TIMING, ...(opts.timing || {}) };
  if (age < 0 || age > end || alpha <= 0.01 || !PETS[pet]) return;
  const st = petState(pet);
  const pn = pen(st);
  const extra = PETS[pet](pn, age);
  // in from the swarm, back into it before the next ride
  const kin = clamp(age / T.form), kout = clamp((end - age) / T.out), k = Math.min(kin, kout);
  // where each drone sits in the constellation, in this figure's units (rotations ignored: close enough mid-flight)
  if (source?.cloud && k < 1) {
    const m = Math.min(w, h), Sc = m * source.scale, Sp = m * size, N = source.cloud.n;
    for (let i = 0; i < st.n; i++) {
      const j = Math.floor((i * N) / st.n) * 3;
      st.src.p[i * 3] = ((source.cx - x) * w + source.cloud.p[j] * Sc) / Sp;
      st.src.p[i * 3 + 1] = ((source.cy - y) * h + source.cloud.p[j + 1] * Sc) / Sp;
      st.src.p[i * 3 + 2] = source.cloud.p[j + 2] * Sc / Sp;
      st.src.s[i] = 1;
    }
  }
  const cloud = k >= 1 || !source?.cloud ? st.live : morphClouds(st.src, st.live, k, { stagger: 0.45, lift: 0.4, seed: 29, out: st.mix });
  // The camera swings round a little while the figure forms (shows its depth), then sways gently.
  const swing = 1 - easeInOutSine(kin);
  const view = { cx: x, cy: y, scale: size, dist: 3, rotY: 0.28 * Math.sin(t * 0.35) - 0.7 * swing, rotX: 0.06 + 0.2 * swing };
  const A = alpha * (source?.cloud ? clamp(k * 3) : k) * (0.4 + 0.6 * kout);
  const C = st.colors;
  const color = k >= 1 ? (i) => C[i] : (i) => (rand(i * 1.7) < k * 1.15 ? C[i] : 'snow');
  renderDrones(ctx, w, h, t, cloud, view, { alpha: A, color });
  if (extra.glint && extra.glint[3] > 0.01 && k >= 1) {
    const [gx, gy, f] = projector(w, h, view)(extra.glint[0], extra.glint[1], extra.glint[2]);
    additive(ctx, A * extra.glint[3], () => dot(ctx, glowSprite('candle', 0.25), gx, gy, Math.min(w, h) * size * 0.15 * f));
  }
}
