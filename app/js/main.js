import { cssMatrixForQuad, stageToUnit, unitToStage } from './homography.js';
import { defaultLayout, STAGE_W, STAGE_H } from './layout.js';
import { calibrationPattern, demoEffects } from './effects.js';
import { MasterClock, beep } from './audio.js';
import { Timeline, fmtTime } from './timeline.js';
import { scenes, holds, preshow, cutTime } from './scenes/index.js';
import { skyBase, SKY_ZONES } from './scenes/common.js';
import * as media from './media.js';
import { clipsFrame } from './fx/clips.js';
import { IdleMusic } from './idle-music.js';

const STORAGE_KEY = 'christmas-mapping.layout.v1';

// ---------- state ----------
let layout = loadLayout();
let mode = 'calibrate';          // calibrate | test | demo | show
let testPattern = 'grid';        // grid | white | colors
let selectedId = 'wall';
let editMask = false;
let activeHandle = null;         // { zoneId, kind: 'corner'|'mask'|'move', index }
let nudgeStep = 2;
const t0 = performance.now();

// show state
const clock = new MasterClock();
const timeline = new Timeline(scenes, holds);
let started = false;             // false = pre-show loop
// The s00 music-box loop plays while the show isn't running (pre-show and after the finale), never during it.
const idleMusic = new IdleMusic();
window.__idleMusic = idleMusic;
for (const ev of ['pointerdown', 'keydown']) document.addEventListener(ev, () => idleMusic.unlock(), { capture: true });
let holding = null;              // active hold point while looping
let syncTest = false;
let syncBase = 0, lastBeep = -1;
let uiTick = 0;

// ---------- DOM ----------
const stage = document.getElementById('stage');
const bg = document.getElementById('bg');
const handlesLayer = document.getElementById('handles');
const panel = document.getElementById('panel');
const zoneSelect = document.getElementById('zoneSelect');
const views = new Map(); // zoneId -> { canvas, ctx }

function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === 1) return mergeDefaults(saved);
  } catch { /* storage blocked or corrupt: fall back */ }
  return defaultLayout();
}

// Keep new default zones if the saved file predates them.
function mergeDefaults(saved) {
  const def = defaultLayout();
  const byId = new Map(saved.zones.map((z) => [z.id, z]));
  def.zones = def.zones.map((z) => (byId.has(z.id) ? { ...z, ...byId.get(z.id) } : z));
  def.audioOffsetMs = saved.audioOffsetMs ?? 0;
  return def;
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch { /* ignore */ }
  }, 200);
}

const zoneById = (id) => layout.zones.find((z) => z.id === id);

// What a scene's draw() gets besides the canvas: its zone, and a way to find points of other zones in its own
// 0..1 coordinates (e.g. "the top of box 2, in backdrop space"), so effects can line up across zones.
function sceneEnv(z) {
  return {
    zone: z,
    from(id, u, v) {
      const o = zoneById(id);
      if (!o || o.hidden) return null;
      const [x, y] = unitToStage(o.quad, u, v);
      return stageToUnit(z.quad, x, y);
    },
    // Occluder zones (tree shadow, obstacles: WP-09a) as polygons in this zone's unit coords, for stageLayout.
    occluders() {
      return layout.zones.filter((o) => o.occluder && !o.hidden).map((o) => (o.mask || [[0, 0], [1, 0], [1, 1], [0, 1]])
        .map(([u, v]) => { const [x, y] = unitToStage(o.quad, u, v); return stageToUnit(z.quad, x, y); }));
    },
  };
}

// Rolling frame stats for the Show panel (and the smoke test's fps check).
const perf = { frames: 0, frameMs: 0, drawMs: 0, last: 0 };
window.__perf = perf;

// ---------- build zone canvases ----------
function buildViews() {
  for (const v of views.values()) v.canvas.remove();
  views.clear();
  for (const z of layout.zones) {
    const canvas = document.createElement('canvas');
    canvas.width = z.res[0]; canvas.height = z.res[1];
    canvas.className = 'zone';
    stage.insertBefore(canvas, handlesLayer);
    views.set(z.id, { canvas, ctx: canvas.getContext('2d') });
  }
  zoneSelect.innerHTML = layout.zones.map((z) => `<option value="${z.id}">${z.label}</option>`).join('');
  zoneSelect.value = selectedId;
  applyTransforms();
}

function applyTransforms() {
  for (const z of layout.zones) {
    const v = views.get(z.id);
    v.canvas.style.transform = cssMatrixForQuad(z.res[0], z.res[1], z.quad);
    v.canvas.style.display = z.hidden ? 'none' : '';
  }
  renderHandles();
}

// ---------- stage scaling ----------
let scale = 1;
function fitStage() {
  scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
}
window.addEventListener('resize', fitStage);

function toStage(e) {
  const r = stage.getBoundingClientRect();
  return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale];
}

// ---------- handles ----------
function renderHandles() {
  handlesLayer.innerHTML = '';
  if (mode !== 'calibrate') return;
  const z = zoneById(selectedId);
  if (!z) return;
  const add = (x, y, kind, index, cls) => {
    const el = document.createElement('div');
    el.className = `handle ${cls}`;
    if (activeHandle && activeHandle.kind === kind && activeHandle.index === index) el.classList.add('active');
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    el.style.borderColor = z.color;
    el.dataset.kind = kind; el.dataset.index = index;
    handlesLayer.appendChild(el);
  };
  if (editMask && z.mask) {
    z.mask.forEach(([u, v], i) => { const [x, y] = unitToStage(z.quad, u, v); add(x, y, 'mask', i, 'small'); });
  } else {
    z.quad.forEach(([x, y], i) => add(x, y, 'corner', i, ''));
    const cx = z.quad.reduce((s, p) => s + p[0], 0) / 4;
    const cy = z.quad.reduce((s, p) => s + p[1], 0) / 4;
    add(cx, cy, 'move', 0, 'move');
  }
}

let dragStart = null;
handlesLayer.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.handle');
  if (!el) return;
  e.preventDefault();
  el.setPointerCapture(e.pointerId);
  activeHandle = { zoneId: selectedId, kind: el.dataset.kind, index: Number(el.dataset.index) };
  const z = zoneById(selectedId);
  dragStart = { p: toStage(e), quad: z.quad.map((q) => [...q]) };
  renderHandles();
});

handlesLayer.addEventListener('pointermove', (e) => {
  if (!activeHandle || !dragStart || e.buttons === 0) return;
  moveActive(toStage(e), dragStart);
});

handlesLayer.addEventListener('pointerup', () => { dragStart = null; save(); });

function moveActive([x, y], start) {
  const z = zoneById(activeHandle.zoneId);
  if (activeHandle.kind === 'corner') {
    z.quad[activeHandle.index] = [x, y];
  } else if (activeHandle.kind === 'move') {
    const dx = x - start.p[0], dy = y - start.p[1];
    z.quad = start.quad.map(([qx, qy]) => [qx + dx, qy + dy]);
  } else if (activeHandle.kind === 'mask') {
    const [u, v] = stageToUnit(z.quad, x, y);
    z.mask[activeHandle.index] = [Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v))];
  }
  applyTransforms();
}

// Arrow nudging for precise alignment (buttons on the panel or keyboard).
function nudge(dx, dy) {
  if (!activeHandle) return;
  const z = zoneById(activeHandle.zoneId);
  if (activeHandle.kind === 'corner') {
    const [x, y] = z.quad[activeHandle.index];
    z.quad[activeHandle.index] = [x + dx * nudgeStep, y + dy * nudgeStep];
  } else if (activeHandle.kind === 'move') {
    z.quad = z.quad.map(([x, y]) => [x + dx * nudgeStep, y + dy * nudgeStep]);
  } else if (activeHandle.kind === 'mask') {
    const [x, y] = unitToStage(z.quad, ...z.mask[activeHandle.index]);
    const [u, v] = stageToUnit(z.quad, x + dx * nudgeStep, y + dy * nudgeStep);
    z.mask[activeHandle.index] = [Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v))];
  }
  applyTransforms(); save();
}

// ---------- render loop ----------
function maskPath(ctx, z) {
  const [w, h] = z.res;
  ctx.beginPath();
  z.mask.forEach(([u, v], i) => (i ? ctx.lineTo(u * w, v * h) : ctx.moveTo(u * w, v * h)));
  ctx.closePath();
}

function updateShow() {
  if (!started) return;
  let st = clock.showTime;
  if (clock.playing) {
    // Once a hold is reached it stays active (looping) until Continue releases it.
    if (!holding) holding = timeline.holdAt(st);
    if (holding && st >= holding.loop[1]) { clock.seek(holding.loop[0]); st = holding.loop[0]; }
    if (st >= timeline.duration) { stopShow(); return; }
  }
  return st;
}

function frame(now) {
  const drawStart = performance.now();
  const t = (now - t0) / 1000;
  const showT = mode === 'show' ? updateShow() : undefined;
  let syncFlash = false;
  if (syncTest) {
    const raw = (now - syncBase) / 1000;
    if (Math.floor(raw) !== lastBeep) { lastBeep = Math.floor(raw); beep(); }
    const vis = raw - layout.audioOffsetMs / 1000;
    syncFlash = vis >= 0 && vis % 1 < 0.12;
  }
  for (const z of layout.zones) {
    if (z.hidden) continue;
    const { ctx } = views.get(z.id);
    // Occluders (tree shadow, obstacles) only steer the layout: nothing is drawn in them outside Calibrate.
    if (z.occluder && mode !== 'calibrate') { ctx.clearRect(0, 0, z.res[0], z.res[1]); continue; }
    const [w, h] = z.res;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (z.mask) { maskPath(ctx, z); ctx.clip(); }
    if (z.occlude) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); }
    if (mode === 'calibrate') {
      calibrationPattern(ctx, w, h, z, z.id === selectedId);
    } else if (mode === 'test') {
      if (testPattern === 'white') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      else if (testPattern === 'colors') { ctx.fillStyle = z.color; ctx.fillRect(0, 0, w, h); }
      else calibrationPattern(ctx, w, h, z, false);
    } else if (mode === 'show') {
      if (syncTest) {
        if (syncFlash && (z.id === 'star' || z.id === 'backdrop')) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      } else if (!started) {
        if (preshow.zones.includes(z.id)) {
          try { preshow.draw(z.id, ctx, w, h, t, t, sceneEnv(z)); }
          catch (e) { console.error('pre-show draw failed', e); }
        }
      } else {
        const scene = timeline.sceneFor(z.id, showT);
        if (scene) {
          timeline.enterIfNeeded(scene);
          try { scene.draw(z.id, ctx, w, h, showT, showT - scene.start, sceneEnv(z)); }
          catch (e) { console.error(`scene ${scene.id} draw failed`, e); }
        } else if (SKY_ZONES.includes(z.id)) {
          skyBase(z.id, ctx, w, h, showT);                 // sky zones never go black between scenes
        }
      }
    } else if (demoEffects[z.id]) {
      demoEffects[z.id](ctx, w, h, t);
    }
    ctx.restore();
    if (mode === 'calibrate' && z.mask) {
      maskPath(ctx, z); ctx.strokeStyle = z.color; ctx.lineWidth = 4; ctx.stroke();
    }
  }
  clipsFrame(mode === 'show' && started && clock.playing);   // character clips follow the show clock
  idleMusic.update(mode === 'show' && !started && !syncTest);
  if (perf.last) {
    const k = 0.05;                                        // exponential moving average
    perf.frameMs += ((now - perf.last) - perf.frameMs) * k;
    perf.drawMs += ((performance.now() - drawStart) - perf.drawMs) * k;
  }
  perf.last = now; perf.frames++;
  if (mode === 'show' && ++uiTick % 6 === 0) updateShowUI(showT);
  requestAnimationFrame(frame);
}

// ---------- show controls ----------
const $ = (id) => document.getElementById(id);

function stopShow() {
  clock.pause(); clock.seek(0); timeline.reset();
  started = false; holding = null; updateShowUI(0);
}

async function togglePlay() {
  if (syncTest) toggleSync(false);
  if (clock.playing) { clock.pause(); }
  else { if (!started) { timeline.reset(); clock.seek(0); started = true; } await clock.play(); }
  updateShowUI(clock.showTime);
}

function jumpTo(t) {
  timeline.reset(); timeline.releaseBefore(t);
  clock.seek(t); started = true; holding = null;
  updateShowUI(t);
}

function jumpToCut() {
  if (!started) return;
  const c = cutTime(timeline.sceneAt(clock.showTime));
  if (c !== null && c > clock.showTime) jumpTo(c);
}

function continueHold() {
  if (!holding) return;
  timeline.released.add(holding.id);
  clock.seek(holding.at); holding = null;
}

function toggleSync(on = !syncTest) {
  syncTest = on;
  if (on) { clock.pause(); syncBase = performance.now(); lastBeep = -1; beep(); }
  $('syncBtn').classList.toggle('on', on);
}

function updateShowUI(st = 0) {
  $('playBtn').textContent = clock.playing ? '❚❚ Pause' : '▶ Play';
  $('continueBtn').disabled = !holding;
  const cur0 = started ? timeline.sceneAt(st) : null;
  const cut = cutTime(cur0);
  $('cutBtn').disabled = holding || cut === null || cut <= st;
  if (uiTick % 30 === 0) $('perfLabel').textContent = `${Math.round(1000 / (perf.frameMs || 16.7))} fps · draw ${perf.drawMs.toFixed(1)} ms`;
  $('continueBtn').classList.toggle('on', !!holding);
  $('timeLabel').textContent = started ? `${fmtTime(st)} / ${fmtTime(timeline.duration)}` : `pre-show · ${fmtTime(timeline.duration)}`;
  if (!seeking) $('seekBar').value = started ? String(st / timeline.duration) : '0';
  const cur = started ? timeline.sceneAt(st) : null;
  $('sceneLabel').textContent = holding ? '⏸ Waiting for Continue…' : (cur ? cur.title || cur.id : '');
}

// Live-moment fallback (TREATMENT §05): project the star in the finale if the real one couldn't go on.
const SHOW_KEY = 'christmas-mapping.show.v1';
const finale = scenes.find((s) => s.options && 'projectedStar' in s.options);
function setProjectedStar(on) {
  if (finale) finale.options.projectedStar = !!on;
  try { localStorage.setItem(SHOW_KEY, JSON.stringify({ projectedStar: !!on })); } catch { /* private mode: not persisted */ }
}
function loadShowOptions() {
  let on = false;
  try { on = !!JSON.parse(localStorage.getItem(SHOW_KEY) || '{}').projectedStar; } catch { /* ignore */ }
  if (finale) finale.options.projectedStar = on;
  $('projStar').checked = on;
}

let seeking = false;
function buildShowPanel() {
  loadShowOptions();
  $('sceneSelect').innerHTML = '<option value="">Jump to scene…</option>' +
    timeline.scenes.map((s) => `<option value="${s.start}">${fmtTime(s.start)} · ${s.title || s.id}</option>`).join('');
  $('delayRange').value = String(layout.audioOffsetMs);
  $('delayValue').textContent = `${layout.audioOffsetMs} ms`;
  clock.latencyMs = layout.audioOffsetMs;
}

$('playBtn').addEventListener('click', togglePlay);
$('restartBtn').addEventListener('click', () => { const wasPlaying = clock.playing; stopShow(); if (wasPlaying) togglePlay(); });
$('continueBtn').addEventListener('click', continueHold);
$('cutBtn').addEventListener('click', jumpToCut);
$('projStar').addEventListener('change', (e) => { setProjectedStar(e.target.checked); });
$('syncBtn').addEventListener('click', () => toggleSync());
$('sceneSelect').addEventListener('change', (e) => { if (e.target.value !== '') jumpTo(Number(e.target.value)); e.target.value = ''; });
$('seekBar').addEventListener('input', () => { seeking = true; });
$('seekBar').addEventListener('change', (e) => { seeking = false; jumpTo(Number(e.target.value) * timeline.duration); });
$('delayRange').addEventListener('input', (e) => {
  layout.audioOffsetMs = Number(e.target.value);
  clock.latencyMs = layout.audioOffsetMs;
  $('delayValue').textContent = `${layout.audioOffsetMs} ms`;
  save();
});

// ---------- media pack ----------
// Private files live in IndexedDB on this device (see media.js); scenes fetch them with media.objectUrl(name).
async function renderMediaList() {
  const items = await media.list();
  const ul = $('mediaList');
  ul.replaceChildren(...items.map(({ name, size }) => {
    const li = document.createElement('li');
    li.dataset.name = name;
    const label = document.createElement('span');
    label.textContent = `${name} · ${media.fmtBytes(size)}`;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm(`Delete "${name}" from this device?`)) return;
      try { await media.remove(name); } catch (err) { alert(err.message); }
      if (name === 'master-mix') loadMasterMix();
      if (name === 'music-box-loop') idleMusic.load();
      renderMediaList();
    });
    li.append(label, del);
    return li;
  }));
  if (!items.length) ul.innerHTML = '<li class="hint">No files yet.</li>';
  const est = await media.storageEstimate();
  $('mediaStatus').textContent = est
    ? `Storage used: ${media.fmtBytes(est.usage)} of ${media.fmtBytes(est.quota)}`
    : 'Storage used: unknown on this browser';
}

// The final mix drives the show clock when present; otherwise the clock runs silent.
async function loadMasterMix() {
  const url = await media.objectUrl('master-mix');
  if (!url) { $('musicName').textContent = 'No master-mix in the media pack: silent clock'; return; }
  stopShow(); clock.load(url);
  $('musicName').textContent = 'Music: master-mix (media pack)';
}

$('mediaFiles').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  let failed = '';
  for (const f of files) {
    try { await media.put(media.logicalName(f.name), f); } catch (err) { failed = err.message; }
  }
  media.persist();
  await renderMediaList();
  if (failed) $('mediaStatus').textContent = failed;
  if (files.some((f) => media.logicalName(f.name) === 'master-mix')) loadMasterMix();
  if (files.some((f) => media.logicalName(f.name) === 'music-box-loop')) idleMusic.load();
});

async function initMedia() {
  try { await media.check(); } catch (err) { $('mediaStatus').textContent = err.message; return; }
  await renderMediaList();
  loadMasterMix();
  idleMusic.load();
}

// ---------- panel ----------
function setMode(m) {
  mode = m;
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  document.getElementById('calibTools').hidden = m !== 'calibrate';
  document.getElementById('testTools').hidden = m !== 'test';
  document.getElementById('showTools').hidden = m !== 'show';
  if (m === 'show') updateShowUI(started ? clock.showTime : 0);
  if (m !== 'show') { if (clock.playing) clock.pause(); if (syncTest) toggleSync(false); }
  renderHandles();
}

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
document.querySelectorAll('[data-pattern]').forEach((b) => b.addEventListener('click', () => {
  testPattern = b.dataset.pattern;
  document.querySelectorAll('[data-pattern]').forEach((x) => x.classList.toggle('on', x === b));
}));

zoneSelect.addEventListener('change', () => {
  selectedId = zoneSelect.value; activeHandle = null; editMask = false;
  document.getElementById('maskBtn').classList.remove('on');
  document.getElementById('maskBtn').hidden = !zoneById(selectedId).mask;
  document.getElementById('hideZone').checked = !!zoneById(selectedId).hidden;
  renderHandles();
});

document.getElementById('maskBtn').addEventListener('click', (e) => {
  editMask = !editMask; activeHandle = null;
  e.currentTarget.classList.toggle('on', editMask);
  renderHandles();
});

document.getElementById('hideZone').addEventListener('change', (e) => {
  zoneById(selectedId).hidden = e.target.checked; applyTransforms(); save();
});

document.querySelectorAll('[data-nudge]').forEach((b) => b.addEventListener('click', () => {
  const [dx, dy] = b.dataset.nudge.split(',').map(Number); nudge(dx, dy);
}));
document.getElementById('stepSel').addEventListener('change', (e) => { nudgeStep = Number(e.target.value); });

document.getElementById('resetZone').addEventListener('click', () => {
  if (!confirm(`Reset "${zoneById(selectedId).label}" to its default position?`)) return;
  const def = defaultLayout().zones.find((z) => z.id === selectedId);
  Object.assign(zoneById(selectedId), { quad: def.quad, mask: def.mask });
  activeHandle = null; applyTransforms(); save();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'mapping-layout.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.version !== 1) throw new Error('unknown version');
    layout = mergeDefaults(data); buildViews(); save();
  } catch (err) { alert(`Could not import: ${err.message}`); }
  e.target.value = '';
});

document.getElementById('photoFile').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  bg.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
  bg.hidden = false;
  document.getElementById('photoOpacity').disabled = false;
});
document.getElementById('photoOpacity').addEventListener('input', (e) => { bg.style.opacity = e.target.value; });
document.getElementById('photoClear').addEventListener('click', () => { bg.hidden = true; bg.style.backgroundImage = ''; });

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  const el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
});

function toggleUI(force) {
  const show = force ?? panel.hidden;
  panel.hidden = !show;
  document.body.classList.toggle('ui-hidden', !show);
}
document.getElementById('hideUI').addEventListener('click', () => toggleUI(false));
document.getElementById('hotCorner').addEventListener('click', () => toggleUI(true));

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (map[e.key]) { e.preventDefault(); nudge(...map[e.key]); }
  if (e.key === 'h') toggleUI();
  if (e.key === '1') setMode('calibrate');
  if (e.key === '2') setMode('test');
  if (e.key === '3') setMode('demo');
  if (e.key === '4') setMode('show');
  if (mode === 'show' && e.key === ' ') { e.preventDefault(); togglePlay(); }
  if (mode === 'show' && e.key === 'c') continueHold();
});

// ---------- go ----------
fitStage();
buildViews();
buildShowPanel();
setMode('calibrate');
document.getElementById('maskBtn').hidden = !zoneById(selectedId).mask;
requestAnimationFrame(frame);
initMedia();

// Offline: cache the app shell (sw.js). Service workers need https or localhost.
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker not registered', err));
}
