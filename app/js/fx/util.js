// Shared helpers for the effect library. Everything is time-based (seconds), never frame-based,
// so the MP4 exporter (WP-07) can render any frame in any order.
import { rgb } from '../palette.js';

export const TAU = Math.PI * 2;

/** Deterministic 0..1 noise from a seed (same layout every run and every frame). */
export const rand = (seed) => { const x = Math.sin(seed * 9301.17 + 0.5) * 49297.31; return x - Math.floor(x); };

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
/** 0..1 progress of x between a and b (clamped). */
export const prog = (x, a, b) => clamp((x - a) / (b - a));
export const smooth = (k) => k * k * (3 - 2 * k);
export const easeInOutSine = (k) => -(Math.cos(Math.PI * k) - 1) / 2;
export const easeOutCubic = (k) => 1 - (1 - k) ** 3;
export const easeOutBack = (k) => { const c = 1.70158; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };

/** Fade-in / fade-out envelope for a window [a, b] with ramps (seconds). */
export function envelope(x, a, b, inS = 1, outS = 1) {
  if (x < a || x > b) return 0;
  return easeInOutSine(Math.min(prog(x, a, a + inS), 1 - prog(x, b - outS, b)));
}

/** Periodic 0..1 wave whose period divides `period` exactly, so a looped hold segment is seamless. */
export function loopWave(t, period, cycles = 1, phase = 0) {
  return 0.5 + 0.5 * Math.sin((t / period) * TAU * cycles + phase);
}

// Soft round glow sprites, cached per colour. Drawing a pre-rendered sprite is far cheaper than a
// gradient per particle, which keeps hundreds of particles inside the iPad's frame budget.
const spriteCache = new Map();
const makeCanvas = (w, h) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
};

/** Soft dot sprite: a bright core with a wide falloff (additive-friendly). */
export function glowSprite(color, core = 0.18) {
  const key = `${color}|${core}`;
  let s = spriteCache.get(key);
  if (s) return s;
  const R = 64;
  s = makeCanvas(R * 2, R * 2);
  const g = s.getContext('2d');
  const [r, gg, b] = rgb(color);
  const grad = g.createRadialGradient(R, R, 0, R, R, R);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(core, `rgba(${r},${gg},${b},0.9)`);
  grad.addColorStop(0.45, `rgba(${r},${gg},${b},0.25)`);
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, R * 2, R * 2);
  spriteCache.set(key, s);
  return s;
}

/** Draws a glow sprite of radius r centred at x,y. */
export function dot(ctx, sprite, x, y, r) {
  ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
}

/** Runs fn with additive blending and the given alpha, restoring state afterwards. */
export function additive(ctx, alpha, fn) {
  if (alpha <= 0.002) return;
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = ga * alpha;
  fn();
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = ga;
}

/** Glowing stroke: a wide faint pass, then a mid pass, then a bright thin core (projected light traces). */
export function glowStroke(ctx, color, width, coreColor = '#ffffff') {
  const [r, g, b] = rgb(color);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(${r},${g},${b},0.16)`; ctx.lineWidth = width * 3.2; ctx.stroke();
  ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`; ctx.lineWidth = width * 1.7; ctx.stroke();
  ctx.strokeStyle = `rgba(${r},${g},${b},1)`; ctx.lineWidth = width; ctx.stroke();
  ctx.strokeStyle = coreColor; ctx.globalAlpha *= 0.7; ctx.lineWidth = Math.max(1.5, width * 0.35); ctx.stroke();
  ctx.globalAlpha /= 0.7;
}
