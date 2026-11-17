// s06 · Constelaciones (1:30). The whole wall becomes a starry sky; constellations draw themselves star by star
// (Orion, Canis Major and Minor, Felis); a gold glint by the North Star slips away; slow shooting stars; snow on
// the right wall (TREATMENT §04). The pets-as-constellation smiles are WP-08.
import { cueSheet, beatGrid, constellation, twinkleStars, shootingStars, starHalo, glowSprite, dot, additive, sparkleBurst,
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
// Constellations draw on the beat: a star (or a line) every second beat.
const drawOn = (local, cue, shape) => B.steps(local, cue, 2 * (shape.stars.length + shape.lines.length));
const duration = 90;

// Placement on the wall (0..1 of the wall zone). The tree covers roughly u 0.17–0.5 below v 0.27 and the
// star sits near u 0.26–0.41 at the top, so the shapes live on the open left edge and the right half.
const BOXES = {
  orion: [0.56, 0.06, 0.78, 0.62],
  cma: [0.80, 0.34, 0.99, 0.74],
  cmi: [0.80, 0.04, 0.97, 0.24],
  felis: [0.005, 0.03, 0.19, 0.33],
};
const NORTH_STAR = [0.5, 0.06];

export default {
  id: 's06-constellations',
  title: 's06 · Constelaciones',
  duration,
  cues,
  beats,
  zones: ['wall', 'backdrop', 'tree', 'star', 'rightStrip'],
  draw(zoneId, ctx, w, h, t, local) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const sky = B.steps(local, C.at('sky'), 15);
    const { bt, soft, bar } = beatClock(B, t - local, local);
    switch (zoneId) {
      case 'wall': {
        skyBase(zoneId, ctx, w, h, soft);
        // the sky breathes once per bar (the waltz's ONE-two-three)
        twinkleStars(ctx, w, h, bt, { seed: 81, density: 1.1 * sky, alpha: A * (0.8 + 0.2 * bar), size: 0.9 });
        // Orion stays (dimmed) after the cut; Canis and Felis fade out just before it, so jumping to `cut`
        // never pops them on.
        const dim = 1 - 0.55 * C.prog(local, 'cut', { after: 3 });
        const leave = 1 - C.prog(local, C.at('cut') - 3, 'cut');
        constellation(ctx, w, h, bt, { ...ORION, box: BOXES.orion, progress: drawOn(local, C.at('orion'), ORION), alpha: A * dim, lineColor: 'ice', seed: 1 });
        constellation(ctx, w, h, bt, { ...CANIS_MAJOR, box: BOXES.cma, progress: drawOn(local, C.at('canis'), CANIS_MAJOR), alpha: A * leave, lineColor: 'ice', seed: 2 });
        constellation(ctx, w, h, bt, { ...CANIS_MINOR, box: BOXES.cmi, progress: drawOn(local, C.at('canis') + 6, CANIS_MINOR), alpha: A * leave, lineColor: 'ice', seed: 3 });
        constellation(ctx, w, h, bt, { ...FELIS, box: BOXES.felis, progress: drawOn(local, C.at('felis'), FELIS), alpha: A * leave, lineColor: 'plum', seed: 4 });
        // The North Star, steady, and the gold glint that slips away from it (the lost star, off to the right).
        additive(ctx, A * sky * (0.8 + 0.2 * bar), () => dot(ctx, glowSprite('snow', 0.2), NORTH_STAR[0] * w, NORTH_STAR[1] * h, Math.min(w, h) * 0.035));
        const g = C.since(local, 'glint');
        if (g >= 0) {
          const p = easeInOutSine(B.steps(local, C.at('glint') + 2, 24));   // glides away in beat-steps
          const gx = (NORTH_STAR[0] + 0.04 + p * 0.6) * w, gy = (NORTH_STAR[1] + 0.03 + Math.sin(p * Math.PI) * 0.08) * h;
          const a = A * clamp(g / 1.5) * (1 - clamp((g - 10) / 3));
          additive(ctx, a, () => dot(ctx, glowSprite('gold', 0.25), gx, gy, Math.min(w, h) * (0.03 + 0.012 * bar)));
          for (let j = 1; j <= 6; j++) {
            const pj = easeInOutSine(B.steps(local - j * 0.12, C.at('glint') + 2, 24));
            additive(ctx, a * (1 - j / 7) * 0.6, () => dot(ctx, glowSprite('gold', 0.3),
              (NORTH_STAR[0] + 0.04 + pj * 0.6) * w, (NORTH_STAR[1] + 0.03 + Math.sin(pj * Math.PI) * 0.08) * h, Math.min(w, h) * 0.012));
          }
        }
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
