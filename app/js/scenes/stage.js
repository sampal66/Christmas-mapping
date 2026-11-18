// The story stage (WP-08): places the pets' character clips (WP-04b) and picks which clip each pet plays at a scene
// time. Pets are drawn on the WALL zone, under the backdrop canvas, so the story's lost star (also on the wall, drawn
// after them by star-story.js) stays in front of Connor's mouth and Pooh's pot.
//
// Where they stand (default layout, TREATMENT §07): the dogs on the sideboard top between the tree and the gift tower
// (Alaska, then Connor), the cats on top of the tower (Orion, then Gandalf), so left → right is still Alaska, Connor,
// Orion, Gandalf and nobody is ever over the tree. Sizes are relative to Connor, whose size is fixed by s07: the star
// rides at his mouth along star-story's carry path, so his mouth height above the floor sets his height.
//
// Clip choice: a pet's track is a list of events { at, end, id, loop, time? } (later events win while they overlap;
// `time(local)`, when given, sets the clip time, e.g. a walk cycle driven by the distance walked). Between
// events the pet plays its idle loop. Every change of clip cross-fades over XFADE seconds. A missing or still-loading
// clip simply isn't drawn.
import { drawClip, preloadClips, EAR_FADE } from '../fx/clips.js';
import { easeInOutSine, clamp, starDustArrive, starDustLeave } from '../fx/index.js';
import { RETURN_PATH } from './star-story.js';

export const PETS = ['alaska', 'connor', 'orion', 'gandalf'];
/**
 * Each pet's one fixed size, relative to Connor (owner, from a family photo 2026-11-18): Connor the biggest, Alaska
 * about ¾ of him, Orion and Gandalf about half and the same as each other. Never change these per scene or per clip:
 * a pet's size only changes if it moves nearer or farther (opts.scale on drawPet / drawPetClip is for depth only).
 */
export const PET_SIZE = { connor: 1, alaska: 0.75, orion: 0.5, gandalf: 0.5 };
const XFADE = 0.3;
// s07: Connor's mouth in the carry clip, at (0.85, 0.30) of the frame. In units of his height: how far it is in front
// of his anchor point, and how high above his feet.
export const CONNOR_MOUTH = (0.85 - 0.493) * 1.222 / 0.944;
const CONNOR_MOUTH_UP = 0.7 / 0.944;

// Every clip of a pet starts from the same start frame (WP-04b), but each is cropped to its own motion, so the pet
// fills a different share of each frame. Measured from each clip's first frame (the matte's bounding box):
// [x of the pet's centre, share of the frame height the pet fills, frame width / height]. A clip is drawn so the pet
// in it has its fixed size and stands on the same spot, whichever clip plays. Re-measure if a clip is re-cut.
const FRAME = {
  'pet-alaska-idle': [0.488, 1.0, 0.974], 'pet-alaska-lookup': [0.54, 1.0, 0.974], 'pet-alaska-talk': [0.538, 0.991, 1.044],
  'pet-connor-idle': [0.512, 0.993, 1.093], 'pet-connor-lookup': [0.503, 0.994, 1.07], 'pet-connor-talk': [0.506, 0.994, 1.104],
  'pet-gandalf-idle': [0.57, 0.993, 1.189], 'pet-gandalf-lookup': [0.552, 1.0, 1.185], 'pet-gandalf-talk': [0.619, 1.0, 1.296],
  'pet-orion-idle': [0.6, 1.0, 1.2], 'pet-orion-lookup': [0.573, 0.989, 1.096], 'pet-orion-talk': [0.588, 1.0, 1.193],
  's03-alaska-boss': [0.413, 0.928, 1.137], 's03-alaska-nooo': [0.431, 0.967, 1.185], 's03-gandalf-bat': [0.416, 0.922, 1.607],
  's03-gandalf-oops': [0.54, 1.0, 1.215], 's05-connor-hide': [0.432, 0.994, 1.274], 's05-gandalf-bells': [0.595, 0.933, 1.189],
  's07-connor-brave': [0.444, 0.987, 1.211], 's07-connor-carry': [0.493, 0.944, 1.222], 's07-pooh-float': [0.4, 0.985, 0.563],
  's08-gandalf-soft': [0.547, 0.994, 1.207], 's10-alaska-wave': [0.477, 0.994, 1.178], 's10-connor-wave': [0.454, 0.994, 1.319],
  's10-gandalf-wave': [0.556, 0.998, 1.263], 's10-orion-wave': [0.555, 1.0, 1.419],
};
// The pet's body width / its height (idle start frame), for laying out slots before the clips load.
const BODY = Object.fromEntries(['alaska', 'connor', 'orion', 'gandalf'].map((p) => [p, FRAME[`pet-${p}-idle`][2] / FRAME[`pet-${p}-idle`][1]]));

export const idleOf = (p) => `pet-${p}-idle`;
export const talk = (p, at, len) => ({ at, end: at + len, id: `pet-${p}-talk`, loop: true });
export const look = (p, at, end) => ({ at, end, id: `pet-${p}-lookup`, loop: false });
export const act = (id, at, end, loop = false) => ({ at, end, id, loop });

/** Every clip a set of tracks can play (idle loops included): for a scene's enter(). */
export function trackClips(tracks) {
  const ids = new Set();
  for (const [p, evs] of Object.entries(tracks)) {
    if (PETS.includes(p)) ids.add(idleOf(p));
    for (const e of evs) ids.add(e.id);
  }
  return [...ids];
}
export const preloadTracks = (tracks) => preloadClips(trackClips(tracks));

/** The pet's clip at `local`: { id, time, loop }. Idle loops are phase-shifted per pet so they never breathe in step. */
function stateAt(pet, events, local) {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (local >= e.at && local < e.end) return { id: e.id, at: e.at, loop: e.loop, time: e.time };
  }
  return { id: idleOf(pet), at: -1.7 * PETS.indexOf(pet), loop: true };
}
const clipTime = (st, local) => (st.time ? st.time(local) : local - st.at);

/** Start of the clip segment `local` is in (the latest event start or end at or before it). */
function segmentStart(events, local) {
  let s = -Infinity;
  for (const e of events) {
    if (e.at <= local && e.at > s) s = e.at;
    if (e.end <= local && e.end > s) s = e.end;
  }
  return s;
}

/**
 * Horizontal stretch that undoes the zone's non-square pixels (a zone canvas is stretched onto its quad), so the
 * characters keep their drawn proportions on the wall.
 */
export function aspectFix(env, w, h) {
  const q = env?.zone?.quad;
  if (!q) return 1;
  const sx = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) / w;
  const sy = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]) / h;
  return sx > 0 && sy > 0 ? sy / sx : 1;
}

const at = (env, zone, u, v, fb) => env?.from?.(zone, u, v) || fb;

/**
 * The stage in this zone's pixels: floor line, the top of the gift tower, Connor's height, and a slot (feet point,
 * facing) per pet. Uses the backdrop's bottom edge as the floor, kept inside the zone.
 */
export function stageLayout(env, w, h) {
  const k = aspectFix(env, w, h);
  const P = (zone, u, v, fb) => { const q = at(env, zone, u, v, fb); return q ? [q[0] * w, q[1] * h] : null; };
  const paw = P('backdrop', ...RETURN_PATH.paw, [0.65, 0.85]);
  const floorY = Math.min(P('backdrop', RETURN_PATH.paw[0], 1, [0.65, 1])[1], 0.99 * h);
  // Connor's size: his mouth in the s07 carry clip meets the star's carry path above the floor.
  const H = clamp((floorY - paw[1]) / CONNOR_MOUTH_UP, 0.1 * h, 0.3 * h);
  const width = (p) => H * PET_SIZE[p] * BODY[p] * k;
  // The dogs stand close to the tower (as far from the tree as they can): Connor just left of the big box, Alaska
  // tucked in front of his shoulder.
  const box = P('box2Side', 0, 1, null) || P('box2', 0, 1, [0.76, 1]);
  const connorX = box[0] - 0.56 * width('connor');
  const alaskaX = connorX - 0.5 * width('connor') - 0.2 * width('alaska');
  // Tower top: the visible side face's top edge, then the front face's.
  const sideL = P('box1Side', 0, 0, null), sideR = P('box1Side', 1, 0, null);
  const frontL = P('box1', 0, 0, [0.79, 0.52]), frontR = P('box1', 1, 0, [0.9, 0.52]);
  const L = sideL && sideR ? sideL : frontL;
  const towerAt = (s) => {                                   // s: 0..1 across the whole top edge
    const x = L[0] + (frontR[0] - L[0]) * s;
    const seg = x < frontL[0] && L !== frontL ? [sideL, sideR] : [frontL, frontR];
    const f = clamp((x - seg[0][0]) / ((seg[1][0] - seg[0][0]) || 1));
    return [x, seg[0][1] + (seg[1][1] - seg[0][1]) * f];
  };
  return {
    k, H, floorY, paw, towerAt,
    slot: {
      alaska: { x: alaskaX, y: floorY, flip: false },
      connor: { x: connorX, y: floorY, flip: false },
      orion: { ...xy(towerAt(0.27)), flip: true },          // the cats face left, toward the team and the tree
      gandalf: { ...xy(towerAt(0.76)), flip: true },
    },
  };
}
const xy = ([x, y]) => ({ x, y });

/** Draws one clip of a pet with its feet (or `anchor`) at x, y. Returns false when the clip isn't available. */
export function drawPetClip(ctx, L, pet, id, time, { x, y, flip = false, alpha = 1, loop = false, anchor, scale = 1 }) {
  const [cx, fill] = FRAME[id] || [0.5, 1];
  const hh = L.H * (PET_SIZE[pet] ?? 1) * scale / fill;
  if (!anchor) anchor = [cx, 1];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(L.k, 1);
  const ok = drawClip(ctx, id, time, { x: 0, y: 0, h: hh, alpha, loop, flip, anchor, topFade: EAR_FADE });
  ctx.restore();
  return ok;
}

/**
 * Draws a pet at `local` from its track: the current clip, cross-faded with the previous one for XFADE seconds
 * after each change. opts: x, y (feet), flip, alpha, scale.
 */
export function drawPet(ctx, L, pet, events, local, opts) {
  if ((opts.alpha ?? 1) <= 0.01) return;
  const cur = stateAt(pet, events, local);
  const s0 = segmentStart(events, local);
  const k = (local - s0) / XFADE;
  if (k < 1) {
    const prev = stateAt(pet, events, s0 - 1e-3);
    if (prev.id !== cur.id) {
      const e = easeInOutSine(clamp(k));
      drawPetClip(ctx, L, pet, prev.id, clipTime(prev, local), { ...opts, loop: prev.loop, alpha: (opts.alpha ?? 1) * (1 - e) });
      drawPetClip(ctx, L, pet, cur.id, clipTime(cur, local), { ...opts, loop: cur.loop, alpha: (opts.alpha ?? 1) * e });
      return;
    }
  }
  drawPetClip(ctx, L, pet, cur.id, clipTime(cur, local), { ...opts, loop: cur.loop });
}

// Star-dust entrances and exits (WP-08c, owner: no popping in from nowhere). Arrivals are staggered ARRIVE_GAP s apart
// so the landing glows stay under 2.5 accents/s (DESIGN_SYSTEM §06); exits LEAVE_GAP s apart.
const SWIRL = 1.2, ARRIVE_GAP = 0.45, LEAVE_GAP = 0.3, DISSOLVE = 0.9, RISE = 1.8;

/**
 * Pet i's presence at `local`: the star-dust swirl starts at inAt + i·ARRIVE_GAP and the pet fades in (growing from
 * 85 %) from the swirl's centre as it lands; from outAt + i·LEAVE_GAP it dissolves into rising sparkles.
 * Returns { alpha, scale, arrive, leave } (arrive / leave: the effects' start times).
 */
export function presence(local, i, inAt, outAt) {
  const arrive = inAt + ARRIVE_GAP * i, leave = outAt + LEAVE_GAP * i;
  const a = easeInOutSine(clamp((local - arrive - 0.75 * SWIRL) / 0.6));
  const b = 1 - easeInOutSine(clamp((local - leave) / DISSOLVE));
  return { alpha: a * b, scale: 0.85 + 0.15 * a, arrive, leave };
}

/**
 * All four pets in their slots (back to front: tower cats, then Alaska, then Connor in front), each arriving and
 * leaving in star dust. override[p]: slot fields (x, y, flip, alpha, hidden, inAt).
 */
export function drawPets(ctx, L, tracks, local, { inAt = 0, outAt = Infinity, override = {} } = {}) {
  for (const p of ['orion', 'gandalf', 'alaska', 'connor']) {
    const s = { ...L.slot[p], ...(override[p] || {}) };
    if (s.hidden) continue;
    const i = PETS.indexOf(p);
    const { alpha, scale, arrive, leave } = presence(local, i, s.inAt ?? inAt, outAt);
    // sparkles the same size for every pet (a cat's would be specks), swirls at least Alaska-sized
    const ph = L.H * PET_SIZE[p], cy = s.y - 0.5 * ph, a0 = s.alpha ?? 1, spark = 0.03 * L.H, sw = Math.max(ph, 0.75 * L.H);
    if (alpha > 0.01) {
      ctx.save();
      ctx.translate(s.x, cy); ctx.scale(scale, scale); ctx.translate(-s.x, -cy);
      drawPet(ctx, L, p, tracks[p] || [], local, { x: s.x, y: s.y, flip: s.flip, alpha: alpha * a0 });
      ctx.restore();
    }
    starDustArrive(ctx, local, { x: s.x, y: cy, size: sw, spark, t0: arrive, dur: SWIRL, alpha: a0, seed: i + 1, dir: i % 2 ? -1 : 1 });
    starDustLeave(ctx, local, { x: s.x, y: cy, size: ph, spark, width: ph * BODY[p] * L.k, t0: leave, dur: RISE, alpha: a0, seed: i + 5 });
  }
}
