// s10 · Gran final (1:30), visuals only (the pets' wave and Santa's sleigh are WP-04/08 clips laid on top).
// A warm ripple from the lit star, footlights burst, a sparkle trail where the sleigh will fly, soft fireworks,
// then the stars gather into the family constellation (from one media-pack photo, processed on the iPad) and
// "¡Feliz Navidad!". Fades to the starfield (TREATMENT §04).
import { cueSheet, treeWaves, treeWash, twinkleStars, softFirework, sparkleBurst, footlights, boxFaces, snowfall,
  starHalo, projectedStar, constellation, photoToConstellation, fallbackConstellation, titleCard, loadFonts,
  glowSprite, dot, additive, glowStroke, easeInOutSine, clamp, rand } from '../fx/index.js';
import { SHOW_HUES } from '../palette.js';
import * as media from '../media.js';
import { skyBase, stripSnow, from } from './common.js';

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
const C = cueSheet(cues);
const duration = 90;

// Fireworks: one every 1.6 s across open sky (left edge and right half of the wall; the tree is in between).
const FIREWORKS = [];
for (let i = 0, at = C.at('fireworks'); at < C.at('wave') - 2; i++, at += 1.6) {
  const left = rand(i + 0.1) < 0.25;
  FIREWORKS.push({
    t0: at, seed: i,
    x: left ? 0.03 + rand(i + 0.2) * 0.12 : 0.56 + rand(i + 0.3) * 0.38,
    y: 0.14 + rand(i + 0.4) * 0.3,
    color: SHOW_HUES[i % SHOW_HUES.length],
    radius: 0.14 + rand(i + 0.5) * 0.1,
  });
}

// Family constellation: computed once from a media-pack photo named "family…" (never leaves the device).
let family = fallbackConstellation();
let familyLoading = false;
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
  } catch (e) {
    console.warn('family constellation: using the fallback shape', e);
  }
}

const FAMILY_BOX = [0.56, 0.24, 0.97, 0.74];

export default {
  id: 's10-finale',
  title: 's10 · Gran final',
  duration,
  cues,
  // Live-moment fallback (TREATMENT §05): show the projected star if the real one isn't on the tree.
  options: { projectedStar: false },
  zones: ['wall', 'rightStrip', 'backdrop', 'stage', 'box1', 'box2', 'tree', 'star'],
  enter() { loadFonts(); loadFamily(); },
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const fw = C.env(local, 'fireworks', 'wave', 2, 3);
    const fam = C.prog(local, 'family-constellation', { after: 10 });
    switch (zoneId) {
      case 'wall': {
        skyBase(zoneId, ctx, w, h, t);
        // Warm ripple rings spreading from the star.
        const [sx, sy] = from(env, 'star', 0.5, 0.5, [0.33, 0.17]);
        for (let r = 0; r < 2; r++) {
          const p = clamp((local - r * 1.2) / 5);
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
            additive(ctx, A * (1 - j / 26), () => dot(ctx, glowSprite(j % 3 ? 'gold' : 'snow', 0.3), x, y + Math.sin(j * 1.7 + t * 3) * 6, (j ? 12 : 26) * (1 - j / 40)));
          }
        }
        for (const f of FIREWORKS) softFirework(ctx, w, h, local, { ...f, alpha: A });
        snowfall(ctx, w, h, t, { density: 0.5 * C.prog(local, 'wave', { after: 4 }), alpha: A });
        // The stars gather into the family constellation, then the title.
        if (fam > 0) {
          constellation(ctx, w, h, t, { ...family, box: FAMILY_BOX, gather: C.prog(local, 'family-constellation', { after: 5 }),
            progress: C.prog(local, C.at('family-constellation') + 3, { after: 8 }), color: 'gold', lineColor: 'candle', alpha: A, seed: 9, starSize: 0.8 });
        }
        titleCard(ctx, w, h, t, { lines: ['¡Feliz Navidad!'], x: 0.765, y: 0.12, size: 120, maxWidth: 0.4,
          alpha: A, reveal: C.prog(local, 'title', { after: 2.5 }) });
        break;
      }
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, t);
        stripSnow(ctx, w, h, t, 0.4 + 0.4 * C.prog(local, 'wave', { after: 4 }), A);
        break;
      case 'backdrop':
        // Gold sparkle snow behind the pets' wave (WP-08).
        snowfall(ctx, w, h, t, { color: 'gold', density: 0.25 * C.env(local, 'wave', 'title', 2, 3), layers: 2, alpha: A });
        break;
      case 'stage':
        footlights(ctx, w, h, local, { warm: A, chase: 0.5 + 0.4 * C.env(local, 'ripple', 'sleigh', 0.5, 4), speed: 8 });
        break;
      case 'box1':
      case 'box2':
        boxFaces(ctx, w, h, local, { bpm: 100, offset: zoneId === 'box2' ? 0.3 : 0, mode: fw > 0.5 ? 'all' : 'cells',
          colors: zoneId === 'box1' ? ['plum', 'rose'] : ['cranberry', 'gold'], level: A * (0.4 + 0.4 * fw) * (1 - 0.5 * fam), seed: 5 });
        break;
      case 'tree': {
        // A warm wave rolls down from the lit star, then gentle colour waves; quiet gold for the constellation.
        const rip = C.prog(local, 'ripple', { after: 3.5 });
        if (rip < 1) {
          const y = easeInOutSine(rip) * 1.3 - 0.15;
          const g = ctx.createLinearGradient(0, (y - 0.15) * h, 0, (y + 0.15) * h);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(255,176,102,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          additive(ctx, A, () => { ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
        }
        treeWaves(ctx, w, h, local, { hueSweep: true, speed: 0.22, alpha: A * 0.7 * C.prog(local, 2, 5) * (1 - 0.7 * fam) });
        if (fam > 0) treeWash(ctx, w, h, t, { color: 'gold', alpha: 0.18 * fam * A });
        twinkleStars(ctx, w, h, t, { seed: 65, density: 0.8, colors: ['gold', 'snow'], size: 1.6, alpha: 0.6 * A });
        break;
      }
      case 'star': {
        const on = this.options.projectedStar;
        if (on) projectedStar(ctx, w, h, t, { alpha: A, spin: 1 });
        starHalo(ctx, w, h, t, { intensity: A * (on ? 0.8 : 0.45), period: 5, size: 0.5 });
        sparkleBurst(ctx, w, h, local, { t0: 0.2, count: 26, spread: 0.7, colors: ['gold', 'candle', 'snow'], duration: 2.4, alpha: A });
        break;
      }
    }
  },
};
