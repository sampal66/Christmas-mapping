// Sky effects: the dusk starfield base, twinkling stars, layered snow and slow shooting stars.
import { rgba, mix } from '../palette.js';
import { TAU, rand, clamp, glowSprite, dot, additive, loopWave, easeInOutSine } from './util.js';

const scaleOf = (w, h) => Math.max(0.5, Math.min(w, h) / 1080 + 0.35);

/**
 * Twinkling stars. opts: count (default ∝ area × density), seed, colors (tokens), size, alpha,
 * period (seconds: twinkle cycles divide it exactly, for seamless hold loops), area [u0, v0, u1, v1].
 */
export function twinkleStars(ctx, w, h, t, opts = {}) {
  const { seed = 1, colors = ['snow', 'snow', 'snow', 'gold', 'ice'], size = 1, alpha = 1, period = 0,
    density = 1, area = [0, 0, 1, 1] } = opts;
  const [u0, v0, u1, v1] = area;
  const count = opts.count ?? Math.round(density * (w * h * (u1 - u0) * (v1 - v0)) / 9000);
  const s = scaleOf(w, h) * size;
  additive(ctx, alpha, () => {
    for (let i = 0; i < count; i++) {
      const k = seed * 1000 + i;
      const x = (u0 + rand(k) * (u1 - u0)) * w;
      const y = (v0 + rand(k + 0.31) * (v1 - v0)) * h;
      const mag = rand(k + 0.57);
      const tw = period
        ? loopWave(t, period, 1 + Math.floor(rand(k + 0.73) * 3), rand(k + 0.91) * TAU)
        : 0.5 + 0.5 * Math.sin(t * (0.5 + rand(k + 0.73) * 1.4) + rand(k + 0.91) * TAU);
      // Gentle twinkle (never below ~45%): stars shimmer, they don't blink.
      ctx.globalAlpha = alpha * (0.45 + 0.55 * tw) * (0.35 + 0.65 * mag);
      const r = (2.5 + mag * mag * 7) * s;
      dot(ctx, glowSprite(colors[i % colors.length]), x, y, r);
    }
  });
}

/** The dusk base every scene sits on and fades to (DESIGN_SYSTEM §02: never fade to black). */
export function duskBase(ctx, w, h, t, opts = {}) {
  const { level = 1, stars = 1, period = 0, seed = 7 } = opts;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, mix('night', 'dusk', 0.75 * level));
  g.addColorStop(1, mix('night', 'dusk', level));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (stars > 0) twinkleStars(ctx, w, h, t, { seed, density: 0.55 * stars, alpha: 0.75 * level, period });
}

/**
 * Layered snow (far layers small and slow, near layers bigger, faster, softer). opts: density, layers,
 * wind (px/s drift scale), alpha, color, seed.
 */
export function snowfall(ctx, w, h, t, opts = {}) {
  const { density = 1, layers = 3, wind = 0.3, alpha = 1, color = 'snow', seed = 3 } = opts;
  const s = scaleOf(w, h);
  const base = (w * h) / 11000 * density;
  const sprite = glowSprite(color, 0.35);
  additive(ctx, alpha, () => {
    for (let l = 0; l < layers; l++) {
      const depth = (l + 1) / layers;                    // 0..1, near = 1
      const n = Math.round(base * (1.3 - depth * 0.8));
      const speed = (25 + 70 * depth) * s;
      const r0 = (2 + 6 * depth) * s;
      ctx.globalAlpha = alpha * (0.35 + 0.5 * depth);
      for (let i = 0; i < n; i++) {
        const k = seed * 777 + l * 101 + i;
        const sway = Math.sin(t * (0.4 + rand(k) * 0.6) + rand(k + 0.2) * TAU) * 18 * s * depth;
        const x = ((rand(k + 0.4) * w + t * wind * speed + sway) % w + w) % w;
        const y = (rand(k + 0.6) * (h + 40) + t * speed * (0.8 + rand(k + 0.8) * 0.4)) % (h + 40) - 20;
        dot(ctx, sprite, x, y, r0 * (0.7 + rand(k + 0.9) * 0.6));
      }
    }
  });
}

/**
 * Slow shooting stars: one every `every` seconds at a seeded position, gliding for `dur` seconds with a
 * fading trail. Small and soft, so they read as wonder, not flashes.
 */
export function shootingStars(ctx, w, h, t, opts = {}) {
  const { every = 5, dur = 1.6, seed = 11, color = 'snow', alpha = 1, area = [0, 0, 1, 0.6] } = opts;
  const n = Math.floor(t / every);
  const local = t - n * every;
  if (local > dur || t < 0) return;
  const k = seed * 31 + n;
  const p = easeInOutSine(local / dur);
  const [u0, v0, u1, v1] = area;
  const x0 = (u0 + rand(k) * (u1 - u0)) * w, y0 = (v0 + rand(k + 0.3) * (v1 - v0)) * h;
  const dir = rand(k + 0.5) < 0.5 ? -1 : 1;
  const len = Math.min(w, h) * 0.35;
  const x = x0 + dir * p * len, y = y0 + p * len * 0.45;
  const fade = Math.sin(Math.PI * clamp(local / dur));
  const tail = len * 0.35;
  const grad = ctx.createLinearGradient(x, y, x - dir * tail, y - tail * 0.45);
  grad.addColorStop(0, rgba(color, 0.9 * fade * alpha));
  grad.addColorStop(1, rgba(color, 0));
  additive(ctx, 1, () => {
    ctx.strokeStyle = grad; ctx.lineWidth = Math.max(3, Math.min(w, h) / 220); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * tail, y - tail * 0.45); ctx.stroke();
    ctx.globalAlpha = fade * alpha;
    dot(ctx, glowSprite(color), x, y, Math.min(w, h) / 45);
  });
}
