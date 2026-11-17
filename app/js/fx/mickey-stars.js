// s05 (WP-11): Mickey drawn in stars. As Mickey whistles the clue, his old-film frame dissolves into a swarm of star
// points that forms the **1928 Steamboat Willie Mickey** (public domain design only: round black ears, pie-cut eyes,
// long snout, bare hands with no gloves, shorts with two buttons, rubber-hose limbs, a thin tail) as a moving
// constellation, drone-show style like s06. He bobs to the whistle, then raises his arm and points up; the
// pointing hand's star trails a line up into the sky (the lead-in to s06). Built as a reusable piece WP-08 places.
//
// The figure is a few keyframed poses of named joints, blended over time; every part (circles, ellipses, hose
// curves) is re-sampled into a fixed number of points each frame, so the point swarm can morph in and keep its
// identity while the pose changes. Time-based only (`age` = seconds since the piece starts).
import { rgba } from '../palette.js';
import { TAU, rand, clamp, lerp, easeInOutSine, easeOutBack, glowSprite, dot, additive, glowStroke } from './util.js';
import { renderCloud, morphClouds, projector } from './points3d.js';
import { drawStar } from './stars.js';

// ---------- poses (figure units, y down; ≈ 2.2 units from ear tops to shoe soles; he faces right, ¾ view) ----------
// Joints: head centre + tilt, both elbows and hands, both feet, and the finger (only shown when pointing).
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

/** The pose at `age` (seconds into the piece), with the whistle bob layered on top. */
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

// ---------- parts: each samples a fixed number of points ----------
const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
/** A point on the head, from an offset in head space (rotates with the head tilt). */
const onHead = (p, off) => add(p.head, rot(off, p.tilt));
const quad = (a, c, b, f) => [(1 - f) ** 2 * a[0] + 2 * (1 - f) * f * c[0] + f * f * b[0], (1 - f) ** 2 * a[1] + 2 * (1 - f) * f * c[1] + f * f * b[1]];
function ellipse(out, n, c, rx, ry, a = 0, from = 0, to = TAU) {
  for (let i = 0; i < n; i++) {
    const t = from + ((to - from) * (i + 0.5)) / n;
    out.push(add(c, rot([Math.cos(t) * rx, Math.sin(t) * ry], a)));
  }
}
function line(out, n, a, b) { for (let i = 0; i < n; i++) { const f = (i + 0.5) / n; out.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); } }
function hose(out, n, a, c, b) { for (let i = 0; i < n; i++) out.push(quad(a, c, b, (i + 0.5) / n)); }
/** A pie-cut eye: a tall oval with a wedge cut out of it (the 1928 look), the wedge's two edges drawn in. */
function pieEye(out, n, c, rx, ry, a, cut) {
  const gap = 0.9;
  ellipse(out, n - 4, c, rx, ry, a, cut + gap / 2, cut + TAU - gap / 2);
  const e1 = add(c, rot([Math.cos(cut - gap / 2) * rx, Math.sin(cut - gap / 2) * ry], a));
  const e2 = add(c, rot([Math.cos(cut + gap / 2) * rx, Math.sin(cut + gap / 2) * ry], a));
  const m = add(c, rot([rx * 0.1, ry * 0.15], a));
  line(out, 2, e1, m); line(out, 2, m, e2);
}

/** Every part of the figure for a pose: { pts: [[x, y]...], z: [...], anchors: [[x, y, mag, cls]...], hand, mouth }. */
function figure(p) {
  const pts = [], z = [];
  const part = (fn, depth) => { const s = pts.length; fn(pts); for (let i = s; i < pts.length; i++) z.push(depth); };
  const earL = onHead(p, [-0.24, -0.3]), earR = onHead(p, [0.2, -0.33]);
  part((o) => ellipse(o, 26, earL, 0.155, 0.155), 0.06);
  part((o) => ellipse(o, 26, earR, 0.155, 0.155), -0.04);
  // head: a circle, open where the snout joins on the right
  part((o) => ellipse(o, 40, p.head, 0.29, 0.28, p.tilt, 0.55, TAU - 0.35), 0);
  // snout: a long rounded muzzle to the right, the nose at its tip
  const snoutC = onHead(p, [0.3, 0.1]);
  part((o) => ellipse(o, 24, snoutC, 0.2, 0.11, p.tilt + 0.12, -2.5, 2.3), -0.08);
  const nose = onHead(p, [0.5, 0.04]);
  part((o) => ellipse(o, 8, nose, 0.055, 0.045, p.tilt), -0.12);
  // whistling mouth: a small puckered ring under the nose (fades into a smile line when he points)
  const mouth = onHead(p, [0.38, 0.17]);
  part((o) => (p.finger < 0.5 ? ellipse(o, 6, mouth, 0.03, 0.03) : hose(o, 6, onHead(p, [0.22, 0.14]), onHead(p, [0.32, 0.22]), onHead(p, [0.42, 0.13]))), -0.1);
  part((o) => pieEye(o, 14, onHead(p, [0.04, -0.06]), 0.045, 0.085, p.tilt, 0.6), -0.06);
  part((o) => pieEye(o, 14, onHead(p, [0.17, -0.07]), 0.042, 0.082, p.tilt, 0.6), -0.07);
  // body: a pear-shaped torso, shorts with two buttons
  const neck = add(p.head, [-0.02, 0.27]);
  part((o) => { hose(o, 12, neck, [-0.26, -0.05], [-0.18, 0.3]); hose(o, 12, neck, [0.26, -0.05], [0.18, 0.3]); }, 0);
  part((o) => { line(o, 10, [-0.2, 0.14], [0.2, 0.14]); hose(o, 10, [-0.2, 0.14], [-0.26, 0.3], [-0.16, 0.38]); hose(o, 10, [0.2, 0.14], [0.26, 0.3], [0.16, 0.38]); line(o, 8, [-0.16, 0.38], [0.16, 0.38]); }, -0.02);
  // rubber-hose arms with bare round hands (no gloves in 1928)
  const shL = [-0.15, -0.06], shR = [0.15, -0.06];
  part((o) => hose(o, 18, shL, p.elbowL, p.handL), 0.12);
  part((o) => ellipse(o, 9, p.handL, 0.06, 0.06), 0.12);
  part((o) => hose(o, 18, shR, p.elbowR, p.handR), -0.12);
  part((o) => ellipse(o, 9, p.handR, 0.06, 0.06), -0.12);
  const fingerTip = add(p.handR, [0.03 * p.finger, -0.16 * p.finger]);
  part((o) => line(o, 5, p.handR, fingerTip), -0.13);
  // hose legs and big oval shoes
  const hipL = [-0.09, 0.38], hipR = [0.09, 0.38];
  part((o) => hose(o, 16, hipL, [-0.2, 0.6], p.footL), 0.05);
  part((o) => hose(o, 16, hipR, [0.2, 0.6], p.footR), -0.05);
  const shoeL = add(p.footL, [-0.06, 0.06]), shoeR = add(p.footR, [0.09, 0.06]);
  part((o) => ellipse(o, 16, shoeL, 0.16, 0.075, -0.08), 0.05);
  part((o) => ellipse(o, 16, shoeR, 0.17, 0.075, 0.06), -0.05);
  // a thin tail, curling up behind
  const tailTip = [-0.62, 0.12];
  part((o) => hose(o, 14, [-0.18, 0.32], [-0.6, 0.56], tailTip), 0.1);
  const anchors = [
    [...earL, 0.75, 'A'], [...earR, 0.75, 'A'], [...nose, 0.85, 'F'], [...p.handL, 0.6, 'B'], [...fingerTip, 0.6 + 0.4 * p.finger, 'G'],
    [...shoeL, 0.6, 'B'], [...shoeR, 0.6, 'B'], [-0.06, 0.24, 0.5, 'A'], [0.08, 0.24, 0.5, 'A'], [...tailTip, 0.45, 'K'],
  ];
  return { pts, z, anchors, hand: fingerTip, mouth };
}

// ---------- the piece ----------
const N = figure(WHISTLE).pts.length;
const live = { n: N, p: new Float32Array(N * 3), s: new Float32Array(N).fill(0.55) };
let frameCloud = null;
function frameCloudOf(aspect) {
  if (frameCloud?.aspect === aspect) return frameCloud.c;
  // the old-film frame's border as points (the shape the swarm starts from)
  const c = { n: N, p: new Float32Array(N * 3), s: new Float32Array(N).fill(0.6) };
  const hw = 0.95 * aspect, hh = 0.95;
  for (let i = 0; i < N; i++) {
    const f = (i + rand(i) * 0.5) / N, per = 4 * (hw + hh), d = f * per * 2;
    const L = d % per;
    let x, y;
    if (L < 2 * hw) [x, y] = [-hw + L, -hh];
    else if (L < 2 * hw + 2 * hh) [x, y] = [hw, -hh + (L - 2 * hw)];
    else if (L < 4 * hw + 2 * hh) [x, y] = [hw - (L - 2 * hw - 2 * hh), hh];
    else [x, y] = [-hw, hh - (L - 4 * hw - 2 * hh)];
    c.p.set([x, y, (rand(i + 0.3) - 0.5) * 0.2], i * 3);
  }
  frameCloud = { aspect, c };
  return c;
}

/** Default timing (seconds from `mickey-in`); the s05 whistle sfx is ≈ 8 s long from the cue. */
export const MICKEY_TIMING = { frame: 0, dissolve: 1.6, form: 4.2, anticipate: 7.6, point: 8.4, trail: 9.0, fade: 12.5, end: 15 };

/**
 * Draw the star Mickey. age: seconds since `mickey-in`. opts: x, y (centre on the zone, 0..1), size (figure
 * half-height as a share of h), alpha, timing (override MICKEY_TIMING), film (draw the old-film frame stand-in:
 * WP-08 sets false once Mickey's clip plays in the frame).
 */
export function mickeyStars(ctx, w, h, t, age, opts = {}) {
  const T = { ...MICKEY_TIMING, ...(opts.timing || {}) };
  const { x = 0.5, y = 0.6, size = 0.2, alpha = 1, film = true } = opts;
  if (age < 0 || age > T.end || alpha <= 0.01) return;
  const out = 1 - easeInOutSine(clamp((age - T.fade) / (T.end - T.fade)));
  const A = alpha * out;
  const scale = size;                                      // renderCloud scale: share of min(w, h) per unit
  const S = Math.min(w, h) * scale;
  const view = { cx: x, cy: y, scale, rotY: 0.22 * Math.sin(age * 0.45), rotX: 0.05, dist: 4 };
  const aspect = 0.8;

  // 1. the old-film frame (sepia, static vignette, no flicker: DESIGN_SYSTEM §05), dissolving as he whistles
  const frameA = film ? clamp(age / 0.6) * (1 - easeInOutSine(clamp((age - T.dissolve) / 1.2))) : 0;
  if (frameA > 0.01) {
    const fw = S * 0.95 * aspect * 2, fh = S * 0.95 * 2;
    const fx = x * w - fw / 2, fy = y * h - fh / 2;
    ctx.save();
    ctx.globalAlpha *= A * frameA;
    const g = ctx.createRadialGradient(x * w, y * h, fh * 0.1, x * w, y * h, fh * 0.7);
    g.addColorStop(0, rgba('sepia', 0.32)); g.addColorStop(1, rgba('sepia', 0.04));
    ctx.fillStyle = g; ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = rgba('sepia', 0.18); ctx.lineWidth = 2;   // static scratches
    for (let i = 0; i < 5; i++) { const sx = fx + fw * rand(i + 4.2); ctx.beginPath(); ctx.moveTo(sx, fy + fh * 0.05); ctx.lineTo(sx + fw * 0.02, fy + fh * (0.4 + rand(i) * 0.5)); ctx.stroke(); }
    ctx.beginPath(); ctx.rect(fx, fy, fw, fh);
    glowStroke(ctx, 'sepia', Math.max(4, S * 0.025));
    ctx.restore();
  }

  // 2. the swarm: frame border → figure, then the live pose
  const pose = poseAt(age, T);
  const fig = figure(pose);
  for (let i = 0; i < N; i++) live.p.set([fig.pts[i][0], fig.pts[i][1], fig.z[i]], i * 3);
  const k = clamp((age - T.dissolve) / (T.form - T.dissolve));
  if (k <= 0) return;
  const cloud = k >= 1 ? live : morphClouds(frameCloudOf(aspect), live, k, { stagger: 0.45, lift: 0.4, seed: 23 });
  const colorOf = (i) => (i % 7 === 0 ? 'gold' : i % 3 === 0 ? 'ice' : 'snow');
  renderCloud(ctx, w, h, t, cloud, { ...view, size: 1.3, alpha: A * clamp(k * 3), color: colorOf, twinkle: 0.18 });

  // 3. the named stars on the joints (realistic stars, s06 style), once the figure has formed
  const P = projector(w, h, view);
  const starA = A * clamp((age - T.form + 0.6) / 1.2);
  if (starA > 0.01) {
    const unit = Math.min(w, h) / 1080;
    const ga = ctx.globalAlpha, op = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    fig.anchors.forEach(([ax, ay, mag, cls], i) => {
      const [px, py] = P(ax, ay, 0);
      drawStar(ctx, px, py, t, { mag, cls, seed: 40 + i, twinkle: 0.2, unit: unit * scale / 0.2, alpha: starA });
    });
    ctx.globalAlpha = ga; ctx.globalCompositeOperation = op;
  }

  // 4. whistled notes floating up from his mouth while he whistles
  const noteA = A * clamp((age - T.form + 0.8) / 0.8) * (1 - clamp((age - T.anticipate) / 0.6));
  if (noteA > 0.01) {
    const [mx, my] = P(fig.mouth[0], fig.mouth[1], -0.1);
    additive(ctx, noteA, () => {
      for (let j = 0; j < 4; j++) {
        const a = (age * 0.9 + j * 0.25) % 1;                // each note rises and fades over ≈ 1.1 s
        const nx = mx + S * (0.15 + 0.5 * a) + Math.sin(a * 6 + j) * S * 0.05, ny = my - S * 0.7 * a;
        noteGlyph(ctx, nx, ny, S * 0.16, Math.sin(a * Math.PI) * noteA, j % 2);
      }
    });
  }

  // 5. pointing: the fingertip star trails a line of light up into the sky (the lead-in to s06)
  const tr = clamp((age - T.trail) / 2.2);
  if (tr > 0) {
    const [hx, hy] = P(fig.hand[0], fig.hand[1], -0.13);
    const top = -0.02 * h;
    const ey = hy + (top - hy) * easeInOutSine(tr);
    const ex = hx + (w * 0.04) * easeInOutSine(tr);
    additive(ctx, A, () => {
      const g = ctx.createLinearGradient(hx, hy, ex, ey);
      g.addColorStop(0, rgba('gold', 0.9)); g.addColorStop(1, rgba('snow', 0.5));
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey);
      ctx.lineCap = 'round'; ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(6, S * 0.03) * 2.6; ctx.globalAlpha *= 0.25; ctx.stroke();
      ctx.lineWidth = Math.max(4, S * 0.016); ctx.globalAlpha *= 3.2; ctx.stroke();
      dot(ctx, glowSprite('gold', 0.3), ex, ey, S * 0.12 * (1 - 0.5 * tr));
      const sp = glowSprite('snow', 0.3);
      for (let j = 0; j < 8; j++) {
        const f = clamp(tr - j * 0.04);
        dot(ctx, sp, hx + (ex - hx) * f + Math.sin(j * 2.3 + age * 3) * S * 0.04, hy + (ey - hy) * f, S * 0.025);
      }
    });
  }
}

/** A musical note drawn in light: an oval head, a stem and (for `flag`) a little flag. */
function noteGlyph(ctx, x, y, s, a, flag) {
  if (a <= 0.01) return;
  const sp = glowSprite('gold', 0.3);
  ctx.globalAlpha *= a;
  for (let i = 0; i < 5; i++) { const ang = (i / 5) * TAU; dot(ctx, sp, x + Math.cos(ang) * s * 0.35, y + Math.sin(ang) * s * 0.25, s * 0.16); }
  for (let i = 1; i <= 5; i++) dot(ctx, sp, x + s * 0.32, y - (i / 5) * s * 1.3, s * 0.11);
  if (flag) for (let i = 1; i <= 3; i++) dot(ctx, sp, x + s * (0.32 + i * 0.13), y - s * 1.3 + i * s * 0.15, s * 0.1);
  ctx.globalAlpha /= a;
}
