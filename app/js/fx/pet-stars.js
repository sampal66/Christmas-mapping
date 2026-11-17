// s06 (WP-11b): the pets as star figures. TREATMENT §04 has "pets as constellations (line-art)" in s06, and §03 says
// Orion the cat smiles when his constellation forms. During each calm pause a small drone swarm peels off the
// constellation and re-forms beside it as a pet drawn in light lines (constellation line-art, drone-show style like
// fx/mickey-stars.js), makes one small move, then flies back into the swarm before the next ride.
//   Orion (tabby)  sitting, grumpy → looks up at his constellation → slow lopsided smile (one lip lifted)
//   Connor (husky) lying down, lifts his head to look up, plume tail sways
//   Alaska (pomsky) sitting proud, nose up, unimpressed: half-lidded eyes, an eye-roll and a "hmph", tail always wagging
//   Gandalf (Russian Blue) crouches, wiggles, pounces towards the constellation, lands
//
// Same tech as Mickey: keyframed poses are blended over time, and each stroke keeps a fixed number of points, so the
// swarm keeps its identity as the pose changes and can morph in from (and back into) the constellation.
// Colours follow DESIGN_SYSTEM §05 with lifted darks (cream rims, no dark fills). Time-based only.
import { TAU, rand, clamp, lerp, easeInOutSine, easeOutBack, glowSprite, dot, additive } from './util.js';
import { renderCloud, morphClouds, projector } from './points3d.js';

// ---------- pose + stroke helpers ----------
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
/** Ellipse (or arc) as a polyline. */
const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, steps = 24) =>
  Array.from({ length: steps + 1 }, (_, i) => { const a = lerp(a0, a1, i / steps); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
/** Cubic Bézier as a polyline. */
const bz = (a, b, c, d, steps = 16) => Array.from({ length: steps + 1 }, (_, i) => {
  const t = i / steps, u = 1 - t;
  return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
});
/** A gentle pulse 0 → 1 → 0 between a and b (for blinks, twitches). */
const pulse = (age, a, b) => (age > a && age < b ? Math.sin(Math.PI * (age - a) / (b - a)) : 0);

const CAP = 400;
/**
 * The pen writes a figure's points into its cloud, stroke by stroke. Every stroke has a fixed point count, so a
 * figure always has the same number of points in the same order; colours and the count are recorded on the first
 * build. line(): points evenly spaced along a polyline (by arc length); z may be a number or [zStart, zEnd].
 */
function pen(st) {
  const P = st.live.p, S = st.live.s, rec = !st.colors, cols = rec ? [] : null;
  let k = 0;
  const api = {};
  const put = (x, y, z, c, s) => {
    if (k >= CAP) return;
    P[k * 3] = x; P[k * 3 + 1] = y + api.oy; P[k * 3 + 2] = z; S[k] = s;
    if (rec) cols.push(c);
    k++;
  };
  return Object.assign(api, {
    oy: 0,                                                 // whole-figure lift (Gandalf's leap)
    line(n, pts, z, c, s = 1) {
      const L = [0];
      for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const tot = L.at(-1) || 1;
      let seg = 0;
      for (let i = 0; i < n; i++) {
        const f = n === 1 ? 0.5 : i / (n - 1), d = f * tot;
        while (seg < pts.length - 2 && L[seg + 1] < d) seg++;
        const g = clamp((d - L[seg]) / ((L[seg + 1] - L[seg]) || 1));
        const a = pts[seg], b = pts[Math.min(seg + 1, pts.length - 1)];
        put(lerp(a[0], b[0], g), lerp(a[1], b[1], g), Array.isArray(z) ? lerp(z[0], z[1], f) : z, c, s);
      }
    },
    star(p, z, c, s = 2.2) { put(p[0], p[1], z, c, s); },
    done() { if (rec) { st.colors = cols; st.n = k; } },
  });
}

// ---------- Orion: sitting tabby, ¾ view facing left (towards his constellation) ----------
// Outline cream (sepia), stripes caramel (candle), eyes yellow-green → gold, nose and the lifted lip warm.
const ORION_GRUMPY = { head: [-0.1, -0.27], tilt: 0, lid: 1, smile: 0 };
const ORION_LOOK = { head: [-0.11, -0.28], tilt: 0.22, lid: 0.7, smile: 0 };
const ORION_SMILE = { head: [-0.11, -0.28], tilt: 0.16, lid: 0.15, smile: 1 };
const ORION_KEYS = [[2.2, ORION_GRUMPY], [3.8, ORION_LOOK], [7, ORION_SMILE]];

function orion(pn, age) {
  const q = keyed(ORION_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const O = 'sepia', ST = 'candle';
  const blink = 1 - 0.9 * (pulse(age, 3, 3.45) + pulse(age, 8.2, 8.65));
  const er = pulse(age, 5.2, 5.5) + pulse(age, 5.6, 5.9);  // a double ear twitch
  const fl = Math.sin(age * 1.9) * 0.5 + 0.5 * Math.sin(age * 4.3) * pulse((age % 4.2), 0, 1.2); // lazy tail flicks
  // head, ears, forehead "M"
  pn.line(30, ell(0, 0, 0.17, 0.15, 0, TAU, 28).map(([x, y]) => hp(x, y)), 0, O);
  pn.line(9, [hp(-0.15, -0.06), hp(-0.14, -0.27), hp(-0.04, -0.13)], 0.02, O);
  pn.line(9, [hp(0.03, -0.14), hp(0.12 + 0.03 * er, -0.26 + 0.04 * er), hp(0.15, -0.05)], 0.04, O);
  pn.line(5, [hp(-0.06, -0.1), hp(-0.04, -0.06), hp(-0.02, -0.1), hp(0, -0.06), hp(0.02, -0.1)], -0.02, ST, 0.8);
  // eyes: half-lidded and grumpy (lids slant down towards the nose); they soften as he smiles
  for (const [ex, inner] of [[-0.085, 1], [0.035, -1]]) {
    const open = (0.35 + 0.65 * (1 - 0.6 * q.lid)) * blink;
    pn.line(3, [hp(ex, -0.012 - 0.024 * open), hp(ex, -0.012 + 0.024 * open)], -0.03, 'gold', 1.7);
    const slant = 0.025 * q.lid, lift = 0.012 * (1 - q.lid);
    pn.line(4, [hp(ex - 0.035, -0.042 - slant * inner - lift), hp(ex + 0.035, -0.042 + slant * inner - lift)], -0.03, O, 0.8);
  }
  // nose, mouth: flat and turned down while grumpy; one lip lifts on the right (his missing-tooth smile)
  const s = q.smile;
  pn.star(hp(-0.03, 0.05), -0.04, 'rose', 1.6);
  pn.line(9, [hp(-0.1, 0.115 + 0.012 * (1 - s)), hp(-0.03, 0.095), hp(0.02, 0.11 - 0.03 * s), hp(0.05 + 0.01 * s, 0.12 - 0.065 * s)], -0.04, 'candle', 1.1);
  // whiskers (they perk up with the smile)
  for (const [a, b] of [[[-0.11, 0.07], [-0.33, 0.03 - 0.03 * s]], [[-0.11, 0.08], [-0.32, 0.11 - 0.02 * s]], [[0.05, 0.07], [0.24, 0.02 - 0.03 * s]], [[0.05, 0.08], [0.24, 0.1 - 0.02 * s]]]) {
    pn.line(4, [hp(...a), hp(...b)], -0.05, 'snow', 0.6);
  }
  // body: back down to the haunch, chest to the front paws, legs, the floor line
  pn.line(28, bz([H[0] + 0.12, H[1] + 0.1], [0.3, -0.05], [0.36, 0.36], [0.18, 0.46]), 0.02, O);
  pn.line(16, bz([H[0] - 0.1, H[1] + 0.14], [-0.26, -0.02], [-0.22, 0.2], [-0.18, 0.45]), -0.02, O);
  pn.line(9, [[-0.14, 0.12], [-0.14, 0.46]], -0.07, O);
  pn.line(9, [[-0.04, 0.15], [-0.04, 0.46]], 0.05, O);
  pn.line(12, [[-0.23, 0.47], [0.2, 0.47]], 0, O, 0.8);
  pn.line(12, ell(0.15, 0.3, 0.14, 0.16, -1.7, 1.2, 12), -0.07, O);
  // stripes on his back
  for (const st of [[[0.11, -0.07], [0.19, -0.02]], [[0.22, 0.07], [0.3, 0.1]], [[0.25, 0.21], [0.33, 0.22]]]) pn.line(4, st, 0.02, ST, 0.9);
  // tail curling round the front, the tip flicking
  const tip = [0.44 + 0.07 * fl, 0.02 - 0.03 * fl];
  pn.line(18, bz([0.18, 0.46], [0.5, 0.5], [0.58, 0.2], tip), [0, 0.12], O);
  pn.star(tip, 0.12, ST, 1.5);
  // the smile's glint, on the lifted lip
  return { glint: [...hp(0.06, 0.05), -0.04, pulse(age, 5.6, 7.6)] };
}

// ---------- Connor: husky lying down, facing left, head up; black-and-white → ice outline, snow face ----------
const CONNOR_REST = { head: [-0.36, -0.1], tilt: -0.08 };
const CONNOR_LOOK = { head: [-0.37, -0.18], tilt: 0.22 };
const CONNOR_KEYS = [[2.4, CONNOR_REST], [3.6, CONNOR_LOOK]];

function connor(pn, age) {
  const q = keyed(CONNOR_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const O = 'ice', W = 'snow';
  const e = pulse(age, 4.6, 4.9) + pulse(age, 5.1, 5.4);
  const blink = 1 - 0.9 * pulse(age, 5.8, 6.25);
  const wag = 0.14 * Math.sin(age * 2.2);                  // slow, gentle sway
  pn.line(24, ell(0, 0, 0.13, 0.11, 0, TAU, 22).map(([x, y]) => hp(x, y)), 0, O);
  pn.line(12, [hp(-0.1, -0.01), hp(-0.26, 0.03), hp(-0.25, 0.085), hp(-0.08, 0.09)], -0.02, W);
  pn.star(hp(-0.26, 0.03), -0.03, O, 1.6);
  pn.line(9, [hp(-0.08, -0.07), hp(-0.07 - 0.03 * e, -0.27 + 0.03 * e), hp(0, -0.1)], 0.01, O);
  pn.line(9, [hp(0.03, -0.1), hp(0.09, -0.27), hp(0.12, -0.05)], 0.04, O);
  pn.line(6, [hp(-0.12, -0.05), hp(-0.05, -0.02), hp(0.02, -0.07)], -0.02, W, 0.8);    // the mask's brow
  pn.line(3, [hp(-0.065, -0.025 - 0.018 * blink), hp(-0.065, -0.025 + 0.018 * blink)], -0.03, O, 1.9);
  pn.line(3, [hp(0.03, -0.03 - 0.015 * blink), hp(0.03, -0.03 + 0.015 * blink)], 0.02, O, 1.5);
  // back, rump, hind leg, belly, chest
  pn.line(26, bz([H[0] + 0.1, H[1] - 0.02], [-0.1, -0.22], [0.2, -0.16], [0.44, -0.06]), 0.02, O);
  pn.line(10, bz([0.44, -0.06], [0.57, 0], [0.55, 0.18], [0.42, 0.2]), 0.02, O);
  pn.line(12, ell(0.3, 0.1, 0.13, 0.09, Math.PI * 1.05, Math.PI * 2.1, 12), -0.07, O);
  pn.line(6, [[0.3, 0.19], [0.1, 0.2]], -0.07, O);
  pn.line(12, [[0.1, 0.2], [-0.2, 0.2]], 0, O, 0.9);
  pn.line(10, bz([H[0] + 0.02, H[1] + 0.1], [-0.37, 0.05], [-0.31, 0.17], [-0.24, 0.2]), -0.03, W);
  // front legs stretched out in front
  pn.line(12, [[-0.22, 0.2], [-0.6, 0.21]], -0.08, O);
  pn.line(12, [[-0.27, 0.13], [-0.58, 0.14]], 0.08, O);
  // big plume tail curled up over his back, swaying
  const B = [0.46, -0.05], T = (dx, dy) => add(B, rot2(dx, dy, wag));
  pn.line(18, bz(B, T(0.24, -0.06), T(0.24, -0.34), T(-0.02, -0.26)), [0.05, 0.15], O);
  pn.line(12, bz(T(0, 0.02), T(0.17, -0.03), T(0.17, -0.25), T(0.01, -0.21)), [0.06, 0.14], W, 0.9);
  pn.star(T(-0.02, -0.26), 0.15, W, 1.5);
  return {};
}

// ---------- Alaska: pomsky sitting proud, nose up, unimpressed; blonde → gold outline, cream ruff ----------
const ALASKA_PROUD = { head: [-0.06, -0.3], tilt: 0.25, roll: 0 };
const ALASKA_HMPH = { head: [-0.04, -0.31], tilt: 0.45, roll: 1 };
const ALASKA_KEYS = [[2.6, ALASKA_PROUD], [3.2, ALASKA_HMPH, easeOutBack], [4.6, ALASKA_HMPH], [5.6, ALASKA_PROUD]];

function alaska(pn, age) {
  const q = keyed(ALASKA_KEYS, age);
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const O = 'gold', R = 'sepia';
  const ef = pulse(age, 6.2, 6.5);
  const wag = 0.22 * Math.sin(age * TAU * 1.6);           // always wagging (a small area of points: no flash)
  pn.line(24, ell(0, 0, 0.13, 0.12, 0, TAU, 22).map(([x, y]) => hp(x, y)), 0, O);
  pn.line(10, [hp(-0.1, 0), hp(-0.2, 0.02), hp(-0.19, 0.07), hp(-0.08, 0.08)], -0.02, O);
  pn.star(hp(-0.2, 0.02), -0.03, 'candle', 1.6);
  pn.line(8, [hp(-0.07, -0.08), hp(-0.06 - 0.03 * ef, -0.22), hp(0, -0.1)], 0.01, O);
  pn.line(8, [hp(0.03, -0.1), hp(0.08, -0.22), hp(0.11, -0.06)], 0.04, O);
  // half-lidded eyes under flat lids (unimpressed); during the "hmph" the eyes roll up
  for (const [ex, s] of [[-0.06, 1.8], [0.03, 1.4]]) {
    pn.star(hp(ex - 0.008 * q.roll, -0.012 - 0.022 * q.roll), -0.03, 'candle', s);
    pn.line(4, [hp(ex - 0.035, -0.03), hp(ex + 0.035, -0.03)], -0.03, O, 0.8);
  }
  // fluffy chest ruff (zigzag), back, legs, floor line, haunch
  const A = [H[0] - 0.1, H[1] + 0.12], Bp = [-0.17, 0.13];
  pn.line(22, Array.from({ length: 9 }, (_, i) => {
    const f = i / 8, z = i % 2 ? -0.04 : 0;
    return [lerp(A[0], Bp[0], f) + z, lerp(A[1], Bp[1], f)];
  }), -0.03, R, 0.9);
  pn.line(22, bz([H[0] + 0.1, H[1] + 0.08], [0.22, -0.1], [0.3, 0.25], [0.18, 0.45]), 0.02, O);
  pn.line(9, [[-0.13, 0.14], [-0.13, 0.45]], -0.07, O);
  pn.line(9, [[-0.03, 0.16], [-0.03, 0.45]], 0.05, O);
  pn.line(12, [[-0.19, 0.46], [0.2, 0.46]], 0, O, 0.8);
  pn.line(10, ell(0.13, 0.3, 0.12, 0.14, -1.6, 1.3, 10), -0.07, O);
  // curled plume tail over her back
  const B = [0.22, 0.04], T = (dx, dy) => add(B, rot2(dx, dy, wag));
  pn.line(16, bz(B, T(0.2, -0.04), T(0.2, -0.26), T(0.0, -0.22)), [0.05, 0.12], R);
  pn.line(10, bz(T(0.0, -0.02), T(0.12, -0.05), T(0.12, -0.19), T(0.02, -0.17)), [0.06, 0.11], O, 0.8);
  pn.star(T(0.0, -0.22), 0.12, R, 1.4);
  return {};
}

// ---------- Gandalf: Russian Blue, big ears, huge eyes; crouch → wiggle → pounce → land ----------
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
  // the butt wiggle before the pounce
  const wig = clamp((age - 1.2) / 0.8) * (1 - clamp((age - 2.6) / 0.3)) * Math.sin(age * TAU * 2.5) * 0.03;
  const P = [q.P[0] + wig, q.P[1]], S = q.S;
  pn.oy = q.dy;
  const H = q.head, hp = (x, y) => add(H, rot2(x, y, q.tilt));
  const O = 'ice', E = 'pine';
  const blink = 1 - 0.9 * pulse(age, 6, 6.4);
  const fl = 0.06 * Math.sin(age * 3.1) * (age > 4.5 ? 1 : 0.4);
  // head, huge ears, huge eyes, nose, whiskers
  pn.line(22, ell(0, 0, 0.12, 0.11, 0, TAU, 20).map(([x, y]) => hp(x, y)), 0, O);
  pn.line(9, [hp(-0.1, -0.05), hp(-0.12, -0.27), hp(-0.02, -0.1)], 0.01, O);
  pn.line(9, [hp(0.02, -0.1), hp(0.1, -0.27), hp(0.12, -0.04)], 0.04, O);
  for (const ex of [-0.05, 0.04]) {
    pn.line(7, ell(ex, -0.005, 0.03, 0.036 * blink, 0, TAU, 10).map(([x, y]) => hp(x, y)), -0.03, E, 1.1);
    pn.star(hp(ex - 0.006, -0.005), -0.035, E, 1.8);
  }
  pn.star(hp(-0.11, 0.045), -0.04, 'rose', 1.4);
  pn.line(3, [hp(-0.11, 0.06), hp(-0.27, 0.03)], -0.05, 'snow', 0.6);
  pn.line(3, [hp(-0.11, 0.07), hp(-0.26, 0.1)], -0.05, 'snow', 0.6);
  // neck, back, belly
  pn.line(5, [hp(0.07, 0.06), [S[0] + 0.02, S[1] - 0.06]], 0, O);
  pn.line(5, [hp(-0.05, 0.1), [S[0] - 0.03, S[1] + 0.04]], -0.02, O);
  pn.line(24, bz([S[0] + 0.02, S[1] - 0.06], [S[0] + 0.15, S[1] - 0.14], [P[0] - 0.12, P[1] - 0.12], [P[0] + 0.04, P[1] - 0.05]), 0.02, O);
  pn.line(18, bz([S[0], S[1] + 0.06], [S[0] + 0.12, S[1] + 0.1], [P[0] - 0.1, P[1] + 0.1], [P[0], P[1] + 0.07]), 0, O, 0.9);
  // legs (front knees forward, hind knees back), paw stars
  const leg = (from, to, kx, ky, z) => pn.line(10, [from, [(from[0] + to[0]) / 2 + kx, (from[1] + to[1]) / 2 + ky], to], z, O);
  leg([S[0] - 0.02, S[1] + 0.04], q.F1, -0.03, 0, -0.07);
  leg([S[0] + 0.03, S[1] + 0.05], q.F2, -0.03, 0, 0.07);
  leg([P[0] - 0.03, P[1] + 0.05], q.B1, 0.07, -0.03, -0.07);
  leg([P[0] + 0.02, P[1] + 0.04], q.B2, 0.07, -0.03, 0.07);
  pn.star(q.F1, -0.07, 'snow', 1.3);
  pn.star(q.F2, 0.07, 'snow', 1.3);
  // tail streaming behind, flicking
  const TE = [q.TE[0] + fl * 0.3, q.TE[1] - fl];
  pn.line(18, bz([P[0] + 0.04, P[1] - 0.03], q.TC, [TE[0] - 0.05, TE[1]], TE), [0.02, 0.12], O);
  pn.star(TE, 0.12, O, 1.4);
  return {};
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
 * Draw one pet star figure. age: seconds since it starts forming; end: seconds at which it is gone (it flies back
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
  renderCloud(ctx, w, h, t, cloud, { ...view, alpha: A, color, twinkle: 0.1 });
  if (extra.glint && extra.glint[3] > 0.01 && k >= 1) {
    const [gx, gy, f] = projector(w, h, view)(extra.glint[0], extra.glint[1], extra.glint[2]);
    additive(ctx, A * extra.glint[3], () => dot(ctx, glowSprite('gold', 0.25), gx, gy, Math.min(w, h) * size * 0.12 * f));
  }
}
