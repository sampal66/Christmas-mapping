// Projection palette (DESIGN_SYSTEM §03). Effects take colours by token name so the whole show can be
// re-tuned on the wall in WP-09 (e.g. nudging cranberry/plum) by editing this one file.
export const PALETTE = {
  night: '#000000',
  dusk: '#0E1430',
  snow: '#F4F7FF',
  gold: '#FFC94A',
  candle: '#FFB066',
  cranberry: '#E8475F',
  pine: '#4CC38A',
  ice: '#7FD3FF',
  plum: '#B07CFF',
  rose: '#FF8FB8',
  sepia: '#E9D3A8',
};

const rgbCache = new Map();

/** [r, g, b] for a token name or a #rrggbb string. */
export function rgb(c) {
  const hex = PALETTE[c] || c;
  let v = rgbCache.get(hex);
  if (!v) {
    const n = parseInt(hex.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, v);
  }
  return v;
}

/** CSS rgba() string for a token with alpha. */
export function rgba(c, a = 1) {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${a})`;
}

/** Mix two tokens (0 → a, 1 → b), returned as rgba(). */
export function mix(a, b, k, alpha = 1) {
  const A = rgb(a), B = rgb(b);
  const m = (i) => Math.round(A[i] + (B[i] - A[i]) * k);
  return `rgba(${m(0)},${m(1)},${m(2)},${alpha})`;
}

// Bright hues for the light-show tree waves (DESIGN_SYSTEM §03: full sweeps allowed in light-show scenes).
export const SHOW_HUES = ['gold', 'cranberry', 'pine', 'ice', 'plum', 'rose'];
