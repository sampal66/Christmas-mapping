// Transitions (DESIGN_SYSTEM §06: iris wipes and fades, no hard cuts). Scenes draw their base first, then
// the content inside one of these, so a fade or iris always resolves to the dusk starfield, never to black.
import { clamp, easeInOutSine } from './util.js';

/** Scene alpha with eased fade-in at the start and fade-out before `duration`. */
export function fadeInOut(local, duration, inS = 2, outS = 2) {
  return easeInOutSine(clamp(Math.min(local / inS, (duration - local) / outS)));
}

/**
 * Iris: runs draw() clipped to a circle that opens (p 0 → 1) from (cx, cy) in 0..1 coords.
 * Use p = 1 - k to close it.
 */
export function iris(ctx, w, h, p, draw, cx = 0.5, cy = 0.5) {
  if (p <= 0) return;
  if (p >= 1) { draw(); return; }
  const R = Math.hypot(Math.max(cx, 1 - cx) * w, Math.max(cy, 1 - cy) * h) * easeInOutSine(p);
  ctx.save();
  ctx.beginPath(); ctx.arc(cx * w, cy * h, R, 0, Math.PI * 2); ctx.clip();
  draw();
  ctx.restore();
}

/** Runs draw() at a global alpha (a cross-fade over the base). */
export function fade(ctx, alpha, draw) {
  if (alpha <= 0.002) return;
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * clamp(alpha);
  draw();
  ctx.globalAlpha = a;
}
