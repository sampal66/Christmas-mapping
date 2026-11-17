// s01 · La pared despierta (1:00). The mapping "wow": light lines trace the wall, the sideboard top, both boxes
// and the tree; footlights warm up; snow begins and spills round the corner (TREATMENT §04).
import { cueSheet, beatGrid, edgeTrace, snowfall, footlights, sparkleBurst, projectedStar, twinkleStars, boxOpen, easeInOutSine } from '../fx/index.js';
import { skyBase, outlineOf, from, beatClock } from './common.js';

const cues = [
  { t: 2, name: 'trace' },
  { t: 18, name: 'snow' },
  { t: 30, name: 'welcome' },
  { t: 40, name: 'cut' },
  { t: 56, name: 'out' },
];
// Placeholder tempo (soft intro into O Christmas Tree) until WP-05 supplies the real beat times.
const beats = { bpm: 96, perBar: 3 };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 60;

export default {
  id: 's01-wall-wakes',
  title: 's01 · La pared despierta',
  duration,
  cues,
  beats,
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', 'box1', 'box2', 'tree', 'star'],
  draw(zoneId, ctx, w, h, t, local, env) {
    // Content fades back to the bare starfield at the end (never to black).
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    // Traces settle to a softer glow once the snow is going.
    const settle = 1 - 0.35 * C.prog(local, 'snow', { after: 6 });
    const snow = B.steps(local, C.at('snow'), 12);
    const { bt, soft, pulse, bar } = beatClock(B, t - local, local);
    // Traces draw on in eased steps, one segment-push per beat.
    const trace = (delay, nBeats) => B.steps(local, C.at('trace') + delay, nBeats);
    switch (zoneId) {
      case 'wall':
        skyBase(zoneId, ctx, w, h, soft);
        edgeTrace(ctx, w, h, bt, { progress: trace(0, 9), color: 'ice', alpha: A * settle * (0.85 + 0.15 * bar), path: outlineOf(env, 0.012) });
        snowfall(ctx, w, h, soft, { density: 0.9 * snow, alpha: A });
        break;
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, soft);
        // the corner line where the two walls meet
        edgeTrace(ctx, w, h, bt, { path: [[0.06, 0], [0.06, 1]], closed: false, progress: trace(4, 5), color: 'ice', alpha: A * settle * (0.85 + 0.15 * bar) });
        snowfall(ctx, w, h, soft, { density: 0.7 * B.steps(local, C.at('snow') + 3, 12), alpha: A, layers: 2 });
        break;
      case 'backdrop': {
        // A rising shower of sparkles from both boxes on the beats of the welcome line.
        const wt = C.at('welcome');
        for (const [i, id] of ['box1', 'box2'].entries()) {
          const [x, y] = from(env, id, 0.5, 0, [0.4 + i * 0.3, 0.75]);
          sparkleBurst(ctx, w, h, local, { t0: B.nextBeat(wt + i * 0.01), x, y, up: 0.7, spread: 0.35, count: 36, colors: ['gold', 'snow', 'rose'], duration: 2.6, seed: 3 + i, alpha: A });
        }
        twinkleStars(ctx, w, h, bt, { seed: 43, density: 0.25 * snow, alpha: 0.7 * A });
        break;
      }
      case 'stage':
        edgeTrace(ctx, w, h, bt, { path: [[0, 0.5], [1, 0.5]], closed: false, progress: trace(3, 6), color: 'candle', width: h * 0.18, alpha: A * settle });
        footlights(ctx, w, h, bt, { warm: B.steps(local, 10, 15) * A * (0.85 + 0.15 * pulse), chase: 0.35, speed: 3 });
        break;
      case 'box1':
      case 'box2': {
        const i = zoneId === 'box1' ? 0 : 1;
        edgeTrace(ctx, w, h, bt, { progress: trace(5 + i * 1.2, 6), color: i ? 'plum' : 'cranberry', alpha: A });
        boxOpen(ctx, w, h, bt, { open: (0.38 + 0.1 * (i ? bar : pulse)) * C.env(local, 'welcome', 'out', 1.2, 3), color: i ? 'plum' : 'rose', alpha: A });
        break;
      }
      case 'tree':
        edgeTrace(ctx, w, h, bt, { path: outlineOf(env), progress: trace(8, 9), color: 'pine', alpha: A * settle * (0.85 + 0.15 * pulse) });
        twinkleStars(ctx, w, h, bt, { seed: 61, density: 0.9 * snow, colors: ['snow', 'gold', 'ice'], size: 1.6, alpha: (0.6 + 0.3 * pulse) * A });
        break;
      case 'star':
        projectedStar(ctx, w, h, bt, { alpha: A * (0.85 + 0.15 * bar) * (0.35 * trace(14, 4) + 0.55 * B.steps(local, C.at('welcome'), 3)) });
        break;
    }
  },
};
