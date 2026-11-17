// Flash / brightness safety check (DESIGN_SYSTEM §06). Renders every scene headless, zone by zone, at a fixed
// sample rate, and measures each zone's average relative luminance frame to frame.
// Fails when a zone has more than 3 flashes in any 1-second window (a flash = a pair of opposing luminance
// swings of ≥ 10%, WCAG 2.3.1 style), or a brightness jump > 50% within 0.5 s. Hold loops are also checked
// for a visible seam.
// Also logs each scene's render cost per frame (all zones). Usage:
//   node tools/flash-check.js [--fps 20] [--scene s02] [--par 3]   (exit code 1 on failure)
const { chromium } = require('playwright');
const { serve } = require('./serve');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : dflt; };
const FPS = Number(opt('fps', 20));
const ONLY = opt('scene', '');
const PAR = Number(opt('par', 3));        // scenes rendered in parallel pages

const PAGE = '<!doctype html><meta charset="utf-8"><title>flash-check</title><body></body>';

// Runs in the page: renders one scene and returns { zoneId: [luminance per sample] }.
async function renderScene({ sceneId, fps }) {
  const { scenes, preshow } = await import('/js/scenes/index.js');
  const { defaultLayout } = await import('/js/layout.js');
  const { stageToUnit, unitToStage } = await import('/js/homography.js');
  const scene = sceneId === preshow.id ? { ...preshow, start: 0 } : scenes.find((s) => s.id === sceneId);
  const zones = defaultLayout().zones;
  const byId = Object.fromEntries(zones.map((z) => [z.id, z]));
  const env = (z) => ({ zone: z, from(id, u, v) { const o = byId[id]; if (!o) return null; const [x, y] = unitToStage(o.quad, u, v); return stageToUnit(z.quad, x, y); } });
  const S = 48;
  const small = document.createElement('canvas'); small.width = S; small.height = S;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const LUT = Array.from({ length: 256 }, (_, i) => lin(i));
  try { scene.enter?.(); } catch (e) { /* enter is best-effort here */ }
  const out = {};
  const t0 = performance.now();
  for (const id of scene.zones) {
    const z = byId[id];
    if (!z) continue;
    const [w, h] = z.res;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const series = [];
    const n = Math.floor(scene.duration * fps);
    for (let i = 0; i <= n; i++) {
      const local = i / fps;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      if (z.mask) { ctx.beginPath(); z.mask.forEach(([u, v], k) => (k ? ctx.lineTo(u * w, v * h) : ctx.moveTo(u * w, v * h))); ctx.closePath(); ctx.clip(); }
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      scene.draw(id, ctx, w, h, scene.start + local, local, env(z));
      ctx.restore();
      sctx.clearRect(0, 0, S, S);
      sctx.drawImage(c, 0, 0, S, S);
      const d = sctx.getImageData(0, 0, S, S).data;
      let sum = 0;
      for (let p = 0; p < d.length; p += 4) sum += 0.2126 * LUT[d[p]] + 0.7152 * LUT[d[p + 1]] + 0.0722 * LUT[d[p + 2]];
      series.push(sum / (S * S));
    }
    out[id] = series;
  }
  const ms = performance.now() - t0;
  // Render cost: draw every zone for one frame, then flush (a 1-pixel read per canvas forces the raster).
  const canv = scene.zones.filter((id) => byId[id]).map((id) => {
    const z = byId[id]; const c = document.createElement('canvas'); c.width = z.res[0]; c.height = z.res[1];
    return { id, z, ctx: c.getContext('2d') };
  });
  const N = 40;
  let worst = 0;
  const tc = performance.now();
  for (let i = 0; i < N; i++) {
    const local = ((i + 0.5) / N) * scene.duration;
    const f0 = performance.now();
    for (const { id, z, ctx } of canv) {
      const [w, h] = z.res;
      ctx.clearRect(0, 0, w, h);
      scene.draw(id, ctx, w, h, scene.start + local, local, env(z));
    }
    for (const { ctx } of canv) ctx.getImageData(0, 0, 1, 1);
    worst = Math.max(worst, performance.now() - f0);
  }
  const frameMs = (performance.now() - tc) / N;
  return { series: out, ms, frameMs, worst, hold: scene.hold || null };
}

// Turning points with 10% hysteresis → luminance transitions (WCAG: the darker side must be < 0.8).
function transitions(L) {
  const out = [];
  let lo = L[0], hi = L[0], ref = L[0], dir = 0;     // dir: +1 rising, -1 falling, 0 not yet known
  const mark = (i, dark) => { if (dark < 0.8) out.push(i); };
  for (let i = 1; i < L.length; i++) {
    const v = L[i];
    if (dir === 0) {
      lo = Math.min(lo, v); hi = Math.max(hi, v);
      if (v - lo >= 0.1) { dir = 1; ref = v; mark(i, lo); } else if (hi - v >= 0.1) { dir = -1; ref = v; mark(i, v); }
    } else if (dir === 1) {
      if (v > ref) ref = v; else if (ref - v >= 0.1) { dir = -1; mark(i, v); ref = v; }
    } else if (v < ref) ref = v; else if (v - ref >= 0.1) { dir = 1; mark(i, ref); ref = v; }
  }
  return out;
}

function analyse(L, fps) {
  const tr = transitions(L);
  let maxFlashes = 0;
  for (let i = 0; i < tr.length; i++) {
    let j = i;
    while (j < tr.length && tr[j] - tr[i] < fps) j++;
    maxFlashes = Math.max(maxFlashes, Math.floor((j - i) / 2));
  }
  let maxJump = 0;
  const win = Math.round(fps * 0.5);
  for (let i = 0; i < L.length; i++) {
    for (let k = 1; k <= win && i + k < L.length; k++) maxJump = Math.max(maxJump, Math.abs(L[i + k] - L[i]));
  }
  const mean = L.reduce((a, b) => a + b, 0) / L.length;
  return { maxFlashes, maxJump, mean, peak: Math.max(...L) };
}

function report(id, { series, ms, frameMs, worst, hold }) {
  const rows = [];
  let failed = false;
  for (const [zone, L] of Object.entries(series)) {
    const a = analyse(L, FPS);
    const bad = a.maxFlashes > 3 || a.maxJump > 0.5;
    let seam = '';
    if (hold) {
      const i0 = Math.round(hold.loop[0] * FPS), i1 = Math.round(hold.loop[1] * FPS);
      const d = Math.abs(L[i1] - L[i0]);
      seam = ` seam Δ${d.toFixed(3)}`;
      if (d > 0.02) { failed = true; seam += ' ✗'; }
    }
    if (bad) failed = true;
    rows.push(`  ${bad ? '✗' : '✓'} ${zone.padEnd(10)} flashes/s ≤ ${a.maxFlashes}  max Δ0.5s ${a.maxJump.toFixed(3)}  mean ${a.mean.toFixed(3)}  peak ${a.peak.toFixed(3)}${seam}`);
  }
  const head = `${id}: render ${frameMs.toFixed(1)} ms/frame avg, ${worst.toFixed(1)} worst (all zones; ${(ms / 1000).toFixed(1)} s check)`;
  return { failed, text: `${head}\n${rows.join('\n')}` };
}

(async () => {
  const server = await serve({ '/__flash.html': PAGE });
  const url = `http://localhost:${server.address().port}/__flash.html`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  let failed = false;
  try {
    await page.goto(url);
    const ids = await page.evaluate(async () => {
      const { scenes, preshow } = await import('/js/scenes/index.js');
      return [preshow.id, ...scenes.filter((s) => !s.placeholder).map((s) => s.id)];
    });
    const todo = ids.filter((x) => !ONLY || x.includes(ONLY));
    const pages = [page, ...await Promise.all(Array.from({ length: Math.min(PAR, todo.length) - 1 }, async () => {
      const p = await browser.newPage();
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await p.goto(url);
      return p;
    }))];
    const reports = new Map();
    let next = 0;
    await Promise.all(pages.map(async (p) => {
      while (next < todo.length) {
        const id = todo[next++];
        reports.set(id, report(id, await p.evaluate(renderScene, { sceneId: id, fps: FPS })));
      }
    }));
    for (const id of todo) {
      const r = reports.get(id);
      if (r.failed) failed = true;
      console.log(r.text);
    }
  } catch (e) {
    errors.push(e.message);
  } finally {
    await browser.close();
    server.close();
  }
  if (errors.length) { console.error('FLASH CHECK ERROR\n' + errors.join('\n')); process.exit(1); }
  if (failed) { console.error('FLASH CHECK FAILED (DESIGN_SYSTEM §06: ≤ 3 flashes/s, no > 50% jump in 0.5 s)'); process.exit(1); }
  console.log('flash check passed');
})();
