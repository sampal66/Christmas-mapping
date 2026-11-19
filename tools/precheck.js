// Show pre-check (WP-12): plays the whole assembled show headless and writes a short report plus one contact sheet per
// scene, so mechanical problems (missing clips, console errors, things drawn in the wrong place, timing, safety,
// render cost) are caught before the owner reviews each scene by eye. Node + the preinstalled Playwright; no new deps.
//
// Usage: node tools/precheck.js [--mix master-mix.m4a] [--out precheck] [--no-flash] [--no-sheets]
//   Writes <out>/report.md and <out>/sheet-<scene>.png (scratch output: precheck/ is git-ignored, never commit it).
//   Exit code 1 on a failure: console error, missing clip or shell file, sw.js VERSION not bumped, flash check
//   failure, a cue outside its scene, or a mix whose length doesn't match the timeline. Other findings are flagged ⚠.
//
// How it renders: the page builds the same zone canvases as the Mapper (default layout, CSS homography per zone, masks
// and occluders) and draws every zone at an exact show time, the way main.js does. Character clips are paused at
// that time and the frame is read only once every video has finished seeking (fx/clips.js clipsBusy). Every
// drawClip() call is recorded through fx/clips.js setClipProbe: which clip, where it landed, at what opacity.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { chromium } = require('playwright');
const { serve } = require('./serve');
const { ROOT, scriptLines, sceneTable } = require('./show-table');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : dflt; };
const flag = (name) => args.includes(`--${name}`);
const OUT = path.resolve(opt('out', path.join(ROOT, 'precheck')));
const MIX = opt('mix', '');
const PROPOSAL = path.join(ROOT, 'docs/work-packages/WP-12-review-and-proposals.md');   // appended to the report when present

const BUDGET_MS = 33;        // worst render ms per frame (headless software raster: real fps is checked on the iPad, WP-09)
const FEET_TOL = Number(opt('feet-tol', 4));         // px off the floor / tower line before a pet is flagged
const FROZEN_S = 8;          // s on a held last frame before a pet is flagged as a still picture
const SAMPLE = 0.5;          // s between frames of the clip-coverage pass
const PETS = ['alaska', 'connor', 'orion', 'gandalf'];
const MEDIA_PACK_ONLY = [];  // clip ids allowed to come only from the owner's media pack (none today)

const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const sh = (cmd, a) => execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });

const PAGE = `<!doctype html><meta charset="utf-8"><title>precheck</title>
<style>html,body{margin:0;background:#000;overflow:hidden}#stage{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:#000}
canvas.zone{position:absolute;left:0;top:0;transform-origin:0 0}</style><body><div id="stage"></div></body>`;

// ---------- in-page renderer ----------
async function pageSetup() {
  const PETS = ['alaska', 'connor', 'orion', 'gandalf'];
  const { scenes } = await import('/js/scenes/index.js');
  const { defaultLayout } = await import('/js/layout.js');
  const { cssMatrixForQuad, stageToUnit, unitToStage } = await import('/js/homography.js');
  const { Timeline } = await import('/js/timeline.js');
  const { skyBase, SKY_ZONES } = await import('/js/scenes/common.js');
  const { setClipProbe, clipsBusy, clipsFrame, preloadClips, CLIP_FILES } = await import('/js/fx/clips.js');
  // load every committed clip up front, so even the fast pass knows each clip's length (held last frames)
  preloadClips(CLIP_FILES);
  for (const until = performance.now() + 20000; clipsBusy() && performance.now() < until;) await new Promise((res) => setTimeout(res, 50));
  const { stageLayout } = await import('/js/scenes/stage.js');
  const layout = defaultLayout();
  const byId = Object.fromEntries(layout.zones.map((z) => [z.id, z]));
  const timeline = new Timeline(scenes, []);
  const stage = document.getElementById('stage');
  const views = layout.zones.map((z) => {
    const c = document.createElement('canvas');
    c.width = z.res[0]; c.height = z.res[1]; c.className = 'zone';
    c.style.transform = cssMatrixForQuad(z.res[0], z.res[1], z.quad);
    stage.appendChild(c);
    return { z, ctx: c.getContext('2d') };
  });
  const env = (z) => ({ zone: z, from(id, u, v) { const o = byId[id]; if (!o) return null; const [x, y] = unitToStage(o.quad, u, v); return stageToUnit(z.quad, x, y); } });
  let zoneNow = null;
  let recs = [];
  setClipProbe((r) => recs.push({ ...r, zone: zoneNow }));
  const errors = [];

  function render(t) {
    recs = [];
    for (const { z, ctx } of views) {
      const [w, h] = z.res;
      zoneNow = z.id;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      if (z.mask) { ctx.beginPath(); z.mask.forEach(([u, v], i) => (i ? ctx.lineTo(u * w, v * h) : ctx.moveTo(u * w, v * h))); ctx.closePath(); ctx.clip(); }
      if (z.occlude) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }
      const scene = timeline.sceneFor(z.id, t);
      try {
        if (scene) { timeline.enterIfNeeded(scene); scene.draw(z.id, ctx, w, h, t, t - scene.start, env(z)); }
        else if (SKY_ZONES.includes(z.id)) skyBase(z.id, ctx, w, h, t);
      } catch (e) { errors.push(`${scene?.id || z.id} @ ${t.toFixed(1)}: ${e.message}`); }
      ctx.restore();
    }
    clipsFrame(false);
    return recs;
  }

  // Tree outline in stage px, for the "pet over the tree" test.
  const tree = byId.tree;
  const treePoly = (tree.mask || [[0, 0], [1, 0], [1, 1], [0, 1]]).map(([u, v]) => unitToStage(tree.quad, u, v));
  const inPoly = ([x, y], P) => {
    let inside = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      if ((P[i][1] > y) !== (P[j][1] > y) && x < ((P[j][0] - P[i][0]) * (y - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) inside = !inside;
    }
    return inside;
  };
  const wall = byId.wall;
  const L = stageLayout(env(wall), wall.res[0], wall.res[1]);
  const t0 = L.towerAt(0), t1 = L.towerAt(1);

  /** Plain-data summary of one record: pet, feet, box corners and the placement verdicts. */
  function describe(r) {
    const pet = PETS.find((p) => r.id.includes(`-${p}-`)) || null;
    const out = { id: r.id, zone: r.zone, drawn: r.drawn, failed: !!r.failed, pet, alpha: r.alpha ?? 0 };
    if (!r.drawn) return out;
    const { m, box: [bx, by, bw, bh] } = r;
    const P = (x, y) => { const q = m.transformPoint(new DOMPoint(x, y)); return [q.x, q.y]; };
    const corners = [P(bx, by), P(bx + bw, by), P(bx + bw, by + bh), P(bx, by + bh)];
    const feet = P(0, 0);
    const w = r.canvas.width, h = r.canvas.height;
    out.feet = feet.map((v) => Math.round(v));
    // body samples: a column above the feet and two beside it (the frame's transparent margins are left out)
    const pts = [];
    for (const fy of [0.15, 0.4, 0.65]) for (const fx of [-0.22, 0, 0.22]) pts.push(P(fx * bw, -fy * bh));
    out.inZone = pts.every(([x, y]) => x >= 0 && x <= w && y >= 0 && y <= h);
    out.frameOver = Math.round(Math.max(0, ...corners.map(([x, y]) => Math.max(-x, x - w, -y, y - h))));
    if (r.zone === 'wall' && pet) {
      out.overTree = pts.some(([x, y]) => inPoly(unitToStage(wall.quad, x / w, y / h), treePoly));
      if (r.anchor?.[1] === 1) {
        const dFloor = Math.abs(feet[1] - L.floorY);
        const s = (feet[0] - t0[0]) / ((t1[0] - t0[0]) || 1);
        const dTower = s > -0.05 && s < 1.05 ? Math.abs(feet[1] - L.towerAt(Math.min(1, Math.max(0, s)))[1]) : Infinity;
        out.offLine = Math.round(Math.min(dFloor, dTower));
      }
    }
    return out;
  }

  window.__pc = {
    errors,
    scenes: scenes.map((s) => ({ id: s.id, start: s.start, duration: s.duration })),
    /** Fast pass: draw once, return which clips were asked for (no waiting for videos). */
    probe(t) { return render(t).map((r) => ({ id: r.id, drawn: r.drawn, failed: !!r.failed, held: !!r.held, zone: r.zone, alpha: r.alpha ?? 0 })); },
    /** Exact frame: draw, wait until every clip has loaded and landed on its seek, draw again. */
    async frame(t) {
      render(t);
      const until = performance.now() + 8000;
      while (clipsBusy() && performance.now() < until) await new Promise((res) => setTimeout(res, 30));
      await new Promise((res) => setTimeout(res, 30));
      render(t);
      return render(t).map(describe);
    },
  };
  return window.__pc.scenes;
}

// ---------- Node-side checks ----------
function clipFiles() {
  const dir = path.join(ROOT, 'app/assets/clips');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4));
}

/** Share of frames whose matte has content in the frame's top row (cut ear tips). */
function topRowShare(id) {
  const file = path.join(ROOT, 'app/assets/clips', `${id}.mp4`);
  const w = Number(sh('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', file]).trim());
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'format=gray,crop=w=iw:h=1:x=0:y=ih/2', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout?.length) throw new Error(`ffmpeg could not read ${id}: ${String(r.stderr).slice(-300)}`);
  const buf = r.stdout;
  const n = Math.floor(buf.length / w);
  let hit = 0;
  for (let f = 0; f < n; f++) {
    let px = 0;
    for (let i = f * w; i < (f + 1) * w; i++) if (buf[i] > 128) px++;
    if (px > 2) hit++;
  }
  return n ? hit / n : 0;
}

function shellCheck() {
  const sw = fs.readFileSync(path.join(ROOT, 'app/sw.js'), 'utf8');
  const arr = sw.slice(sw.indexOf('const SHELL'), sw.indexOf('];', sw.indexOf('const SHELL')));
  const shell = [...arr.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
  const missing = shell.filter((f) => !fs.existsSync(path.join(ROOT, 'app', f)));
  const version = (/VERSION = '([^']+)'/.exec(sw) || [])[1];
  let base = null, mainVersion = null, appChanged = false;
  for (const ref of ['origin/main', 'main']) {
    try {
      mainVersion = (/VERSION = '([^']+)'/.exec(sh('git', ['-C', ROOT, 'show', `${ref}:app/sw.js`])) || [])[1];
      base = ref;
      const r = spawnSync('git', ['-C', ROOT, 'diff', '--quiet', ref, '--', 'app'], { stdio: 'ignore' });
      appChanged = r.status === 1;
      break;
    } catch { /* try the next ref */ }
  }
  const bumped = !base || !appChanged || version !== mainVersion;
  return { shell: shell.length, missing, version, mainVersion, base, appChanged, bumped };
}

function flashCheck() {
  if (flag('no-flash')) return { skipped: true, failed: false, lines: [], perf: [] };
  const r = spawnSync('node', [path.join(__dirname, 'flash-check.js')], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const perf = [...out.matchAll(/^(\S+): render ([\d.]+) ms\/frame avg, ([\d.]+) worst/gm)].map((m) => ({ id: m[1], avg: Number(m[2]), worst: Number(m[3]) }));
  const zones = [...out.matchAll(/^ {2}([✓✗]) (\S+)\s+flashes\/s ≤ (\d+)\s+max Δ0\.5s ([\d.]+)/gm)];
  const worstFlash = Math.max(0, ...zones.map((m) => Number(m[3])));
  const worstJump = Math.max(0, ...zones.map((m) => Number(m[4])));
  const seams = [...out.matchAll(/^ {2}[✓✗] (\S+).*seam Δ([\d.]+)/gm)].map((m) => `${m[1]} Δ${m[2]}`);
  const bad = out.split('\n').filter((l) => l.startsWith('  ✗') || /ERROR|FAILED/.test(l));
  return { failed: r.status !== 0, worstFlash, worstJump, seams, bad, perf };
}

function mixLength(total) {
  if (!MIX) return null;
  const len = Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', MIX]).trim());
  return { len, ok: Math.abs(len - total) <= 0.2 };
}

/** Lays the PNG frames out as a labelled strip (2 columns) and screenshots it at 2× device scale. */
async function contactSheet(browser, scene, frames, file) {
  const page = await browser.newPage({ viewport: { width: 1320, height: 400 }, deviceScaleFactor: 2 });
  const cells = frames.map((f) => `<figure><img src="data:image/png;base64,${f.png.toString('base64')}"><figcaption>${f.label}</figcaption></figure>`).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#0b0d1a;color:#e8e4d8;font:14px system-ui,sans-serif;padding:12px}
    h1{font-size:16px;margin:0 0 10px}main{display:grid;grid-template-columns:repeat(2,640px);gap:12px}
    figure{margin:0}img{width:640px;height:360px;display:block;background:#000}figcaption{padding:4px 2px;opacity:.85}
  </style><h1>${scene.id} · ${fmt(scene.start)}–${fmt(scene.start + scene.duration)} · cue +1 s</h1><main>${cells}</main>`);
  await page.waitForLoadState('load');
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

// ---------- main ----------
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const fail = [];             // hard failures (exit 1)
  const table = await sceneTable();
  const lines = scriptLines();
  const total = table.reduce((s, x) => s + x.duration, 0);
  const files = clipFiles();

  const server = await serve({ '/__precheck.html': PAGE });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const consoleErrors = [];
  let current = 'load';
  page.on('pageerror', (e) => consoleErrors.push(`${current}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${current}: ${m.text()}`); });

  const asked = new Map();       // clip id → { failed, scenes:Set }
  const scriptRows = [];         // { id, t, issue }
  const offStage = [];
  const placement = [];          // flagged placement findings
  const frozen = [];             // { scene, pet, from, to, id }: held last frames
  const sheets = [];
  let flash, shell, mix;
  try {
    await page.goto(`http://localhost:${server.address().port}/__precheck.html`);
    await page.evaluate(pageSetup);

    // 1 · assembly: every scene drawn every SAMPLE s; which clips are asked for
    for (const s of table) {
      current = s.id;
      const ts = [];
      for (let t = 0; t < s.duration; t += SAMPLE) ts.push(s.start + t);
      const recs = await page.evaluate((list) => list.map((t) => window.__pc.probe(t)), ts);
      // frozen pets: a once-and-hold clip sitting on its last frame (a still picture on the wall)
      const run = {};
      recs.forEach((frame, k) => {
        for (const p of [...PETS, 'pooh']) {
          const r = frame.find((x) => x.drawn && x.alpha > 0.5 && x.id.includes(`-${p}-`));
          const key = `${s.id}|${p}`;
          if (r?.held) { (run[key] ||= { from: ts[k], id: r.id }).to = ts[k] + SAMPLE; }
          else if (run[key]) { frozen.push({ scene: s.id, pet: p, ...run[key] }); delete run[key]; }
        }
      });
      for (const [key, v] of Object.entries(run)) frozen.push({ scene: s.id, pet: key.split('|')[1], ...v });
      for (const r of recs.flat()) {
        const a = asked.get(r.id) || { failed: false, scenes: new Set() };
        a.failed ||= r.failed; a.scenes.add(s.id.slice(0, 3));
        asked.set(r.id, a);
      }
    }

    // 2 · script ↔ picture: who is drawn while each line is spoken
    for (const l of lines) {
      const s = table.find((x) => x.id.startsWith(l.scenePrefix));
      const speaker = l.id.split('-')[1];
      const t = s.start + s.at(l.cue) + l.offset;
      if (speaker === 'narrador') continue;                    // the narrator is never on stage
      current = s.id;
      const probes = [t + 0.5, t + Math.max(0.6, l.est / 2)];
      for (const pt of probes) {
        const recs = (await page.evaluate((x) => window.__pc.frame(x), pt)).filter((r) => r.drawn && r.alpha > 0.5);
        const who = speaker === 'todos' ? PETS : [speaker];
        for (const p of who) {
          const mine = recs.filter((r) => r.id.includes(`-${p}-`) || (p === 'pooh' && r.id.includes('pooh')));
          if (!mine.length) { if (!offStage.some((o) => o.id === l.id)) offStage.push({ id: l.id, t: pt, who: p }); continue; }
          if (mine.every((r) => r.id === `pet-${p}-idle`)) scriptRows.push({ id: l.id, t: pt, who: p, clip: mine.map((r) => r.id).join(', ') });
        }
      }
    }

    // 3 + 7 · placement and contact sheets: every cue + 1 s
    for (const s of table) {
      current = s.id;
      const frames = [];
      for (const q of s.cues) {
        const local = Math.min(q.t + 1, s.duration - 0.05);
        const t = s.start + local;
        const recs = await page.evaluate((x) => window.__pc.frame(x), t);
        for (const r of recs.filter((x) => x.drawn && x.pet && x.zone === 'wall' && x.alpha > 0.95)) {
          const issues = [];
          if (!r.inZone) issues.push(`body outside the wall zone (frame ${r.frameOver} px past the edge)`);
          if (r.overTree) issues.push('over the tree');
          if (r.offLine > FEET_TOL) issues.push(`feet ${r.offLine} px off the floor/tower line`);
          if (issues.length) placement.push({ scene: s.id, cue: q.name, t, id: r.id, feet: r.feet, issues });
        }
        if (!flag('no-sheets')) {
          const png = await page.locator('#stage').screenshot();
          frames.push({ png, label: `${q.name} +1 s · ${fmt(t)} (local ${local.toFixed(1)} s)` });
        }
      }
      if (frames.length) {
        const file = path.join(OUT, `sheet-${s.id.slice(0, 3)}.png`);
        await contactSheet(browser, s, frames, file);
        sheets.push(path.relative(ROOT, file));
      }
    }
    consoleErrors.push(...(await page.evaluate(() => window.__pc.errors)));
  } catch (e) {
    consoleErrors.push(`precheck: ${e.message}`);
  } finally {
    await browser.close();
    server.close();
  }

  // assembly verdicts
  const missingClips = [...asked].filter(([id, a]) => !files.includes(id) && !MEDIA_PACK_ONLY.includes(id)).map(([id, a]) => `${id} (${[...a.scenes].join(', ')})`);
  const failedClips = [...asked].filter(([, a]) => a.failed).map(([id]) => id);
  const unused = files.filter((f) => !asked.has(f));
  shell = shellCheck();
  if (consoleErrors.length) fail.push('console errors');
  if (missingClips.length || failedClips.length) fail.push('missing clips');
  if (shell.missing.length) fail.push('sw.js SHELL files missing');
  if (!shell.bumped) fail.push('sw.js VERSION not bumped');
  const ears = files.map((id) => [id, topRowShare(id)]).filter(([, k]) => k > 0).sort((a, b) => b[1] - a[1]);

  // 4 · timeline
  const tl = [];
  let at = 0;
  for (const s of table) {
    if (Math.abs(s.start - at) > 1e-6) tl.push(`${s.id} starts ${fmt(s.start)}, expected ${fmt(at)} (gap or overlap)`);
    at = s.start + s.duration;
    for (const q of s.cues) if (!(q.t >= 0 && q.t <= s.duration)) tl.push(`${s.id}: cue ${q.name} at ${q.t.toFixed(2)} s is outside the scene (0–${s.duration} s)`);
  }
  const holdScenes = table.filter((s) => s.hold);
  for (const s of holdScenes) {
    const [a, b] = s.hold.loop;
    if (!(a >= 0 && b > a && b <= s.duration)) tl.push(`${s.id}: hold loop ${a}–${b} s not inside the scene`);
  }
  const cuts = table.filter((s) => s.cues.some((q) => q.name === 'cut')).map((s) => `${s.id.slice(0, 3)} ${s.at('cut').toFixed(1)} s`);
  const voice = [];
  const placed = [];
  for (const l of lines) {
    const s = table.find((x) => x.id.startsWith(l.scenePrefix));
    let t;
    try { t = s.at(l.cue) + l.offset; } catch (e) { tl.push(`${l.id}: cue "${l.cue}" not in ${s.id}`); continue; }
    if (t < 0) tl.push(`${l.id}: starts before its scene (${t.toFixed(1)} s)`);
    if (t + l.est > s.duration) voice.push(`${l.id} runs past the end of ${s.id} (${(t + l.est).toFixed(1)} > ${s.duration} s)`);
    placed.push({ id: l.id, a: s.start + t, b: s.start + t + l.est });
  }
  placed.sort((x, y) => x.a - y.a);
  for (let i = 1; i < placed.length; i++) {
    const p = placed[i - 1], q = placed[i];
    if (p.b > q.a + 0.05 && !q.id.startsWith('s10-todos')) voice.push(`${p.id} (ends ${fmt(p.b)}) overlaps ${q.id} (starts ${fmt(q.a)})`);
  }
  if (tl.length) fail.push('timeline');
  mix = mixLength(total);
  if (mix && !mix.ok) fail.push('mix length');

  // 5 + 6 · safety and render cost (flash-check renders every zone of every scene)
  flash = flashCheck();
  if (flash.failed) fail.push('flash check');
  const slow = flash.perf.filter((p) => p.worst > BUDGET_MS);

  const longFrozen = frozen.filter((f) => f.to - f.from >= FROZEN_S).sort((a, b) => (b.to - b.from) - (a.to - a.from));

  // ---------- report ----------
  const ok = (cond, warn = false) => (cond ? '✅' : warn ? '⚠️' : '❌');
  const summary = [
    ['1 · Assembly', ok(!consoleErrors.length && !missingClips.length && !failedClips.length && !shell.missing.length && shell.bumped),
      `${table.length} scenes, ${asked.size} clips asked for, ${consoleErrors.length} console errors; sw.js ${shell.version}${shell.base ? ` (main ${shell.mainVersion}${shell.appChanged ? ', app changed' : ''})` : ''}, ${shell.shell} shell files`],
    ['2 · Script ↔ picture', ok(!scriptRows.length, true), `${lines.filter((l) => !l.id.includes('narrador')).length} on-stage lines; ${scriptRows.length} idle while speaking, ${offStage.length} speaker not drawn`],
    ['3 · Placement', ok(!placement.length, true), `${placement.length} flagged at cue +1 s; ${ears.length} clips with top-row content (ears, soft-faded by EAR_FADE)`],
    ['3b · Frozen pets', ok(!longFrozen.length, true), `${longFrozen.length} stretches ≥ ${FROZEN_S} s where a pet holds a clip's last frame (longest ${longFrozen.length ? `${(longFrozen[0].to - longFrozen[0].from).toFixed(0)} s` : '–'})`],
    ['4 · Timeline', ok(!tl.length && (!mix || mix.ok)) + (voice.length ? ' ⚠️' : ''), `${fmt(total)} total, ${holdScenes.length} hold, cuts: ${cuts.join(', ')}; mix: ${mix ? `${fmt(mix.len)} ${mix.ok ? 'matches' : 'MISMATCH'}` : 'not supplied (--mix)'}`],
    ['5 · Safety', flash.skipped ? '–' : ok(!flash.failed), flash.skipped ? 'skipped (--no-flash)' : `worst ${flash.worstFlash} flashes/s (limit 3), max jump ${flash.worstJump.toFixed(2)} (limit 0.5), seams ${flash.seams.join(', ') || '–'}`],
    ['6 · Performance', flash.skipped ? '–' : ok(!slow.length, true), flash.skipped ? 'skipped' : `worst ${Math.max(...flash.perf.map((p) => p.worst)).toFixed(0)} ms/frame; ${slow.length} scenes over ${BUDGET_MS} ms (headless software raster; real fps in WP-09)`],
    ['7 · Contact sheets', sheets.length ? '✅' : '–', sheets.length ? `${sheets.length} sheets in ${path.relative(ROOT, OUT)}/` : 'skipped'],
  ];
  const md = [
    `# Show pre-check — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`, '',
    `**Result: ${fail.length ? `FAIL (${fail.join(', ')})` : 'PASS'}**`, '',
    '| Check | | Notes |', '|---|---|---|', ...summary.map((r) => `| ${r.join(' | ')} |`), '',
  ];
  const sect = (title, rows) => { if (rows.length) md.push(`## ${title}`, '', ...rows.map((r) => `- ${r}`), ''); };
  sect('Console errors', consoleErrors.slice(0, 30));
  sect('Missing clips', [...missingClips.map((m) => `not in app/assets/clips: ${m}`), ...failedClips.map((m) => `failed to load: ${m}`)]);
  sect('Shell', [...shell.missing.map((m) => `SHELL file missing: ${m}`), ...(shell.bumped ? [] : [`app/ changed since ${shell.base} but VERSION is still ${shell.version}`])]);
  sect('Script ↔ picture: speaker idle while talking', scriptRows.map((r) => `${r.id} @ ${fmt(r.t)}: ${r.who} plays ${r.clip}`));
  sect('Script ↔ picture: speaker not on stage', offStage.map((r) => `${r.id} @ ${fmt(r.t)}: ${r.who} not drawn`));
  sect('Placement', placement.map((p) => `${p.scene} ${p.cue} +1 s (${fmt(p.t)}): ${p.id} at ${p.feet.join(', ')}: ${p.issues.join('; ')}`));
  sect('Frozen pets (held last frame)', longFrozen.map((f) => `${f.scene} ${f.pet}: ${fmt(f.from)}–${fmt(f.to)} (${(f.to - f.from).toFixed(1)} s) on ${f.id}`));
  if (ears.length) md.push('<details><summary>Clips with content in the top row (share of frames)</summary>', '', ears.map(([id, k]) => `${id} ${Math.round(k * 100)} %`).join(' · '), '', '</details>', '');
  sect('Timeline', [...tl, ...voice.map((v) => `⚠️ ${v}`)]);
  sect('Safety', flash.bad || []);
  sect('Performance (over budget)', slow.map((p) => `${p.id}: ${p.avg.toFixed(1)} ms avg, ${p.worst.toFixed(1)} ms worst`));
  if (unused.length) sect('Committed clips never drawn', [unused.join(', ')]);
  if (fs.existsSync(PROPOSAL)) md.push(fs.readFileSync(PROPOSAL, 'utf8').replace(/^# .*\n/, ''));
  fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n');
  console.log(md.slice(0, summary.length + 6).join('\n'));
  console.log(`\nreport: ${path.relative(ROOT, path.join(OUT, 'report.md'))}`);
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
