// The lost star's journey in the story scenes (TREATMENT §04), drawn now so it can be rehearsed; WP-08 adds the pets,
// Pooh and Connor around exactly this motion. The tree's five-point star (star zone) turns into a night-sky star when
// it escapes (s03), crosses the constellations (s06, see s06-constellations.js), is found in Pooh's honey pot, carried by
// Connor a few steps toward the tree, and rises from his mouth back to the tree tip, where it turns into the
// five-point star again (s07).
import { projectedStar, starHalo, lostStar, starMorph, sparkleBurst, glowSprite, dot, additive, easeInOutSine, clamp, prog } from '../fx/index.js';
import { skyBase, from } from './common.js';

// Where s06 picks the star up (wall fractions); keep in sync with ENTER in s06-constellations.js.
export const SKY_SPOT = [0.86, 0.12];

const bez = (p0, p1, lift, k) => {
  const cx = (p0[0] + p1[0]) / 2, cy = Math.min(p0[1], p1[1]) - lift;
  return [(1 - k) ** 2 * p0[0] + 2 * k * (1 - k) * cx + k * k * p1[0], (1 - k) ** 2 * p0[1] + 2 * k * (1 - k) * cy + k * k * p1[1]];
};

// s07's path points in backdrop fractions (the honey pot, where Connor takes it in his mouth); stage.js places Pooh's
// pot and Connor's mouth on these. Where his walk ends follows from WALK (in units of his height).
export const RETURN_PATH = { pot: [0.42, 0.32], paw: [0.24, 0.84] };

/**
 * s07's short carry (WP-08c, owner: the 20 s floor slide skated). Connor walks WALK.cycles cycles of his
 * s07-connor-carry walk toward the tree, eased in and out over `ramp` s, stopping `stopBefore` s before `fly`; then he
 * looks up and the star rises from his mouth to the tree tip on fly → settle. The clip time is driven by the distance
 * walked, so the paws never skate, even while easing.
 * Measured from the clip (2026-11-18): the cycle repeats every 30 frames (1.0 s; frames 13, 43, 73 …, drawn on
 * threes) and the planted paw slides back ≈12 px per frame at 30 fps of a ≈510 px tall Connor: a stride of ≈0.70 of
 * his height per cycle. Frames 0–12 lead in from the shared standing start frame.
 * 1.5 cycles (≈1 Connor height) keeps him clear of the tree in the default layout (2 cycles reached its edge).
 */
export const WALK = { stride: 0.7, cycle: 1.0, lead: 13 / 30, loopLen: 4, cycles: 1.5, ramp: 0.8, stopBefore: 0.5 };
const WALK_V = WALK.stride / WALK.cycle;                          // Connor heights per second at full speed
const WALK_D = WALK.cycles * WALK.stride;                         // how far he walks, in Connor heights
const WALK_T = WALK_D / WALK_V + WALK.ramp;                       // sine ramps each cost ramp/2 of distance
/** s07: when Connor's walk starts and ends (scene seconds). */
export const walkSpan = (C) => { const end = C.at('fly') - WALK.stopBefore; return [end - WALK_T, end]; };

/**
 * s07: Connor's walk at `local`: d (Connor heights walked toward the tree), speed (0..1 of full) and clip (seconds
 * into s07-connor-carry for that distance).
 */
export function carryWalk(local, C) {
  const [a] = walkSpan(C), r = WALK.ramp, u = clamp(local - a, 0, WALK_T);
  const ramp = (x) => WALK_V * r * (x / 2 - Math.sin(Math.PI * x) / (2 * Math.PI));   // ∫ easeInOutSine
  let d, speed;
  if (u < r) { d = ramp(u / r); speed = easeInOutSine(u / r); }
  else if (u > WALK_T - r) { d = WALK_D - ramp((WALK_T - u) / r); speed = easeInOutSine((WALK_T - u) / r); }
  else { d = WALK_V * r / 2 + WALK_V * (u - r); speed = 1; }
  if (local <= a || local >= a + WALK_T) speed = 0;
  let clip = (d / WALK.stride) * WALK.cycle;
  if (clip > WALK.lead + WALK.loopLen) clip = WALK.lead + ((clip - WALK.lead) % WALK.loopLen);
  return { d, speed, clip };
}

/** The star zone's centre and five-point radius in wall pixels (so the hand-over between zones is seamless). */
function starOnWall(env, w) {
  const c = from(env, 'star', 0.5, 0.5, [0.33, 0.17]);
  const l = from(env, 'star', 0, 0.5, [0.27, 0.17]), r = from(env, 'star', 1, 0.5, [0.39, 0.17]);
  return { c, R: 0.36 * Math.abs(r[0] - l[0]) * w };
}

/**
 * s03: the star is batted off the tree, turns into a night-sky star, bounces off the gift tower and escapes.
 * `mid` (optional) draws on the wall between the sky and the star: WP-08's pets, so the star stays in front of them.
 */
export function drawEscape(zoneId, ctx, w, h, t, local, env, C, mid = null) {
  const bat = C.at('bat');
  if (zoneId === 'star') {
    if (local < bat) projectedStar(ctx, w, h, t, { alpha: clamp(local / 2), spin: 1 });
    return;
  }
  if (zoneId !== 'wall') return;
  skyBase(zoneId, ctx, w, h, t);
  mid?.();
  if (local < bat) return;
  const { c, R } = starOnWall(env, w);
  const S = [c[0] * w, c[1] * h];
  const B0 = from(env, 'box1', 0.5, -0.06, [0.78, 0.48]);
  const Bp = [B0[0] * w, B0[1] * h];
  const E = [SKY_SPOT[0] * w, SKY_SPOT[1] * h];
  const k = clamp((local - bat - 0.3) / 2);                 // five-point → night star while it tumbles
  let pos;
  if (local < bat + 0.6) pos = [S[0] + Math.sin((local - bat) * 30) * 4, S[1]];          // the knock: a little wobble
  else if (local < bat + 2.6) pos = bez(S, Bp, 0.05 * h, easeInOutSine((local - bat - 0.6) / 2));   // drops onto the tower
  else pos = bez(Bp, E, 0.25 * h, easeInOutSine(clamp((local - bat - 2.6) / (C.at('escape') + 4 - bat - 2.6))));  // and away
  const settled = prog(local, C.at('escape') + 4, C.at('escape') + 7);   // becomes one of the sky's stars
  starMorph(ctx, w, h, t, pos[0], pos[1], k, { size: R * (1 - 0.3 * settled) });
  sparkleBurst(ctx, w, h, local, { t0: bat + 2.6, x: Bp[0] / w, y: Bp[1] / h, count: 22, spread: 0.08, up: 0.6, colors: ['gold', 'snow'], duration: 1.6 });
}

/**
 * s07: found in Pooh's honey pot, handed down, carried by Connor a few steps, rises from his mouth to the tree tip,
 * five-point again. `mid` as in drawEscape (Pooh and the pets, under the star). opts.unit: Connor's height in wall
 * pixels, horizontally (his walk is measured in it).
 */
export function drawReturn(zoneId, ctx, w, h, t, local, env, C, mid = null, { unit = 0.1 * w } = {}) {
  const settle = C.at('settle');
  if (zoneId === 'star') {
    const a = clamp((local - settle - 2.5) / 0.5);
    if (a <= 0) return;
    projectedStar(ctx, w, h, t, { alpha: a, spin: 1 });
    starHalo(ctx, w, h, t, { intensity: 0.6 * a, pulse: 0.2, period: 4, size: 0.5 });
    sparkleBurst(ctx, w, h, local, { t0: settle + 2.4, count: 30, spread: 0.7, colors: ['gold', 'snow'], duration: 2.2 });
    return;
  }
  if (zoneId !== 'wall') return;
  skyBase(zoneId, ctx, w, h, t);
  mid?.();
  const found = C.at('found');
  if (local < found || local > settle + 2.6) return;
  const bd = (u, v) => { const p = from(env, 'backdrop', u, v, [0.53 + u * 0.47, v]); return [p[0] * w, p[1] * h]; };
  const POT = bd(...RETURN_PATH.pot), PAW = bd(...RETURN_PATH.paw), END = [PAW[0] - WALK_D * unit, PAW[1]];
  const { c, R } = starOnWall(env, w);
  const TIP = [c[0] * w, c[1] * h];
  let pos, k = 1;                                            // k: 1 = night star, 0 = five-point
  if (local < found + 7) pos = POT;                           // glowing in the honey pot
  else if (local < C.at('carry')) pos = bez(POT, PAW, 0.02 * h, easeInOutSine(prog(local, found + 7, C.at('carry'))));
  else if (local < C.at('fly')) {                             // in Connor's mouth, bobbing twice per walk cycle
    const { d, speed, clip } = carryWalk(local, C);
    pos = [PAW[0] - d * unit, PAW[1] - speed * Math.abs(Math.sin(Math.PI * 2 * clip / WALK.cycle)) * 0.008 * h];
  } else if (local < settle) {                                // rises from his mouth in a sparkle arc to the tree tip
    const q = easeInOutSine(prog(local, C.at('fly'), settle));
    pos = bez(END, TIP, 0.18 * h, q);
    const trail = glowSprite('gold', 0.3);
    additive(ctx, clamp((local - C.at('fly')) / 0.8) * clamp((settle - local) / 1.2), () => {
      for (let j = 1; j <= 14; j++) {
        const qj = easeInOutSine(clamp(prog(local - j * 0.09, C.at('fly'), settle)));
        if (qj <= 0) break;
        const [x, y] = bez(END, TIP, 0.18 * h, qj);
        ctx.globalAlpha = 0.7 * (1 - j / 15);
        dot(ctx, trail, x + Math.sin(j * 2.3 + t * 2) * 0.004 * w, y + Math.cos(j * 1.7 + t * 2) * 0.004 * w, 0.009 * w * (1 - j / 20));
      }
    });
  } else { pos = TIP; k = 1 - clamp((local - settle) / 2.2); }
  // the lift-off from his mouth: a small, soft puff of sparkles
  sparkleBurst(ctx, w, h, local, { t0: C.at('fly'), x: END[0] / w, y: END[1] / h, count: 14, spread: 0.04, up: 0.8, colors: ['gold', 'snow'], duration: 1.4 });
  const appear = clamp((local - found) / 2.5);
  if (k >= 1) lostStar(ctx, pos[0], pos[1], t, { size: Math.min(w, h) * 0.06, alpha: appear });
  else starMorph(ctx, w, h, t, pos[0], pos[1], k, { size: R });
}

/** s08: the star back on the tree glows warmer. */
export function drawWarmStar(zoneId, ctx, w, h, t, local) {
  if (zoneId !== 'star') return;
  projectedStar(ctx, w, h, t, { spin: 1 });
  starHalo(ctx, w, h, t, { intensity: 0.45 + 0.25 * clamp(local / 20), color: 'candle', pulse: 0.25, period: 5, size: 0.5 });
}
