import { cssMatrixForQuad, stageToUnit, unitToStage } from './homography.js';
import { defaultLayout, STAGE_W, STAGE_H } from './layout.js';
import { calibrationPattern, demoEffects } from './effects.js';

const STORAGE_KEY = 'christmas-mapping.layout.v1';

// ---------- state ----------
let layout = loadLayout();
let mode = 'calibrate';          // calibrate | test | demo
let testPattern = 'grid';        // grid | white | colors
let selectedId = 'wall';
let editMask = false;
let activeHandle = null;         // { zoneId, kind: 'corner'|'mask'|'move', index }
let nudgeStep = 2;
const t0 = performance.now();

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

function frame(now) {
  const t = (now - t0) / 1000;
  for (const z of layout.zones) {
    if (z.hidden) continue;
    const { ctx } = views.get(z.id);
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
    } else if (demoEffects[z.id]) {
      demoEffects[z.id](ctx, w, h, t);
    }
    ctx.restore();
    if (mode === 'calibrate' && z.mask) {
      maskPath(ctx, z); ctx.strokeStyle = z.color; ctx.lineWidth = 4; ctx.stroke();
    }
  }
  requestAnimationFrame(frame);
}

// ---------- panel ----------
function setMode(m) {
  mode = m;
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  document.getElementById('calibTools').hidden = m !== 'calibrate';
  document.getElementById('testTools').hidden = m !== 'test';
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
});

// ---------- go ----------
fitStage();
buildViews();
setMode('calibrate');
document.getElementById('maskBtn').hidden = !zoneById(selectedId).mask;
requestAnimationFrame(frame);
