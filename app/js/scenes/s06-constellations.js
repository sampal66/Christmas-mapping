// s06 · Constelaciones (1:30). A rollercoaster through the universe: calm pauses on each constellation (stars, then
// the 1822 atlas engraving and its name), explosive rides between them (warp stars, comets, aurora, galaxies).
// The whole wall becomes a starry sky; a swarm of star points forms the constellations
// as turning 3D figures (Orion, Canis Major and Minor, Felis), then the lost star, which slips away; slow shooting
// stars; snow on the right wall (TREATMENT §04). In each pause the pet whose sky it is forms beside it as a star figure
// (fx/portrait-swarm.js): each pet as a star-swarm portrait of its cartoon art (owner, 2026-11-18).
import { cueSheet, beatGrid, twinkleStars, shootingStars, starHalo, glowSprite, dot, additive, sparkleBurst,
  cloudScatter, cloudConstellation, cloudGroup, cloudStar, formation, renderCloud, sweepColors, nebula,
  drawCard, shapeRect, loadAtlasArt, atlasLabel, warpField, aurora, galaxy, megaTree, prog, smooth,
  formationState, projector, drawStar, lostStar, portraitSwarm, PET_PORTRAITS,
  ORION, CANIS_MAJOR, CANIS_MINOR, FELIS, easeInOutSine, clamp } from '../fx/index.js';
import { BEATMAPS } from './beatmaps.js';
import { skyBase, stripSnow, beatClock } from './common.js';

const cues = [
  { t: 0, name: 'sky' },
  { t: 8, name: 'orion' },
  { t: 30.3, name: 'canis' },       // full-band tutti enters (file 2:00)
  { t: 47, name: 'felis' },
  { t: 64, name: 'cut' },           // tutti peak (file 2:33)
  { t: 70.5, name: 'glint' },       // the quiet middle section
  { t: 86, name: 'out' },
];
// Real beat map (Waltz of the Flowers, USAF Band, excerpt from 1:28.94, ≈176 bpm 3/4): scenes/beatmaps.js.
const beats = { bpm: 176, ...BEATMAPS['s06-constellations'] };
const B = beatGrid(beats);
const C = cueSheet(cues, B);
const duration = 90;

// The constellations are a drone swarm: one set of light points that gathers out of the sky into Orion, re-forms
// as Canis Major + Minor, then Felis, then dissolves back into the sky while the lost star slips away. Each shape is a real 3D
// figure turning slowly. Placed on the open right half of the wall (the tree covers u 0.17–0.5 lower down).
const N = 600;
// Between the tree tip and the gift tower (its top is at v ≈ 0.52, from u ≈ 0.77), clear of the top edge.
const SWARM = { cx: 0.645, cy: 0.35, scale: 0.215 };
const NORTH_STAR = [0.5, 0.06];
// Behind the stars, the real atlas engraving of each figure (Jamieson, 1822: the hunter, the two dogs, the cat),
// drawn as light lines in the same 3D view, so it turns with its stars; it fades in once the stars have formed and
// out as the swarm re-forms. Stars come from the same engravings, so they sit exactly on the drawings.
// Each figure also gets its name, dimmed, in the atlas's engraved lettering (Spanish, like all on-screen text).
const ART = [
  { from: 'orion', to: 'canis', parts: [{ shape: ORION, size: 1.05, label: 'ORIÓN' }] },
  { from: 'canis', to: 'felis', parts: [{ shape: CANIS_MAJOR, size: 0.78, x: -0.2, y: 0.22, label: 'CAN MAYOR' }, { shape: CANIS_MINOR, size: 0.32, x: 0.62, y: -0.62, label: 'CAN MENOR', labelAbove: true }] },
  { from: 'felis', to: 'cut', parts: [{ shape: FELIS, size: 1.05, label: 'FELIS' }] },
];

// The rollercoaster: each constellation is a calm pause; between them a "ride" (warp-speed stars, comets, aurora, a
// galaxy sweeping past, meteors down the tree) builds for 3.5 s, peaks while the swarm flies to the next figure and
// settles by +6 s. The engraving grows out from the stars as they settle (cue + 5.5 s → +10.5 s), then its name, and holds.
const RIDES = [['orion', 0.7], ['canis', 1], ['felis', 1], ['cut', 1]];
function ride(local) {
  let e = 0, which = -1;
  RIDES.forEach(([cue, peak], i) => {
    const c = C.at(cue);
    const v = Math.min(smooth(prog(local, c - 3.5, c)), 1 - smooth(prog(local, c + 2, c + 6))) * peak;
    if (v > e) { e = v; which = i; }
  });
  return { e, which, p: which >= 0 ? prog(local, C.at(RIDES[which][0]) - 3.5, C.at(RIDES[which][0]) + 6) : 0 };
}
const GALAXY_COLORS = [['ice', 'plum', 'snow'], ['rose', 'plum', 'snow'], ['pine', 'ice', 'snow'], ['gold', 'candle', 'snow']];
const art = new Map();                                    // src → tinted canvas, once loaded
function loadArt() {
  for (const g of ART) for (const p of g.parts) loadAtlasArt(p.shape.src, 'ice').then((c) => { if (c) art.set(p.shape.src, c); });
}
let seq = null;
function sequence() {
  if (seq) return seq;
  // starts spread across the whole sky, so the stars visibly gather into the first figure
  const sky = cloudScatter(N, { w: 6.5, h: 3.4, d: 2, seed: 31 });
  const orion = cloudConstellation(ORION, N, { size: 1.05, depth: 0.4, seed: 41 });
  const canis = cloudGroup([{ shape: CANIS_MAJOR, x: -0.2, y: 0.22, size: 0.78 }, { shape: CANIS_MINOR, x: 0.62, y: -0.62, size: 0.32 }], N, 51);
  const felis = cloudConstellation(FELIS, N, { size: 1.05, depth: 0.4, seed: 61 });
  // after the last pause the swarm dissolves back into the sky (the lost star slips away on its own)
  const dissolve = cloudScatter(N, { w: 6.5, h: 3.4, d: 2, seed: 37 });
  seq = [
    { at: 0, cloud: sky },
    { at: C.at('orion'), cloud: orion, dur: 7 },
    { at: C.at('canis'), cloud: canis, dur: 7 },
    { at: C.at('felis'), cloud: felis, dur: 7 },
    { at: C.at('cut'), cloud: dissolve, dur: 6 },
  ];
  return seq;
}

// The pets as star figures (WP-11b): in each calm pause, after the stars have formed, a few drones peel off the
// constellation and re-form beside it (the open sky right of the figures, above the gift tower) as that pet, a 3D
// drone figure smaller than the constellation, then fly
// back before the next ride. from: seconds after the cue; gone 1 s before the next cue (back over its last 2 s).
// src: the formation-sequence entry the drones come from.
const PETS = [
  { pet: 'orion', cue: 'orion', from: 9, to: 'canis', x: 0.845, y: 0.3, size: 0.19, src: 1 },
  { pet: 'connor', cue: 'canis', from: 7.5, to: 'felis', x: 0.82, y: 0.39, size: 0.15, src: 2 },
  { pet: 'alaska', cue: 'canis', from: 8, to: 'felis', x: 0.89, y: 0.18, size: 0.15, src: 2 },
  { pet: 'gandalf', cue: 'felis', from: 7.5, to: 'cut', x: 0.87, y: 0.3, size: 0.18, src: 3 },
];

// The lost star (the tree's five-point star, now a night-sky star since it escaped in s03) travels through the
// whole scene: it arrives from the sky where it vanished, rides with the swarm into each constellation and rests
// there during the pause ("this is where the star has been"), then slips away to the right, towards Pooh (s07).
const starPt = (shape, size, x, y, i, du = 0, dv = 0) => {
  const [x0, y0, x1, y1] = shapeRect(shape, size, x, y);
  return [x0 + (shape.stars[i][0] + du) * (x1 - x0), y0 + (shape.stars[i][1] + dv) * (y1 - y0)];
};
const REST = [
  (() => { const a = starPt(ORION, 1.05, 0, 0, 4), b = starPt(ORION, 1.05, 0, 0, 7); return [(a[0] + b[0]) / 2 + 0.12, (a[1] + b[1]) / 2]; })(),
  starPt(CANIS_MAJOR, 0.78, -0.2, 0.22, 0, -0.22, -0.1),
  starPt(FELIS, 1.05, 0, 0, 9, 0.12, -0.08),
];
const ENTER = [0.86, 0.12], EXIT = [1.12, 0.03];          // wall fractions: where s03 left it, and off towards Pooh
function lostStarPos(local, w, h, P) {
  const rest = REST.map(([x, y]) => P(x, y, 0.15));
  const legs = [
    [C.at('orion') - 3.5, C.at('orion') + 4, [ENTER[0] * w, ENTER[1] * h], rest[0]],
    [C.at('canis') - 3.5, C.at('canis') + 4, rest[0], rest[1]],
    [C.at('felis') - 3.5, C.at('felis') + 4, rest[1], rest[2]],
    [C.at('glint'), C.at('glint') + 7, rest[2], [EXIT[0] * w, EXIT[1] * h]],
  ];
  let pos = [ENTER[0] * w, ENTER[1] * h], moving = 0;
  for (const [a, b, p0, p1] of legs) {
    if (local < a) break;
    const k = easeInOutSine(clamp((local - a) / (b - a)));
    // a curved hop, lifted towards the top of the sky
    const cx = (p0[0] + p1[0]) / 2, cy = Math.min(p0[1], p1[1]) - 0.12 * h;
    pos = [(1 - k) ** 2 * p0[0] + 2 * k * (1 - k) * cx + k * k * p1[0], (1 - k) ** 2 * p0[1] + 2 * k * (1 - k) * cy + k * k * p1[1]];
    moving = local < b ? Math.sin(Math.PI * k) : 0;
  }
  return { pos, moving };
}

export default {
  id: 's06-constellations',
  title: 's06 · Constelaciones',
  duration,
  cues,
  beats,
  zones: ['wall', 'backdrop', 'tree', 'star', 'rightStrip'],
  enter() { sequence(); loadArt(); },
  draw(zoneId, ctx, w, h, t, local) {
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    const sky = B.steps(local, C.at('sky'), 15);
    const { bt, soft, bar } = beatClock(B, t - local, local);
    switch (zoneId) {
      case 'wall': {
        skyBase(zoneId, ctx, w, h, soft);
        // the sky breathes once per bar (the waltz's ONE-two-three)
        twinkleStars(ctx, w, h, bt, { seed: 81, density: 0.6 * sky, alpha: A * (0.8 + 0.2 * bar), size: 0.9 });
        // Nebula glow behind the figures, for depth.
        nebula(ctx, w, h, t, { alpha: A * sky * (0.85 + 0.15 * bar), area: [0.5, 0, 1, 0.75] });
        // The swarm. Constellations turn gently (they're 3D figures); the star spins as it leaves.
        const cloud = formation(local, sequence());
        const g = C.since(local, 'glint');
        const view = {
          cx: SWARM.cx, cy: SWARM.cy, scale: SWARM.scale, dist: 2.6,
          rotY: 0.5 * Math.sin(bt * 0.16), rotX: 0.16 * Math.sin(bt * 0.12),
        };
        // The ride between constellations: aurora, a galaxy sweeping past, warp-speed stars and comets.
        const R = ride(local);
        if (R.e > 0.01) {
          aurora(ctx, w, h, t, { alpha: A * 1.3 * R.e, area: [0.3, 1], height: 0.45, colors: ['pine', 'ice'] });
          galaxy(ctx, w, h, t, { x: 1.08 - 0.75 * R.p, y: 0.18 + 0.12 * (R.which % 2), size: 0.27, tilt: 1.0, rot: t * 0.25, alpha: A * 0.85 * R.e, colors: GALAXY_COLORS[R.which] });
          warpField(ctx, w, h, t, { intensity: A * R.e, cx: SWARM.cx, cy: SWARM.cy, seed: 3 + R.which });
          shootingStars(ctx, w, h, t, { every: 0.9, dur: 0.8, seed: 17 + R.which, alpha: A * R.e, area: [0.35, 0, 1, 0.55] });
        }
        // The pause: the atlas engraving and its dimmed name, a couple of seconds after the stars have formed.
        for (const g of ART) {
          // The engraving grows out from the stars as they settle (a soft radial reveal over ≈5 s, slightly
          // oversized and settling in), instead of a flat fade that seemed to come from nowhere (owner, WP-05).
          const kin = clamp((local - C.at(g.from) - 5.5) / 5);
          const k = Math.min(kin, 1 - clamp((local - C.at(g.to) + 3.5) / 2.5));
          if (k <= 0) continue;
          const ka = easeInOutSine(k) ** 1.5;
          const reveal = easeInOutSine(kin);
          for (const p of g.parts) {
            const r0 = shapeRect(p.shape, p.size * (1 + 0.06 * (1 - reveal)), p.x, p.y);
            const rect = shapeRect(p.shape, p.size, p.x, p.y);
            drawCard(ctx, w, h, art.get(p.shape.src), view, r0, { z: -0.12, alpha: A * 0.6 * ka * (0.9 + 0.1 * bar), reveal });
            const lab = atlasLabel(p.label, 'ice');
            const lh = 0.16 * Math.max(0.8, p.size), lw = lh * lab.width / lab.height, mx = (rect[0] + rect[2]) / 2;
            const ly = p.labelAbove ? rect[1] - lh * 1.05 : rect[3] - lh * 0.4;
            drawCard(ctx, w, h, lab, view, [mx - lw / 2, ly, mx + lw / 2, ly + lh], { z: -0.1, alpha: A * 0.38 * ka * clamp((reveal - 0.6) / 0.4), soft: false });
          }
        }
        renderCloud(ctx, w, h, bt, cloud, {
          ...view,
          color: sweepColors(['snow', 'ice', 'snow', 'plum'], bt, 0.08),
          alpha: A * (local < C.at('orion') ? 0.55 * sky : 0.8) * (0.88 + 0.12 * bar),
        });
        // The pet star figures, each beside its own constellation during the pause.
        for (const p of PETS) {
          const t0 = C.at(p.cue) + p.from;
          portraitSwarm(ctx, w, h, bt, local - t0, { data: PET_PORTRAITS[p.pet], x: p.x, y: p.y, size: p.size, alpha: A, end: C.at(p.to) - 1 - t0, flip: true,
            source: { cloud: sequence()[p.src].cloud, cx: SWARM.cx, cy: SWARM.cy, scale: SWARM.scale } });
        }
        // The named stars as real stars (spectral colours, spikes on the bright ones) once each figure has formed.
        const P = projector(w, h, view);
        const F = formationState(local, sequence());
        const unit = Math.min(w, h) / 1080;
        const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
        const drawAnchors = (cl, a) => {
          if (!cl?.anchors || a <= 0.01) return;
          cl.anchors.forEach(([x, y, z, mg, cls], i) => {
            const [sx, sy, f] = P(x, y, z);
            drawStar(ctx, sx, sy, bt, { mag: 0.45 + 0.55 * mg, cls, seed: i + 1, unit: unit * f * 1.35, twinkle: 0.15, alpha: A * a });
          });
        };
        drawAnchors(F.cur, F.k ** 2);
        drawAnchors(F.prev, 1 - clamp(F.k * 3));
        ctx.globalCompositeOperation = op;
        // The lost star, on its journey (see lostStarPos).
        const L = lostStarPos(local, w, h, P);
        const trail = L.moving > 0.05 ? [6, 5, 4, 3, 2, 1].map((j) => lostStarPos(local - j * 0.07, w, h, P).pos) : null;
        lostStar(ctx, L.pos[0], L.pos[1], bt, { size: Math.min(w, h) * 0.07 * (1 + 0.2 * L.moving), alpha: A * clamp((local + 0.5) / 2) * (1 - clamp((g - 5.5) / 1.5)), trail });
        // The North Star, steady.
        additive(ctx, A * sky * (0.8 + 0.2 * bar), () => dot(ctx, glowSprite('snow', 0.2), NORTH_STAR[0] * w, NORTH_STAR[1] * h, Math.min(w, h) * 0.035));
        // a shooting star every 6 bars, launched on the downbeat
        if (local > C.at('orion')) shootingStars(ctx, w, h, local - B.time(0), { every: 6 * B.perBar * B.beatLen, dur: B.perBar * B.beatLen * 1.5, seed: 5, alpha: 0.8 * A, area: [0.5, 0, 1, 0.5] });
        break;
      }
      case 'backdrop':
        twinkleStars(ctx, w, h, bt, { seed: 47, density: 0.25 * sky, colors: ['ice', 'snow'], alpha: 0.6 * A });
        break;
      case 'tree': {
        // calm: soft twinkle; during a ride: meteors pour down the tree and it spins up
        const R = ride(local);
        megaTree(ctx, w, h, bt - (t - local), { spin: (bt - (t - local)) * (0.15 + 0.6 * R.e), alpha: A, size: 0.85, layers: [
          { pattern: 'twinkle', colors: ['snow', 'ice', 'gold'], alpha: (0.35 + 0.15 * bar) * sky },
          { pattern: 'meteors', params: { count: 18, speed: 1.2 }, colors: ['ice', 'snow', 'plum'], alpha: R.e },
        ] });
        break;
      }
      case 'star': {
        // The star is gone (s03); a faint gold breath answers the glint: hope.
        starHalo(ctx, w, h, t, { intensity: (0.25 + 0.1 * bar) * C.env(local, 'glint', 'out', 2, 3) * A, pulse: 0, size: 0.45 });
        sparkleBurst(ctx, w, h, local, { t0: C.at('glint') + 0.5, count: 18, spread: 0.6, colors: ['gold'], duration: 2.2, alpha: 0.6 * A });
        break;
      }
      case 'rightStrip':
        skyBase(zoneId, ctx, w, h, soft);
        stripSnow(ctx, w, h, soft, (0.6 * sky + 0.2) * (1 - 0.6 * ride(local).e), A);
        // the warp streaks carry on round the corner (vanishing point off to the left)
        warpField(ctx, w, h, t, { intensity: A * 0.8 * ride(local).e, cx: -1.5, cy: 0.35, seed: 41 });
        break;
    }
  },
};
