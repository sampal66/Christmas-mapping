// s02 · El árbol cobra vida (1:30). The tree is the light-show star: colour waves on the beat, ornament pops,
// a spiral garland, and the star glowing gold at the climax. Soft colour echo on the wall (TREATMENT §04).
import { cueSheet, treeWaves, ornamentPops, spiral, treeWash, twinkleStars, starHalo, projectedStar, additive, easeInOutSine } from '../fx/index.js';
import { SHOW_HUES, mix } from '../palette.js';
import { skyBase, from } from './common.js';

const BPM = 132;                           // placeholder tempo until the real recording (WP-05)
const cues = [
  { t: 0, name: 'build' },
  { t: 20, name: 'drop' },
  { t: 40, name: 'spiral' },
  { t: 62, name: 'cut' },
  { t: 70, name: 'star-glow' },
  { t: 86, name: 'out' },
];
const C = cueSheet(cues);
const duration = 90;

export default {
  id: 's02-tree-alive',
  title: 's02 · El árbol cobra vida',
  duration,
  cues,
  bpm: BPM,
  zones: ['tree', 'star', 'wall'],
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const build = C.prog(local, 'build', 'drop');
    const drop = C.prog(local, 'drop', { after: 1.5 });
    const glow = C.prog(local, 'star-glow', { after: 4 });
    if (zoneId === 'tree') {
      const wavesA = A * (0.25 + 0.55 * build + 0.2 * drop) * (1 - 0.4 * C.prog(local, 'spiral', { after: 4 })) * (1 - 0.5 * glow);
      treeWaves(ctx, w, h, local, {
        speed: 0.18 + 0.12 * build + 0.15 * drop,
        hueSweep: local >= C.at('drop') && local < C.at('star-glow'),
        colors: ['gold', 'cranberry', 'pine', 'ice'],
        alpha: wavesA,
      });
      if (local >= C.at('drop')) {
        ornamentPops(ctx, w, h, local, { bpm: BPM, offset: C.at('drop'), every: 2, alpha: A * drop * (1 - 0.6 * glow) });
      }
      spiral(ctx, w, h, local, {
        grow: C.prog(local, 'spiral', { after: 6 }),
        colors: glow > 0 ? ['gold', 'snow'] : ['gold', 'cranberry'],
        alpha: A * (0.6 + 0.4 * glow),
      });
      if (glow > 0) {
        treeWash(ctx, w, h, t, { color: 'gold', alpha: 0.32 * glow * A });
        twinkleStars(ctx, w, h, t, { seed: 71, density: 1.6, colors: ['gold', 'snow'], size: 1.8, alpha: glow * A });
      }
    } else if (zoneId === 'star') {
      projectedStar(ctx, w, h, t, { alpha: A * (0.4 + 0.2 * drop + 0.4 * glow), spin: 1 });
      starHalo(ctx, w, h, t, { intensity: A * glow, period: 4, size: 0.5 });
    } else if (zoneId === 'wall') {
      skyBase(zoneId, ctx, w, h, t);
      // Soft coloured echo round the tree (the tree zone itself sits on top and blacks out the middle).
      const [x, y] = from(env, 'tree', 0.5, 0.6, [0.3, 0.6]);
      // During the drop the echo cross-fades through the show hues; otherwise it stays gold.
      const sweep = local >= C.at('drop') && glow === 0;
      const k = local * 0.4, i = Math.floor(k), f = k - i;
      const R = Math.min(w, h) * 0.55;
      // A radial gradient over just its bounding box: much cheaper than scaling a sprite up this far.
      const [ca, cb, k2] = sweep ? [SHOW_HUES[i % SHOW_HUES.length], SHOW_HUES[(i + 1) % SHOW_HUES.length], f] : ['gold', 'gold', 0];
      const cx = x * w, cy = y * h;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, mix(ca, cb, k2, 0.9));
      g.addColorStop(1, mix(ca, cb, k2, 0));
      additive(ctx, A * (0.1 + 0.12 * drop + 0.1 * glow), () => { ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); });
    }
  },
};
