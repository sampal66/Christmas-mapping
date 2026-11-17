// s09 · La estrella de verdad (live hold). The projected star bows twice and fades into a soft gold halo that
// marks where the real star goes; dim starfield; the tree zone stays dark so Papá and {BABY} aren't lit in the
// face. The timeline loops [hold-start, hold-end] until the operator taps Continue (TREATMENT §05).
// Everything inside the loop repeats with a period that divides LOOP exactly, so the seam is invisible.
import { cueSheet, beatGrid, projectedStar, starHalo, twinkleStars, easeInOutSine, prog } from '../fx/index.js';
import { skyBase } from './common.js';

const LOOP = 12;                            // seconds per loop pass = 6 bars of the 3/4 music-box loop at 90 bpm
// Placeholder tempo for the music-box loop; LOOP must stay a whole number of bars so the seam is invisible.
const beats = { bpm: 90, perBar: 3 };
const B = beatGrid(beats);
const cues = [
  { t: 0, name: 'bow' },
  { t: 8, name: 'hold' },
  { t: 8, name: 'cut' },
  { t: 8 + LOOP, name: 'out' },
];
const C = cueSheet(cues, B);
const duration = 8 + LOOP + 2;

export default {
  id: 's09-real-star',
  title: 's09 · La estrella de verdad (live)',
  duration,
  cues,
  beats,
  // Offsets within the scene; index.js turns them into a timeline hold point.
  hold: { loop: [C.at('hold'), C.at('out')] },
  zones: ['star', 'backdrop', 'rightStrip', 'wall', 'tree'],
  draw(zoneId, ctx, w, h, t, local) {
    // Loop-relative beat time: warp() advances exactly LOOP per loop pass, so periodic motion still lines up.
    const lt = B.warp(local) - B.warp(C.at('hold'));
    const bar = B.barPulse(local);           // once per bar: the halo breathes with the waltz
    // The sky dims from the full base to 75% during the bow, then stays put through the loop.
    const level = 1 - 0.25 * easeInOutSine(prog(local, 0, 6));
    switch (zoneId) {
      case 'star': {
        // Two gentle bows, one per bar (2 s each, TREATMENT §05), then the star melts into the halo.
        const bow = local < 4 ? Math.sin((local / 2) * Math.PI) ** 2 : 0;
        const starA = 1 - easeInOutSine(prog(local, 4, 7));
        projectedStar(ctx, w, h, t, { alpha: starA * (0.75 + 0.25 * bow), size: 0.36 * (1 + 0.07 * bow) });
        starHalo(ctx, w, h, lt, { intensity: (0.68 + 0.12 * bar) * easeInOutSine(prog(local, 4, 7.5)), pulse: 0, size: 0.48 });
        break;
      }
      case 'wall':
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, lt, { level, period: LOOP, stars: 0.8 });
        break;
      case 'backdrop':
        twinkleStars(ctx, w, h, lt, { seed: 49, density: 0.2, alpha: 0.5 * level, period: LOOP });
        break;
      case 'tree':
        break;                                // dark on purpose
    }
  },
};
