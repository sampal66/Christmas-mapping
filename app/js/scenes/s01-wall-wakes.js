// s01 · La pared despierta (1:00). The mapping "wow": light lines trace the wall, the sideboard top, both boxes
// and the tree; footlights warm up; snow begins and spills round the corner (TREATMENT §04).
import { cueSheet, beatGrid, edgeTrace, edgeRunners, snowfall, footlights, sparkleBurst, projectedStar, twinkleStars, boxOpen, easeInOutSine,
  cloudScatter, cloudSnowflake, cloudStar, formation, renderCloud, sweepColors, clamp } from '../fx/index.js';
import { BEATMAPS } from './beatmaps.js';
import { skyBase, outlineOf, from, beatClock, boxFace, BOX_ZONES } from './common.js';

const cues = [
  { t: 2, name: 'trace' },
  { t: 25, name: 'snow' },          // the band swells at 0:25
  { t: 32, name: 'welcome' },
  { t: 42.5, name: 'cut' },         // second swell at 0:43
  { t: 56, name: 'out' },
];
// Real beat map (O Christmas Tree, Airmen of Note, 152 bpm 4/4): scenes/beatmaps.js. `bpm` is only the fallback.
const beats = { bpm: 152, ...BEATMAPS['s01-wall-wakes'] };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 60;

// WP-11 review (owner: s01 felt thin after the traces): once each outline is drawn, comets of light chase round it
// on the beat, and a drone swarm rises from the floor line into a turning 3D snowflake on the snow swell, becomes a
// star on the second swell, then lets go and falls as snow. Drone-show language, like s06 and s10.
const N = 640;
const SWARM = { cx: 0.66, cy: 0.3, scale: 0.27 };
let seq = null;
function sequence() {
  if (seq) return seq;
  const ground = cloudScatter(N, { w: 3.4, h: 0.15, d: 1.2, seed: 21 });
  for (let i = 0; i < N; i++) ground.p[i * 3 + 1] += 2.9;           // waiting on the floor line, below the frame
  const fall = cloudScatter(N, { w: 4.4, h: 3.2, d: 1.6, seed: 23 });
  for (let i = 0; i < N; i++) fall.p[i * 3 + 1] += 1.2;              // drifting down and out, into the snowfall
  seq = [
    { at: 0, cloud: ground },
    { at: C.at('snow') - 4, cloud: cloudSnowflake(N, { size: 1.05 }), dur: 6 },
    { at: C.at('cut'), cloud: cloudStar(N, { size: 0.95 }), dur: 4 },
    { at: C.at('out') - 6, cloud: fall, dur: 7 },
  ];
  return seq;
}

export default {
  id: 's01-wall-wakes',
  title: 's01 · La pared despierta',
  duration,
  cues,
  beats,
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', ...BOX_ZONES, 'tree', 'star'],
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
        // comets of light round the wall's edge once it is traced (two per lap, they surge on the beat)
        edgeRunners(ctx, w, h, bt, { path: outlineOf(env, 0.012), count: 3, speed: 0.045, tail: 0.07, size: 22, color: 'gold', alpha: A * B.steps(local, C.at('trace') + 6, 4) * settle });
        snowfall(ctx, w, h, soft, { density: 0.9 * snow, alpha: A });
        {
          // the drone swarm: rises (from 21 s), snowflake on the snow swell, star on the second swell, then falls as snow
          const rise = clamp((local - (C.at('snow') - 4)) / 1.5);
          if (rise > 0) {
            const star = local >= C.at('cut');
            renderCloud(ctx, w, h, bt, formation(local, sequence()), {
              ...SWARM, rotY: 0.5 * Math.sin(bt * 0.22), rotX: 0.18 * Math.sin(bt * 0.15), rotZ: star ? 0 : bt * 0.05,
              color: star ? sweepColors(['gold', 'gold', 'candle', 'snow'], bt, 0.1) : sweepColors(['ice', 'snow', 'ice', 'plum'], bt, 0.08),
              alpha: A * rise * (0.9 + 0.1 * bar), size: 1,
            });
          }
        }
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
        // (from the top of the tower, then from the big box's shoulder beside it)
        for (const [i, [id, u]] of [['box1', 0.5], ['box2', 0.95]].entries()) {
          const [x, y] = from(env, id, u, 0, [0.6 + i * 0.1, 0.55 + i * 0.2]);
          sparkleBurst(ctx, w, h, local, { t0: B.nextBeat(wt + i * 0.01), x, y, up: 0.7, spread: 0.35, count: 36, colors: ['gold', 'snow', 'rose'], duration: 2.6, seed: 3 + i, alpha: A });
        }
        twinkleStars(ctx, w, h, bt, { seed: 43, density: 0.25 * snow, alpha: 0.7 * A });
        break;
      }
      case 'stage':
        edgeTrace(ctx, w, h, bt, { path: [[0, 0.5], [1, 0.5]], closed: false, progress: trace(3, 6), color: 'candle', width: h * 0.18, alpha: A * settle });
        footlights(ctx, w, h, bt, { warm: B.steps(local, 10, 15) * A * (0.85 + 0.15 * pulse), chase: 0.35, speed: 3 });
        break;
      case 'box1': case 'box1Side': case 'box2': case 'box2Side': {
        // The tower traces from the bottom up: big box side, big front, small side, small front.
        const f = boxFace(zoneId);
        const i = (f.top ? 2 : 0) + (f.face === 'front' ? 1 : 0);
        const col = f.top ? 'cranberry' : 'plum';
        edgeTrace(ctx, w, h, bt, { progress: trace(5 + i * 0.9, 5), color: col, alpha: A * (f.face === 'side' ? 0.8 : 1) });
        edgeRunners(ctx, w, h, bt, { count: 1, speed: 0.25, tail: 0.18, color: 'snow', alpha: A * B.steps(local, C.at('trace') + 12 + i, 4) });
        boxOpen(ctx, w, h, bt, { open: (0.38 + 0.1 * (f.top ? pulse : bar)) * C.env(local, 'welcome', 'out', 1.2, 3) * (f.face === 'side' ? 0.7 : 1), color: f.top ? 'rose' : 'plum', alpha: A });
        break;
      }
      case 'tree':
        edgeTrace(ctx, w, h, bt, { path: outlineOf(env), progress: trace(8, 9), color: 'pine', alpha: A * settle * (0.85 + 0.15 * pulse) });
        edgeRunners(ctx, w, h, bt, { path: outlineOf(env), count: 3, speed: 0.11, tail: 0.1, color: 'gold', alpha: A * B.steps(local, C.at('trace') + 13, 4) });
        twinkleStars(ctx, w, h, bt, { seed: 61, density: 0.9 * snow, colors: ['snow', 'gold', 'ice'], size: 1.6, alpha: (0.6 + 0.3 * pulse) * A });
        break;
      case 'star':
        projectedStar(ctx, w, h, bt, { alpha: A * (0.85 + 0.15 * bar) * (0.35 * trace(14, 4) + 0.55 * B.steps(local, C.at('welcome'), 3)) });
        break;
    }
  },
};
