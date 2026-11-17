// Mega-tree: the tree as a 3D cone of light points, like the pixel "mega trees" of pro Christmas light shows
// (xLights / Light-O-Rama effects, Twinkly trees). Patterns are defined on the cone's surface (u = around,
// 0..1; k = height, 0 tip → 1 base) in world angle, so they wrap round the tree and turn with real depth (back
// points dimmer and smaller). Points only: the tree "eats light", so bold dots read better than washes.
import { TAU, rand, clamp, glowSprite } from './util.js';

const coneCache = new Map();
function cone(rings) {
  let c = coneCache.get(rings);
  if (c) return c;
  const u = [], k = [];
  for (let r = 0; r < rings; r++) {
    const kk = (r + 0.6) / rings;                         // 0 = tip, 1 = base
    const n = Math.max(4, Math.round(46 * kk));          // fewer points near the tip
    for (let j = 0; j < n; j++) { u.push((j + (r % 2) * 0.5) / n); k.push(kk); }
  }
  c = { u: Float32Array.from(u), k: Float32Array.from(k), n: u.length };
  coneCache.set(rings, c);
  return c;
}

const frac = (x) => x - Math.floor(x);
const peak = (d, width) => { const x = Math.min(d, 1 - d) / width; return x >= 1 ? 0 : (1 - x * x) ** 2; };

/**
 * Patterns: (u, k, t, P, i) → [brightness 0..1, colour index]. P holds the pattern's options.
 *  twinkle   gentle random sparkle;            rings     bands climbing round the cone
 *  helix     n spiral strands winding up;      bars      rotating candy-cane / pinwheel stripes
 *  meteors   light drops falling down columns; shockwave rings spreading from a point on the surface
 *  galaxy    swirling arms from the tip;        plasma    a slowly flowing colour field;   fill  everything on
 */
export const TREE_PATTERNS = {
  twinkle: (u, k, t, P, i) => [0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * (1.2 + rand(i) * 2.2) + rand(i + 0.5) * TAU)) ** 3, Math.floor(rand(i + 0.7) * 97)],
  rings: (u, k, t, P) => { const d = frac(k * (P.count ?? 4) + t * (P.speed ?? 0.5)); return [peak(d, P.width ?? 0.22), Math.floor(k * (P.count ?? 4) + t * (P.speed ?? 0.5))]; },
  helix: (u, k, t, P) => { const n = P.count ?? 3; const d = frac(u * n + k * (P.turns ?? 3) - t * (P.speed ?? 0.4)); return [peak(d, P.width ?? 0.18), Math.floor(u * n + k * (P.turns ?? 3) - t * (P.speed ?? 0.4))]; },
  bars: (u, k, t, P) => {
    const n = P.count ?? 6; const x = (u + k * (P.twist ?? 0.35)) * n - t * (P.speed ?? 0.6);
    const d = frac(x); return [d < 0.5 ? 0.3 + 0.7 * Math.sin(d * 2 * Math.PI) ** 0.5 : 0.06, Math.floor(x)];
  },
  meteors: (u, k, t, P, i) => {
    const cols = P.count ?? 18; const c = Math.floor(u * cols);
    const sp = 0.35 + rand(c + 0.1) * 0.35; const head = frac(t * sp * (P.speed ?? 1) + rand(c + 0.3)) * 1.5 - 0.25;
    const d = head - k; const tail = P.tail ?? 0.28;
    return [d < 0 || d > tail ? 0 : (1 - d / tail) ** 2, c];
  },
  shockwave: (u, k, t, P) => {
    const age = t - (P.t0 ?? 0); if (age < 0) return [0, 0];
    const du = Math.min(Math.abs(u - (P.u0 ?? 0)), 1 - Math.abs(u - (P.u0 ?? 0))) * TAU * 0.5 * k;
    const d = Math.hypot(du, k - (P.k0 ?? 0)); const R = age * (P.speed ?? 0.6);
    const x = (d - R) / (P.width ?? 0.08); return [Math.exp(-x * x) * clamp(1 - age / (P.life ?? 2.2)), 0];
  },
  galaxy: (u, k, t, P) => { const n = P.count ?? 3; const d = frac(u * n + Math.log(0.15 + k) * (P.twist ?? 2.2) - t * (P.speed ?? 0.3)); return [0.15 + 0.85 * peak(d, 0.3), Math.floor(u * n + Math.log(0.15 + k) * (P.twist ?? 2.2) - t * (P.speed ?? 0.3))]; },
  plasma: (u, k, t, P) => {
    const a = u * TAU, s = Math.sin(a * 2 + t * 0.7) + Math.sin(k * 7 - t * 0.9) + Math.sin(a + k * 5 + t * 0.5);
    return [0.55 + 0.45 * (0.5 + 0.5 * Math.sin(s * 1.5)), Math.floor((s + 3) * (P.bands ?? 1.2))];
  },
  fill: () => [1, 0],
};

/**
 * Draw the mega-tree. Either one pattern (opts.pattern, params, colors, alpha) or several at once in `layers`
 * ([{ pattern, params, colors, alpha }]): the layers are mixed per point in a single pass (brightness adds up,
 * the strongest layer gives the colour), so each light is drawn once however many patterns are running.
 * Shared opts: spin (radians: the tree's rotation), alpha, size (point scale), rings (density),
 * apex [u, v] and baseHalfWidth (cone in zone coordinates; matches the default tree mask).
 */
export function megaTree(ctx, w, h, t, opts = {}) {
  const { spin = 0, alpha = 1, size = 1, rings = 26, apex = [0.5, 0.03], baseHalfWidth = 0.47 } = opts;
  const layers = (opts.layers || [{ pattern: opts.pattern, params: opts.params, colors: opts.colors, alpha: 1 }])
    .filter((L) => (L.alpha ?? 1) > 0.002)
    .map((L) => ({ fn: TREE_PATTERNS[L.pattern] || TREE_PATTERNS.twinkle, params: L.params || {}, colors: L.colors || ['gold', 'snow'], a: L.alpha ?? 1, t: L.t ?? t }));
  if (alpha <= 0.002 || !layers.length) return;
  const C = cone(rings);
  const base = Math.max(5, w / 70) * size;
  const buckets = new Map();
  for (let i = 0; i < C.n; i++) {
    const k = C.k[i];
    const ang = C.u[i] * TAU + spin;
    const uw = frac(ang / TAU);                          // pattern coordinates turn with the tree
    let b = 0, best = 0, tok = null;
    for (const L of layers) {
      const [v, ci] = L.fn(uw, k, L.t, L.params, i);
      const c = v * L.a;
      if (c <= 0.01) continue;
      b += c;
      if (c > best) { best = c; tok = L.colors[((ci % L.colors.length) + L.colors.length) % L.colors.length]; }
    }
    if (b <= 0.02) continue;
    if (b > 1) b = 1;
    const front = 0.5 + 0.5 * Math.cos(ang);             // 1 = facing the audience
    const x = (apex[0] + Math.sin(ang) * baseHalfWidth * k) * w;
    const y = (apex[1] + k * (1 - apex[1])) * h;
    let arr = buckets.get(tok);
    if (!arr) buckets.set(tok, (arr = []));
    arr.push(x, y, base * (0.65 + 0.45 * front) * (0.8 + 0.4 * b), b * (0.18 + 0.82 * front));
  }
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  for (const [tk, arr] of buckets) {
    const sprite = glowSprite(tk, 0.3);
    for (let j = 0; j < arr.length; j += 4) {
      const r = arr[j + 2] * 1.7;
      ctx.globalAlpha = ga * alpha * arr[j + 3];
      ctx.drawImage(sprite, arr[j] - r, arr[j + 1] - r, r * 2, r * 2);
    }
  }
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = ga;
}
