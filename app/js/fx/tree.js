// Tree effects. The tree "eats light" (DESIGN_SYSTEM §02.3): bold, saturated bands and big sparkles only.
import { rgb, rgba, SHOW_HUES } from '../palette.js';
import { TAU, rand, clamp, glowSprite, dot, additive, easeOutBack } from './util.js';

/**
 * Colour bands climbing the tree. opts: speed (cycles/s), bands, colors (tokens), hueSweep (full rainbow,
 * light-show scenes only), alpha, width (band height as a share of h), phase.
 */
export function treeWaves(ctx, w, h, t, opts = {}) {
  const { speed = 0.3, bands = 5, colors = SHOW_HUES, hueSweep = false, alpha = 1, width = 0.16, phase = 0 } = opts;
  additive(ctx, alpha, () => {
    for (let i = 0; i < bands; i++) {
      const p = ((t * speed + i / bands + phase) % 1 + 1) % 1;
      const y = h * (1.15 - p * 1.3);
      const bh = h * width;
      let mid;
      if (hueSweep) mid = `hsla(${(t * 30 + i * (360 / bands)) % 360},95%,62%,0.95)`;
      else {
        const [r, g, b] = rgb(colors[(i + Math.floor(t * speed)) % colors.length]);
        mid = `rgba(${r},${g},${b},0.95)`;
      }
      const grad = ctx.createLinearGradient(0, y - bh, 0, y + bh);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, mid);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - bh, w, bh * 2);
    }
  });
}

/**
 * Light-garland spiral wound round the cone. opts: turns, speed (turns/s), strands, colors, alpha,
 * grow 0..1 (how far up the tree it has climbed), apex [u, v], baseHalfWidth (share of w).
 */
export function spiral(ctx, w, h, t, opts = {}) {
  const { turns = 4.5, speed = 0.18, strands = 2, colors = ['gold', 'cranberry'], alpha = 1, grow = 1,
    apex = [0.5, 0.03], baseHalfWidth = 0.47 } = opts;
  const steps = 90;
  const r0 = Math.max(10, Math.min(w, h) / 40);
  additive(ctx, alpha, () => {
    for (let s = 0; s < strands; s++) {
      const sprite = glowSprite(colors[s % colors.length], 0.25);
      for (let i = 0; i <= steps; i++) {
        const k = i / steps;                              // 0 = base, 1 = apex
        if (k > grow) break;
        const v = 1 - k * (1 - apex[1]);
        const radius = baseHalfWidth * w * (v - apex[1]) / (1 - apex[1]);
        const ang = k * turns * TAU - t * speed * TAU + (s / strands) * TAU;
        const depth = Math.cos(ang);                      // > 0 = front of the tree
        ctx.globalAlpha = alpha * (0.25 + 0.75 * clamp(depth * 0.5 + 0.5));
        const x = apex[0] * w + Math.sin(ang) * radius;
        dot(ctx, sprite, x, v * h, r0 * (0.6 + 0.6 * clamp(depth * 0.5 + 0.5)));
      }
    }
  });
}

/**
 * Ornament pops on the beat: a seeded spot on the tree swells (easeOutBack) and fades over `life` seconds.
 * opts: bpm, offset, every (beats), life, colors, alpha, seed, perBeat.
 */
export function ornamentPops(ctx, w, h, t, opts = {}) {
  const { bpm = 120, offset = 0, every = 2, life = 1.2, colors = SHOW_HUES, alpha = 1, seed = 21, perBeat = 2 } = opts;
  const beatLen = (60 / bpm) * every;
  const nowN = Math.floor((t - offset) / beatLen);
  const back = Math.ceil(life / beatLen);
  const unit = Math.min(w, h) / 1024;
  additive(ctx, alpha, () => {
    for (let n = nowN - back; n <= nowN; n++) {
      if (n < 0) continue;
      const age = t - offset - n * beatLen;
      if (age < 0 || age > life) continue;
      for (let j = 0; j < perBeat; j++) {
        const k = seed * 97 + n * 7 + j;
        const v = 0.2 + rand(k) * 0.75;                   // inside the cone
        const u = 0.5 + (rand(k + 0.4) - 0.5) * 0.85 * v;
        const grow = easeOutBack(clamp(age / 0.35));
        const fade = 1 - clamp((age - 0.35) / (life - 0.35));
        ctx.globalAlpha = alpha * fade;
        dot(ctx, glowSprite(colors[(n + j) % colors.length], 0.3), u * w, v * h, 60 * unit * grow);
      }
    }
  });
}

/** Soft full-tree wash in one colour (used for the gold climax and the warm ripple). */
export function treeWash(ctx, w, h, t, opts = {}) {
  const { color = 'gold', alpha = 0.5, from = 1, to = 0 } = opts;
  const grad = ctx.createLinearGradient(0, from * h, 0, to * h);
  grad.addColorStop(0, rgba(color, alpha));
  grad.addColorStop(1, rgba(color, alpha * 0.35));
  additive(ctx, 1, () => { ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h); });
}
