// Box faces and footlights.
import { rgb, rgba } from '../palette.js';
import { rand, clamp, glowSprite, dot, additive, glowStroke, easeOutBack } from './util.js';

/**
 * Box face sequencer: the face is split into a grid whose cells light in turn on the beat, with a soft decay
 * (never a hard on/off), plus a ribbon cross and a glowing outline. The ribbon sits at the centre of every face, so
 * it lines up across the box's corner. opts: beats (beatGrid), shift (s), level 0..1, face ('front' | 'side'),
 * colors, ribbon (token), grid (cells per side), mode ('cells' | 'all' | 'outline'), seed.
 */
export function boxFaces(ctx, w, h, t, opts = {}) {
  const { beats, shift = 0, colors = ['plum', 'cranberry'], ribbon = 'gold', grid = 2, mode = 'cells', seed = 1, face = 'front' } = opts;
  // The side face is shaded a little darker, so the tower reads as a solid 3D object.
  const level = (opts.level ?? 1) * (face === 'side' ? 0.72 : 1);
  if (level <= 0 || !beats) return;
  const { n, phase: ph } = beats.at(t - shift);
  const decay = Math.exp(-ph * 2.2);                      // soft fall-off between beats
  const cells = grid * grid;
  const [r, g_, bl] = rgb(colors[n % colors.length]);
  const m = Math.min(w, h);
  additive(ctx, level, () => {
    // Soft base glow (never a flat fill): brighter in the middle, falling off to the edges.
    const base = mode === 'all' ? 0.3 + 0.35 * decay : 0.16;
    const g = ctx.createRadialGradient(w / 2, h / 2, m * 0.1, w / 2, h / 2, m * 0.75);
    g.addColorStop(0, `rgba(${r},${g_},${bl},${base})`);
    g.addColorStop(1, `rgba(${r},${g_},${bl},${base * 0.35})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (mode === 'cells') {
      const order = Math.floor(rand(seed + n) * cells);
      const cw = w / grid, ch = h / grid;
      const sprite = glowSprite(colors[n % colors.length], 0.12);
      ctx.globalAlpha = level * (0.35 + 0.6 * decay);
      dot(ctx, sprite, ((order % grid) + 0.5) * cw, (Math.floor(order / grid) + 0.5) * ch, Math.max(cw, ch) * 0.75);
      ctx.globalAlpha = level;
    }
    // ribbon cross
    const rw = Math.max(10, w * 0.1);
    ctx.fillStyle = rgba(ribbon, 0.55 + 0.25 * decay);
    ctx.fillRect(w / 2 - rw / 2, 0, rw, h);
    ctx.fillRect(0, h / 2 - rw / 2, w, rw);
    ctx.beginPath(); ctx.rect(4, 4, w - 8, h - 8);
    glowStroke(ctx, ribbon, Math.max(6, w / 40));
  });
}

/**
 * The box "opens": a glow spills out of the top edge and sparkles rise. opts: open 0..1, color, alpha.
 */
export function boxOpen(ctx, w, h, t, opts = {}) {
  const { open = 1, color = 'gold', alpha = 1 } = opts;
  if (open <= 0) return;
  const k = easeOutBack(clamp(open));
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.8);
  g.addColorStop(0, rgba(color, 0.9 * clamp(k)));
  g.addColorStop(1, rgba(color, 0));
  additive(ctx, alpha, () => {
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const sprite = glowSprite('snow', 0.3);
    for (let i = 0; i < 14; i++) {
      const life = (t * 0.7 + rand(i)) % 1;
      ctx.globalAlpha = alpha * clamp(open) * (1 - life);
      dot(ctx, sprite, (0.15 + rand(i + 0.5) * 0.7) * w, h * (0.7 - life * 0.75), w * 0.04);
    }
  });
}

/**
 * Footlights along the stage strip: warm bulbs with a chase. opts: warm 0..1 (warm-up), chase 0..1 (amount),
 * speed (bulbs/s), count, colors, alpha.
 */
export function footlights(ctx, w, h, t, opts = {}) {
  const { warm = 1, chase = 0.6, speed = 6, count = 18, colors = ['candle', 'gold'], alpha = 1 } = opts;   // pass grid.warp() as t to chase on the beat
  if (warm <= 0) return;
  const g = ctx.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, rgba('candle', 0.35 * warm));
  g.addColorStop(1, rgba('candle', 0));
  additive(ctx, alpha, () => {
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const head = (t * speed) % count;
    for (let i = 0; i < count; i++) {
      const d = Math.min(Math.abs(i - head), count - Math.abs(i - head));
      const c = Math.exp(-d * d / 3);
      ctx.globalAlpha = alpha * warm * (0.45 + 0.55 * (1 - chase) + chase * 0.55 * c);
      dot(ctx, glowSprite(colors[i % colors.length], 0.3), (i + 0.5) * w / count, h * 0.55, h * (0.45 + 0.25 * c * chase));
    }
  });
}

/**
 * A soft vertical band of light travelling round a box: position p runs 0..1 across the side face (back edge →
 * corner) and 1..2 across the front (corner → right edge), so one sweep wraps continuously round the corner.
 * opts: p, face ('front' | 'side'), color, width (share of a face), alpha.
 */
export function wrapSweep(ctx, w, h, t, opts = {}) {
  const { p = 0, face = 'front', color = 'snow', width = 0.35, alpha = 1 } = opts;
  const x = (p - (face === 'side' ? 0 : 1)) * w;
  const bw = width * w;
  if (x < -bw || x > w + bw || alpha <= 0) return;
  const g = ctx.createLinearGradient(x - bw, 0, x + bw, 0);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.5, rgba(color, 0.85 * (face === 'side' ? 0.75 : 1)));
  g.addColorStop(1, rgba(color, 0));
  additive(ctx, alpha, () => { ctx.fillStyle = g; ctx.fillRect(Math.max(0, x - bw), 0, bw * 2, h); });
}
