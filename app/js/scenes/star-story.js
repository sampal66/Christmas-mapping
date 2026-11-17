// The lost star's journey in the story scenes (TREATMENT §04), drawn now so it can be rehearsed; WP-08 adds the pets,
// Pooh and Connor around exactly this motion. The tree's five-point star (star zone) turns into a night-sky star when
// it escapes (s03), crosses the constellations (s06, see s06-constellations.js), is found in Pooh's honey pot, carried by
// Connor along the ground line and flies back to the tree tip, where it turns into the five-point star again (s07).
import { projectedStar, starHalo, lostStar, starMorph, sparkleBurst, easeInOutSine, clamp, prog } from '../fx/index.js';
import { skyBase, from } from './common.js';

// Where s06 picks the star up (wall fractions); keep in sync with ENTER in s06-constellations.js.
export const SKY_SPOT = [0.86, 0.12];

const bez = (p0, p1, lift, k) => {
  const cx = (p0[0] + p1[0]) / 2, cy = Math.min(p0[1], p1[1]) - lift;
  return [(1 - k) ** 2 * p0[0] + 2 * k * (1 - k) * cx + k * k * p1[0], (1 - k) ** 2 * p0[1] + 2 * k * (1 - k) * cy + k * k * p1[1]];
};

/** The star zone's centre and five-point radius in wall pixels (so the hand-over between zones is seamless). */
function starOnWall(env, w) {
  const c = from(env, 'star', 0.5, 0.5, [0.33, 0.17]);
  const l = from(env, 'star', 0, 0.5, [0.27, 0.17]), r = from(env, 'star', 1, 0.5, [0.39, 0.17]);
  return { c, R: 0.36 * Math.abs(r[0] - l[0]) * w };
}

/** s03: the star is batted off the tree, turns into a night-sky star, bounces off the gift tower and escapes. */
export function drawEscape(zoneId, ctx, w, h, t, local, env, C) {
  const bat = C.at('bat');
  if (zoneId === 'star') {
    if (local < bat) projectedStar(ctx, w, h, t, { alpha: clamp(local / 2), spin: 1 });
    return;
  }
  if (zoneId !== 'wall') return;
  skyBase(zoneId, ctx, w, h, t);
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

/** s07: found in Pooh's honey pot, handed down, carried by Connor, flown to the tree tip, five-point again. */
export function drawReturn(zoneId, ctx, w, h, t, local, env, C) {
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
  const found = C.at('found');
  if (local < found || local > settle + 2.6) return;
  const bd = (u, v) => { const p = from(env, 'backdrop', u, v, [0.53 + u * 0.47, v]); return [p[0] * w, p[1] * h]; };
  const POT = bd(0.42, 0.32), PAW = bd(0.24, 0.84), END = bd(0.04, 0.84);
  const { c, R } = starOnWall(env, w);
  const TIP = [c[0] * w, c[1] * h];
  let pos, k = 1;                                            // k: 1 = night star, 0 = five-point
  if (local < found + 7) pos = POT;                           // glowing in the honey pot
  else if (local < C.at('carry')) pos = bez(POT, PAW, 0.02 * h, easeInOutSine(prog(local, found + 7, C.at('carry'))));
  else if (local < C.at('fly')) {                             // carried along the ground line, bobbing with each step
    const q = easeInOutSine(prog(local, C.at('carry'), C.at('fly')));
    pos = [PAW[0] + (END[0] - PAW[0]) * q, PAW[1] + (END[1] - PAW[1]) * q - Math.abs(Math.sin(local * Math.PI * 1.8)) * 0.012 * h];
  } else if (local < settle) pos = bez(END, TIP, 0.18 * h, easeInOutSine(prog(local, C.at('fly'), settle)));
  else { pos = TIP; k = 1 - clamp((local - settle) / 2.2); }
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
