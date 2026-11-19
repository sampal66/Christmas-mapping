// Right-wall strip motions (WP-13a, WP-12 P1): one calm, music-led motion per scene on the narrow strip round the
// corner, so the picture wraps the room instead of leaving plain sky there. Each draws on top of the strip's sky
// base. The strip canvas is tall and narrow with non-square pixels, so shapes are drawn through `squash` (x scaled by
// the zone's pixel aspect) to keep their proportions.
import { rgba, mix } from '../palette.js';
import { TAU, rand, clamp, easeInOutSine, glowSprite, dot, additive } from './util.js';
import { drawToy, TOY_NAMES } from './toys.js';
import { aurora } from './cosmos.js';

/** Pixel aspect of a zone (height-per-pixel ÷ width-per-pixel, from its quad): x sizes are multiplied by it. */
export function pixelAspect(env, w, h) {
  const q = env?.zone?.quad;
  if (!q) return 1;
  const sx = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) / w;
  const sy = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]) / h;
  return sx > 0 && sy > 0 ? sy / sx : 1;
}

function squash(ctx, x, y, k, fn) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, 1); fn(); ctx.restore();
}

/** s02: sparkles drifting slowly up the strip; `t` is the beat clock, so they surge a little on each beat. */
export function stripSparkleDrift(ctx, w, h, t, { alpha = 1, colors = ['gold', 'snow', 'ice'], density = 1, k = 1 } = {}) {
  const n = Math.round(26 * density);
  additive(ctx, alpha, () => {
    for (let i = 0; i < n; i++) {
      const sp = 0.035 + rand(i + 0.3) * 0.05;                         // share of the height per second
      const v = 1.05 - ((rand(i + 0.1) + t * sp) % 1) * 1.1;
      const u = 0.12 + rand(i + 0.2) * 0.8 + 0.04 * Math.sin(t * 0.5 + i);
      const tw = 0.55 + 0.45 * Math.sin(t * (1.1 + rand(i + 0.4)) + i * 2.3);
      const edge = clamp(v / 0.15) * clamp((1 - v) / 0.15);              // fade in at the bottom, out at the top
      ctx.globalAlpha = alpha * tw * edge;
      const r = h * (0.008 + rand(i + 0.5) * 0.012);
      squash(ctx, u * w, v * h, k, () => dot(ctx, glowSprite(colors[i % colors.length], 0.3), 0, 0, r));
    }
  });
}

/**
 * s03: a falling star streaks down across the strip and leaves a sparkle trail that lingers and fades.
 * age = seconds since it starts; it crosses in `dur` s, and the trail is gone `linger` s later.
 */
export function stripFallingStar(ctx, w, h, age, { alpha = 1, dur = 2.6, linger = 4, k = 1 } = {}) {
  if (age < 0 || age > dur + linger) return;
  const path = (p) => [(0.85 - 0.6 * p) * w, (0.06 + 0.78 * easeInOutSine(p) ** 1.1) * h];
  const head = clamp(age / dur);
  additive(ctx, alpha, () => {
    const sp = glowSprite('gold', 0.3), sn = glowSprite('snow', 0.3);
    for (let j = 0; j < 40; j++) {
      const p = (j / 40) * head;
      const since = age - p * dur;                                        // seconds since the head passed here
      const fade = clamp(1 - since / linger);
      if (fade <= 0) continue;
      const [x, y] = path(p);
      ctx.globalAlpha = alpha * 0.7 * fade;
      const jx = Math.sin(j * 1.9 + age * 2) * w * 0.03;
      squash(ctx, x + jx, y + since * h * 0.02, k, () => dot(ctx, j % 3 ? sp : sn, 0, 0, h * 0.007 * (0.6 + fade)));
    }
    if (head < 1) {
      const [x, y] = path(head);
      ctx.globalAlpha = alpha;
      squash(ctx, x, y, k, () => { dot(ctx, glowSprite('candle', 0.12), 0, 0, h * 0.05); dot(ctx, sn, 0, 0, h * 0.018); });
    }
  });
}

/** s04: a soft rain of small toys sliding slowly down the strip, turning gently. `level` 0..1 sets how many fall. */
export function stripToyRain(ctx, w, h, t, { alpha = 1, level = 1, k = 1 } = {}) {
  const n = Math.round(9 * level);
  for (let i = 0; i < n; i++) {
    const sp = 0.07 + rand(i + 0.7) * 0.05;
    const v = ((rand(i + 0.1) + t * sp) % 1) * 1.2 - 0.1;
    const u = 0.2 + rand(i + 0.2) * 0.6 + 0.06 * Math.sin(t * 0.6 + i * 1.7);
    const size = h * (0.045 + rand(i + 0.3) * 0.02);
    const name = TOY_NAMES[Math.floor(rand(i + 0.4) * TOY_NAMES.length)];
    squash(ctx, u * w, v * h, k, () => drawToy(ctx, name, 0, 0, size, Math.sin(t * 0.8 + i) * 0.5, alpha));
  }
}

/** One stocking hanging from (0, 0), about `s` px tall, toe pointing right; drawn in the current transform. */
function stocking(ctx, s, color, alpha) {
  const L = s, W = s * 0.38;
  ctx.beginPath();
  ctx.moveTo(-W / 2, s * 0.16);
  ctx.lineTo(-W / 2, L * 0.78);
  ctx.quadraticCurveTo(-W / 2, L, W * 0.1, L);                     // heel
  ctx.lineTo(W * 0.9, L);
  ctx.quadraticCurveTo(W * 1.25, L * 0.86, W * 0.75, L * 0.72);     // toe
  ctx.lineTo(W / 2, L * 0.72);
  ctx.lineTo(W / 2, s * 0.16);
  ctx.closePath();
  ctx.fillStyle = rgba(color, 0.8 * alpha); ctx.fill();
  ctx.strokeStyle = rgba('gold', 0.5 * alpha); ctx.lineWidth = Math.max(1.5, s * 0.025); ctx.stroke();
  // white cuff and a loop to hang it by
  ctx.fillStyle = rgba('snow', 0.85 * alpha);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-W * 0.6, 0, W * 1.2, s * 0.18, s * 0.05); else ctx.rect(-W * 0.6, 0, W * 1.2, s * 0.18);
  ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, s * 0.04, 0, TAU); ctx.strokeStyle = rgba('gold', 0.8 * alpha); ctx.stroke();
}

/**
 * s05: stockings hanging from two garlands that sway gently, and swing harder (then settle) when the jingle plays.
 * jingle = seconds since the jingle cue (negative before it).
 */
export function stripStockings(ctx, w, h, t, { alpha = 1, jingle = -1, k = 1 } = {}) {
  if (alpha <= 0.01) return;
  const kick = jingle >= 0 ? Math.exp(-jingle / 2.2) * clamp(jingle / 0.4) : 0;
  const rows = [
    { v: 0.14, items: [[0.3, 'cranberry'], [0.72, 'pine']] },
    { v: 0.5, items: [[0.22, 'plum'], [0.62, 'cranberry']] },
  ];
  rows.forEach((row, r) => {
    // the garland: a soft gold swag with tiny lights
    const y0 = row.v * h, sag = h * 0.04;
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.quadraticCurveTo(w / 2, y0 + sag * 2, w, y0);
    ctx.strokeStyle = mix('night', 'pine', 0.55, alpha); ctx.lineWidth = Math.max(3, h * 0.008); ctx.stroke();
    additive(ctx, alpha * 0.8, () => {
      for (let i = 0; i <= 6; i++) {
        const u = i / 6, y = y0 + sag * 4 * u * (1 - u);
        ctx.globalAlpha = alpha * 0.8 * (0.6 + 0.4 * Math.sin(t * 1.2 + i * 1.7 + r));
        squash(ctx, u * w, y, k, () => dot(ctx, glowSprite(i % 2 ? 'gold' : 'candle', 0.3), 0, 0, h * 0.008));
      }
    });
    row.items.forEach(([u, color], i) => {
      const y = y0 + sag * 4 * u * (1 - u);
      const ph = i * 1.3 + r * 2.1;
      const ang = 0.05 * Math.sin(t * 0.9 + ph) + 0.35 * kick * Math.sin(jingle * 5.2 + ph);
      ctx.save(); ctx.translate(u * w, y); ctx.scale(k, 1); ctx.rotate(ang);
      stocking(ctx, h * 0.17, color, alpha);
      ctx.restore();
    });
  });
}

/**
 * s07: the star's path home: a dotted trail of small lights curving down the strip toward the corner (and the tree
 * beyond it). `fill` 0..1 lights it from the top; once full, a soft spark glides along it every few seconds.
 */
export function stripStarPath(ctx, w, h, t, { alpha = 1, fill = 1, k = 1 } = {}) {
  if (alpha <= 0.01 || fill <= 0) return;
  const path = (p) => [(0.82 - 0.76 * p + 0.18 * Math.sin(p * Math.PI * 1.5)) * w, (0.08 + 0.62 * p) * h];
  const N = 22;
  additive(ctx, alpha, () => {
    const g = glowSprite('gold', 0.3);
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const on = clamp((fill * 1.15 - p) / 0.15);
      if (on <= 0) continue;
      const [x, y] = path(p);
      ctx.globalAlpha = alpha * on * (0.6 + 0.2 * Math.sin(t * 1.4 + i * 0.9));
      squash(ctx, x, y, k, () => dot(ctx, g, 0, 0, h * 0.009));
    }
    if (fill >= 1) {
      const p = ((t / 6) % 1);
      const [x, y] = path(p);
      ctx.globalAlpha = alpha * Math.sin(Math.PI * p);
      squash(ctx, x, y, k, () => { dot(ctx, glowSprite('candle', 0.15), 0, 0, h * 0.03); dot(ctx, glowSprite('snow', 0.3), 0, 0, h * 0.01); });
    }
  });
}

/** s08: a slow aurora curtain filling the strip. */
export function stripAurora(ctx, w, h, t, { alpha = 1 } = {}) {
  aurora(ctx, w, h, t * 0.5, { alpha, colors: ['pine', 'ice', 'plum'], top: 0.04, height: 0.62, area: [0, 1] });
}
