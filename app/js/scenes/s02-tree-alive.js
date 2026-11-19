// s02 · El árbol cobra vida (1:30). The tree is the light-show star: a turning 3D mega-tree of light points running
// pro light-show patterns on the beat (rings, candy-cane bars, shockwaves, helix, meteors, galaxy, plasma), ornament
// pops, and the star glowing gold at the climax. Soft colour echo on the wall (TREATMENT §04).
import { cueSheet, beatGrid, megaTree, ornamentPops, starHalo, projectedStar, additive, easeInOutSine } from '../fx/index.js';
import { SHOW_HUES, mix } from '../palette.js';
import { BEATMAPS } from './beatmaps.js';
import { skyBase, from, beatClock } from './common.js';
import { stripSparkleDrift, pixelAspect } from '../fx/strip.js';

const cues = [
  { t: 0, name: 'build' },
  { t: 17.9, name: 'drop' },        // first full-band peak (0:18)
  { t: 35.9, name: 'spiral' },      // second build after the quiet verse
  { t: 51.3, name: 'cut' },         // just before the climax (cut list: skips ≈0:35)
  { t: 55.7, name: 'star-glow' },   // loudest bar of the excerpt (0:56)
  { t: 79.6, name: 'out' },         // section ends at 1:22; the mix fades here

];
// Real beat map (Carol of the Bells, USAF Band of the Rockies, ≈130 bpm 3/4): scenes/beatmaps.js.
const beats = { bpm: 130, ...BEATMAPS['s02-tree-alive'] };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 84;

export default {
  id: 's02-tree-alive',
  title: 's02 · El árbol cobra vida',
  duration,
  cues,
  beats,
  zones: ['tree', 'star', 'wall', 'rightStrip'],
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const build = C.prog(local, 'build', 'drop');
    const drop = C.prog(local, 'drop', { after: 1.5 });
    const glow = B.steps(local, C.at('star-glow'), 9);
    const { bt, soft, pulse, bar } = beatClock(B, t - local, local);
    if (zoneId === 'tree') {
      // The tree as a turning 3D mega-tree of light points. Sections cross-fade over ~1.5 s:
      //   build: twinkle + slow rising rings · drop: candy-cane bars spinning, a shockwave from the tip every bar
      //   spiral: rainbow helix + falling meteors · cut: galaxy swirl · star-glow: flowing gold plasma + sparkle
      const sec = (a2, b2) => C.env(local, a2, b2, 1.5, 1.5);
      const spin = (bt - (t - local)) * (local < C.at('drop') ? 0.25 : 0.55);   // the tree turns, faster after the drop
      const lt = bt - (t - local);
      const layers = [
        { pattern: 'twinkle', colors: ['gold', 'snow', 'ice'], alpha: (0.35 + 0.5 * build) * (1 - 0.7 * drop) + 0.5 * glow },
        { pattern: 'rings', params: { count: 3, speed: -0.25, width: 0.25 }, colors: ['gold', 'cranberry', 'pine', 'ice'], alpha: build * sec('build', 'drop') * (0.85 + 0.15 * pulse) },
        { pattern: 'bars', params: { count: 6, twist: 0.45, speed: 0.5 }, colors: ['cranberry', 'snow', 'pine', 'snow'], alpha: sec('drop', 'spiral') * (0.85 + 0.15 * pulse) },
        { pattern: 'helix', params: { count: 3, turns: 2.5, speed: 0.35, width: 0.16 }, colors: ['gold', 'rose', 'ice', 'pine', 'plum', 'cranberry'], alpha: sec('spiral', 'star-glow') * (0.85 + 0.15 * pulse) },
        { pattern: 'meteors', params: { count: 16, speed: 0.9 }, colors: ['snow', 'ice'], alpha: 0.7 * sec('spiral', 'cut') },
        { pattern: 'galaxy', params: { count: 3, twist: 2.4, speed: 0.35 }, colors: ['plum', 'ice', 'gold'], alpha: sec('cut', 'star-glow') },
        { pattern: 'plasma', colors: ['gold', 'candle', 'gold', 'snow'], alpha: glow * (0.75 + 0.25 * bar) },
      ];
      // A shockwave from the tip on every downbeat during the drop (pattern time = scene time, so it lands on the bar).
      if (local >= C.at('drop') && local < C.at('spiral') + 2) {
        const { bar: barN } = B.at(local);
        for (let j = Math.max(B.at(C.at('drop')).bar, barN - 1); j <= barN; j++) {
          layers.push({ pattern: 'shockwave', t: local, params: { t0: B.time(j * B.perBar), u0: 0, k0: 0, speed: 0.75, width: 0.07, life: 2 }, colors: ['gold'], alpha: sec('drop', 'spiral') });
        }
      }
      megaTree(ctx, w, h, lt, { layers, spin, alpha: A });
      if (local >= C.at('drop')) {
        ornamentPops(ctx, w, h, local, { grid: B, from: C.at('drop'), every: 2, perBeat: 1, alpha: 0.7 * A * drop * (1 - 0.6 * glow) });
      }
    } else if (zoneId === 'star') {
      projectedStar(ctx, w, h, bt, { alpha: A * (0.4 + 0.2 * drop + 0.4 * glow) * (0.85 + 0.15 * pulse), spin: 1 });
      starHalo(ctx, w, h, t, { intensity: A * glow * (0.75 + 0.25 * bar), pulse: 0, size: 0.5 });
    } else if (zoneId === 'rightStrip') {
      // WP-13a: sparkles drift slowly up round the corner, brighter after the drop, gold at the star's glow.
      skyBase(zoneId, ctx, w, h, soft);
      stripSparkleDrift(ctx, w, h, bt, { alpha: A * (0.45 + 0.3 * drop + 0.25 * glow) * (0.9 + 0.1 * bar),
        colors: glow > 0.5 ? ['gold', 'candle', 'snow'] : ['gold', 'snow', 'ice'], k: pixelAspect(env, w, h) });
    } else if (zoneId === 'wall') {
      skyBase(zoneId, ctx, w, h, soft);
      // Soft coloured echo round the tree (the tree zone itself sits on top and blacks out the middle).
      const [x, y] = from(env, 'tree', 0.5, 0.6, [0.3, 0.6]);
      // During the drop the echo cross-fades through the show hues; otherwise it stays gold.
      const sweep = local >= C.at('drop') && glow === 0;
      // one hue per bar, cross-fading in a surge on the downbeat
      const { bar: barN, barPhase } = B.at(local);
      const i = barN, f = Math.min(1, barPhase * 3) ** 0.5;
      const R = Math.min(w, h) * 0.55;
      // A radial gradient over just its bounding box: much cheaper than scaling a sprite up this far.
      const [ca, cb, k2] = sweep ? [SHOW_HUES[i % SHOW_HUES.length], SHOW_HUES[(i + 1) % SHOW_HUES.length], f] : ['gold', 'gold', 0];
      const cx = x * w, cy = y * h;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, mix(ca, cb, k2, 0.9));
      g.addColorStop(1, mix(ca, cb, k2, 0));
      additive(ctx, A * (0.1 + 0.12 * drop + 0.1 * glow) * (0.8 + 0.2 * bar), () => { ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); });
    }
  },
};
