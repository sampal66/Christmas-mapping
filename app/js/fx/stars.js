// Realistic night-sky stars: a tight bright core, a faint halo and (for bright stars) thin diffraction spikes, in the
// colours of the real spectral classes, with gentle scintillation. Also the story's lost star (warm gold-white, with
// slowly turning spikes) and the morph between it and the five-point projected star.
import { rgba } from '../palette.js';
import { TAU, rand, clamp, glowSprite, easeInOutSine } from './util.js';
import { projectedStar } from './bursts.js';

// Blackbody colours of the spectral classes (after M. Charity, "What colour are the stars?"), slightly saturated so
// they survive an LCD projector, which washes pale colours out (DESIGN_SYSTEM §02.7).
export const SPECTRAL = {
  O: '#8FAAFF', B: '#A5BCFF', A: '#CAD8FF', F: '#F6F4FF', G: '#FFF1DC', K: '#FFCB8C', M: '#FFAD66',
};
// Rough share of each class among the stars you see with the naked eye.
const CLASS_MIX = 'BBBAAAAAAFFFGGGKKKKKKMM';

const spriteCache = new Map();
const offscreen = (n) => (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(n, n)
  : Object.assign(document.createElement('canvas'), { width: n, height: n }));

/** Star sprite for a spectral class: core + halo, plus 4 thin diffraction spikes when `spikes`. */
export function starSprite(cls = 'A', spikes = false) {
  const key = `${cls}|${spikes}`;
  let s = spriteCache.get(key);
  if (s) return s;
  const N = spikes ? 128 : 64, C = N / 2;
  s = offscreen(N);
  const g = s.getContext('2d');
  const col = SPECTRAL[cls] || cls;
  const halo = g.createRadialGradient(C, C, 0, C, C, C);
  halo.addColorStop(0, 'rgba(255,255,255,1)');
  halo.addColorStop(spikes ? 0.04 : 0.08, rgba(col, 1));
  halo.addColorStop(spikes ? 0.12 : 0.22, rgba(col, 0.35));
  halo.addColorStop(spikes ? 0.3 : 0.5, rgba(col, 0.06));
  halo.addColorStop(1, rgba(col, 0));
  g.fillStyle = halo; g.fillRect(0, 0, N, N);
  if (spikes) {
    g.globalCompositeOperation = 'lighter';
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const lg = g.createLinearGradient(C - dx * C, C - dy * C, C + dx * C, C + dy * C);
      lg.addColorStop(0, rgba(col, 0)); lg.addColorStop(0.5, rgba(col, 0.75)); lg.addColorStop(1, rgba(col, 0));
      g.fillStyle = lg;
      if (dx) g.fillRect(0, C - 0.8, N, 1.6); else g.fillRect(C - 0.8, 0, 1.6, N);
    }
  }
  spriteCache.set(key, s);
  return s;
}

/** A random spectral class with the naked-eye mix. */
export const randomClass = (seed) => CLASS_MIX[Math.floor(rand(seed) * CLASS_MIX.length)];

/**
 * Draw one realistic star at pixel x, y. opts: mag 0..1 (brightness), cls (spectral class), seed, twinkle (0..1),
 * unit (pixel scale, default min(w, h)/1080 passed by the caller), alpha.
 */
export function drawStar(ctx, x, y, t, opts = {}) {
  const { mag = 0.5, cls = 'A', seed = 1, twinkle = 0.2, unit = 1, alpha = 1 } = opts;
  // scintillation: small, smooth brightness changes (never a blink)
  const sc = 1 - twinkle * (0.5 + 0.5 * Math.sin(t * (2 + rand(seed) * 3) + rand(seed + 0.5) * TAU)) * (0.6 + 0.4 * Math.sin(t * 7.3 + seed));
  const bright = mag > 0.55;
  const r = unit * (bright ? 14 + 46 * (mag - 0.55) / 0.45 : 3 + 12 * mag);
  ctx.globalAlpha = alpha * (0.35 + 0.65 * mag) * sc;
  ctx.drawImage(starSprite(cls, bright), x - r, y - r, r * 2, r * 2);
}

/**
 * The story's lost star in its night-sky form: warm gold-white, brighter than any other star, with four long and
 * four short spikes turning slowly and a soft pulse. x, y in pixels; size in pixels (half-width of the long spikes).
 */
export function lostStar(ctx, x, y, t, { size = 60, alpha = 1, trail = null } = {}) {
  if (alpha <= 0.01) return;
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  if (trail) {                                            // a short sparkle trail while it travels: [[x, y], …] older first
    const sp = glowSprite('gold', 0.3);
    trail.forEach(([tx, ty], i) => {
      const k = (i + 1) / trail.length;
      const r = size * 0.18 * k;
      ctx.globalAlpha = ga * alpha * 0.5 * k;
      ctx.drawImage(sp, tx - r, ty - r, r * 2, r * 2);
    });
  }
  const pulse = 0.9 + 0.1 * Math.sin(t * 1.6);
  ctx.globalAlpha = ga * alpha * 0.85;
  const halo = size * 1.1;
  ctx.drawImage(glowSprite('candle', 0.12), x - halo, y - halo, halo * 2, halo * 2);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(t * 0.12);
  for (let i = 0; i < 8; i++) {                           // spikes: 4 long, 4 short (diagonals)
    const L = size * (i % 2 ? 0.45 : 1) * pulse, wdt = Math.max(1.5, size * (i % 2 ? 0.02 : 0.03));
    const lg = ctx.createLinearGradient(0, 0, L, 0);
    lg.addColorStop(0, 'rgba(255,248,225,0.95)'); lg.addColorStop(1, 'rgba(255,201,74,0)');
    ctx.globalAlpha = ga * alpha;
    ctx.fillStyle = lg;
    ctx.fillRect(0, -wdt / 2, L, wdt);
    ctx.rotate(TAU / 8);
  }
  ctx.restore();
  ctx.globalAlpha = ga * alpha;
  const core = size * 0.32 * pulse;
  ctx.drawImage(starSprite('G', false), x - core, y - core, core * 2, core * 2);
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
}

/**
 * Morph between the five-point projected star (k = 0) and the night-sky lost star (k = 1) at pixel x, y.
 * size = the five-point star's outer radius in pixels.
 */
export function starMorph(ctx, w, h, t, x, y, k, { size = 50, alpha = 1 } = {}) {
  const e = easeInOutSine(clamp(k));
  const m = Math.min(w, h);
  if (e < 0.999) projectedStar(ctx, w, h, t, { x: x / w, y: y / h, size: (size / m) * (1 - 0.55 * e), alpha: alpha * (1 - e) });
  if (e > 0.001) lostStar(ctx, x, y, t, { size: size * (0.6 + 0.6 * e), alpha: alpha * e });
}
