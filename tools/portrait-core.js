// Photo → drone-swarm portrait: N coloured light points placed by error-diffusion stippling of an importance map
// (brightness + edges), so faces, glasses, hair and clothes read in light on a night sky. Pure function of an image.
// Output: { v: 1, aspect, pal: [hex…], d: base64(u16 u, u16 v, u8 colour index, u8 size) per point }.
function photoToPortrait(img, { points = 1600, grid = 220, bg = null, mode = 'stipple', contrast = 1.35, gamma = 1.15, edgeW = 0.7, lift = 0.38, focus = [], relax = 0, clip = null, base = 0.55 } = {}) {
  const W0 = img.naturalWidth || img.width, H0 = img.naturalHeight || img.height;
  // 1. crop to the opaque figures (cut-out) or keep the whole frame
  const probe = document.createElement('canvas'); probe.width = 200; probe.height = Math.max(8, Math.round(200 * H0 / W0));
  const pg = probe.getContext('2d', { willReadFrequently: true }); pg.drawImage(img, 0, 0, probe.width, probe.height);
  const pd = pg.getImageData(0, 0, probe.width, probe.height).data;
  // a pixel counts as figure when opaque and (with a picked background colour) far enough from it
  const opaque = (d, o) => d[o + 3] > 128 && (!bg || Math.hypot(d[o] - bg[0], d[o + 1] - bg[1], d[o + 2] - bg[2]) / 441 > bg[3] + 0.03);
  let x0 = probe.width, y0 = probe.height, x1 = -1, y1 = -1;
  for (let y = 0; y < probe.height; y++) for (let x = 0; x < probe.width; x++) if (opaque(pd, (y * probe.width + x) * 4)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  let crop = [0, 0, 1, 1];
  if (x1 >= 0 && !(x1 - x0 > probe.width * 0.98 && y1 - y0 > probe.height * 0.98)) {
    const m = 2; crop = [Math.max(0, x0 - m) / probe.width, Math.max(0, y0 - m) / probe.height, Math.min(probe.width, x1 + 1 + m) / probe.width, Math.min(probe.height, y1 + 1 + m) / probe.height];
  }
  if (clip) crop = [Math.max(crop[0], clip[0]), Math.max(crop[1], clip[1]), Math.min(crop[2], clip[2]), Math.min(crop[3], clip[3])];   // optional frame limit (0..1 of the source)
  const cw = (crop[2] - crop[0]) * W0, ch = (crop[3] - crop[1]) * H0;
  const gw = grid, gh = Math.max(8, Math.round(grid * ch / cw));
  const c = document.createElement('canvas'); c.width = gw; c.height = gh;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, crop[0] * W0, crop[1] * H0, cw, ch, 0, 0, gw, gh);
  const px = g.getImageData(0, 0, gw, gh).data;
  const n = gw * gh, L = new Float32Array(n), A = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    A[i] = px[i * 4 + 3] / 255;
    L[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
  }
  // optional background removal by colour distance from a picked background colour (when there is no transparency)
  if (bg) {
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(px[i * 4] - bg[0], px[i * 4 + 1] - bg[1], px[i * 4 + 2] - bg[2]) / 441;
      A[i] *= Math.min(1, Math.max(0, (d - bg[3]) / 0.06));
    }
  }
  // 2. importance: brightness (light where the photo is light) + edges (features), masked by the figures
  const E = new Float32Array(n);
  const at = (x, y) => L[Math.min(gh - 1, Math.max(0, y)) * gw + Math.min(gw - 1, Math.max(0, x))];
  let emax = 0;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
    const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
    const e = Math.hypot(gx, gy); E[y * gw + x] = e; if (e > emax) emax = e;
  }
  const sortedE = Array.from(E).sort((a, b) => a - b), e95 = sortedE[Math.floor(n * 0.95)] || emax || 1;
  const D = new Float32Array(n);
  let sum = 0;
  // 'stipple': light where the photo is light (cartoons); 'led': even coverage + edges, the colour carries the
  // brightness (photos: dark features show as dim lights, not holes)
  for (let i = 0; i < n; i++) {
    const e = Math.min(1, E[i] / e95);
    D[i] = A[i] * (mode === 'led' ? base + edgeW * e : 0.18 + 0.55 * L[i] ** 1.15 + 0.8 * e);
    // focus ellipses (faces), in the source image's 0..1 coordinates: [cx, cy, rx, ry, weight]
    if (focus.length) {
      const x = i % gw, y = (i / gw) | 0;
      const u0 = crop[0] + ((x + 0.5) / gw) * (crop[2] - crop[0]), v0 = crop[1] + ((y + 0.5) / gh) * (crop[3] - crop[1]);
      let f = 1;
      for (const [cx, cy, rx, ry, wgt] of focus) { const d = Math.hypot((u0 - cx) / rx, (v0 - cy) / ry); if (d < 1.25) f = Math.max(f, 1 + (wgt - 1) * Math.min(1, (1.25 - d) / 0.35)); }
      D[i] *= f;
    }
    sum += D[i];
  }
  const k = points / (sum || 1);
  // 3. Floyd–Steinberg dithering of the scaled importance: one point per "1"
  const err = Float32Array.from(D, (v) => v * k);
  const pts = [];
  for (let y = 0; y < gh; y++) {
    const ltr = y % 2 === 0;                                  // serpentine scan: no diagonal artefacts
    for (let xi = 0; xi < gw; xi++) {
      const x = ltr ? xi : gw - 1 - xi, i = y * gw + x, v = err[i];
      const out = v >= 0.5 ? 1 : 0, e = v - out;
      if (out) pts.push(i);
      const s = ltr ? 1 : -1;
      if (x + s >= 0 && x + s < gw) err[i + s] += e * 7 / 16;
      if (y + 1 < gh) {
        if (x - s >= 0 && x - s < gw) err[i + gw - s] += e * 3 / 16;
        err[i + gw] += e * 5 / 16;
        if (x + s >= 0 && x + s < gw) err[i + gw + s] += e * 1 / 16;
      }
    }
  }
  // 3b. relaxation: neighbours push apart to their local spacing (removes dithering worms), staying on the figure
  const avgSp = Math.sqrt((gw * gh) / Math.max(1, pts.length));
  // start positions scattered by the local spacing: sparse areas lose the dither's row pattern
  const P = pts.map((i, j) => { const sp0 = 1 / Math.sqrt(Math.max(0.01, D[i] * k)), sp = sp0 > 1.6 * avgSp ? Math.min(8, sp0) : 0.6; return [i % gw + 0.5 + (rnd0(j) - 0.5) * sp, ((i / gw) | 0) + 0.5 + (rnd0(j + 0.37) - 0.5) * sp]; });
  function rnd0(s0) { const x = Math.sin(s0 * 9301.17 + 0.5) * 49297.31; return x - Math.floor(x); }
  for (let it = 0; it < relax; it++) {
    const cell = new Map(), key = (x, y) => (x << 16) | y;
    P.forEach((q, j) => { const kk = key(q[0] | 0, q[1] | 0); (cell.get(kk) || cell.set(kk, []).get(kk)).push(j); });
    const moved = P.map((q) => [q[0], q[1]]);
    P.forEach((q, j) => {
      const ci = Math.min(n - 1, (Math.min(gh - 1, q[1] | 0)) * gw + Math.min(gw - 1, q[0] | 0));
      const r = Math.min(9, 1 / Math.sqrt(Math.max(0.01, D[ci] * k)));   // expected spacing here (cells)
      let fx = 0, fy = 0;
      const R = Math.ceil(r);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const lst = cell.get(key((q[0] | 0) + dx, (q[1] | 0) + dy)); if (!lst) continue;
        for (const o of lst) { if (o === j) continue; const ex = q[0] - P[o][0], ey = q[1] - P[o][1], d = Math.hypot(ex, ey);
          if (d > 0 && d < r) { const f = (r - d) / r; fx += ex / d * f; fy += ey / d * f; } }
      }
      const nx = q[0] + fx * 0.25, ny = q[1] + fy * 0.25;
      const ni = Math.min(gh - 1, Math.max(0, ny | 0)) * gw + Math.min(gw - 1, Math.max(0, nx | 0));
      if (A[ni] > 0.5) moved[j] = [nx, ny];
    });
    for (let j = 0; j < P.length; j++) P[j] = moved[j];
  }
  const gsp = Math.sqrt((gw * gh) / Math.max(1, pts.length)) * 0.85;   // typical spacing between lights (cells)
  // 4. colours: the photo's colour, lifted (drones are lights) and quantised to a small palette
  const pal = [], palIdx = new Map();
  const bytes = new Uint8Array(pts.length * 6);
  const rnd = (s) => { const x = Math.sin(s * 9301.17 + 0.5) * 49297.31; return x - Math.floor(x); };
  pts.forEach((i0, j) => {
    const fx0 = P[j][0], fy0 = P[j][1];
    const x = Math.min(gw - 1, Math.max(0, fx0 | 0)), y = Math.min(gh - 1, Math.max(0, fy0 | 0)), i = y * gw + x;
    let r = px[i * 4], gg = px[i * 4 + 1], b = px[i * 4 + 2];
    const l = L[i];
    if (mode === 'led') {
      // contrast around mid-grey, then gamma: features read; a small lift keeps the darkest lights just visible
      const tone = (v) => { let x = Math.min(1, Math.max(0, (v / 255 - 0.5) * contrast + 0.5)); x = x ** gamma; return 255 * (lift + (1 - lift) * x); };
      r = tone(r); gg = tone(gg); b = tone(b);
    } else {
      const m = Math.max(r, gg, b) || 1, target = 255 * (lift + (1 - lift) * Math.max(l, m / 255));   // even dark clothes glow a little
      const f = target / m; r = Math.min(255, r * f); gg = Math.min(255, gg * f); b = Math.min(255, b * f);
    }
    const q = (v) => Math.min(15, Math.round(v / 17));
    const hex = '#' + [r, gg, b].map((v) => (q(v) * 17).toString(16).padStart(2, '0')).join('');
    if (!palIdx.has(hex)) {
      if (pal.length < 255) { palIdx.set(hex, pal.length); pal.push(hex); }
      else {                                                  // palette full: nearest existing colour
        const rgbOf = (h) => [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16)), c0 = rgbOf(hex);
        let best = 0, bd = Infinity;
        pal.forEach((h, idx) => { const c1 = rgbOf(h); const dd = (c0[0] - c1[0]) ** 2 + (c0[1] - c1[1]) ** 2 + (c0[2] - c1[2]) ** 2; if (dd < bd) { bd = dd; best = idx; } });
        palIdx.set(hex, best);
      }
    }
    const u = Math.round(Math.min(1, Math.max(0, fx0 / gw)) * 65535), v = Math.round(Math.min(1, Math.max(0, fy0 / gh)) * 65535);
    bytes.set([u & 255, u >> 8, v & 255, v >> 8, Math.min(255, palIdx.get(hex)), Math.round(Math.min(255, 127 * Math.min(2, (1 / Math.sqrt(Math.max(0.02, D[i] * k))) / gsp)))], j * 6);   // size byte: local spacing ÷ typical (127 = typical)
  });
  let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return { v: 1, aspect: Math.round((cw / ch) * 1000) / 1000, pal, d: btoa(bin) };
}

/** Decodes a portrait into [{ u, v, color, s }]. */
function decodePortrait(p) {
  const bin = atob(p.d), out = [];
  for (let j = 0; j + 5 < bin.length; j += 6) {
    const b = (k) => bin.charCodeAt(j + k);
    out.push({ u: (b(0) | (b(1) << 8)) / 65535, v: (b(2) | (b(3) << 8)) / 65535, color: p.pal[b(4)] || '#ffffff', s: b(5) / 127 });
  }
  return out;
}
