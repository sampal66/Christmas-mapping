// s04 · Cajas mágicas (1:15). The gift boxes light face by face to the music; each one "opens" with sparkles
// (box 2 releases a jack-in-the-box spring of light); footlights chase (TREATMENT §04). Gandalf popping out of a
// box is character animation (WP-08), laid over this later.
import { cueSheet, boxFaces, boxOpen, footlights, sparkleBurst, twinkleStars, snowfall, glowStroke, additive, clamp, easeInOutSine } from '../fx/index.js';
import { from } from './common.js';

const BPM = 76;                            // placeholder tempo (Sugar Plum Fairy feel) until WP-05
const cues = [
  { t: 14, name: 'box1-open' },
  { t: 30, name: 'box2-open' },
  { t: 46, name: 'cut' },
  { t: 54, name: 'finale' },
  { t: 71, name: 'out' },
];
const C = cueSheet(cues);
const duration = 75;
const COLORS = { box1: ['plum', 'rose'], box2: ['cranberry', 'gold'] };

/** A coiled spring of light bouncing up out of a point (damped, so it settles instead of jittering). */
function lightSpring(ctx, w, h, age, x, y, alpha) {
  if (age < 0 || alpha <= 0) return;
  const k = 1 - Math.exp(-age * 2.2) * Math.cos(age * 7);  // damped overshoot → settles at 1
  const height = h * 0.28 * clamp(k, 0, 1.3);
  const coils = 7, rad = w * 0.05;
  ctx.beginPath();
  for (let i = 0; i <= coils * 16; i++) {
    const p = i / (coils * 16);
    const px = x * w + Math.sin(p * coils * Math.PI * 2) * rad;
    const py = y * h - p * height;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  additive(ctx, alpha, () => glowStroke(ctx, 'gold', Math.max(6, w / 140)));
  sparkleBurst(ctx, w, h, age, { t0: 0.35, x, y: y - height / h, count: 30, colors: ['gold', 'snow'], spread: 0.18, duration: 1.8, alpha });
}

export default {
  id: 's04-magic-boxes',
  title: 's04 · Cajas mágicas',
  duration,
  cues,
  bpm: BPM,
  zones: ['box1', 'box2', 'backdrop', 'stage'],
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = easeInOutSine(clamp(local / 2)) * (1 - easeInOutSine(C.prog(local, 'out', duration)));
    const fin = C.prog(local, 'finale', { after: 1.5 });
    switch (zoneId) {
      case 'box1':
      case 'box2': {
        const one = zoneId === 'box1';
        const openCue = one ? 'box1-open' : 'box2-open';
        const opened = local >= C.at(openCue);
        // Second sequence (box2-open → cut, skipped by the cut list): finer 3×3 grid.
        const second = local >= C.at('box2-open') + 6 && local < C.at('finale');
        boxFaces(ctx, w, h, local, {
          bpm: BPM, offset: one ? 0 : 30 / BPM,             // box 2 half a beat behind box 1
          colors: COLORS[zoneId], grid: second ? 3 : 2,
          mode: fin > 0 ? 'all' : 'cells',
          level: A * (opened ? 0.85 : 0.6 + 0.2 * clamp(local / 10)),
          seed: one ? 1 : 2,
        });
        boxOpen(ctx, w, h, local, { open: C.env(local, openCue, C.at(openCue) + 8, 0.6, 3) + 0.6 * fin, color: COLORS[zoneId][1], alpha: A });
        break;
      }
      case 'backdrop': {
        twinkleStars(ctx, w, h, t, { seed: 45, density: 0.3, alpha: 0.6 * A });
        const [x1, y1] = from(env, 'box1', 0.5, 0, [0.5, 0.8]);
        const [x2, y2] = from(env, 'box2', 0.5, 0, [0.85, 0.72]);
        sparkleBurst(ctx, w, h, local, { t0: C.at('box1-open'), x: x1, y: y1, up: 0.65, spread: 0.4, count: 48, colors: ['plum', 'rose', 'snow'], duration: 2.4, alpha: A });
        lightSpring(ctx, w, h, local - C.at('box2-open'), x2, y2, A * (1 - C.prog(local, C.at('box2-open') + 7, { after: 2 })));
        if (fin > 0) {
          snowfall(ctx, w, h, t, { color: 'gold', density: 0.35 * fin, layers: 2, alpha: A });
          // A burst above alternating boxes every two beats-ish (2.4 s): festive, well under 3 flashes/s.
          const n = Math.floor((local - C.at('finale')) / 2.4);
          for (let j = Math.max(0, n - 1); j <= n; j++) {
            const [x, y] = j % 2 ? [x2, y2] : [x1, y1];
            sparkleBurst(ctx, w, h, local, { t0: C.at('finale') + j * 2.4, x, y: y - 0.05, up: 0.5, spread: 0.3, count: 34, colors: j % 2 ? COLORS.box2 : COLORS.box1, duration: 2.2, seed: 30 + j, alpha: A });
          }
        }
        break;
      }
      case 'stage':
        footlights(ctx, w, h, local, { warm: A, chase: 0.7, speed: 5 + 5 * fin });
        break;
    }
  },
};
