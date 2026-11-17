// s01 · La pared despierta (1:00). The mapping "wow": light lines trace the wall, the sideboard top, both boxes
// and the tree; footlights warm up; snow begins and spills round the corner (TREATMENT §04).
import { cueSheet, edgeTrace, snowfall, footlights, sparkleBurst, projectedStar, twinkleStars, boxOpen, easeInOutSine } from '../fx/index.js';
import { skyBase, outlineOf, from } from './common.js';

const cues = [
  { t: 2, name: 'trace' },
  { t: 18, name: 'snow' },
  { t: 30, name: 'welcome' },
  { t: 40, name: 'cut' },
  { t: 56, name: 'out' },
];
const C = cueSheet(cues);
const duration = 60;

export default {
  id: 's01-wall-wakes',
  title: 's01 · La pared despierta',
  duration,
  cues,
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', 'box1', 'box2', 'tree', 'star'],
  draw(zoneId, ctx, w, h, t, local, env) {
    // Content fades back to the bare starfield at the end (never to black).
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    // Traces settle to a softer glow once the snow is going.
    const settle = 1 - 0.35 * C.prog(local, 'snow', { after: 6 });
    const snow = C.prog(local, 'snow', { after: 8 });
    switch (zoneId) {
      case 'wall':
        skyBase(zoneId, ctx, w, h, t);
        edgeTrace(ctx, w, h, t, { progress: C.prog(local, 'trace', { after: 6 }), color: 'ice', alpha: A * settle, path: outlineOf(env, 0.012) });
        snowfall(ctx, w, h, t, { density: 0.9 * snow, alpha: A });
        break;
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, t);
        // the corner line where the two walls meet
        edgeTrace(ctx, w, h, t, { path: [[0.06, 0], [0.06, 1]], closed: false, progress: C.prog(local, C.at('trace') + 4, { after: 3 }), color: 'ice', alpha: A * settle });
        snowfall(ctx, w, h, t, { density: 0.7 * C.prog(local, C.at('snow') + 3, { after: 8 }), alpha: A, layers: 2 });
        break;
      case 'backdrop': {
        // A rising shower of sparkles from both boxes as the welcome line lands.
        const wt = C.at('welcome');
        for (const [i, id] of ['box1', 'box2'].entries()) {
          const [x, y] = from(env, id, 0.5, 0, [0.4 + i * 0.3, 0.75]);
          sparkleBurst(ctx, w, h, local, { t0: wt + i * 0.6, x, y, up: 0.7, spread: 0.35, count: 36, colors: ['gold', 'snow', 'rose'], duration: 2.6, seed: 3 + i, alpha: A });
        }
        twinkleStars(ctx, w, h, t, { seed: 43, density: 0.25 * snow, alpha: 0.7 * A });
        break;
      }
      case 'stage':
        edgeTrace(ctx, w, h, t, { path: [[0, 0.5], [1, 0.5]], closed: false, progress: C.prog(local, C.at('trace') + 3, { after: 4 }), color: 'candle', width: h * 0.18, alpha: A * settle });
        footlights(ctx, w, h, t, { warm: C.prog(local, 10, 20) * A, chase: 0.25, speed: 3 });
        break;
      case 'box1':
      case 'box2': {
        const i = zoneId === 'box1' ? 0 : 1;
        edgeTrace(ctx, w, h, t, { progress: C.prog(local, C.at('trace') + 5 + i, { after: 3.5 }), color: i ? 'plum' : 'cranberry', alpha: A });
        boxOpen(ctx, w, h, t, { open: 0.45 * C.env(local, 'welcome', 'out', 1.2, 3) , color: i ? 'plum' : 'rose', alpha: A });
        break;
      }
      case 'tree':
        edgeTrace(ctx, w, h, t, { path: outlineOf(env), progress: C.prog(local, C.at('trace') + 8, { after: 6 }), color: 'pine', alpha: A * settle });
        twinkleStars(ctx, w, h, t, { seed: 61, density: 0.9 * snow, colors: ['snow', 'gold', 'ice'], size: 1.6, alpha: 0.8 * A });
        break;
      case 'star':
        projectedStar(ctx, w, h, t, { alpha: A * (0.35 * C.prog(local, C.at('trace') + 14, { after: 3 }) + 0.55 * C.prog(local, 'welcome', { after: 2 })) });
        break;
    }
  },
};
