// s06 · Constelaciones (1:30). The whole wall becomes a starry sky; a swarm of star points forms the constellations
// as turning 3D figures (Orion, Canis Major and Minor, Felis), then the lost star, which slips away; slow shooting
// stars; snow on the right wall (TREATMENT §04). The pets-as-constellation smiles are WP-08.
import { cueSheet, beatGrid, twinkleStars, shootingStars, starHalo, glowSprite, dot, additive, sparkleBurst,
  cloudScatter, cloudConstellation, cloudGroup, cloudStar, formation, renderCloud, sweepColors,
  ORION, CANIS_MAJOR, CANIS_MINOR, FELIS, easeInOutSine, clamp } from '../fx/index.js';
import { skyBase, stripSnow, beatClock } from './common.js';

const cues = [
  { t: 0, name: 'sky' },
  { t: 8, name: 'orion' },
  { t: 28, name: 'canis' },
  { t: 46, name: 'felis' },
  { t: 64, name: 'cut' },
  { t: 70, name: 'glint' },
  { t: 86, name: 'out' },
];
// Placeholder tempo (Waltz of the Flowers, 3/4) until WP-05 supplies the real beat times.
const beats = { bpm: 168, perBar: 3 };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 90;

// The constellations are a drone swarm: one set of light points that gathers out of the sky into Orion, re-forms
// as Canis Major + Minor, then Felis, then the lost star, which slips away at the glint. Each shape is a real 3D
// figure turning slowly. Placed on the open right half of the wall (the tree covers u 0.17–0.5 lower down).
const N = 700;
const SWARM = { cx: 0.765, cy: 0.38, scale: 0.3 };
const NORTH_STAR = [0.5, 0.06];
let seq = null;
function sequence() {
  if (seq) return seq;
  // starts spread across the whole sky, so the stars visibly gather into the first figure
  const sky = cloudScatter(N, { w: 6.5, h: 3.4, d: 2, seed: 31 });
  const orion = cloudConstellation(ORION, N, { size: 1.05, seed: 41 });
  const canis = cloudGroup([{ shape: CANIS_MAJOR, x: -0.2, y: 0.22, size: 0.78 }, { shape: CANIS_MINOR, x: 0.62, y: -0.62, size: 0.32 }], N, 51);
  const felis = cloudConstellation(FELIS, N, { size: 1.05, seed: 61 });
  const star = cloudStar(N, { size: 0.8, seed: 71 });
  seq = [
    { at: 0, cloud: sky },
    { at: C.at('orion'), cloud: orion, dur: 7 },
    { at: C.at('canis'), cloud: canis, dur: 7 },
    { at: C.at('felis'), cloud: felis, dur: 7 },
    { at: C.at('cut'), cloud: star, dur: 5.5 },
  ];
  return seq;
}

export default {
  id: 's06-constellations',
  title: 's06 · Constelaciones',
  duration,
  cues,
  beats,
  zones: ['wall', 'backdrop', 'tree', 'star', 'rightStrip'],
  enter() { sequence(); },
  draw(zoneId, ctx, w, h, t, local) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const sky = B.steps(local, C.at('sky'), 15);
    const { bt, soft, bar } = beatClock(B, t - local, local);
    switch (zoneId) {
      case 'wall': {
        skyBase(zoneId, ctx, w, h, soft);
        // the sky breathes once per bar (the waltz's ONE-two-three)
        twinkleStars(ctx, w, h, bt, { seed: 81, density: 1.1 * sky, alpha: A * (0.8 + 0.2 * bar), size: 0.9 });
        // The swarm. Constellations turn gently (they're 3D figures); the star spins as it leaves.
        const cloud = formation(local, sequence());
        const g = C.since(local, 'glint');
        const away = g > 0 ? easeInOutSine(B.steps(local, C.at('glint') + 1.5, 26)) : 0;
        const isStar = local >= C.at('cut');
        renderCloud(ctx, w, h, bt, cloud, {
          cx: SWARM.cx + away * 0.42, cy: SWARM.cy - away * 0.3, scale: SWARM.scale * (1 - 0.82 * away),
          rotY: isStar ? 0.5 * Math.sin(bt * 0.25) + away * 4 : 0.45 * Math.sin(bt * 0.16),
          rotX: 0.14 * Math.sin(bt * 0.12),
          color: isStar ? sweepColors(['gold', 'candle', 'gold', 'snow'], bt, 0.12) : sweepColors(['snow', 'ice', 'snow', 'plum'], bt, 0.08),
          alpha: A * (local < C.at('orion') ? 0.55 * sky : 1) * (0.88 + 0.12 * bar) * (1 - clamp((g - 10) / 3)),
          size: isStar ? 1.15 : 1,
        });
        // The North Star, steady.
        additive(ctx, A * sky * (0.8 + 0.2 * bar), () => dot(ctx, glowSprite('snow', 0.2), NORTH_STAR[0] * w, NORTH_STAR[1] * h, Math.min(w, h) * 0.035));
        // a shooting star every 6 bars, launched on the downbeat
        if (local > C.at('orion')) shootingStars(ctx, w, h, local - B.time(0), { every: 6 * B.perBar * B.beatLen, dur: B.perBar * B.beatLen * 1.5, seed: 5, alpha: 0.8 * A, area: [0.5, 0, 1, 0.5] });
        break;
      }
      case 'backdrop':
        twinkleStars(ctx, w, h, bt, { seed: 47, density: 0.25 * sky, colors: ['ice', 'snow'], alpha: 0.6 * A });
        break;
      case 'tree':
        twinkleStars(ctx, w, h, bt, { seed: 63, density: 0.7 * sky, colors: ['snow', 'ice', 'gold'], size: 1.5, alpha: (0.45 + 0.2 * bar) * A });
        break;
      case 'star': {
        // The star is gone (s03); a faint gold breath answers the glint: hope.
        starHalo(ctx, w, h, t, { intensity: (0.25 + 0.1 * bar) * C.env(local, 'glint', 'out', 2, 3) * A, pulse: 0, size: 0.45 });
        sparkleBurst(ctx, w, h, local, { t0: C.at('glint') + 0.5, count: 18, spread: 0.6, colors: ['gold'], duration: 2.2, alpha: 0.6 * A });
        break;
      }
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, soft);
        stripSnow(ctx, w, h, soft, 0.6 * sky + 0.2, A);
        break;
    }
  },
};
