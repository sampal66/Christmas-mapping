// 3D fireworks made of points: shells burst as true spheres, tilted rings or drooping willows, seen through a
// perspective camera and turning slightly, so they read as objects in the sky (drone-show / real-firework look).
// Safety (DESIGN_SYSTEM §06): the bloom ramps in over 0.4 s and fades over ≥ 2.5 s; no strobe, no flash.
import { TAU, rand, clamp, glowSprite, easeInOutSine } from './util.js';

const dirCache = new Map();
function shellDirs(type, n, seed, tilt) {
  const key = `${type}|${n}|${seed}|${tilt}`;
  let d = dirCache.get(key);
  if (d) return d;
  d = new Float32Array(n * 3);
  const ga = Math.PI * (3 - Math.sqrt(5));
  const [st, ct] = [Math.sin(tilt), Math.cos(tilt)];
  for (let i = 0; i < n; i++) {
    let x, y, z;
    if (type === 'ring') {
      const a = (i / n) * TAU;
      x = Math.cos(a); y = 0; z = Math.sin(a);
      const y2 = y * ct - z * st; z = y * st + z * ct; y = y2;     // tilt the ring towards the audience
    } else {
      const yy = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - yy * yy), a = i * ga + seed;
      x = Math.cos(a) * r; y = yy; z = Math.sin(a) * r;
    }
    const sp = type === 'ring' ? 1 : 0.88 + rand(seed + i) * 0.24;
    d.set([x * sp, y * sp, z * sp], i * 3);
  }
  dirCache.set(key, d);
  return d;
}

/**
 * opts: t0 (launch), x, y (burst point, 0..1), color, color2, radius (share of min(w, h)), rise (s),
 * type ('peony' | 'ring' | 'willow' | 'double'), tilt (ring tilt, radians), spin, alpha, seed, count.
 */
export function firework3d(ctx, w, h, t, opts = {}) {
  const { t0 = 0, x = 0.5, y = 0.35, color = 'gold', color2 = 'snow', radius = 0.2, rise = 1.0, type = 'peony',
    tilt = 1.1, spin = 0.25, alpha = 1, seed = 1, count = 90 } = opts;
  const life = type === 'willow' ? 4.2 : 3.2;
  const age = t - t0;
  if (age < 0 || age > rise + life) return;
  const m = Math.min(w, h);
  const bx = x * w, by = y * h;
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter';
  if (age < rise) {
    // the shell climbing: a small ember with a short fading tail
    const p = easeInOutSine(age / rise);
    const ey = h + 10 - (h + 10 - by) * p;
    const s = glowSprite(color, 0.3);
    for (let j = 0; j < 6; j++) {
      const r = m * 0.009 * (1 - j / 8);
      ctx.globalAlpha = ga * alpha * 0.8 * (1 - j / 6);
      ctx.drawImage(s, bx - r, ey + j * m * 0.018 - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
    return;
  }
  const a = age - rise;
  const bloom = easeInOutSine(clamp(a / 0.4));
  const fade = 1 - easeInOutSine(clamp((a - 0.5) / (life - 0.5)));
  const shells = type === 'double' ? [[1, color], [0.55, color2]] : [[1, color]];
  const R = radius * m;
  const grav = (type === 'willow' ? 0.22 : 0.07) * m;
  // Rings keep facing the audience (a spun ring goes edge-on and reads as a line); spheres can turn freely.
  const rot = type === 'ring' ? (rand(seed) - 0.5) * 0.7 + 0.08 * a : spin * a + rand(seed) * TAU;
  const [sr, cr] = [Math.sin(rot), Math.cos(rot)];
  const dist = 3;
  for (const [scaleR, col] of shells) {
    const dirs = shellDirs(type === 'double' ? 'peony' : type, count, seed, tilt);
    const sCore = glowSprite(col, 0.3), sAlt = glowSprite(color2, 0.3);
    // Three samples along each point's path give it a short tail (motion trail).
    for (let k = 2; k >= 0; k--) {
      const ak = Math.max(0, a - k * 0.07);
      const ex = 1 - Math.exp(-3.2 * ak);               // fast burst, air drag slows it
      for (let i = 0; i < count; i++) {
        let dx = dirs[i * 3], dy = dirs[i * 3 + 1], dz = dirs[i * 3 + 2];
        const rx = dx * cr + dz * sr; dz = -dx * sr + dz * cr; dx = rx;   // slow spin about the vertical axis
        const f = dist / (dist + dz * 0.9);
        const px = bx + dx * R * scaleR * ex * f;
        const py = by + dy * R * scaleR * ex * f + grav * ak * ak;
        const depth = clamp(0.4 + 0.6 * (f - 0.75) / 0.5);
        const r = m * (k ? 0.006 : 0.0095) * f;
        ctx.globalAlpha = ga * alpha * bloom * fade * depth * (k ? 0.28 / k : 1);
        const sp = i % 4 === 0 ? sAlt : sCore;
        ctx.drawImage(sp, px - r, py - r, r * 2, r * 2);
      }
    }
  }
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
}
