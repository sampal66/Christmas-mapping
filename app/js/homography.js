// Homography helpers: map a rectangle (w x h) onto an arbitrary quad, and back.
// Quads are [[x,y] TL, TR, BR, BL] in stage pixels.

// Solve the 3x3 projective matrix mapping unit-square corners to quad corners.
function squareToQuad(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  let g = 0, h = 0;
  if (sx !== 0 || sy !== 0) {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (sx * dy2 - dx2 * sy) / den;
    h = (dx1 * sy - sx * dy1) / den;
  }
  return [
    x1 - x0 + g * x1, x3 - x0 + h * x3, x0,
    y1 - y0 + g * y1, y3 - y0 + h * y3, y0,
    g, h, 1,
  ];
}

function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    A / det, -(b * i - c * h) / det, (b * f - c * e) / det,
    B / det, (a * i - c * g) / det, -(a * f - c * d) / det,
    C / det, -(a * h - b * g) / det, (a * e - b * d) / det,
  ];
}

// CSS matrix3d that maps an element of size w x h (origin 0 0) onto quad q.
export function cssMatrixForQuad(w, h, q) {
  const m = squareToQuad(q);
  // pre-scale by 1/w, 1/h so element pixels become unit square
  const a = m[0] / w, b = m[1] / h, c = m[2];
  const d = m[3] / w, e = m[4] / h, f = m[5];
  const g = m[6] / w, hh = m[7] / h, i = m[8];
  // column-major 4x4
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,${i})`;
}

// Map a stage point back into unit-square coords of quad q (for editing masks).
export function stageToUnit(q, x, y) {
  const inv = invert3(squareToQuad(q));
  const X = inv[0] * x + inv[1] * y + inv[2];
  const Y = inv[3] * x + inv[4] * y + inv[5];
  const W = inv[6] * x + inv[7] * y + inv[8];
  return [X / W, Y / W];
}

export function unitToStage(q, u, v) {
  const m = squareToQuad(q);
  const W = m[6] * u + m[7] * v + m[8];
  return [(m[0] * u + m[1] * v + m[2]) / W, (m[3] * u + m[4] * v + m[5]) / W];
}
