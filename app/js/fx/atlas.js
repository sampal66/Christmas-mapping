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
