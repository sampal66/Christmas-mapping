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

/**
 * The gift tower in the dark (WP-08c, story scenes): a dim, steady warm wash on a box face, a faint ribbon cross and,
 * on the top box, a slightly brighter rim along the top edge where the cats stand. It only breathes very slowly
 * (one 9 s swell, ±8 %), so it never pulls focus from the pets or the star. opts: level (≈0.12–0.18), face
 * ('front' | 'side'), top (the top box: draw the rim), alpha.
 */
export function towerGlow(ctx, w, h, t, opts = {}) {
  const { face = 'front', top = false, alpha = 1, ribbon = true } = opts;
  const level = (opts.level ?? 0.15) * (face === 'side' ? 0.7 : 1) * alpha * (1 + 0.08 * Math.sin(t * 0.7));
  if (level <= 0.002) return;
  additive(ctx, 1, () => {
    const m = Math.min(w, h);
    const g = ctx.createRadialGradient(w / 2, h * 0.45, m * 0.1, w / 2, h * 0.45, m * 0.85);
    g.addColorStop(0, rgba('candle', level));
    g.addColorStop(1, rgba('candle', level * 0.45));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (ribbon) {
      const rw = Math.max(8, w * 0.09);
      ctx.fillStyle = rgba('gold', level * 0.9);
      ctx.fillRect(w / 2 - rw / 2, 0, rw, h);
      ctx.fillRect(0, h / 2 - rw / 2, w, rw);
    }
    if (top) {
      const rim = ctx.createLinearGradient(0, 0, 0, h * 0.12);
      rim.addColorStop(0, rgba('candle', Math.min(1, level * 3)));
      rim.addColorStop(1, rgba('candle', 0));
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, w, h * 0.12);
    }
  });
}

// The cottage (WP-13b, P3): what each box face carries, in the face's own 0..1 coordinates (every face is a physical
// square, so u and v are true proportions once calibrated). The door faces the audience on the big box; the window
// on the big box's side is the one beside Connor (it flickers when he hides in s05).
const COTTAGE = {
  box1: { front: [{ win: [0.3, 0.28, 0.7, 0.66] }], side: [{ win: [0.33, 0.32, 0.67, 0.64] }] },
  box2: { front: [{ door: [0.37, 0.4, 0.63, 1] }, { win: [0.74, 0.42, 0.92, 0.64] }, { win: [0.08, 0.42, 0.26, 0.64] }],
    side: [{ win: [0.3, 0.34, 0.7, 0.68], flick: true }] },
};

/** Candle-like flicker 0..1: smooth (≤ 2 Hz), so it never reads as a flash (DESIGN_SYSTEM §06). */
const flickerAt = (t) => 0.5 + 0.22 * Math.sin(t * 7.1) + 0.17 * Math.sin(t * 11.3 + 1.7) + 0.11 * Math.sin(t * 4.3 + 0.4);

/**
 * The gift tower as a little snowy cottage (story scenes, on top of towerGlow): warm four-pane windows, a door with
 * a wreath on the big box, and a lumpy snow cap along every top edge. Steady except for a slow breath; the side
 * window of the big box flickers by `flicker` (0..1, s05 Connor's hide). opts: box ('box1' | 'box2'),
 * face ('front' | 'side'), alpha, flicker.
 */
export function cottageFace(ctx, w, h, t, opts = {}) {
  const { box = 'box1', face = 'front', alpha = 1, flicker = 0 } = opts;
  const a = alpha * (face === 'side' ? 0.75 : 1);
  if (a <= 0.002) return;
  const m = Math.min(w, h);
  additive(ctx, 1, () => {
    for (const it of COTTAGE[box][face]) {
      if (it.win) {
        const [u0, v0, u1, v1] = it.win, x = u0 * w, y = v0 * h, ww = (u1 - u0) * w, hh = (v1 - v0) * h;
        const f = it.flick && flicker > 0 ? 1 - flicker * 0.55 * (1 - flickerAt(t)) : 1;
        const lit = a * f * (0.42 + 0.04 * Math.sin(t * 0.9 + u0 * 5));
        // the warm room behind the glass, brighter low down (a fire)
        const g = ctx.createLinearGradient(0, y, 0, y + hh);
        g.addColorStop(0, rgba('candle', lit * 0.6));
        g.addColorStop(1, rgba('gold', lit));
        ctx.fillStyle = g;
        const bar = Math.max(3, ww * 0.07), bx = x + ww / 2 - bar / 2, by = y + hh / 2 - bar / 2;
        ctx.fillRect(x, y, bx - x, by - y); ctx.fillRect(bx + bar, y, x + ww - bx - bar, by - y);
        ctx.fillRect(x, by + bar, bx - x, y + hh - by - bar); ctx.fillRect(bx + bar, by + bar, x + ww - bx - bar, y + hh - by - bar);
        // a soft spill of light round the window, and a frame
        const sp = ctx.createRadialGradient(x + ww / 2, y + hh / 2, 0, x + ww / 2, y + hh / 2, Math.max(ww, hh) * 0.9);
        sp.addColorStop(0, rgba('candle', lit * 0.25)); sp.addColorStop(1, rgba('candle', 0));
        ctx.fillStyle = sp; ctx.fillRect(x - ww * 0.5, y - hh * 0.5, ww * 2, hh * 2);
        ctx.strokeStyle = rgba('sepia', a * 0.5); ctx.lineWidth = Math.max(2, m * 0.012);
        ctx.strokeRect(x, y, ww, hh);
        // snow on the sill
        ctx.fillStyle = rgba('snow', a * 0.45);
        ctx.fillRect(x - ww * 0.06, y + hh, ww * 1.12, Math.max(3, hh * 0.07));
      }
      if (it.door) {
        const [u0, v0, u1, v1] = it.door, x = u0 * w, y = v0 * h, ww = (u1 - u0) * w, hh = (v1 - v0) * h, r = ww / 2;
        ctx.beginPath();
        ctx.moveTo(x, y + hh); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + ww, y + hh);
        ctx.fillStyle = rgba('candle', a * 0.12); ctx.fill();
        ctx.strokeStyle = rgba('sepia', a * 0.55); ctx.lineWidth = Math.max(2, m * 0.014); ctx.stroke();
        // knob
        ctx.fillStyle = rgba('gold', a * 0.7);
        ctx.beginPath(); ctx.ellipse(x + ww * 0.8, y + hh * 0.62, ww * 0.045, hh * 0.022, 0, 0, Math.PI * 2); ctx.fill();
        // wreath: a ring of pine with berries and a cranberry bow
        const cx = x + r, cy = y + r * 1.15, rx = ww * 0.28, ry = (rx / w) * h;
        ctx.strokeStyle = rgba('pine', a * 0.75); ctx.lineWidth = Math.max(3, ww * 0.1);
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = rgba('cranberry', a * 0.8);
        for (let i = 0; i < 7; i++) {
          const q = (i / 7) * Math.PI * 2 + 0.3;
          ctx.beginPath(); ctx.arc(cx + Math.cos(q) * rx, cy + Math.sin(q) * ry, Math.max(1.5, ww * 0.025), 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(cx, cy + ry); ctx.lineTo(cx - rx * 0.5, cy + ry * 0.7); ctx.lineTo(cx - rx * 0.5, cy + ry * 1.3);
        ctx.lineTo(cx, cy + ry); ctx.lineTo(cx + rx * 0.5, cy + ry * 0.7); ctx.lineTo(cx + rx * 0.5, cy + ry * 1.3); ctx.closePath(); ctx.fill();
      }
    }
    // snow cap along the top edge: a soft band with lumps and a few short icicle drips
    const sh = h * 0.07;
    ctx.fillStyle = rgba('snow', a * 0.5);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, sh * 0.6);
    const n = 7;
    for (let i = n; i >= 0; i--) {
      const x = (i / n) * w, lump = sh * (0.75 + 0.35 * rand(i + (box === 'box1' ? 3 : 11) + (face === 'side' ? 20 : 0)));
      ctx.quadraticCurveTo(x + w / n / 2, lump * 1.25, x, sh * 0.6);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('ice', a * 0.3);
    for (let i = 0; i < 5; i++) {
      const x = (0.1 + 0.8 * rand(i * 3.1 + (box === 'box1' ? 1 : 7))) * w, len = sh * (0.6 + 0.9 * rand(i + 40));
      ctx.beginPath(); ctx.moveTo(x - m * 0.012, sh * 0.8); ctx.lineTo(x + m * 0.012, sh * 0.8); ctx.lineTo(x, sh * 0.8 + len); ctx.closePath(); ctx.fill();
    }
  });
}

/**
 * A small chimney on the cottage roof with a soft puff of smoke drifting up and away (wall zone, behind the pets).
 * x, y: where the chimney meets the roof (px); size: chimney height (px); alpha.
 */
export function chimneyPuff(ctx, w, h, t, { x, y, size, alpha = 1 }) {
  if (alpha <= 0.002) return;
  const cw = size * 0.55;
  additive(ctx, 1, () => {
    ctx.fillStyle = rgba('candle', alpha * 0.1);
    ctx.fillRect(x - cw / 2, y - size, cw, size);
    ctx.strokeStyle = rgba('sepia', alpha * 0.45); ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.strokeRect(x - cw / 2, y - size, cw, size);
    ctx.fillStyle = rgba('snow', alpha * 0.5);
    ctx.fillRect(x - cw * 0.62, y - size - size * 0.12, cw * 1.24, size * 0.14);
    // puffs: each rises for 6 s, swelling and thinning, drifting right
    for (let i = 0; i < 4; i++) {
      const life = (t / 6 + i / 4) % 1;
      const px = x + size * (0.9 * life + 0.25 * Math.sin(t * 0.6 + i * 2)), py = y - size * (1.2 + 2.6 * life);
      const r = size * (0.25 + 0.6 * life), k = alpha * 0.16 * Math.sin(Math.PI * life);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, rgba('snow', k)); g.addColorStop(1, rgba('snow', 0));
      ctx.fillStyle = g; ctx.fillRect(px - r, py - r, r * 2, r * 2);
    }
  });
}
