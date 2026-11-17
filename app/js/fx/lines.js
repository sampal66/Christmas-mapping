// Line-art effects: edge traces (the core "mapping" look), constellations, and photo → constellation.
import { rgba } from '../palette.js';
import { TAU, rand, clamp, prog, lerp, glowSprite, dot, additive, glowStroke, easeOutBack, easeInOutSine } from './util.js';

const lineW = (w, h, k = 1) => Math.max(6, Math.min(w, h) / 90) * k;   // ≥ 6 px (DESIGN_SYSTEM §02.6)

/** Rectangle outline in 0..1 coordinates, inset so the glow stays inside the zone. */
export function rectPath(inset = 0.02) {
  const a = inset, b = 1 - inset;
  return [[a, b], [a, a], [b, a], [b, b]];
}

/**
 * Draws a path on, from its first point, with a bright moving head. opts: path ([u, v] 0..1), closed,
 * progress 0..1, color, width (px), alpha, head (bool).
 */
export function edgeTrace(ctx, w, h, t, opts = {}) {
  const { path = rectPath(), closed = true, progress = 1, color = 'gold', alpha = 1, head = true } = opts;
  const width = opts.width ?? lineW(w, h);
  if (progress <= 0 || alpha <= 0) return;
  const pts = path.map(([u, v]) => [u * w, v * h]);
  if (closed) pts.push(pts[0]);
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d); total += d;
  }
  let left = clamp(progress) * total;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let hx = pts[0][0], hy = pts[0][1];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i - 1]);
    hx = lerp(pts[i - 1][0], pts[i][0], k); hy = lerp(pts[i - 1][1], pts[i][1], k);
    ctx.lineTo(hx, hy);
    left -= seg[i - 1];
  }
  // A slow shimmer along the finished line keeps it alive without blinking.
  const shimmer = 0.85 + 0.15 * Math.sin(t * 1.3);
  additive(ctx, alpha * shimmer, () => glowStroke(ctx, color, width));
  if (head && progress < 1) {
    additive(ctx, alpha, () => dot(ctx, glowSprite(color, 0.25), hx, hy, width * 4.5));
  }
}

/** Fits a box of the given aspect (w/h) inside [u0, v0, u1, v1] of a w×h zone; returns pixel rect. */
function fitBox(aspect, w, h, [u0, v0, u1, v1]) {
  const bw = (u1 - u0) * w, bh = (v1 - v0) * h;
  if (!aspect) return [u0 * w, v0 * h, bw, bh];
  let fw = bw, fh = bw / aspect;
  if (fh > bh) { fh = bh; fw = bh * aspect; }
  return [u0 * w + (bw - fw) / 2, v0 * h + (bh - fh) / 2, fw, fh];
}

/**
 * Constellation line-art: stars pop on one by one (first 55% of `progress`), then the lines join them.
 * opts: stars [[u, v, mag]] in 0..1 of `box`, lines [[i, j]], progress, box [u0, v0, u1, v1], aspect,
 * color (stars), lineColor, alpha, gather 0..1 (stars fly in from scattered positions), seed.
 */
export function constellation(ctx, w, h, t, opts = {}) {
  const { stars = [], lines = [], progress = 1, box = [0, 0, 1, 1], aspect = 0, color = 'snow',
    lineColor = 'ice', alpha = 1, gather = 1, seed = 5, starSize = 1 } = opts;
  if (alpha <= 0 || progress <= 0 || !stars.length) return;
  const [bx, by, bw, bh] = fitBox(aspect, w, h, box);
  const n = stars.length;
  const g = easeInOutSine(clamp(gather));
  const pos = stars.map(([u, v], i) => {
    const tx = bx + u * bw, ty = by + v * bh;
    if (g >= 1) return [tx, ty];
    const sx = rand(seed + i) * w, sy = rand(seed + i + 0.5) * h;
    return [lerp(sx, tx, g), lerp(sy, ty, g)];
  });
  const starPhase = clamp(progress / 0.55);
  const linePhase = prog(progress, 0.55, 1);
  if (linePhase > 0 && lines.length) {
    const shown = linePhase * lines.length;
    ctx.beginPath();
    for (let i = 0; i < lines.length && i < shown; i++) {
      const [a, b] = lines[i];
      const k = Math.min(1, shown - i);
      ctx.moveTo(pos[a][0], pos[a][1]);
      ctx.lineTo(lerp(pos[a][0], pos[b][0], k), lerp(pos[a][1], pos[b][1], k));
    }
    additive(ctx, alpha * 0.75, () => glowStroke(ctx, lineColor, Math.max(4, lineW(w, h, 0.55)), rgba('snow', 0.8)));
  }
  const unit = Math.min(w, h) / 1080;
  additive(ctx, alpha, () => {
    for (let i = 0; i < n; i++) {
      const appear = clamp(starPhase * n - i);           // one by one
      if (appear <= 0) break;
      const mag = stars[i][2] ?? 0.6;
      const tw = 0.85 + 0.15 * Math.sin(t * (0.8 + rand(seed + i) * 0.8) + i);
      const r = (14 + 26 * mag) * unit * starSize * easeOutBack(appear) * tw;
      ctx.globalAlpha = alpha * Math.min(1, appear * 1.5);
      dot(ctx, glowSprite(color, 0.22), pos[i][0], pos[i][1], Math.max(4, r));
    }
  });
}

/** Minimum spanning tree over points (Prim, O(n²)): a tidy line-art web with no crossings to speak of. */
export function spanningLines(pts) {
  const n = pts.length;
  if (n < 2) return [];
  const inTree = new Array(n).fill(false);
  const best = new Array(n).fill(Infinity);
  const from = new Array(n).fill(-1);
  const out = [];
  best[0] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!inTree[i] && (u < 0 || best[i] < best[u])) u = i;
    inTree[u] = true;
    if (from[u] >= 0) out.push([from[u], u]);
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = (pts[u][0] - pts[v][0]) ** 2 + (pts[u][1] - pts[v][1]) ** 2;
      if (d < best[v]) { best[v] = d; from[v] = u; }
    }
  }
  return out;
}

/**
 * Photo → constellation, computed on the device (the photo never leaves the iPad). Picks well-spaced points
 * on strong edges and bright areas, then joins them with a spanning tree.
 * source: an image/bitmap/canvas. Returns { stars, lines, aspect } for constellation().
 */
export function photoToConstellation(source, { points = 70, sampleW = 112 } = {}) {
  const iw = source.naturalWidth || source.videoWidth || source.width;
  const ih = source.naturalHeight || source.videoHeight || source.height;
  if (!iw || !ih) return null;
  const sw = sampleW, sh = Math.max(8, Math.round(sampleW * ih / iw));
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(sw, sh)
    : Object.assign(document.createElement('canvas'), { width: sw, height: sh });
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(source, 0, 0, sw, sh);
  const px = g.getImageData(0, 0, sw, sh).data;
  const lum = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
  const cand = [];
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const L = (dx, dy) => lum[(y + dy) * sw + x + dx];
      const gx = L(1, -1) + 2 * L(1, 0) + L(1, 1) - L(-1, -1) - 2 * L(-1, 0) - L(-1, 1);
      const gy = L(-1, 1) + 2 * L(0, 1) + L(1, 1) - L(-1, -1) - 2 * L(0, -1) - L(1, -1);
      cand.push([Math.hypot(gx, gy) * 0.8 + L(0, 0) * 0.2 + rand(x * 131 + y) * 0.02, x, y]);
    }
  }
  cand.sort((a, b) => b[0] - a[0]);
  const minD = Math.sqrt((sw * sh) / points) * 0.75;
  const picked = [];
  for (const [score, x, y] of cand) {
    if (picked.length >= points) break;
    if (picked.every((p) => (p[0] - x) ** 2 + (p[1] - y) ** 2 >= minD * minD)) picked.push([x, y, score]);
  }
  const top = picked[0]?.[2] || 1;
  const stars = picked.map(([x, y, s]) => [x / (sw - 1), y / (sh - 1), clamp(s / top)]);
  return { stars, lines: spanningLines(stars.map(([u, v]) => [u * iw, v * ih])), aspect: iw / ih };
}

/** A simple heart-and-star shape used when no family photo is in the media pack. */
export function fallbackConstellation() {
  const stars = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU;
    const x = 16 * Math.sin(a) ** 3;
    const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    stars.push([0.5 + x / 36, 0.48 + y / 36, 0.4 + 0.6 * rand(i)]);
  }
  const lines = stars.map((_, i) => [i, (i + 1) % stars.length]);
  return { stars, lines, aspect: 1 };
}

/**
 * Light runners: comets of light chasing along a traced path (the outline "comes alive" after it is drawn).
 * opts: path ([u, v] 0..1), closed, count (runners, evenly spaced), speed (laps per second of `t`; feed beat time so
 * they surge on the beat), tail (share of the path length), color, size (px, head radius), alpha.
 */
export function edgeRunners(ctx, w, h, t, opts = {}) {
  const { path = rectPath(), closed = true, count = 3, speed = 0.1, tail = 0.08, color = 'snow', alpha = 1 } = opts;
  if (alpha <= 0.01 || path.length < 2) return;
  const size = opts.size ?? lineW(w, h) * 1.6;
  const pts = path.map(([u, v]) => [u * w, v * h]);
  if (closed) pts.push(pts[0]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1] || 1;
  const at = (f) => {
    let d = (((f % 1) + 1) % 1) * total, i = 1;
    if (!closed) d = clamp(f) * total;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
  };
  const head = glowSprite('snow', 0.25), body = glowSprite(color, 0.3);
  additive(ctx, alpha, () => {
    for (let r = 0; r < count; r++) {
      const f0 = t * speed + r / count;
      for (let j = 11; j >= 0; j--) {
        const f = f0 - (j / 11) * tail;
        if (!closed && (f < 0 || f > 1)) continue;
        const [x, y] = at(closed ? f : f % 1);
        ctx.globalAlpha = alpha * (1 - j / 12) ** 1.5;
        dot(ctx, j ? body : head, x, y, size * (j ? 1 - j / 16 : 1.4));
      }
    }
  });
}
