// s04 · Cajas mágicas (1:15). Box chaos (owner, 2026-11-17): the pets have dived into the gift boxes to search for
// the star, and a joyful mess of Christmas, pet and cameo objects bursts out on the music, in waves that build to
// the finale: arcs, spins, bounces on the floor line, a pile-up, sparkles. Still no star. The boxes wobble, the lids
// pop, ears and tails flick out (placeholders shaped for WP-04's "pets rummaging" clips); the faces still light to
// the music, box 2 releases a jack-in-the-box spring of light; footlights chase (TREATMENT §04). The objects fly on
// the wall zone (it spans the whole stage), so they can arc over the tree and land anywhere left of the tower.
import { cueSheet, beatGrid, boxFaces, boxOpen, wrapSweep, footlights, sparkleBurst, twinkleStars, snowfall, glowStroke, additive, clamp, easeInOutSine, easeOutBack, rand,
  glowSprite, dot } from '../fx/index.js';
import { TOYS, TOY_NAMES, drawToy, tossSpec, tossAt, petPeek, boxLid, poof } from '../fx/toys.js';
import { drawClip, EAR_FADE, preloadClips } from '../fx/clips.js';
import { BEATMAPS } from './beatmaps.js';
import { from, beatClock, boxFace, BOX_ZONES, skyBase } from './common.js';
import { PERF } from '../perf.js';
import { stripToyRain, pixelAspect } from '../fx/strip.js';

const cues = [
  { t: 14.76, name: 'box1-open' },      // first burst: the full orchestra tumbles in
  { t: 25.66, name: 'box2-open' },      // bigger and busier
  { t: 43.82, name: 'cut' },            // sudden quiet restart (pizzicato + celesta)
  { t: 56.57, name: 'finale' },         // grand finale, the fullest section
  { t: 71.11, name: 'out' },            // the last chord rings out (music ends ≈ 1:12)
];
// Real beat map (box-chaos romp, original ElevenLabs cartoon-orchestra track, 132 bpm 4/4; owner 2026-11-17): scenes/beatmaps.js.
const beats = { bpm: 132, ...BEATMAPS['s04-magic-boxes'] };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 75;
const COLORS = { box1: ['plum', 'rose'], box2: ['cranberry', 'gold'] };

// ---------- the chaos schedule ----------
// Where objects come out: the top of the small box, and the big box's two shoulders either side of it.
const SOURCES = { b1: ['box1', 0.45, 'box1'], b2L: ['box2Side', 0.45, 'box2'], b2R: ['box2', 0.88, 'box2'] };
const bar = (n) => B.time(n * B.perBar);
const barAt = (t) => B.at(t).bar;
/** Waves of objects: { t, src, n, power }. Bursts land on the cues; flurries on bars (≈ every 3–4 s, like the sfx). */
const WAVES = (() => {
  const W = [];
  const push = (t, src, n, power = 1) => W.push({ t: B.quantize(t), src, n, power });
  push(8, 'b1', 1, 0.45); push(11.5, 'b2R', 2, 0.55);                    // the wobbles: a first toy escapes
  const o1 = C.at('box1-open'), o2 = C.at('box2-open'), cut = C.at('cut'), fin = C.at('finale');
  push(o1, 'b1', 14, 1);                                                   // box 1 bursts
  for (let n = barAt(o1) + 2; bar(n) < o2 - 0.5; n += 2) push(bar(n), 'b1', 5, 0.8);
  push(o2, 'b2R', 10, 1); push(o2, 'b2L', 8, 1); push(o2, 'b1', 4, 0.8);   // box 2 bursts: bigger and busier
  const src3 = ['b1', 'b2L', 'b2R'];
  for (let n = barAt(o2) + 1, i = 0; bar(n) < cut - 0.5; n++, i++) push(bar(n), src3[i % 3], 4 + Math.round(5 * (bar(n) - o2) / (cut - o2)), 0.85 + 0.15 * (i % 2));
  for (let n = barAt(cut) + 2, i = 0; bar(n) < fin - 0.5; n += 2, i++) push(bar(n), src3[(i + 1) % 3], 1 + (i % 2), 0.5);   // the quiet restart
  push(fin, 'b1', 16, 1.1); push(fin, 'b2L', 12, 1.1); push(fin, 'b2R', 12, 1.1);                                           // finale
  const fountain = B.quantize(68.4);
  for (let k = B.at(fin).n + B.perBar, i = 0; B.time(k) < fountain - 0.3; k += 2, i++) push(B.time(k), src3[i % 3], 5, 1);
  push(fountain, 'b1', 10, 1.2); push(fountain, 'b2L', 10, 1.2); push(fountain, 'b2R', 10, 1.2);
  // Between the waves, one toy on every off-beat in the busy sections, so the air is never empty.
  const busy = [[o1, cut - 0.5], [fin, fountain - 0.3]];
  for (const [a, b] of busy) for (let k = B.at(a).n + 1, i = 0; B.time(k) < b; k++, i++) push(B.time(k), src3[(i * 2 + 1) % 3], 1, 0.75);
  return W.sort((p, q) => p.t - q.t);
})();
// Everything on the floor sparkles away at the quiet restart (cut) and at the end (out).
const CLEARS = [C.at('cut'), C.at('out')];
// Box wobbles (the s04-sfx-wobble hits at 3 / 8 / 11.5 s and after the cut) and big lid pops (on the bursts).
const WOBBLES = [[3, 'box2'], [8, 'box1'], [11.5, 'box2'], [C.at('cut') + 1.2, 'box1'], [C.at('cut') + 4.8, 'box2'], [C.at('cut') + 8.4, 'box1'],
  ...WAVES.filter((w) => w.n >= 4).map((w) => [w.t, SOURCES[w.src][2]])].map(([t, b]) => [B.quantize(t), b]);
const POPS = { box1: [C.at('box1-open'), C.at('finale'), B.quantize(68.4)], box2: [C.at('box2-open'), C.at('finale') + B.beatLen, B.quantize(68.4)] };
// Pets rummaging inside the boxes (WP-04): [kind, box zone, u, from, to, clip?]. Each peek plays its character clip
// (cel animation on black, rising out of the box top); the code sprite `kind` is the fallback while a clip is missing.
// Connor and Orion use the big box's left shoulder: its right shoulder runs off the wall zone (the right-wall corner).
// Gandalf's pop clip starts 1.7 s early so his jump peaks on box1-open.
const CLIP_OF = { catEars: 's04-gandalf-ears', huskyTail: 's04-connor-tail', pomTail: 's04-alaska-tail', tabbyEars: 's04-orion-ears' };
// Drawn height of each clip as a share of the wall height (the clips are cropped to the character).
const CLIP_H = { 's04-gandalf-ears': 0.15, 's04-gandalf-pop': 0.159, 's04-connor-tail': 0.2, 's04-alaska-tail': 0.16, 's04-orion-ears': 0.14 };
const PEEKS = [
  ['catEars', 'box1', 0.6, 5, 7.8], ['huskyTail', 'box2Side', 0.2, 9.2, 11.3], ['catEars', 'box1', 0.55, C.at('box1-open') - 1.7, C.at('box1-open') + 2.6, 's04-gandalf-pop'],
  ['pomTail', 'box1', 0.22, 18.5, 24.5], ['tabbyEars', 'box2Side', 0.22, 29, 35.5], ['huskyTail', 'box2Side', 0.2, 37, 42.5],
  ['catEars', 'box1', 0.5, C.at('cut') + 2.2, C.at('cut') + 4.6], ['tabbyEars', 'box2Side', 0.22, C.at('cut') + 5.8, C.at('cut') + 8.2],
  ['pomTail', 'box1', 0.25, C.at('cut') + 9.2, C.at('finale') - 0.3], ['huskyTail', 'box2Side', 0.2, 59, 67.5], ['pomTail', 'box1', 0.22, 60, 67.8],
];
const LOOPS = new Set(['s04-connor-tail', 's04-alaska-tail']);

function wobbleOf(local, box) {
  let v = 0;
  for (const [t, b] of WOBBLES) {
    const a = local - t;
    if (b !== box || a < 0 || a > 1.2) continue;
    v += Math.sin(a * Math.PI * 2 * 5) * Math.exp(-a * 4);
  }
  return v;
}
function lidLift(local, box) {
  let v = 0;
  for (const t of POPS[box]) {
    const a = local - t;
    if (a < 0 || a > 1.6) continue;
    v = Math.max(v, a < 0.35 ? easeOutBack(a / 0.35) : 1 - easeInOutSine((a - 0.35) / 1.25));
  }
  return v;
}

/** The objects, laid out once per wall size and box position (pure function of those, so frames are reproducible). */
let toyCache = null;
function toysFor(env, w, h) {
  const pts = {};
  for (const [k, [zone, u]] of Object.entries(SOURCES)) pts[k] = from(env, zone, u, 0, { b1: [0.84, 0.52], b2L: [0.76, 0.68], b2R: [0.95, 0.67] }[k]);
  const left = from(env, 'box2Side', 0, 1, [0.72, 0.97]);
  const key = `${w}x${h}|${JSON.stringify(pts)}|${left}|${PERF.toys}`;
  if (toyCache?.key === key) return toyCache.list;
  const floorY = Math.min(left[1], 0.97) * h;
  const xMax = left[0] * w;
  const g = 1.9 * h;                                       // a little floaty: cartoon gravity
  const list = [];
  WAVES.forEach((wv, wi) => {
    const [ox, oy] = [pts[wv.src][0] * w, pts[wv.src][1] * h];
    // PERF.toys valve (WP-13a): a third fewer objects per wave; the single off-beat toys stay
    const n = PERF.toys && wv.n > 1 ? Math.ceil(wv.n * 2 / 3) : wv.n;
    for (let i = 0; i < n; i++) {
      const sd = wi * 97 + i * 7.3;
      const name = TOY_NAMES[Math.floor(rand(sd) * TOY_NAMES.length)];
      const size = h * (0.07 + rand(sd + 0.1) * 0.045) * (TOYS[name].long ? 1.15 : 1);
      const into = n > 1 && rand(sd + 0.2) < 0.12;
      const xT = into ? ox + (rand(sd + 0.3) - 0.5) * size * 2 : xMax - size * 0.6 - (xMax - 0.05 * w) * rand(sd + 0.3) ** 1.25;
      const t0 = wv.t + i * 0.05;
      const spec = tossSpec({ t0, x0: ox, y0: oy, xT, floor: floorY - size * 0.38 - rand(sd + 0.4) * h * 0.05, rise: h * (0.18 + rand(sd + 0.5) * 0.36 * wv.power),
        g, e: 0.38 + rand(sd + 0.6) * 0.12, spin: (rand(sd + 0.7) - 0.5) * 11, into });
      const clear = CLEARS.find((c) => c > t0) ?? duration;
      const end = Math.min(t0 + spec.rest + 4 + rand(sd + 0.8) * 3.5, clear + rand(sd + 0.9) * (clear === CLEARS[1] ? 2.5 : 1.2));
      list.push({ name, size, spec, end, glow: TOYS[name].glow });
    }
  });
  toyCache = { key, list };
  return list;
}

/** All the flying, bouncing and resting objects (drawn on the wall zone). */
function drawToys(ctx, w, h, local, env, pulse, alpha) {
  const list = toysFor(env, w, h);
  const glints = [];
  for (const o of list) {
    const age = local - o.spec.t0;
    if (age < 0 || local > o.end + 0.6) continue;
    const p = tossAt(o.spec, age);
    if (!p) continue;
    if (local > o.end) { poof(ctx, p.x, p.y, o.size, (local - o.end) / 0.6, o.glow); continue; }
    const pop = 0.35 + 0.65 * easeOutBack(clamp(age / 0.25));             // squeezes out of the box
    const beat = p.resting ? 1 + 0.05 * pulse : 1;                          // the pile bobs to the beat
    drawToy(ctx, o.name, p.x, p.y, o.size * pop * beat, p.rot, alpha);
    if (!p.resting && age > 0.08) glints.push(o, age);
  }
  // faint glitter trails behind the flying ones
  additive(ctx, 0.55 * alpha, () => {
    for (let j = 0; j < glints.length; j += 2) {
      const o = glints[j], age = glints[j + 1], sp = glowSprite(o.glow, 0.3);
      for (let k = 1; k <= 3; k++) {
        const q = tossAt(o.spec, age - k * 0.045);
        if (q) dot(ctx, sp, q.x, q.y, o.size * (0.16 - k * 0.03));
      }
    }
  });
}

/** Lids popping, ears and tails peeking: the pets are inside (wall zone, just above the box tops). */
function drawPets(ctx, w, h, local, env, t, alpha) {
  const P = (zone, u, v, fb) => { const [x, y] = from(env, zone, u, v, fb); return [x * w, y * h]; };
  for (const box of ['box2', 'box1']) {
    const A = P(`${box}Side`, 0, 0, box === 'box1' ? [0.78, 0.5] : [0.7, 0.66]);
    const Bc = P(box, 0, 0, box === 'box1' ? [0.8, 0.52] : [0.74, 0.68]);
    const Cc = P(box, 1, 0, box === 'box1' ? [0.92, 0.5] : [1, 0.66]);
    const wob = wobbleOf(local, box), pop = lidLift(local, box);
    const lift = h * (0.16 * pop + 0.012 * Math.abs(wob));
    boxLid(ctx, A, Bc, Cc, lift, 0.28 * pop * (box === 'box1' ? -1 : 1) + 0.05 * wob, COLORS[box][0], alpha);
  }
  for (const [kind, zone, u, a, b, clipId = CLIP_OF[kind]] of PEEKS) {
    if (local < a - 0.2 || local > b + 0.4) continue;
    const box = zone.slice(0, 4);
    const duck = Math.min(1, Math.abs(wobbleOf(local, box)) * 1.5);       // they duck when the box jolts
    const up = clamp(Math.min((local - a) / 0.35, (b - local) / 0.3)) * (1 - 0.6 * duck);
    const [x, y] = P(zone, u, 0, [0.85, 0.52]);
    if (peekClip(ctx, clipId, x, y, h * CLIP_H[clipId], up, local - a, alpha)) continue;
    petPeek(ctx, kind, x, y, h * 0.11, up, t + u * 10, alpha);
  }
}

/**
 * A character clip rising out of a box top at (x, y): its bottom edge sits on the box top and everything below it
 * is clipped away, so the pet seems to be inside the box. `up` (0..1) slides it in and out. False when no clip.
 */
function peekClip(ctx, id, x, y, ch, up, time, alpha) {
  if (up <= 0.01) return drawClip(ctx, id, time, { alpha: 0 });
  ctx.save();
  ctx.beginPath(); ctx.rect(x - ch * 3, y - ch * 2, ch * 6, ch * 2); ctx.clip();
  const ok = drawClip(ctx, id, time, { x, y: y + ch * (1 - easeOutBack(clamp(up))) * 0.9, h: ch, alpha, loop: LOOPS.has(id), topFade: EAR_FADE });
  ctx.restore();
  return ok;
}

/**
 * A coiled spring of light bouncing up out of a point (damped, so it settles instead of jittering). It bobs once
 * per beat (pulse) after it settles.
 */
function lightSpring(ctx, w, h, age, x, y, alpha, pulse = 0) {
  if (age < 0 || alpha <= 0) return;
  const k = 1 - Math.exp(-age * 2.2) * Math.cos(age * 7) + 0.06 * pulse * Math.min(1, age / 2);
  const height = h * 0.28 * clamp(k, 0, 1.3);
  const coils = 7, rad = w * 0.05;
  ctx.beginPath();
  for (let i = 0; i <= coils * 16; i++) {
    const p = i / (coils * 16);
    const px = x * w + Math.sin(p * coils * Math.PI * 2) * rad;
    const py = y * h - p * height;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  additive(ctx, alpha, () => glowStroke(ctx, 'gold', Math.max(6, w / 140)));
  sparkleBurst(ctx, w, h, age, { t0: 0.35, x, y: y - height / h, count: 30, colors: ['gold', 'snow'], spread: 0.18, duration: 1.8, alpha });
}

export default {
  id: 's04-magic-boxes',
  title: 's04 · Cajas mágicas',
  duration,
  cues,
  beats,
  zones: ['wall', ...BOX_ZONES, 'backdrop', 'stage', 'rightStrip'],
  enter() { preloadClips([...Object.values(CLIP_OF), 's04-gandalf-pop']); },
  draw(zoneId, ctx, w, h, t, local, env) {
    const A = easeInOutSine(clamp(local / 2)) * (1 - easeInOutSine(C.prog(local, 'out', duration)));
    const fin = B.steps(local, C.at('finale'), 2);
    const { bt, pulse } = beatClock(B, t - local, local);
    switch (zoneId) {
      case 'wall':
        skyBase(zoneId, ctx, w, h, beatClock(B, t - local, local).soft);
        drawToys(ctx, w, h, local, env, pulse, A);
        drawPets(ctx, w, h, local, env, t, A);
        break;
      case 'box1': case 'box1Side': case 'box2': case 'box2Side': {
        // The tower: big box (box2) at the bottom, small box (box1) on top. Each box's front and side are
        // separate surfaces; effects line up across the corner so the tower reads as a solid object.
        const f = boxFace(zoneId);
        // Something busy inside: the box's light jolts and shivers with each wobble.
        const wob = wobbleOf(local, f.box);
        ctx.save();
        ctx.translate(wob * w * 0.05, -Math.abs(wob) * h * 0.05);
        const openCue = f.top ? 'box1-open' : 'box2-open';
        const opened = local >= C.at(openCue);
        const build = f.top ? B.steps(local, 5, 8) : 1;          // the top box joins after the bottom one
        // Second sequence (box2-open → cut, skipped by the cut list): finer 3×3 grid.
        const second = local >= C.at('box2-open') + 6 && local < C.at('finale');
        boxFaces(ctx, w, h, local, {
          beats: B, shift: f.top ? 0 : B.beatLen / 2,          // the boxes answer each other half a beat apart
          colors: COLORS[f.box], grid: second ? 3 : 2, face: f.face,
          mode: fin > 0 ? 'all' : 'cells',
          level: A * build * (opened ? 0.85 : 0.6 + 0.2 * clamp(local / 10)),
          seed: (f.top ? 1 : 2) + (f.face === 'side' ? 10 : 0),
        });
        // Light sweeps round the corner (side → front), one per bar; bottom and top travel in opposite
        // directions, so the tower seems to turn. Twice as often in the second sequence.
        const per = (second ? 1 : 2) * B.perBar * B.beatLen;
        for (let k = 0; k < 2; k++) {
          const age = ((local - B.time(0)) % per) / per - k * 0.5;
          if (age < 0 || age > 1) continue;
          const p = f.top ? -0.3 + age * 2.6 : 2.3 - age * 2.6;
          wrapSweep(ctx, w, h, local, { p, face: f.face, color: f.top ? 'rose' : 'gold', alpha: A * build * (fin > 0 ? 0.4 : 0.7) });
        }
        boxOpen(ctx, w, h, bt, { open: (C.env(local, openCue, C.at(openCue) + 8, 0.6, 3) + 0.6 * fin) * (f.face === 'side' ? 0.7 : 1), color: COLORS[f.box][1], alpha: A * build });
        ctx.restore();
        break;
      }
      case 'backdrop': {
        twinkleStars(ctx, w, h, bt, { seed: 45, density: 0.3, alpha: 0.6 * A });
        // box 1 opens at the top of the tower; box 2's spring rises from its shoulder, beside the small box
        const [x1, y1] = from(env, 'box1', 0.5, 0, [0.72, 0.5]);
        const [x2, y2] = from(env, 'box2', 0.94, 0, [0.95, 0.72]);
        sparkleBurst(ctx, w, h, local, { t0: C.at('box1-open'), x: x1, y: y1, up: 0.65, spread: 0.4, count: 48, colors: ['plum', 'rose', 'snow'], duration: 2.4, alpha: A });
        lightSpring(ctx, w, h, local - C.at('box2-open'), x2, y2, A * (1 - C.prog(local, C.at('box2-open') + 7, { after: 2 })), pulse);
        if (fin > 0) {
          snowfall(ctx, w, h, bt, { color: 'gold', density: 0.35 * fin, layers: 2, alpha: A });
          // A burst above alternating boxes on every downbeat: festive, well under 3 flashes/s.
          const { bar } = B.at(local), first = B.at(C.at('finale')).bar;
          for (let j = Math.max(first, bar - 2); j <= bar; j++) {
            const [x, y] = j % 2 ? [x2, y2] : [x1, y1];
            sparkleBurst(ctx, w, h, local, { t0: B.time(j * B.perBar), x, y: y - 0.05, up: 0.5, spread: 0.3, count: 34, colors: j % 2 ? COLORS.box2 : COLORS.box1, duration: 2.2, seed: 30 + j, alpha: A });
          }
        }
        break;
      }
      case 'rightStrip': {
        // WP-13a: a soft toy rain slides down round the corner once box 1 bursts; thinner in the quiet restart.
        const { soft } = beatClock(B, t - local, local);
        skyBase(zoneId, ctx, w, h, soft);
        const quiet = C.env(local, 'cut', 'finale', 1.5, 1.5);
        const level = clamp((local - C.at('box1-open')) / 4) * (0.65 + 0.35 * fin) * (1 - 0.6 * quiet);
        stripToyRain(ctx, w, h, soft, { alpha: A, level, k: pixelAspect(env, w, h) });
        break;
      }
      case 'stage':
        footlights(ctx, w, h, bt, { warm: A, chase: 0.7, speed: fin > 0 ? 2 / B.beatLen : 1 / B.beatLen });   // one or two bulbs per beat
        break;
    }
  },
};
