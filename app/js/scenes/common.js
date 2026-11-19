// Shared scene helpers.
import { duskBase, snowfall, towerGlow, cottageFace, clamp, easeInOutSine } from '../fx/index.js';

/** Zones that are sky (they show the dusk starfield whenever no scene draws them, never black). */
export const SKY_ZONES = ['wall', 'rightStrip'];

/** The dusk starfield base for a sky zone. The backdrop stays transparent so the wall's sky shows through. */
export function skyBase(zoneId, ctx, w, h, t, opts = {}) {
  if (zoneId === 'wall') duskBase(ctx, w, h, t, opts);
  else if (zoneId === 'rightStrip') duskBase(ctx, w, h, t, { seed: 9, ...opts });
}

/** Light snow on the right-wall strip, used by several scenes to carry the sky round the corner. */
export function stripSnow(ctx, w, h, t, density = 0.6, alpha = 1) {
  snowfall(ctx, w, h, t, { density, alpha, layers: 2, wind: 0.15 });
}

/** Path for a zone's outline: its mask (e.g. the tree) or its rectangle. */
export function outlineOf(env, inset = 0.02) {
  const m = env?.zone?.mask;
  if (m && m.length > 2) return m;
  const a = inset, b = 1 - inset;
  return [[a, b], [a, a], [b, a], [b, b]];
}

/**
 * Gift-box faces: 'box1' / 'box1Side' (small box, on top of the tower) and 'box2' / 'box2Side' (big box, bottom).
 * Returns null for other zones.
 */
export function boxFace(zoneId) {
  const m = /^(box[12])(Side)?$/.exec(zoneId);
  if (!m) return null;
  return { box: m[1], face: m[2] ? 'side' : 'front', top: m[1] === 'box1' };
}
export const BOX_ZONES = ['box1', 'box1Side', 'box2', 'box2Side'];

/** The story-scene tower's fade: in over the first 3 s, out from `outAt` to `end`. */
export function storyAlpha(local, outAt, end) {
  return easeInOutSine(clamp(local / 3)) * (1 - easeInOutSine(clamp((local - outAt) / Math.max(0.1, end - outAt))));
}

/**
 * Story scenes (WP-08c): the gift tower softly lit, so the cats on top stand on something, dressed as a snowy
 * cottage (WP-13b: windows, a door with a wreath, snow on the top edges; the chimney is drawn on the wall by
 * scenes/stage.js `storyChimney`). Fades with storyAlpha. opts.flicker (0..1): the window beside Connor flickers.
 * Returns false for zones that aren't box faces.
 */
export function storyTower(zoneId, ctx, w, h, t, local, outAt, end, opts = {}) {
  const f = boxFace(zoneId);
  if (!f) return false;
  const alpha = storyAlpha(local, outAt, end);
  towerGlow(ctx, w, h, t, { face: f.face, top: f.top, level: f.top ? 0.16 : 0.13, alpha, ribbon: false });
  cottageFace(ctx, w, h, t, { box: f.box, face: f.face, alpha, flicker: opts.flicker || 0 });
  return true;
}

/** A point of another zone expressed in this zone's 0..1 coordinates (fallback when unknown). */
export function from(env, zoneId, u, v, fallback = [0.5, 0.5]) {
  return env?.from?.(zoneId, u, v) || fallback;
}

/**
 * Beat-driven clocks for one frame (DESIGN_SYSTEM §06: light-show motion lands on the beat).
 *   bt    show-time-like clock that surges on every beat (for chases, waves, spirals, twinkles, shimmer)
 *   soft  the same, blended 40% with real time (for snow and the sky base, so they drift rather than lurch)
 *   pulse per-beat accent 0..1;  bar  per-bar accent 0..1 (use for large areas)
 */
export function beatClock(B, start, local) {
  const w = B.warp(local);
  return { bt: start + w, soft: start + local + 0.4 * (w - local), pulse: B.pulse(local), bar: B.barPulse(local) };
}
