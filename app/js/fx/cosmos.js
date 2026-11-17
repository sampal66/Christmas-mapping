// "Real universe" effects for the rides between constellations: warp-speed stars rushing past, aurora curtains and
// a spiral galaxy sweeping by. All are driven by an intensity 0..1 that the scene ramps up and down smoothly (the
// rollercoaster), so brightness never jumps (DESIGN_SYSTEM §06).
import { rgb, rgba } from '../palette.js';
import { TAU, rand, clamp, glowSprite } from './util.js';

const frac = (x) => x - Math.floor(x);

/**
 * Warp field: stars streaming out of a vanishing point towards the audience, with streaks that lengthen with speed.
 * opts: intensity 0..1 (count, speed and streak length scale with it), cx, cy (vanishing point 0..1), colors, seed.
 */
export function warpField(ctx, w, h, t, opts = {}) {
  const { intensity = 1, cx = 0.6, cy = 0.35, colors = ['snow', 'ice', 'snow', 'plum'], seed = 3 } = opts;
  if (intensity <= 0.01) return;
  const n = Math.round(40 + 200 * intensity);
  const R = Math.hypot(w, h) * 0.65;
  const speed = 0.12 + 0.55 * intensity;              // depth units per second
  const ox = cx * w, oy = cy * h;
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  // Streaks are batched by colour and by three brightness/width levels: a dozen strokes instead of hundreds.
  const LV = 3, paths = new Map();
  for (let i = 0; i < n; i++) {
    const a = rand(seed + i) * TAU;
    const z = 1 - frac(rand(seed + i + 0.4) + t * speed * (0.6 + rand(seed + i + 0.7) * 0.8));  // 1 far → 0 near
    if (z < 0.03) continue;
    const r = R * (0.04 / z);                          // perspective: radius grows as the star approaches
    const r0 = R * (0.04 / Math.min(1, z + 0.05 + 0.25 * intensity * z));   // streak tail
    if (r0 > R * 1.2) continue;
    const lv = Math.min(LV - 1, Math.floor(clamp((1 - z) * 1.4) * LV));
    const key = `${colors[i % colors.length]}|${lv}`;
    let path = paths.get(key);
    if (!path) paths.set(key, (path = []));
    const c = Math.cos(a), sn = Math.sin(a);
    path.push(ox + c * r0, oy + sn * r0, ox + c * r, oy + sn * r);
  }
  const unit = Math.min(w, h) / 1080;
  for (const [key, pts] of paths) {
    const [col, lvs] = key.split('|'); const lv = Number(lvs);
    const near = (lv + 0.5) / LV;
    const [cr, cg, cb] = rgb(col);
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(0.15 + 0.75 * near) * intensity})`;
    ctx.lineWidth = Math.max(1.5, 4.5 * near * unit);
    ctx.beginPath();
    for (let j = 0; j < pts.length; j += 4) { ctx.moveTo(pts[j], pts[j + 1]); ctx.lineTo(pts[j + 2], pts[j + 3]); }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
}

// Vertical gradient strip used to build aurora curtains (cached per colour).
const stripCache = new Map();
function auroraStrip(color) {
  let s = stripCache.get(color);
  if (s) return s;
  s = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(4, 256) : Object.assign(document.createElement('canvas'), { width: 4, height: 256 });
  const g = s.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, rgba(color, 0));
  grad.addColorStop(0.55, rgba(color, 0.55));
  grad.addColorStop(0.8, rgba(color, 0.9));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
  stripCache.set(color, s);
  return s;
}

/**
 * Aurora: two or three luminous curtains rippling across the top of the sky. opts: alpha, colors, top (0..1), height
 * (share of h), area [u0, u1] (horizontal span).
 */
export function aurora(ctx, w, h, t, opts = {}) {
  const { alpha = 1, colors = ['pine', 'ice', 'plum'], top = 0.02, height = 0.38, area = [0.4, 1] } = opts;
  if (alpha <= 0.01) return;
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  const x0 = area[0] * w, x1 = area[1] * w;
  const step = Math.max(10, w / 160);
  colors.forEach((c, k) => {
    const strip = auroraStrip(c);
    for (let x = x0; x < x1; x += step) {
      const u = (x - x0) / (x1 - x0);
      const wave = Math.sin(u * 7 + t * 0.6 + k * 2.1) * 0.5 + Math.sin(u * 17 - t * 0.9 + k) * 0.25;
      const y = (top + 0.06 * wave + 0.05 * k) * h;
      const hh = height * h * (0.7 + 0.3 * Math.sin(u * 5 + t * 0.4 + k));
      const edge = Math.sin(Math.PI * u);                 // fades at both ends of the curtain
      ctx.globalAlpha = ga * alpha * edge * (0.35 + 0.25 * Math.sin(u * 23 + t * 1.3 + k * 3)) / (1 + k * 0.4);
      ctx.drawImage(strip, x, y, step + 1, hh);
    }
  });
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
}

/**
 * Spiral galaxy made of points, tilted in 3D and turning slowly. opts: x, y (centre 0..1), size (share of
 * min(w, h)), tilt (0 face-on → 1.2 nearly edge-on), rot (radians), alpha, colors, arms, seed.
 */
export function galaxy(ctx, w, h, t, opts = {}) {
  const { x = 0.5, y = 0.4, size = 0.3, tilt = 0.9, rot = 0, alpha = 1, colors = ['ice', 'plum', 'snow'], arms = 2, seed = 29, count = 520 } = opts;
  if (alpha <= 0.01) return;
  const m = Math.min(w, h), R = size * m, cx = x * w, cy = y * h;
  const ct = Math.cos(tilt);
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  // soft disk glow (an ellipse: the galaxy is tilted) and a bright core
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot * 0.15); ctx.scale(1, Math.max(0.15, ct));
  const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  disk.addColorStop(0, rgba(colors[0], 0.22 * alpha)); disk.addColorStop(0.5, rgba(colors[1], 0.08 * alpha)); disk.addColorStop(1, rgba(colors[1], 0));
  ctx.fillStyle = disk; ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.3);
  g.addColorStop(0, rgba('snow', 0.45 * alpha)); g.addColorStop(0.4, rgba('candle', 0.15 * alpha)); g.addColorStop(1, rgba('candle', 0));
  ctx.fillStyle = g; ctx.fillRect(cx - R * 0.3, cy - R * 0.3, R * 0.6, R * 0.6);
  // arms: many small, dim points spread around two log-spiral arms (soft, not a drawn line)
  for (let i = 0; i < count; i++) {
    const k = seed + i;
    const d = clamp(rand(k) ** 0.7 + (rand(k + 0.2) - 0.5) * 0.1, 0.05, 1);
    const arm = i % arms;
    const a = rot + d * 3.6 + (arm / arms) * TAU + (rand(k + 0.3) - 0.5) * 1.3 * (1.1 - d * 0.4);
    const px = Math.cos(a) * d * R, py = Math.sin(a) * d * R * ct;
    const s = glowSprite(colors[i % colors.length], 0.3);
    const r = m * (0.0025 + 0.004 * (1 - d)) * (0.6 + rand(k + 0.6) * 0.8);
    ctx.globalAlpha = ga * alpha * 0.55 * (0.3 + 0.7 * (1 - d));
    ctx.drawImage(s, cx + px - r * 2, cy + py - r * 2, r * 4, r * 4);
  }
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
}
