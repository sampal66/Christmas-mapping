// Star-swarm portraits (owner, 2026-11-18): a figure made of many small coloured lights, each placed and coloured from
// a picture (fx/pet-portraits.js for the pets; the family portrait for s10). Replaces the hand-built silhouette volumes
// of fx/pet-stars.js: the owner wants the characters to look like their cartoon art, in drone-show style.
// The points get a little depth (brighter points nearer), so the figure shimmers and shows depth as it turns.
import { morphClouds, renderCloud } from './points3d.js';
import { clamp, easeInOutSine, rand } from './util.js';

const cache = new WeakMap();

/** Decodes portrait data into a cloud { n, p (x, y, z), s (size), col (hex per point) }, ±size units tall/wide. */
export function cloudPortrait(data, { size = 1, depth = 0.14, seed = 3 } = {}) {
  let c = cache.get(data);
  if (c && c.size === size) return c;
  const bin = atob(data.d), n = Math.floor(bin.length / 6);
  const a = data.aspect || 1, sx = a >= 1 ? size : size * a, sy = a >= 1 ? size / a : size;
  c = { n, p: new Float32Array(n * 3), s: new Float32Array(n), col: new Array(n), size };
  for (let i = 0; i < n; i++) {
    const b = (k) => bin.charCodeAt(i * 6 + k);
    const u = (b(0) | (b(1) << 8)) / 65535, v = (b(2) | (b(3) << 8)) / 65535;
    const col = data.pal[b(4)] || '#ffffff';
    const lum = (parseInt(col.slice(1, 3), 16) + parseInt(col.slice(3, 5), 16) + parseInt(col.slice(5, 7), 16)) / 765;
    c.p[i * 3] = (u - 0.5) * 2 * sx;
    c.p[i * 3 + 1] = (v - 0.5) * 2 * sy;
    c.p[i * 3 + 2] = (0.5 - lum) * depth + (rand(seed + i * 1.3) - 0.5) * depth * 0.5;   // brighter lights nearer
    c.s[i] = Math.min(2, Math.max(0.35, b(5) / 127));      // sized to the local spacing (fine lights in the faces)
    c.col[i] = col;
  }
  cache.set(data, c);
  return c;
}

/** Default timing (seconds from the figure's start): forms over `form`, flies back into the swarm over `out`. */
export const PORTRAIT_TIMING = { form: 2.6, out: 2 };

/**
 * Draws a portrait swarm that forms out of a source swarm, sways gently in 3D, and flies back before `end`.
 * opts: data (portrait), x, y (centre, 0..1 of the zone), size (half-height as a share of min(w, h)), alpha,
 * end (s), source: { cloud, cx, cy, scale } (the constellation swarm and its view), flip (mirror left-right),
 * hold: [from, to] seconds of age during which the figure stops swaying and faces the audience straight on.
 */
export function portraitSwarm(ctx, w, h, t, age, opts = {}) {
  const { data, x = 0.85, y = 0.35, size = 0.2, alpha = 1, end = 10, source, flip = false, hold = null } = opts;
  const T = { ...PORTRAIT_TIMING, ...(opts.timing || {}) };
  if (!data || age < 0 || age > end || alpha <= 0.01) return;
  const live = cloudPortrait(data);
  const kin = clamp(age / T.form), kout = clamp((end - age) / T.out), k = Math.min(kin, kout);
  let cloud = live;
  if (source?.cloud && k < 1) {
    // where each light sits in the constellation, in this figure's units (close enough mid-flight)
    const m = Math.min(w, h), Sc = m * source.scale, Sp = m * size, N = source.cloud.n;
    const src = live.src || (live.src = { n: live.n, p: new Float32Array(live.n * 3), s: new Float32Array(live.n).fill(1) });
    for (let i = 0; i < live.n; i++) {
      const j = Math.floor((i * N) / live.n) * 3;
      src.p[i * 3] = ((source.cx - x) * w + source.cloud.p[j] * Sc) / Sp * (flip ? -1 : 1);
      src.p[i * 3 + 1] = ((source.cy - y) * h + source.cloud.p[j + 1] * Sc) / Sp;
      src.p[i * 3 + 2] = source.cloud.p[j + 2] * Sc / Sp;
    }
    cloud = morphClouds(src, live, k, { stagger: 0.45, lift: 0.4, seed: 29, out: live.mix || (live.mix = { n: live.n, p: new Float32Array(live.n * 3), s: new Float32Array(live.n) }) });
  }
  // The view swings round a little while it forms (shows the depth), then sways gently and faces the audience.
  const swing = 1 - easeInOutSine(kin);
  const still = hold ? easeInOutSine(clamp((age - hold[0]) / 1.2)) * (1 - easeInOutSine(clamp((age - hold[1]) / 1.2))) : 0;
  const m = Math.min(w, h);
  const spacing = (2 * m * size) / Math.sqrt(live.n);           // typical gap between neighbouring lights
  const dot = (0.8 * spacing) / (2.2 * Math.max(2.5, m / 260));  // renderCloud dot radius: the lights just touch, so it reads as an image
  const col = live.col;
  const color = k >= 1 ? (i) => col[i] : (i) => (rand(i * 1.7) < k * 1.15 ? col[i] : 'snow');
  ctx.save();
  if (flip) { ctx.translate(x * w * 2, 0); ctx.scale(-1, 1); }
  renderCloud(ctx, w, h, t, cloud, {
    cx: x, cy: y, scale: size, dist: 3.2, size: dot, core: 0.06,   // small white centre: the picture's colours read
    rotY: (0.18 * Math.sin(t * 0.35) - 0.7 * swing) * (1 - still), rotX: (0.04 + 0.18 * swing) * (1 - still),
    twinkle: 0.12 * (1 - 0.6 * still),
    alpha: alpha * (source?.cloud ? clamp(k * 3) : k) * (0.4 + 0.6 * kout), color,
  });
  ctx.restore();
}
