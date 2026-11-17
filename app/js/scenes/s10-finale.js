// s10 · Gran final (1:30), visuals only (the pets' wave and Santa's sleigh are WP-04/08 clips laid on top).
// A warm ripple from the lit star, footlights burst, a sparkle trail where the sleigh will fly, soft fireworks,
// then the stars gather into the family constellation (from one media-pack photo, processed on the iPad) and
// "¡Feliz Navidad!". Fades to the starfield (TREATMENT §04).
import { cueSheet, beatGrid, megaTree, firework3d, sparkleBurst, footlights, boxFaces, snowfall,
  starHalo, projectedStar, photoToConstellation, fallbackConstellation, loadFonts,
  cloudScatter, cloudConstellation, cloudHeart, cloudText, formation, renderCloud, sweepColors,
  glowSprite, dot, additive, glowStroke, easeInOutSine, clamp, rand, sparkFountain } from '../fx/index.js';
import { SHOW_HUES } from '../palette.js';
import * as media from '../media.js';
import { BEATMAPS } from './beatmaps.js';
import { skyBase, stripSnow, from, beatClock, boxFace, BOX_ZONES } from './common.js';

const cues = [
  // Stretched (×1.3) to the whole Jingle Bells track (ends ≈1:51) so the music is never cut mid-phrase.
  { t: 0, name: 'ripple' },
  { t: 13, name: 'sleigh' },
  { t: 28.5, name: 'fireworks' },
  { t: 65, name: 'wave' },
  { t: 72.5, name: 'cut' },
  { t: 78, name: 'family-constellation' },
  { t: 93.5, name: 'title' },
  { t: 109, name: 'out' },
];
// Real beat map (Jingle Bells, USAF Band of Mid-America, 159 bpm 4/4): scenes/beatmaps.js.
const beats = { bpm: 159, ...BEATMAPS['s10-finale'] };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 116;

// Fireworks: 3D point shells (sphere, tilted ring, double, willow), launched so each bloom lands on a beat, across
// open sky (left edge and right half; the tree is in between). They build like a real display (WP-11 review: the
// finale felt sparse): singles every second beat → volleys on each downbeat → a barrage on every beat with gold
// willow canopies → a crown of willows, then the sky clears for the pets' wave.
const RISE = 1.0;
const FIREWORKS = [];
{
  const f0 = B.at(C.at('fireworks')).n + 2, fEnd = B.at(C.at('wave') - 2).n;
  const span = fEnd - f0;
  const shell = (n, i, o = {}) => {
    const left = o.left ?? rand(i + 0.1) < 0.25;
    FIREWORKS.push({
      t0: B.time(n) - RISE, rise: RISE, seed: i,
      x: o.x ?? (left ? 0.03 + rand(i + 0.2) * 0.12 : 0.56 + rand(i + 0.3) * 0.38),
      y: o.y ?? 0.12 + rand(i + 0.4) * 0.3,
      color: o.color ?? SHOW_HUES[i % SHOW_HUES.length],
      radius: o.radius ?? 0.14 + rand(i + 0.5) * 0.08,
      type: o.type ?? ['peony', 'ring', 'double', 'willow'][i % 4],
      tilt: 1.0 + rand(i + 0.6) * 0.45,                 // ring seen as a tilted ellipse, never edge-on
      color2: o.color2 ?? (i % 4 === 3 ? 'candle' : 'snow'),
      count: o.count ?? 90,
      ...((o.type ?? ['peony', 'ring', 'double', 'willow'][i % 4]) === 'willow' && !o.color ? { color: 'gold', color2: 'candle' } : {}),
    });
  };
  let i = 0;
  for (let n = f0; n < fEnd - 2 * B.perBar; n++) {
    const k = (n - f0) / span, down = (n % B.perBar) === 0;
    if (k < 0.3) { if (n % 2 === 0) shell(n, i++, { radius: (down ? 0.2 : 0.14) + rand(i) * 0.06 }); }
    else if (k < 0.65) {
      if (down) { shell(n, i++, { left: true, radius: 0.18 }); shell(n, i++, { left: false, radius: 0.24 }); }
      else if (n % 2 === 0) shell(n, i++);
    } else {
      shell(n, i++, { radius: 0.15 + rand(i) * 0.08 });
      if (down) [0.6, 0.75, 0.9].forEach((x, j) => shell(n, i++, { x, y: 0.16 + 0.05 * j, type: 'willow', radius: 0.2, count: 70 }));
    }
  }
  // The crown: five gold willows across the sky on the last downbeat, hanging as the music turns.
  const crown = fEnd - 2 * B.perBar;
  [0.08, 0.58, 0.7, 0.82, 0.94].forEach((x, j) => shell(crown, i++, { x, y: 0.14 + (j % 2) * 0.06, type: 'willow', radius: 0.26, count: 90, color: 'gold', color2: 'candle' }));
}
// Gold spark fountains on the floor line (between the tree and the tower, and at the far left) under the volleys.
const FOUNTAINS = (() => {
  const a = C.at('fireworks'), z = C.at('wave') - 2, k = (q) => B.quantize(a + (z - a) * q);
  return [{ x: 0.52, t0: k(0.3), t1: z, seed: 3 }, { x: 0.6, t0: k(0.3), t1: z, seed: 7 }, { x: 0.06, t0: k(0.65), t1: z, seed: 11 }];
})();

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
const N = 820;
// Above the gift tower (its top is at v ≈ 0.52).
const SWARM = { cx: 0.72, cy: 0.27, scale: 0.21 };
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
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', ...BOX_ZONES, 'tree', 'star'],
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
        for (const f of FOUNTAINS) sparkFountain(ctx, w, h, local, { ...f, y: 0.97, height: 0.3, alpha: 0.85 * A, surge: pulse });
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
      case 'box1': case 'box1Side': case 'box2': case 'box2Side': {
        const f = boxFace(zoneId);
        boxFaces(ctx, w, h, local, { beats: B, shift: f.top ? 0 : B.beatLen / 2, mode: fw > 0.5 ? 'all' : 'cells', face: f.face,
          colors: f.top ? ['plum', 'rose'] : ['cranberry', 'gold'], level: A * (0.4 + 0.4 * fw) * (1 - 0.5 * fam), seed: f.top ? 5 : 6 });
        break;
      }
      case 'tree': {
        // Mega-tree: a warm shockwave rolls down from the lit star on the first two downbeats, then a rainbow helix
        // turns through the fireworks; quiet gold plasma under the family constellation.
        const lt = bt - (t - local), spin = lt * 0.45;
        megaTree(ctx, w, h, lt, { spin, alpha: A, layers: [
          ...[0, 1].map((j) => ({ pattern: 'shockwave', t: local, params: { t0: B.time(j * B.perBar), u0: 0, k0: 0, speed: 0.55, width: 0.09, life: 2.6 }, colors: ['candle'] })),
          { pattern: 'helix', params: { count: 4, turns: 2, speed: 0.4, width: 0.15 }, colors: ['gold', 'cranberry', 'pine', 'ice', 'plum', 'rose'], alpha: C.prog(local, 2, 5) * (1 - 0.8 * fam) * (0.85 + 0.15 * pulse) },
          { pattern: 'twinkle', colors: ['gold', 'snow'], alpha: 0.45 },
          { pattern: 'plasma', colors: ['gold', 'candle', 'gold', 'rose'], alpha: 0.45 * fam * (0.8 + 0.2 * bar) },
        ] });
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
