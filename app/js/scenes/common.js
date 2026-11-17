// Shared scene helpers.
import { duskBase, snowfall } from '../fx/index.js';

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

/** A point of another zone expressed in this zone's 0..1 coordinates (fallback when unknown). */
export function from(env, zoneId, u, v, fallback = [0.5, 0.5]) {
  return env?.from?.(zoneId, u, v) || fallback;
}
