// s10 · Gran final (1:30), visuals only (the pets' wave and Santa's sleigh are WP-04/08 clips laid on top).
// A warm ripple from the lit star, footlights burst, a sparkle trail where the sleigh will fly, soft fireworks,
// then the stars gather into the family constellation (from one media-pack photo, processed on the iPad) and
// "¡Feliz Navidad!". Fades to the starfield (TREATMENT §04).
import { cueSheet, beatGrid, treeWaves, treeWash, twinkleStars, firework3d, sparkleBurst, footlights, boxFaces, snowfall,
  starHalo, projectedStar, photoToConstellation, fallbackConstellation, loadFonts,
  cloudScatter, cloudConstellation, cloudHeart, cloudText, formation, renderCloud, sweepColors,
  glowSprite, dot, additive, glowStroke, easeInOutSine, clamp, rand } from '../fx/index.js';
import { SHOW_HUES } from '../palette.js';
import * as media from '../media.js';
import { skyBase, stripSnow, from, beatClock } from './common.js';

const cues = [
  { t: 0, name: 'ripple' },
  { t: 10, name: 'sleigh' },
  { t: 22, name: 'fireworks' },
  { t: 50, name: 'wave' },
  { t: 56, name: 'cut' },
  { t: 60, name: 'family-constellation' },
  { t: 72, name: 'title' },
  { t: 84, name: 'out' },
];
// Placeholder tempo (Jingle Bells, 4/4) until WP-05 supplies the real beat times.
const beats = { bpm: 120, perBar: 4 };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 90;

// Fireworks: 3D point shells (sphere, tilted ring, double, willow), launched so each bloom lands on a beat (every
// second beat, bigger ones on the downbeat), across open sky (left edge and right half; the tree is in between).
const RISE = 1.0;
const FIREWORKS = [];
for (let i = 0, n = B.at(C.at('fireworks')).n + 2; B.time(n) < C.at('wave') - 2; i++, n += 2) {
  const left = rand(i + 0.1) < 0.25;
  const down = n % B.perBar === 0;
  FIREWORKS.push({
    t0: B.time(n) - RISE, rise: RISE, seed: i,
    x: left ? 0.03 + rand(i + 0.2) * 0.12 : 0.56 + rand(i + 0.3) * 0.38,
    y: 0.14 + rand(i + 0.4) * 0.3,
    color: SHOW_HUES[i % SHOW_HUES.length],
    radius: (down ? 0.18 : 0.12) + rand(i + 0.5) * 0.07,
    type: ['peony', 'ring', 'double', 'willow'][i % 4],
    tilt: 1.0 + rand(i + 0.6) * 0.45,                 // ring seen as a tilted ellipse, never edge-on
    color2: i % 4 === 3 ? 'candle' : 'snow',
    ...(i % 4 === 3 ? { color: 'gold' } : {}),
  });
}

// Family constellation: computed once from a media-pack photo named "family…" (never leaves the device).
let family = fallbackConstellation();
let familyLoading = false;
let familyIsPhoto = false;
async function loadFamily() {
  if (familyLoading) return;
  familyLoading = true;
  try {
    const files = await media.list();
    const f = files.find((x) => /^family/i.test(x.name) && /^image\//.test(x.type));
    if (!f) return;
    const url = await media.objectUrl(f.name);
    const img = new Image();
    img.src = url;
    await img.decode();
    family = photoToConstellation(img, { points: 72 }) || family;
    familyIsPhoto = true;
    seq = null;                                   // rebuild the swarm with the photo's shape
  } catch (e) {
    console.warn('family constellation: using the fallback shape', e);
  }
}

// The closing swarm (drone-show style): sparks rise and gather into the family constellation as a turning 3D
// figure, then re-form as "¡Feliz Navidad!" written in points.
const N = 1000;
const SWARM = { cx: 0.765, cy: 0.42, scale: 0.24 };
let seq = null, seqFonts = false;
const fontsReady = () => typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';
function sequence() {
  if (seq && (seqFonts || !fontsReady())) return seq;
  seqFonts = fontsReady();
  const sparks = cloudScatter(N, { w: 3.2, h: 0.6, d: 1.4, seed: 91 });
  for (let i = 0; i < N; i++) sparks.p[i * 3 + 1] += 1.9;      // start below the formation, rising into it
  const fam = familyIsPhoto ? cloudConstellation(family, N, { size: 0.95, seed: 93 }) : cloudHeart(N, { size: 0.9, seed: 93 });
  seq = [
    { at: 0, cloud: sparks },
    { at: C.at('family-constellation'), cloud: fam, dur: 6.5 },
    { at: C.at('title'), cloud: cloudText('¡Feliz Navidad!', N, { size: 1.6 }), dur: 4.5 },
  ];
  return seq;
}

export default {
  id: 's10-finale',
  title: 's10 · Gran final',
  duration,
  cues,
  beats,
  // Live-moment fallback (TREATMENT §05): show the projected star if the real one isn't on the tree.
  options: { projectedStar: false },
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', 'box1', 'box2', 'tree', 'star'],
  enter() { loadFonts(); loadFamily(); sequence(); },
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const fw = C.env(local, 'fireworks', 'wave', 2, 3);
    const fam = B.steps(local, C.at('family-constellation'), 20);
    const { bt, soft, pulse, bar } = beatClock(B, t - local, local);
    switch (zoneId) {
      case 'wall': {
        skyBase(zoneId, ctx, w, h, soft);
        // Warm ripple rings spreading from the star, one on each of the first two downbeats.
        const [sx, sy] = from(env, 'star', 0.5, 0.5, [0.33, 0.17]);
        for (let r = 0; r < 2; r++) {
          const p = clamp((local - B.time(r * B.perBar)) / 5);
          if (p <= 0 || p >= 1) continue;
          ctx.beginPath(); ctx.arc(sx * w, sy * h, easeInOutSine(p) * w * 0.7, 0, Math.PI * 2);
          additive(ctx, A * (1 - p) * 0.7, () => glowStroke(ctx, 'candle', 10));
        }
        // Sparkle trail along the path the sleigh will fly (WP-08 lays Santa on top of it).
        const sp = C.prog(local, 'sleigh', { after: 9 });
        if (sp > 0 && sp < 1) {
          const path = (k) => [(-0.05 + k * 1.1) * w, (0.42 - Math.sin(k * Math.PI) * 0.3) * h];
          for (let j = 0; j < 26; j++) {
            const k = sp - j * 0.012;
            if (k < 0) break;
            const [x, y] = path(k);
            additive(ctx, A * (1 - j / 26), () => dot(ctx, glowSprite(j % 3 ? 'gold' : 'snow', 0.3), x, y + Math.sin(j * 1.7 + bt * 3) * 6, (j ? 12 : 26 + 10 * pulse) * (1 - j / 40)));
          }
        }
        for (const f of FIREWORKS) firework3d(ctx, w, h, local, { ...f, alpha: A });
        snowfall(ctx, w, h, soft, { density: 0.5 * B.steps(local, C.at('wave'), 8), alpha: A });
        // The swarm: sparks gather into the family constellation, then spell the greeting.
        if (fam > 0) {
          const text = local >= C.at('title');
          const settle = text ? C.prog(local, 'title', { after: 4.5 }) : 0;
          renderCloud(ctx, w, h, bt, formation(local, sequence()), {
            ...SWARM,
            // the figure turns gently; the words face the audience once formed
            rotY: (0.42 * Math.sin(bt * 0.2)) * (1 - settle) + 0.08 * Math.sin(bt * 0.3) * settle,
            rotX: 0.1 * Math.sin(bt * 0.14) * (1 - settle),
            color: text ? sweepColors(['gold', 'gold', 'snow', 'candle'], bt, 0.1, 0.35) : sweepColors(['gold', 'candle', 'rose', 'gold'], bt, 0.08),
            alpha: A * Math.min(1, fam * 4) * (0.9 + 0.1 * bar),
            size: text ? 0.85 : 1,
          });
        }
        break;
      }
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, soft);
        stripSnow(ctx, w, h, soft, 0.4 + 0.4 * B.steps(local, C.at('wave'), 8), A);
        break;
      case 'backdrop':
        // Gold sparkle snow behind the pets' wave (WP-08).
        snowfall(ctx, w, h, soft, { color: 'gold', density: 0.25 * C.env(local, 'wave', 'title', 2, 3), layers: 2, alpha: A });
        break;
      case 'stage':
        footlights(ctx, w, h, bt, { warm: A * (0.85 + 0.15 * pulse), chase: 0.5 + 0.4 * C.env(local, 'ripple', 'sleigh', 0.5, 4), speed: 2 / B.beatLen });
        break;
      case 'box1':
      case 'box2':
        boxFaces(ctx, w, h, local, { beats: B, shift: zoneId === 'box2' ? B.beatLen / 2 : 0, mode: fw > 0.5 ? 'all' : 'cells',
          colors: zoneId === 'box1' ? ['plum', 'rose'] : ['cranberry', 'gold'], level: A * (0.4 + 0.4 * fw) * (1 - 0.5 * fam), seed: 5 });
        break;
      case 'tree': {
        // A warm wave rolls down from the lit star, then gentle colour waves; quiet gold for the constellation.
        const rip = B.steps(local, C.at('ripple'), 7);
        if (rip < 1) {
          const y = easeInOutSine(rip) * 1.3 - 0.15;
          const g = ctx.createLinearGradient(0, (y - 0.15) * h, 0, (y + 0.15) * h);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(255,176,102,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          additive(ctx, A, () => { ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
        }
        treeWaves(ctx, w, h, bt - (t - local), { hueSweep: true, speed: 0.22, alpha: A * (0.6 + 0.15 * pulse) * C.prog(local, 2, 5) * (1 - 0.7 * fam) });
        if (fam > 0) treeWash(ctx, w, h, t, { color: 'gold', alpha: (0.14 + 0.06 * bar) * fam * A });
        twinkleStars(ctx, w, h, bt, { seed: 65, density: 0.8, colors: ['gold', 'snow'], size: 1.6, alpha: 0.6 * A });
        break;
      }
      case 'star': {
        const on = this.options.projectedStar;
        if (on) projectedStar(ctx, w, h, bt, { alpha: A * (0.85 + 0.15 * pulse), spin: 1 });
        starHalo(ctx, w, h, t, { intensity: A * (on ? 0.7 : 0.38) * (0.8 + 0.25 * bar), pulse: 0, size: 0.5 });
        sparkleBurst(ctx, w, h, local, { t0: 0.2, count: 26, spread: 0.7, colors: ['gold', 'candle', 'snow'], duration: 2.4, alpha: A });
        break;
      }
    }
  },
};
