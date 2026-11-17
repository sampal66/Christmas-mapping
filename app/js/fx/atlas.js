// Loads the atlas engravings (app/assets/atlas, white line art on transparent) and tints them once for projection.
// Cached by the service worker with the rest of the app, so they work offline.
import { rgb } from '../palette.js';

const cache = new Map();

/** Promise of a tinted canvas for an atlas image src, or null if it can't load (scenes then skip the art). */
export function loadAtlasArt(src, color = 'ice') {
  const key = `${src}|${color}`;
  if (cache.has(key)) return cache.get(key);
  const p = new Promise((resolve) => {
    if (typeof Image === 'undefined') return resolve(null);
    const img = new Image();
    img.onload = () => {
      const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(img.width, img.height)
        : Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-in';
      const [r, gg, b] = rgb(color);
      g.fillStyle = `rgb(${r},${gg},${b})`;
      g.fillRect(0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  cache.set(key, p);
  return p;
}

const labelCache = new Map();
/**
 * A constellation name in the atlas's engraved style: spaced capitals in the period serif (Playfair Display), as a
 * canvas for drawCard(). Cached once the bundled font is ready.
 */
export function atlasLabel(text, color = 'ice', px = 64) {
  const ready = typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';
  const key = `${text}|${color}|${px}`;
  if (ready && labelCache.has(key)) return labelCache.get(key);
  const font = `400 ${px}px "Playfair Display", Georgia, serif`;
  const spacing = px * 0.28;
  const probe = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas');
  const p = probe.getContext('2d'); p.font = font;
  const chars = [...text];
  const widths = chars.map((ch) => p.measureText(ch).width);
  const W = Math.ceil(widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1) + px * 0.4);
  const H = Math.ceil(px * 1.5);
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = c.getContext('2d');
  g.font = font; g.textBaseline = 'middle';
  const [r, gg, b] = rgb(color);
  g.fillStyle = `rgb(${r},${gg},${b})`;
  g.shadowColor = `rgba(${r},${gg},${b},0.8)`; g.shadowBlur = px * 0.18;
  let x = px * 0.2;
  chars.forEach((ch, i) => { g.fillText(ch, x, H / 2); x += widths[i] + spacing; });
  if (ready) labelCache.set(key, c);
  return c;
}
