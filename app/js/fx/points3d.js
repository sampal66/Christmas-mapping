// 3D point clouds: the "drone show" look. A shape is a set of identical light points in 3D space, seen through a
// perspective camera and turned slowly so its depth shows; shapes morph into each other point by point along
// curved, staggered paths. Clouds are { p: Float32Array [x,y,z…], s: Float32Array sizes, n }, in unit space
// (y down), roughly within ±size.
import { TAU, rand, clamp, glowSprite, easeInOutSine } from './util.js';

const makeCloud = (n) => ({ n, p: new Float32Array(n * 3), s: new Float32Array(n).fill(1) });
const offscreen = (w, h) => (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h)
  : Object.assign(document.createElement('canvas'), { width: w, height: h }));

/** Points evenly spread over a sphere (Fibonacci lattice). */
export function cloudSphere(n, { size = 1, seed = 1 } = {}) {
  const c = makeCloud(n);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * ga + seed;
    c.p.set([Math.cos(a) * r * size, y * size, Math.sin(a) * r * size], i * 3);
  }
  return c;
}

/** Points scattered through a box, like extra stars in the sky. */
export function cloudScatter(n, { w = 2, h = 1.4, d = 1.2, seed = 3 } = {}) {
  const c = makeCloud(n);
  for (let i = 0; i < n; i++) {
    c.p.set([(rand(seed + i) - 0.5) * w, (rand(seed + i + 0.3) - 0.5) * h, (rand(seed + i + 0.6) - 0.5) * d], i * 3);
    c.s[i] = 0.5 + rand(seed + i + 0.9) * 0.5;
  }
  return c;
}

/**
 * A constellation as a 3D figure: each star is a small glowing cluster (bigger points), each line a string of
 * points, with a little depth so it turns like an object. shape: { stars [[u, v, mag]], lines [[i, j]], aspect }.
 */
export function cloudConstellation(shape, n, { size = 1, depth = 0.18, seed = 5 } = {}) {
  const c = makeCloud(n);
  const { stars, lines, aspect = 1 } = shape;
  const sx = aspect >= 1 ? size : size * aspect, sy = aspect >= 1 ? size / aspect : size;
  const at = (u, v) => [(u - 0.5) * 2 * sx, (v - 0.5) * 2 * sy];
  const zOf = stars.map((_, i) => (rand(seed + i * 3.1) - 0.5) * 2 * depth);
  const perStar = Math.max(4, Math.min(14, Math.floor((n * 0.35) / stars.length)));
  let k = 0;
  for (let i = 0; i < stars.length && k < n; i++) {
    const [x, y] = at(stars[i][0], stars[i][1]);
    const mag = stars[i][2] ?? 0.6;
    for (let j = 0; j < perStar && k < n; j++, k++) {
      const a = rand(seed + k) * TAU, b = Math.acos(2 * rand(seed + k + 0.4) - 1), r = 0.035 * size * (0.4 + mag) * rand(seed + k + 0.7) ** 0.5;
      c.p.set([x + Math.sin(b) * Math.cos(a) * r, y + Math.sin(b) * Math.sin(a) * r, zOf[i] + Math.cos(b) * r], k * 3);
      c.s[k] = j === 0 ? 1.8 + mag : 1.1 + mag * 0.4;
    }
  }
  const lens = lines.map(([a, b]) => { const [x1, y1] = at(stars[a][0], stars[a][1]); const [x2, y2] = at(stars[b][0], stars[b][1]); return Math.hypot(x2 - x1, y2 - y1); });
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  const left = n - k;
  lines.forEach(([a, b], li) => {
    const m = li === lines.length - 1 ? n - k : Math.round((left * lens[li]) / total);
    const [x1, y1] = at(stars[a][0], stars[a][1]); const [x2, y2] = at(stars[b][0], stars[b][1]);
    for (let j = 0; j < m && k < n; j++, k++) {
      const f = (j + 0.5) / m;
      c.p.set([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, zOf[a] + (zOf[b] - zOf[a]) * f], k * 3);
      c.s[k] = 0.75;
    }
  });
  for (; k < n; k++) { const j = k % Math.max(1, stars.length); c.p.set(c.p.subarray(j * 3, j * 3 + 3), k * 3); }
  return c;
}

/** Several constellations side by side as one cloud, each { shape, x, y, size } (offsets in cloud units). */
export function cloudGroup(parts, n, seed = 7) {
  const c = makeCloud(n);
  const weights = parts.map((q) => q.shape.stars.length + q.shape.lines.length);
  const tot = weights.reduce((a, b) => a + b, 0);
  let k = 0;
  parts.forEach((q, i) => {
    const m = i === parts.length - 1 ? n - k : Math.round((n * weights[i]) / tot);
    const sub = cloudConstellation(q.shape, m, { size: q.size, seed: seed + i * 13 });
    for (let j = 0; j < m; j++, k++) {
      c.p.set([sub.p[j * 3] + q.x, sub.p[j * 3 + 1] + q.y, sub.p[j * 3 + 2]], k * 3);
      c.s[k] = sub.s[j];
    }
  });
  return c;
}

/** A thick five-point star: outline plus a filled core, extruded in depth. */
export function cloudStar(n, { size = 1, depth = 0.22, seed = 9 } = {}) {
  const c = makeCloud(n);
  const R = size, r = size * 0.42;
  const corner = (i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rad = i % 2 ? r : R; return [Math.cos(a) * rad, Math.sin(a) * rad]; };
  for (let i = 0; i < n; i++) {
    const outline = i < n * 0.6;
    const e = Math.floor(rand(seed + i) * 10), f = rand(seed + i + 0.2);
    const [x1, y1] = corner(e), [x2, y2] = corner((e + 1) % 10);
    let x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f;
    if (!outline) { const g = rand(seed + i + 0.5) ** 0.7; x *= g; y *= g; }
    c.p.set([x, y, (rand(seed + i + 0.8) - 0.5) * 2 * depth * (outline ? 1 : 0.5)], i * 3);
    c.s[i] = outline ? 1.1 : 0.8;
  }
  return c;
}

/** A 3D heart (used when no family photo is loaded). */
export function cloudHeart(n, { size = 1, seed = 11 } = {}) {
  const c = makeCloud(n);
  for (let i = 0; i < n; i++) {
    const a = rand(seed + i) * TAU, fill = i < n * 0.55 ? 1 : rand(seed + i + 0.3) ** 0.6;
    const x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    const z = (rand(seed + i + 0.6) - 0.5) * 2 * 0.25 * Math.sqrt(1 - fill * 0.6);
    c.p.set([(x / 17) * size * fill, (y / 17 + 0.1) * size * fill, z * size], i * 3);
    c.s[i] = i < n * 0.55 ? 1.1 : 0.8;
  }
  return c;
}

const textCache = new Map();
/** Text drawn in points (the classic drone-show message). Width spans ±size. */
export function cloudText(text, n, { size = 1.5, font = '700 160px "Mountains of Christmas", Georgia, serif', seed = 13 } = {}) {
  const key = `${text}|${n}|${size}|${font}`;
  if (textCache.has(key)) return textCache.get(key);
  const W = 1200, H = 260;
  const cv = offscreen(W, H);
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  const tw = Math.min(W - 20, g.measureText(text).width);
  g.fillText(text, W / 2, H / 2, W - 20);
  const d = g.getImageData(0, 0, W, H).data;
  const on = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (d[(y * W + x) * 4 + 3] > 128) on.push([x, y]);
  const c = makeCloud(n);
  const half = Math.max(1, tw / 2);
  for (let i = 0; i < n; i++) {
    const [x, y] = on.length ? on[Math.floor(rand(seed + i) * on.length)] : [W / 2, H / 2];
    c.p.set([((x - W / 2) / half) * size, ((y - H / 2) / half) * size, (rand(seed + i + 0.5) - 0.5) * 0.12], i * 3);
  }
  // Only cache once the real font is in (otherwise the fallback shape would stick).
  if (typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded') textCache.set(key, c);
  return c;
}

/**
 * Morph a → b at k (0..1). Each point leaves at its own moment (stagger) and travels a curved path that bows out
 * of the plane, like drones re-forming, so the transition reads as a swarm, not a cross-fade.
 */
export function morphClouds(a, b, k, { stagger = 0.4, lift = 0.5, seed = 17, out } = {}) {
  const n = Math.min(a.n, b.n);
  const c = out && out.n === n ? out : makeCloud(n);
  for (let i = 0; i < n; i++) {
    const d = rand(seed + i) * stagger;
    const kk = easeInOutSine(clamp((k - d) / (1 - stagger)));
    const bow = Math.sin(kk * Math.PI) * lift;
    const j = i * 3;
    c.p[j] = a.p[j] + (b.p[j] - a.p[j]) * kk + bow * (rand(seed + i + 0.3) - 0.5) * 0.6;
    c.p[j + 1] = a.p[j + 1] + (b.p[j + 1] - a.p[j + 1]) * kk - bow * 0.25 * rand(seed + i + 0.5);
    c.p[j + 2] = a.p[j + 2] + (b.p[j + 2] - a.p[j + 2]) * kk + bow * (rand(seed + i + 0.7) - 0.3);
    c.s[i] = a.s[i] + (b.s[i] - a.s[i]) * kk;
  }
  return c;
}

/**
 * Draw a cloud. opts: cx, cy (0..1 centre on the zone), scale (pixels per unit, as a share of min(w, h)),
 * rotX/rotY/rotZ (radians), dist (camera distance in units; smaller = stronger perspective), size (point radius
 * scale), alpha, color (token, or fn(i, x, y, z) → token), twinkle (0..1).
 */
export function renderCloud(ctx, w, h, t, cloud, opts = {}) {
  const { cx = 0.5, cy = 0.5, scale = 0.25, rotX = 0, rotY = 0, rotZ = 0, dist = 3.2, size = 1, alpha = 1, color = 'snow', twinkle = 0.15 } = opts;
  if (alpha <= 0.002 || !cloud) return;
  const S = Math.min(w, h) * scale;
  const base = Math.max(2.5, Math.min(w, h) / 260) * size;
  const [sx, cxr, sy, cyr, sz, czr] = [Math.sin(rotX), Math.cos(rotX), Math.sin(rotY), Math.cos(rotY), Math.sin(rotZ), Math.cos(rotZ)];
  const fn = typeof color === 'function';
  const buckets = new Map();
  for (let i = 0; i < cloud.n; i++) {
    let x = cloud.p[i * 3], y = cloud.p[i * 3 + 1], z = cloud.p[i * 3 + 2];
    let t1 = x * czr - y * sz; y = x * sz + y * czr; x = t1;                 // Z
    t1 = x * cyr + z * sy; z = -x * sy + z * cyr; x = t1;                    // Y
    t1 = y * cxr - z * sx; z = y * sx + z * cxr; y = t1;                     // X
    const f = dist / (dist + z);
    if (f <= 0) continue;
    const tok = fn ? color(i, x, y, z) : color;
    let arr = buckets.get(tok);
    if (!arr) buckets.set(tok, (arr = []));
    const tw = 1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(t * (1.3 + rand(i) * 1.7) + i));
    arr.push(cx * w + x * S * f, cy * h + y * S * f, base * cloud.s[i] * f, clamp(0.35 + 0.65 * (f - 0.75) / 0.5) * tw);
  }
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  for (const [tok, arr] of buckets) {
    const sprite = glowSprite(tok, 0.3);
    for (let j = 0; j < arr.length; j += 4) {
      const r = arr[j + 2] * 2.2;
      ctx.globalAlpha = ga * alpha * arr[j + 3];
      ctx.drawImage(sprite, arr[j] - r, arr[j + 1] - r, r * 2, r * 2);
    }
  }
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = ga;
}

/** Colour sweep across the swarm (drone shows wash colour through the formation). */
export function sweepColors(tokens, t, speed = 0.15, spread = 0.6) {
  return (i, x) => tokens[Math.floor(((x * spread + t * speed) % 1 + 1) % 1 * tokens.length) % tokens.length];
}

/**
 * A formation sequence: [{ at, cloud, dur }] in scene seconds (first entry is the starting shape). Returns the
 * cloud for `local`, morphing from the previous shape to each new one over its `dur`.
 */
export function formation(local, seq, opts = {}) {
  let i = 0;
  while (i + 1 < seq.length && local >= seq[i + 1].at) i++;
  if (i === 0) return seq[0].cloud;
  const cur = seq[i], prev = seq[i - 1];
  const k = clamp((local - cur.at) / cur.dur);
  return k >= 1 ? cur.cloud : morphClouds(prev.cloud, cur.cloud, k, { seed: 17 + i * 31, ...opts });
}

/**
 * Figure art as a faint point cloud: points spaced along polylines, set back in depth (zBase) so the figure sits
 * behind its stars and shifts against them as the formation turns. parts: [{ figure: { polys, aspect }, x, y, size }].
 */
export function cloudFigure(parts, n, { zBase = -0.35, seed = 19 } = {}) {
  const c = makeCloud(n);
  const segs = [];
  for (const q of parts) {
    const { polys, aspect = 1 } = q.figure;
    const size = q.size ?? 1;
    const sx = aspect >= 1 ? size : size * aspect, sy = aspect >= 1 ? size / aspect : size;
    for (const pl of polys) for (let i = 1; i < pl.length; i++) {
      const a = [(pl[i - 1][0] - 0.5) * 2 * sx + (q.x ?? 0), (pl[i - 1][1] - 0.5) * 2 * sy + (q.y ?? 0)];
      const b = [(pl[i][0] - 0.5) * 2 * sx + (q.x ?? 0), (pl[i][1] - 0.5) * 2 * sy + (q.y ?? 0)];
      segs.push([a, b, Math.hypot(b[0] - a[0], b[1] - a[1])]);
    }
  }
  const total = segs.reduce((s, g) => s + g[2], 0) || 1;
  let k = 0;
  segs.forEach(([a, b, len], si) => {
    const m = si === segs.length - 1 ? n - k : Math.round((n * len) / total);
    for (let j = 0; j < m && k < n; j++, k++) {
      const f = (j + rand(seed + k) * 0.6) / m;
      c.p.set([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, zBase + (rand(seed + k + 0.5) - 0.5) * 0.08], k * 3);
      c.s[k] = 0.55;
    }
  });
  return c;
}
