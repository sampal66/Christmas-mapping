// Bursts and glows: sparkle bursts, soft fireworks (bloom + fade, never a strobe), the star halo and the
// projected star.
import { rgba } from '../palette.js';
import { TAU, rand, clamp, glowSprite, dot, additive, easeOutCubic, easeInOutSine, loopWave } from './util.js';

/**
 * Sparkle burst from a point, with short motion trails. opts: t0 (start, seconds), x, y (0..1), count,
 * colors, duration, spread (share of min(w, h)), gravity, alpha, seed, up (bias upwards, 0..1).
 */
export function sparkleBurst(ctx, w, h, t, opts = {}) {
  const { t0 = 0, x = 0.5, y = 0.5, count = 40, colors = ['gold', 'snow'], duration = 1.8, spread = 0.45,
    gravity = 0.25, alpha = 1, seed = 13, up = 0 } = opts;
  const age = t - t0;
  if (age < 0 || age > duration) return;
  const m = Math.min(w, h);
  const ox = x * w, oy = y * h;
  const fade = 1 - clamp((age - duration * 0.35) / (duration * 0.65));
  additive(ctx, alpha, () => {
    for (let i = 0; i < count; i++) {
      const k = seed * 53 + i;
      const ang = up ? -Math.PI / 2 + (rand(k) - 0.5) * TAU * (1 - up) : rand(k) * TAU;
      const sp = (0.35 + rand(k + 0.3) * 0.65) * spread * m;
      const sprite = glowSprite(colors[i % colors.length], 0.3);
      const r = m * (0.012 + rand(k + 0.6) * 0.016);
      // trail: three samples behind the head, fading
      for (let j = 2; j >= 0; j--) {
        const a2 = Math.max(0, age - j * 0.05);
        const d = easeOutCubic(clamp(a2 / duration)) * sp;
        const px = ox + Math.cos(ang) * d;
        const py = oy + Math.sin(ang) * d + gravity * m * (a2 / duration) ** 2;
        ctx.globalAlpha = alpha * fade * (j === 0 ? 1 : 0.35 / j);
        dot(ctx, sprite, px, py, r * (j === 0 ? 1 : 0.7));
      }
    }
  });
}

/**
 * Soft firework: a slow rising ember, then a bloom that ramps up over ~0.4 s and fades over ~2.4 s
 * (DESIGN_SYSTEM §06: bloom and fade ≥ 0.8 s, no strobe). opts: t0, x, y (burst point, 0..1), color,
 * color2, radius (share of min(w, h)), rise (s), alpha, seed.
 */
export function softFirework(ctx, w, h, t, opts = {}) {
  const { t0 = 0, x = 0.5, y = 0.35, color = 'gold', color2 = 'snow', radius = 0.22, rise = 1.0, alpha = 1, seed = 17 } = opts;
  const age = t - t0;
  const bloomLen = 3.0;
  if (age < 0 || age > rise + bloomLen) return;
  const m = Math.min(w, h);
  const bx = x * w, by = y * h;
  if (age < rise) {
    const p = easeInOutSine(age / rise);
    const ey = h + 10 - (h + 10 - by) * p;
    additive(ctx, alpha * 0.8, () => {
      for (let j = 0; j < 5; j++) {
        ctx.globalAlpha = alpha * 0.8 * (1 - j / 5);
        dot(ctx, glowSprite(color, 0.3), bx, ey + j * m * 0.02, m * 0.012 * (1 - j / 7));
      }
    });
    return;
  }
  const a = age - rise;
  const bloom = easeInOutSine(clamp(a / 0.4));            // gentle ramp in: never a hard flash
  const fade = 1 - easeInOutSine(clamp((a - 0.6) / (bloomLen - 0.6)));
  const R = radius * m * easeOutCubic(clamp(a / 1.6));
  const n = 40;
  additive(ctx, alpha * bloom * fade, () => {
    // soft centre glow, kept dim so the frame brightness barely moves
    // (a gradient over its bounding box: far cheaper than scaling a sprite this big)
    const Rg = Math.max(1, R * 1.1);
    const cg = ctx.createRadialGradient(bx, by, 0, bx, by, Rg);
    cg.addColorStop(0, rgba(color, 0.35));
    cg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = cg;
    ctx.fillRect(bx - Rg, by - Rg, Rg * 2, Rg * 2);
    for (let i = 0; i < n; i++) {
      const k = seed * 71 + i;
      const ang = (i / n) * TAU + rand(k) * 0.2;
      const rr = R * (0.8 + rand(k + 0.5) * 0.25);
      const droop = (a / bloomLen) ** 2 * m * 0.08;
      const sprite = glowSprite(i % 3 ? color : color2, 0.3);
      for (let j = 0; j < 2; j++) {
        const back = 1 - j * 0.14;
        ctx.globalAlpha = alpha * bloom * fade * (j ? 0.3 : 0.95);
        dot(ctx, sprite, bx + Math.cos(ang) * rr * back, by + Math.sin(ang) * rr * back + droop, m * (j ? 0.008 : 0.013));
      }
    }
  });
}

/**
 * Soft halo round the star point. opts: intensity 0..1, color, pulse (0..1 amount), period (seconds;
 * the breath divides it exactly, for seamless holds), x, y, size (share of min(w, h)).
 */
export function starHalo(ctx, w, h, t, opts = {}) {
  const { intensity = 1, color = 'gold', pulse = 0.25, period = 6, x = 0.5, y = 0.5, size = 0.5 } = opts;
  if (intensity <= 0) return;
  const breath = 1 - pulse + pulse * loopWave(t, period, 1, -Math.PI / 2);
  const m = Math.min(w, h);
  const R = m * size;
  const cx = x * w, cy = y * h;
  const g = ctx.createRadialGradient(cx, cy, R * 0.18, cx, cy, R);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.35, rgba(color, 0.55 * intensity * breath));
  g.addColorStop(0.6, rgba(color, 0.2 * intensity * breath));
  g.addColorStop(1, rgba(color, 0));
  additive(ctx, 1, () => { ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
}

/** A five-point projected star with a glow (the finale fallback, and the star before it escapes). */
export function projectedStar(ctx, w, h, t, opts = {}) {
  const { alpha = 1, color = 'gold', size = 0.36, x = 0.5, y = 0.5, spin = 0 } = opts;
  if (alpha <= 0) return;
  const m = Math.min(w, h);
  const R = m * size, r = R * 0.45;
  const cx = x * w, cy = y * h;
  additive(ctx, alpha, () => {
    ctx.globalAlpha = alpha * 0.8;
    // keep the glow inside the zone so its square edge never shows on the wall
    dot(ctx, glowSprite(color, 0.15), cx, cy, Math.min(R * 2.2, m * 0.5));
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5 + spin * Math.sin(t * 0.6) * 0.08;
      const rad = i % 2 ? r : R;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy - R * 0.2, 0, cx, cy, R);
    g.addColorStop(0, rgba('snow', 1));
    g.addColorStop(0.5, rgba(color, 1));
    g.addColorStop(1, rgba('candle', 0.9));
    ctx.fillStyle = g;
    ctx.fill();
  });
}

/**
 * A spark fountain (gerb) rising from a point on the floor line: a steady spray of short-lived sparks that arc up
 * and fall back, emitted on a fixed time grid so any frame is reproducible. opts: x, y (base, 0..1), t0, t1 (on
 * window, seconds; it ramps in and out over 0.8 s), height (share of h), spread (radians), rate (sparks/s),
 * color, color2, alpha, seed, surge (0..1 extra height on the beat).
 */
export function sparkFountain(ctx, w, h, t, opts = {}) {
  const { x = 0.5, y = 0.95, t0 = 0, t1 = 10, height = 0.35, spread = 0.28, rate = 90, color = 'gold', color2 = 'snow',
    alpha = 1, seed = 5, surge = 0 } = opts;
  if (t < t0 || t > t1 + 1.6 || alpha <= 0.01) return;
  const life = 1.5, dt = 1 / rate;
  const g = 2 * height * h / (0.6 * life) ** 2;            // apex at ≈ 0.6 of a spark's life
  const v0 = g * 0.6 * life;
  const first = Math.max(Math.ceil(t0 / dt), Math.ceil((t - life) / dt)), last = Math.floor(Math.min(t, t1) / dt);
  const sA = glowSprite(color, 0.3), sB = glowSprite(color2, 0.3);
  const m = Math.min(w, h);
  additive(ctx, alpha, () => {
    for (let k = first; k <= last; k++) {
      const te = k * dt, age = t - te;
      const ramp = Math.min(clamp((te - t0) / 0.8), clamp((t1 - te) / 0.8));
      if (ramp <= 0) continue;
      const ang = -Math.PI / 2 + (rand(seed + k * 0.37) - 0.5) * spread * 2;
      const sp = v0 * (0.75 + rand(seed + k * 0.53) * 0.35) * (1 + 0.25 * surge);
      const px = x * w + Math.cos(ang) * sp * age;
      const py = y * h + Math.sin(ang) * sp * age + 0.5 * g * age * age;
      const fade = 1 - age / life;
      ctx.globalAlpha = alpha * ramp * fade * (0.6 + 0.4 * rand(seed + k));
      dot(ctx, k % 5 ? sA : sB, px, py, m * (0.006 + 0.004 * fade));
    }
  });
}
