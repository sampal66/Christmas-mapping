// Title cards (DESIGN_SYSTEM §04): Mountains of Christmas for titles, Playfair Display italic for names and
// captions. Both are bundled in app/fonts (declared in style.css) so they work offline; system serif fallback.
import { rgba } from '../palette.js';
import { clamp, easeInOutSine } from './util.js';

export const FONTS = {
  title: (px) => `700 ${px}px "Mountains of Christmas", "Georgia", serif`,
  name: (px) => `italic 400 ${px}px "Playfair Display", "Georgia", serif`,
  caption: (px) => `400 ${px}px "Playfair Display", "Georgia", serif`,
};

/** Starts loading the bundled fonts (call from a scene's enter()); canvas text uses them once ready. */
export function loadFonts() {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load(FONTS.title(96), '¡Feliz Navidad!'),
    document.fonts.load(FONTS.name(72), '¡Feliz Navidad!'),
    document.fonts.load(FONTS.caption(48), 'Navidad'),
  ]).catch(() => {});
}

/**
 * Glowing title card. opts: lines (≤ 2 short lines), style ('title' | 'name' | 'caption'), size (px,
 * ≥ 96 for titles), color, glow, alpha, x, y (0..1 centre), maxWidth (share of w), reveal 0..1 (soft rise-in).
 */
// Rendered titles are cached as bitmaps: text with a shadow blur is costly to redraw every frame on the iPad.
const cache = new Map();
const fontsReady = () => typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';

function renderTitle(lines, style, size, color, glow) {
  const probe = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas');
  const p = probe.getContext('2d');
  p.font = FONTS[style](size);
  const pad = Math.ceil(size * 0.6);
  const lh = size * 1.1;
  const tw = Math.ceil(Math.max(...lines.map((l) => p.measureText(l).width))) + pad * 2;
  const th = Math.ceil(lh * lines.length) + pad * 2;
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(tw, th) : Object.assign(document.createElement('canvas'), { width: tw, height: th });
  const g = c.getContext('2d');
  g.font = FONTS[style](size);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  lines.forEach((line, i) => {
    const ly = pad + lh * (i + 0.5);
    g.shadowColor = rgba(glow, 0.9); g.shadowBlur = size * 0.35;
    g.strokeStyle = rgba(glow, 0.55); g.lineWidth = Math.max(4, size * 0.06);   // 4–6 px light stroke
    g.strokeText(line, tw / 2, ly);
    g.shadowBlur = size * 0.15;
    g.fillStyle = rgba(color, 1);
    g.fillText(line, tw / 2, ly);
  });
  return c;
}

/**
 * Glowing title card. opts: lines (≤ 2 short lines), style ('title' | 'name' | 'caption'), size (px,
 * ≥ 96 for titles), color, glow, alpha, x, y (0..1 centre), maxWidth (share of w), reveal 0..1 (soft rise-in).
 */
export function titleCard(ctx, w, h, t, opts = {}) {
  const { lines = [], style = 'title', color = 'gold', glow = 'candle', alpha = 1, x = 0.5, y = 0.5, reveal = 1 } = opts;
  if (alpha <= 0 || reveal <= 0 || !lines.length) return;
  const min = style === 'title' ? 96 : style === 'name' ? 72 : 48;
  let size = Math.max(min, opts.size ?? min * 1.25);
  ctx.save();
  ctx.font = FONTS[style](size);
  // Shrink to fit, but never below the readable minimum (DESIGN_SYSTEM §04).
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const maxW = w * (opts.maxWidth ?? 0.9);
  if (widest > maxW) size = Math.max(min, size * maxW / widest);
  ctx.restore();
  const ready = fontsReady();
  const key = `${lines.join('\n')}|${style}|${Math.round(size)}|${color}|${glow}`;
  let bmp = ready ? cache.get(key) : null;
  if (!bmp) {
    bmp = renderTitle(lines, style, Math.round(size), color, glow);
    if (ready) cache.set(key, bmp);                    // only cache once the real font is in
  }
  const k = easeInOutSine(clamp(reveal));
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * alpha * k;
  ctx.drawImage(bmp, x * w - bmp.width / 2, y * h - bmp.height / 2 + (1 - k) * size * 0.3);
  ctx.globalAlpha = a;
}
