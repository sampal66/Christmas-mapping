// Theatre curtains (WP-13a, WP-12 P2): projected velvet drapes with gold trim and soft folds on the wall and the
// right-wall strip. Closed in the pre-show, they open over ≈ 4 s at the start of s01 and close again after the s10
// title, so the show has a clear "it starts / it ends" moment. Slow eases only (DESIGN_SYSTEM §06: no fast sweep).
// When fully open nothing is drawn, so the scenes in between never pay for them.
import { mix, rgba } from '../palette.js';
import { clamp, easeInOutSine } from './util.js';

const VELVET = { deep: mix('night', 'cranberry', 0.16), shade: mix('night', 'cranberry', 0.3), mid: mix('night', 'cranberry', 0.46), lit: mix('night', 'cranberry', 0.62) };

/**
 * Curtain state for a scene: 0 = closed, 1 = open. Opens from `openAt` over `dur` s, closes from `closeAt` over `dur` s.
 * Either may be omitted (null).
 */
export function curtainOpen(local, { openAt = null, closeAt = null, dur = 4 } = {}) {
  let k = openAt === null ? 1 : clamp((local - openAt) / dur);
  if (closeAt !== null) k = Math.min(k, 1 - clamp((local - closeAt) / dur));
  return k;
}

// The drapes and the valance are baked once per zone size and then only blitted (a scaled drawImage per panel): the
// many-stop velvet gradients cost too much to redraw every frame (WP-13a render-cost budget).
const bakes = new Map();
const canvas = (w, h) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
};

/** A velvet drape `pw` × `h` px with `folds` soft folds, footlight wash and gold hem (no edge braid: drawn live). */
function bakePanel(pw, h, folds, mirror = false) {
  const c = canvas(pw, h), g = c.getContext('2d');
  if (mirror) { g.translate(pw, 0); g.scale(-1, 1); }
  const v = g.createLinearGradient(0, 0, pw, 0);
  const tones = [VELVET.deep, VELVET.mid, VELVET.lit, VELVET.shade];
  for (let k = 0; k <= folds * 4; k++) v.addColorStop(k / (folds * 4), tones[k % 4]);
  g.fillStyle = v;
  g.fillRect(0, 0, pw, h);
  // soft vertical shading: darker up under the valance, a warm footlight wash on the hem
  const s = g.createLinearGradient(0, 0, 0, h);
  s.addColorStop(0, 'rgba(0,0,0,0.45)'); s.addColorStop(0.3, 'rgba(0,0,0,0)');
  s.addColorStop(0.8, 'rgba(0,0,0,0)'); s.addColorStop(1, rgba('candle', 0.16));
  g.fillStyle = s;
  g.fillRect(0, 0, pw, h);
  const hh = Math.max(4, h * 0.016);
  const gh = g.createLinearGradient(0, h - hh * 1.6, 0, h - hh * 0.6);
  gh.addColorStop(0, mix('night', 'gold', 0.4)); gh.addColorStop(0.5, mix('night', 'gold', 0.8)); gh.addColorStop(1, mix('night', 'gold', 0.4));
  g.fillStyle = gh;
  g.fillRect(0, h - hh * 1.6, pw, hh);
  return c;
}

/** The valance: velvet swags with a gold fringe, `swags` scallops across `w`; the canvas is 0.2 h tall. */
function bakeValance(w, h, swags) {
  const VH = Math.ceil(h * 0.2), c = canvas(w, VH), g = c.getContext('2d');
  const H = h * 0.12, dip = h * 0.05, sw = w / swags;
  const edge = () => { for (let i = swags - 1; i >= 0; i--) g.quadraticCurveTo((i + 0.5) * sw, H + dip * 2, i * sw, H); };
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, H); edge(); g.closePath();
  const v = g.createLinearGradient(0, 0, 0, H + dip);
  v.addColorStop(0, VELVET.deep); v.addColorStop(0.55, VELVET.lit); v.addColorStop(1, VELVET.shade);
  g.fillStyle = v;
  g.fill();
  // fringe along the scallops: a gold line, then a fainter dotted one just below (tassels catching the light)
  g.beginPath(); g.moveTo(w, H); edge();
  g.lineCap = 'round';
  g.strokeStyle = mix('night', 'gold', 0.85); g.lineWidth = Math.max(3, h * 0.008); g.stroke();
  g.translate(0, h * 0.012);
  g.strokeStyle = mix('night', 'gold', 0.4); g.lineWidth = Math.max(2, h * 0.006); g.setLineDash([h * 0.004, h * 0.006]); g.stroke();
  return c;
}

function bakeFor(zone, w, h) {
  const key = `${zone}|${w}x${h}`;
  let b = bakes.get(key);
  if (!b) {
    b = zone === 'strip'
      ? { left: bakePanel(w, h, 5), valance: bakeValance(w, h, 1) }
      : { left: bakePanel(Math.ceil(w * 0.504), h, 9), right: bakePanel(Math.ceil(w * 0.504), h, 9, true), valance: bakeValance(w, h, 5) };
    bakes.set(key, b);
  }
  return b;
}

/**
 * Blits the baked drape into [x0, x1] (its folds gather as it narrows), plus the braid on its leading edge. At full
 * width it is a 1:1 blit; while it moves it is scaled without smoothing (the velvet is soft, and a smoothed scale of
 * a wall-sized image costs several ms a frame).
 */
function panel(ctx, w, h, img, x0, x1, braid) {
  if (x1 - x0 < 1 || x1 <= 0 || x0 >= w) return;
  if (Math.abs(x1 - x0 - img.width) < 0.5) ctx.drawImage(img, Math.round(x0), 0);
  else {
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x0, 0, x1 - x0, h);
    ctx.imageSmoothingEnabled = sm;
  }
  const tw = Math.max(3, w * 0.006), ex = braid === 'right' ? x1 - tw : x0;
  ctx.fillStyle = mix('night', 'gold', 0.7);
  ctx.fillRect(ex, 0, tw, h);
  ctx.fillStyle = mix('night', 'gold', 0.95);
  ctx.fillRect(ex + tw * 0.35, 0, tw * 0.3, h);
}

/**
 * Draws the curtains into a zone. opts: open (0 closed → 1 open), zone ('wall' — two drapes meeting in the middle,
 * gathering to the edges — or 'strip' — one drape gathering to the strip's outer edge, u = 1).
 * Opening, each drape first gathers its folds toward its edge, then the bundle slides out of frame and the valance
 * rises away, so nothing of it stays on the wall during the show.
 */
export function curtains(ctx, w, h, t, { open = 0, zone = 'wall' } = {}) {
  if (open >= 1) return;
  const e = easeInOutSine(clamp(open));
  const lift = easeInOutSine(clamp((open - 0.3) / 0.7)) * h * 0.2;   // the valance rises away in the second part
  // Closed, the drapes hold still (no sway), so the scene changes under them (pre-show → s01, s10 → pre-show) are seamless.
  const B = bakeFor(zone, w, h);
  if (zone === 'strip') {
    const G = w * 0.3;                                    // gathered bundle width
    const lead = e * (w + G);                             // leading edge travels from the corner (u = 0) outwards
    panel(ctx, w, h, B.left, lead, Math.max(w, lead + G), 'left');
  } else {
    const half = w * 0.5, G = w * 0.08, over = w * 0.004;
    const lead = (half + over) - e * (half + over + G);   // the left drape's leading edge, from the middle to off-frame
    panel(ctx, w, h, B.left, Math.min(0, lead - G), lead, 'right');
    panel(ctx, w, h, B.right, w - lead, Math.max(w, w - lead + G), 'left');
  }
  const valance = B.valance;
  if (lift < h * 0.2) ctx.drawImage(valance, 0, Math.round(-lift));
}
