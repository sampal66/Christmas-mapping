// Setup flow on the Room model page (WP-09a): find the projector spot (phase A), then survey the room with the tape
// from that spot (phase B), card by card. Every answer goes straight into the spatial model, so the views, the Mapper's
// default zones and the report follow. Calibration on the wall (phase C) is WP-09b.
import { analyse, rankSpots, suggestBoxes, tradeOffs, TREE_TOLERANCE } from './survey.js';
import { projectorCamera, makeCamera, rayDir } from './stage-model.js';
import { unitToStage } from './homography.js';
import { loadSetup, saveSetup, clearSetup } from './model-store.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cm = (m) => Math.round(m * 100);
const getPath = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
function setPath(o, p, v) { const k = p.split('.'); const last = k.pop(); k.reduce((a, x) => a[x], o)[last] = v; }

// A field: [label, path (metres in the model), sanity range in cm, scale (model value = cm / 100 × scale)].
const F = (label, path, min, max, scale = 1) => ({ label, path, min, max, scale });

// Origin for every tape measurement: the doorway jamb is x = 0, the main wall is y = 0, the floor is z = 0.
const ORIGIN = 'From the <b>doorway jamb</b> (x = 0), out from the <b>main wall</b> (y = 0), up from the <b>floor</b> (z = 0). Centimetres.';

const STEPS = [
  { id: 'rough', phase: 'A', title: 'Rough room', diagram: 'front',
    text: 'Five quick numbers so the app can look for a spot. Rough is fine: the survey later fixes them. Then where a tripod can stand.',
    fields: [F('Main wall width', 'room.wallWidth', 150, 400), F('Sideboard left edge (x)', 'sideboard.x0', 0, 300),
      F('Sideboard right edge (x)', 'sideboard.x1', 50, 400), F('Sideboard height', 'sideboard.height', 50, 120),
      F('Tree trunk (x)', 'tree.x', 0, 250), F('Star top height', 'star.topZ', 120, 280),
      F('Tripod area: x from', 'limits.x.0', -200, 400), F('Tripod area: x to', 'limits.x.1', -200, 400),
      F('Tripod area: nearest to wall', 'limits.y.0', 150, 600), F('Tripod area: farthest from wall', 'limits.y.1', 150, 600),
      F('Lens height: lowest', 'limits.z.0', 80, 220), F('Lens height: highest', 'limits.z.1', 80, 220)] },
  { id: 'spots', phase: 'A', title: 'Candidate spots', diagram: 'top',
    text: 'The app tried a grid of tripod spots and lens heights inside your tripod area and ranks them by the tree shadow on the dogs\' floor, coverage, keystone and whether the lens can fill the frame. Tap <b>Try</b> to see one in the views, then put the tripod there.' },
  { id: 'guides', phase: 'A', title: 'Live wall guides', diagram: 'top',
    text: 'Projector on, aimed at the wall. <b>Project guides</b>: a border and level grid (square and level the image), the <b>stage target</b> (green: the floor the dogs need, blue: the tower top) and the <b>predicted shadow</b> (red dashes). Move the tripod until the frame reaches the wall edges and the <b>real</b> tree shadow stays off the green. Tap the picture to come back, then <b>Lock spot</b>.' },
  { id: 'throw', phase: 'A', title: 'Throw check', diagram: 'top',
    text: '<b>Project white frame</b>, then measure the lit frame\'s width on the wall, straight across through its middle. The app works out the throw ratio from it and the lens distance.' },
  { id: 'lens', phase: 'B', title: 'Lens position', diagram: 'top', text: `Measure to the centre of the lens. ${ORIGIN}`,
    fields: [F('Lens across (x)', 'projector.pos.0', -200, 400), F('Lens out from wall (y)', 'projector.pos.1', 150, 600), F('Lens height (z)', 'projector.pos.2', 80, 220)] },
  { id: 'wall', phase: 'B', title: 'Main wall and ceiling', diagram: 'front', text: ORIGIN,
    fields: [F('Wall width (jamb → corner)', 'room.wallWidth', 150, 400), F('Ceiling height', 'room.ceiling', 200, 300)] },
  { id: 'sideboard', phase: 'B', title: 'Sideboard', diagram: 'front', text: `${ORIGIN} Height = floor → top.`,
    fields: [F('Left edge (x)', 'sideboard.x0', 0, 300), F('Right edge (x)', 'sideboard.x1', 50, 400), F('Depth (from the wall)', 'sideboard.depth', 20, 80), F('Height', 'sideboard.height', 50, 120)] },
  { id: 'obstacles', phase: 'B', title: 'Things that stay on the sideboard', diagram: 'front',
    text: 'Anything that stays on the sideboard top during the show (plant, letter board, figurine…). x = its left edge from the jamb. The dogs are kept off them. Leave empty if the top is clear.' },
  { id: 'tree', phase: 'B', title: 'Tree', diagram: 'tree', text: `${ORIGIN} The trunk is the tree's centre line.`,
    fields: [F('Trunk across (x)', 'tree.x', 0, 250), F('Trunk out from wall (y)', 'tree.y', 10, 150),
      F('Widest diameter', 'tree.radius', 30, 200, 0.5), F('Height of the widest part', 'tree.baseZ', 0, 120),
      F('Bare tip height (no star)', 'tree.tipZ', 100, 260), F('Star top height', 'star.topZ', 120, 280), F('Star size (tall)', 'star.size', 5, 60)] },
  { id: 'rightwall', phase: 'B', title: 'Right wall', diagram: 'front', text: 'From the corner along the right wall. The usable length is the clean stretch the light strip may use.',
    fields: [F('Usable length from the corner', 'rightStrip.depth', 10, 340), F('Table height', 'rightStrip.z0', 0, 120),
      F('Sconce: distance from the corner', 'fixtures.sconce.y', 0, 340), F('Sconce height', 'fixtures.sconce.z', 100, 250)] },
  { id: 'boxes', phase: 'B', title: 'Gift boxes', diagram: 'front',
    text: 'The real box sizes, or tap <b>Suggest</b> for sizes and positions that leave the dogs their floor (the tower moves toward the corner when needed).' },
  { id: 'report', phase: 'B', title: 'Report', diagram: null, text: 'What the show will get from this spot and these measurements.' },
];

let api, setup, spotCache = { key: '', list: [] }, boxCache = { key: '', list: [] };
const model = () => api.model;

export function initSetup(a) {
  api = a;
  setup = loadSetup();
  setup.step = Math.min(Math.max(0, setup.step | 0), STEPS.length - 1);
  $('setupBack').addEventListener('click', () => go(setup.step - 1));
  $('setupNext').addEventListener('click', () => go(setup.step + 1));
  $('setupSkip').addEventListener('click', () => { (setup.unsure ||= {})[STEPS[setup.step].id] = true; go(setup.step + 1); });
  $('setupRestart').addEventListener('click', () => { if (confirm('Start the setup again? Measurements stay in the model.')) { clearSetup(); setup = { step: 0 }; go(0); } });
  $('guideOverlay').addEventListener('click', closeGuides);
  renderCard();
}

/** Called by the page after any model change, so the open card's live checks follow. */
export function refreshSetup() { renderChecks(); }

function go(i) {
  setup.step = Math.min(Math.max(0, i), STEPS.length - 1);
  saveSetup(setup);
  renderCard();
}

function changed() { api.changed(); renderChecks(); }

// ---------- card ----------
function renderCard() {
  const s = STEPS[setup.step];
  $('setupStep').textContent = `${s.phase === 'A' ? 'A · Projector spot' : 'B · Survey'} — ${setup.step + 1}/${STEPS.length}`;
  $('setupDots').innerHTML = STEPS.map((x, i) => `<button class="dot${i === setup.step ? ' on' : ''}${setup.unsure?.[x.id] ? ' skip' : ''}" data-i="${i}" title="${esc(x.title)}" aria-label="${esc(x.title)}"></button>`).join('');
  $('setupDots').querySelectorAll('.dot').forEach((b) => b.addEventListener('click', () => go(+b.dataset.i)));
  $('setupNext').hidden = $('setupSkip').hidden = setup.step === STEPS.length - 1;
  $('setupBack').disabled = setup.step === 0;
  const body = [`<h3>${esc(s.title)}</h3>`, `<p class="hint">${s.text}</p>`];
  if (s.diagram) body.push(diagram(s.diagram, s.id));
  if (s.fields) body.push(`<div class="fields">${s.fields.map(fieldHtml).join('')}</div>`);
  body.push(`<div id="cardCustom"></div><div id="cardCheck" class="check"></div>`);
  $('setupCard').innerHTML = body.join('');
  $('setupCard').querySelectorAll('input[data-path]').forEach((el) => el.addEventListener('input', onField));
  const custom = CUSTOM[s.id];
  if (custom) custom($('cardCustom'));
  api.candidates(s.id === 'spots' || s.id === 'guides' ? spots().slice(0, 3) : []);
  renderChecks();
}

function fieldHtml(f, i) {
  const v = getPath(model(), f.path);
  const val = v === undefined || v === null ? '' : +(v / f.scale * 100).toFixed(1);
  return `<label class="f">${esc(f.label)}<input type="number" inputmode="decimal" step="1" data-path="${f.path}" data-i="${i}" value="${val}" placeholder="cm"><span class="u">cm</span><span class="warn" data-warn="${i}"></span></label>`;
}

function onField(e) {
  const f = STEPS[setup.step].fields[+e.target.dataset.i];
  const raw = parseFloat(e.target.value);
  const warn = $('setupCard').querySelector(`[data-warn="${e.target.dataset.i}"]`);
  if (!Number.isFinite(raw)) { warn.textContent = ''; return; }
  if (raw < f.min || raw > f.max) { warn.textContent = `expected ${f.min}–${f.max} cm: not used`; return; }
  warn.textContent = '';
  setPath(model(), f.path, +(raw / 100 * f.scale).toFixed(4));
  if (setup.unsure?.[STEPS[setup.step].id]) { delete setup.unsure[STEPS[setup.step].id]; saveSetup(setup); }
  changed();
}

// The live check under each card: the spot's trade-offs, plus card-specific notes.
function renderChecks() {
  const el = $('cardCheck');
  if (!el) return;
  const s = STEPS[setup.step];
  if (s.id === 'report') { renderReport($('cardCustom')); el.innerHTML = ''; return; }
  const m = model(), notes = [];
  if (m.sideboard.x1 <= m.sideboard.x0) notes.push(bad('the sideboard\'s right edge must be right of its left edge'));
  if (m.limits.x[1] < m.limits.x[0] || m.limits.y[1] < m.limits.y[0] || m.limits.z[1] < m.limits.z[0]) notes.push(bad('a tripod-area "from" is past its "to"'));
  if (m.star.topZ <= m.tree.tipZ) notes.push(bad('the star top should be above the bare tip'));
  if (m.tree.tipZ <= m.tree.baseZ) notes.push(bad('the bare tip should be above the widest part'));
  if (!notes.length) {
    const a = analyse(m, { fast: s.id !== 'guides' && s.id !== 'throw' && s.id !== 'lens' });
    notes.push(...tradeOffs(a).map((t, i) => (i === 0 ? (a.floorMargin < 0 ? bad(t) : a.floorMargin < TREE_TOLERANCE ? warnLine(t) : good(t)) : `<li>${esc(t)}</li>`)));
  }
  el.innerHTML = `<ul>${notes.join('')}</ul>`;
}
const good = (t) => `<li class="ok">✓ ${esc(t)}</li>`;
const bad = (t) => `<li class="bad">✗ ${esc(t)}</li>`;
const warnLine = (t) => `<li class="warnc">! ${esc(t)}</li>`;

// ---------- card-specific content ----------
function spots() {
  const m = model();
  const key = JSON.stringify([m.limits, m.room, m.sideboard, m.tree, m.star, m.boxes, m.obstacles, m.projector.zoom, m.counter]);
  if (spotCache.key !== key) spotCache = { key, list: rankSpots(m) };
  return spotCache.list;
}

const fmtPos = (p) => `x ${cm(p[0])} · ${cm(p[1])} cm from wall · lens ${cm(p[2])} cm`;

const CUSTOM = {
  spots(el) {
    const m = model();
    const now = analyse(m);
    const best = spots().slice(0, 3);
    el.innerHTML = `<div class="spot now"><b>Now</b> ${fmtPos(m.projector.pos)}<br><small>${esc(tradeOffs(now).join(' · '))}</small></div>` +
      best.map((s, i) => `<div class="spot"><b>${i + 1}</b> ${fmtPos(s.pos)} <button data-try="${i}">Try</button><br><small>${esc(tradeOffs(s.a).join(' · '))}</small></div>`).join('');
    el.querySelectorAll('[data-try]').forEach((b) => b.addEventListener('click', () => {
      m.projector.pos = [...best[+b.dataset.try].pos];
      changed(); CUSTOM.spots(el); api.candidates(best);
    }));
  },
  guides(el) {
    const lk = setup.locked;
    el.innerHTML = `<div class="row"><button class="primary" id="projGuides">Project guides</button><button id="lockSpot">Lock spot</button></div>` +
      `<p class="hint">${lk ? `Locked: ${fmtPos(lk.pos)} (${esc(lk.date)}). Measure it exactly in the survey (Lens position).` : 'Not locked yet.'}</p>`;
    $('projGuides').addEventListener('click', () => openGuides('guides'));
    $('lockSpot').addEventListener('click', () => {
      setup.locked = { pos: [...model().projector.pos], date: new Date().toISOString().slice(0, 10) };
      saveSetup(setup); CUSTOM.guides(el);
    });
  },
  throw(el) {
    const m = model();
    el.innerHTML = `<div class="row"><button class="primary" id="projWhite">Project white frame</button></div>
      <div class="fields"><label class="f">Frame width on the wall<input type="number" inputmode="decimal" id="frameW" placeholder="cm"><span class="u">cm</span><span></span></label></div>
      <p class="hint" id="throwOut">Lens distance from the model: ${cm(m.projector.pos[1])} cm (correct it in Lens position if needed).</p>`;
    $('projWhite').addEventListener('click', () => openGuides('white'));
    $('frameW').addEventListener('input', (e) => {
      const w = parseFloat(e.target.value) / 100;
      if (!(w > 0.5 && w < 6)) { $('throwOut').textContent = 'Expected 50–600 cm.'; return; }
      const tr = throwFromWidth(m, w);
      const [lo, hi] = m.projector.zoom || [tr, tr];
      const inLens = tr >= lo - 0.05 && tr <= hi + 0.05;
      $('throwOut').innerHTML = `Throw ratio <b>${tr.toFixed(2)}</b>. ${inLens ? (lo === hi ? 'Matches the fixed lens.' : `Zoom setting ≈ ${(((tr - lo) / (hi - lo || 1)) * 100).toFixed(0)} % toward tele.`) : `<span class="bad">Outside the lens range ${lo}–${hi}: re-check the width and the lens distance.</span>`} <button id="useThrow">Use ${tr.toFixed(2)}</button>`;
      $('useThrow').addEventListener('click', () => { m.projector.throwRatio = +tr.toFixed(3); changed(); });
    });
  },
  obstacles(el) {
    const m = model();
    const rows = (m.obstacles || []).map((o, i) => `<div class="obs" data-o="${i}">
      <input type="text" data-k="label" value="${esc(o.label || '')}" placeholder="what (e.g. plant)" maxlength="24">
      ${['x', 'width', 'height'].map((k) => `<label>${k}<input type="number" inputmode="decimal" data-k="${k}" value="${cm(o[k])}"></label>`).join('')}
      <button data-del="${i}" aria-label="Remove">✕</button></div>`).join('');
    el.innerHTML = `${rows || '<p class="hint">None: the sideboard top is clear.</p>'}<div class="row"><button id="addObs">Add one</button></div>`;
    $('addObs').addEventListener('click', () => {
      (m.obstacles ||= []).push({ x: +(m.sideboard.x0 + 0.1).toFixed(2), width: 0.2, height: 0.3 });
      changed(); CUSTOM.obstacles(el);
    });
    el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { m.obstacles.splice(+b.dataset.del, 1); changed(); CUSTOM.obstacles(el); }));
    el.querySelectorAll('.obs input').forEach((inp) => inp.addEventListener('input', () => {
      const o = m.obstacles[+inp.closest('.obs').dataset.o], k = inp.dataset.k;
      if (k === 'label') { o.label = inp.value.slice(0, 24); api.changed(); return; }
      const v = parseFloat(inp.value);
      const [lo, hi] = k === 'x' ? [0, 400] : [1, 150];
      inp.classList.toggle('badin', !(v >= lo && v <= hi));
      if (v >= lo && v <= hi) { o[k] = v / 100; changed(); }
    }));
  },
  boxes(el) {
    const m = model();
    const big = m.boxes.find((b) => b.id === 'box2'), small = m.boxes.find((b) => b.id === 'box1');
    el.innerHTML = `<div class="fields">
      <label class="f">Big box size<input type="number" inputmode="decimal" data-b="big" value="${cm(big.size)}"><span class="u">cm</span><span></span></label>
      <label class="f">Small box size<input type="number" inputmode="decimal" data-b="small" value="${cm(small.size)}"><span class="u">cm</span><span></span></label>
      <label class="f">Big box left edge (x)<input type="number" inputmode="decimal" data-b="x" value="${cm(big.x0)}"><span class="u">cm</span><span></span></label></div>
      <div class="row"><button class="primary" id="suggestBtn">Suggest</button></div><div id="suggestions"></div>`;
    el.querySelectorAll('[data-b]').forEach((inp) => inp.addEventListener('input', () => {
      const v = parseFloat(inp.value) / 100;
      if (!(v > 0.1 && v < 4)) return;
      if (inp.dataset.b === 'x') big.x0 = v; else (inp.dataset.b === 'big' ? big : small).size = v;
      // the small box stays centred on the big one
      const inset = (big.size - small.size) / 2;
      Object.assign(small, { x0: +(big.x0 + inset).toFixed(3), y0: +Math.max(0, inset).toFixed(3), z0: +(m.sideboard.height + big.size).toFixed(3) });
      changed();
    }));
    $('suggestBtn').addEventListener('click', () => showSuggestions($('suggestions'), () => CUSTOM.boxes(el)));
  },
};

function showSuggestions(el, after) {
  const list = boxSuggestions().slice(0, 3);
  el.innerHTML = list.map((c, i) => `<div class="spot"><b>${i + 1}</b> big ${cm(c.big)} cm at x ${cm(c.x0)} · small ${cm(c.small)} cm
    <button data-use="${i}">Use</button><br><small class="${c.ok ? '' : 'bad'}">dogs' floor ${c.floor >= 0 ? `+${cm(c.floor)}` : cm(c.floor)} cm · tower top ${c.tower >= 0 ? `+${cm(c.tower)}` : cm(c.tower)} cm${c.ok ? '' : ' (does not fit)'}</small></div>`).join('') ||
    '<p class="hint">No box position fits on this sideboard.</p>';
  if (list.length && !list[0].ok && model().obstacles?.length) el.insertAdjacentHTML('beforeend', '<p class="hint bad">No box layout fits: move the things that stay on the sideboard off the floor between the tree and the boxes.</p>');
  el.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
    model().boxes = JSON.parse(JSON.stringify(list[+b.dataset.use].boxes));
    changed(); after?.();
  }));
}

function boxSuggestions() {
  const m = model();
  const key = JSON.stringify([m.room, m.sideboard, m.tree, m.star, m.boxes, m.obstacles, m.projector]);
  if (boxCache.key !== key) boxCache = { key, list: suggestBoxes(m) };
  return boxCache.list;
}

// The throw ratio whose image, with the model's aim, is `width` m wide on the wall through its middle row.
function throwFromWidth(m, width) {
  const base = projectorCamera(m);
  const widthAt = (tr) => {
    const cam = makeCamera({ pos: base.pos, yaw: base.yaw, pitch: base.pitch, focalPx: tr * base.res[0], res: base.res });
    const hit = (u) => { const d = rayDir(cam, u, base.res[1] / 2); const k = -cam.pos[1] / d[1]; return [cam.pos[0] + d[0] * k, cam.pos[2] + d[2] * k]; };
    const a = hit(0), b = hit(base.res[0]);
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  };
  let lo = 0.3, hi = 4;                                     // width falls as the ratio grows
  for (let i = 0; i < 40; i++) { const c = (lo + hi) / 2; if (widthAt(c) > width) lo = c; else hi = c; }
  return (lo + hi) / 2;
}

// ---------- report ----------
function renderReport(el) {
  const m = model();
  const a = analyse(m);
  const sh = a.shadowAtFloor;
  const need = a.floorNeed, span = a.floorSpan[1] - a.floorSpan[0];
  const f = a.floorMargin;
  const starOff = a.starShadowOffset;
  const line = (cls, label, text) => `<li class="${cls}"><span>${label}</span><span>${text}</span></li>`;
  const cls = (v, warn = 0) => (v < 0 ? 'bad' : v < warn ? 'warnc' : 'ok');
  const skipped = Object.keys(setup.unsure || {}).map((id) => STEPS.find((s) => s.id === id)?.title).filter(Boolean);
  el.innerHTML = `<ul class="report">
    ${line('', 'Tree shadow on the wall (sideboard height)', sh ? `${cm(sh[1] - sh[0])} cm wide, x ${cm(sh[0])}–${cm(sh[1])} cm` : 'none')}
    ${line(cls(f, TREE_TOLERANCE), 'Dogs\' floor (Alaska + Connor)', `needs ${cm(need)} cm, free ${cm(span)} cm → margin ${f >= 0 ? '+' : ''}${cm(f)} cm`)}
    ${line(cls(a.towerMargin), 'Tower top (cats + guest + chimney)', `margin ${a.towerMargin >= 0 ? '+' : ''}${cm(a.towerMargin)} cm`)}
    ${line(Math.abs(starOff[0]) > 0.05 || Math.abs(starOff[1]) > 0.05 ? 'warnc' : 'ok', 'Star', `its shadow lands ${cm(Math.abs(starOff[0]))} cm ${starOff[0] >= 0 ? 'right' : 'left'}, ${cm(Math.abs(starOff[1]))} cm ${starOff[1] >= 0 ? 'above' : 'below'} the topper: calibrate the star on the topper, not on its shadow (WP-09b)`)}
    ${line(a.covered === a.coverTotal ? 'ok' : 'warnc', 'Coverage', `${a.covered}/${a.coverTotal} key points in the image · right wall ${a.rightStrip.toFixed(2)} m`)}
    ${line(a.throwFits ? 'ok' : 'warnc', 'Throw', `needs ≤ ${a.maxThrowRatio.toFixed(2)}, lens ${m.projector.throwRatio}`)}
    ${a.barClear !== null ? line(cls(a.barClear - 0.03), 'Beam over the bar', `${cm(a.barClear)} cm clear`) : ''}
    ${skipped.length ? line('warnc', 'Skipped / not sure', esc(skipped.join(', '))) : ''}
  </ul>
  <h3>Suggestions</h3><div id="reportSug"></div>
  <div class="row"><button class="primary" id="repUse">Use in Mapper</button><button id="repExport">Export setup</button>
    <label class="filebtn">Import setup<input type="file" id="repImport" accept="application/json,.json"></label></div>
  <p class="hint">The setup file holds measurements only (no photos, no names). Calibrate on the wall next (WP-09b).</p>`;
  const sug = [];
  if (f < TREE_TOLERANCE) sug.push(`<p class="hint">The dogs are ${f < 0 ? 'in' : 'close to'} the tree shadow. Box options that free their floor:</p>`);
  $('reportSug').innerHTML = sug.join('') + '<div id="repBoxes"></div>';
  showSuggestions($('repBoxes'), () => renderReport(el));
  $('repUse').addEventListener('click', () => $('useBtn').click());
  $('repExport').addEventListener('click', exportSetup);
  $('repImport').addEventListener('change', (e) => importSetup(e.target.files[0]));
}

// ---------- export / import (measurements only) ----------
export function setupJson() {
  return { kind: 'christmas-mapping-setup', version: 1, model: model(), setup: { locked: setup.locked, unsure: setup.unsure, step: setup.step } };
}

function exportSetup() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(setupJson(), null, 2)], { type: 'application/json' }));
  a.download = 'room-setup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importSetup(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.kind !== 'christmas-mapping-setup' || !data.model) throw new Error('not a room setup file');
    api.replace(data.model);
    setup = { step: STEPS.length - 1, ...(data.setup || {}) };
    saveSetup(setup);
    renderCard();
  } catch (err) { alert(`Could not import: ${err.message}`); }
}

// ---------- projected guides ----------
function openGuides(kind) {
  const ov = $('guideOverlay');
  ov.hidden = false;
  const c = $('guideCanvas'), ctx = c.getContext('2d');
  drawGuides(ctx, c.width, c.height, kind);
  (ov.requestFullscreen || ov.webkitRequestFullscreen)?.call(ov)?.catch?.(() => {});
}

function closeGuides() {
  $('guideOverlay').hidden = true;
  if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
}

/** The wall guides in stage pixels (the projector's 1920×1080 frame). Static: no motion, no flashes. */
export function drawGuides(ctx, W, H, kind) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (kind === 'white') {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();   // measure along this line
    return;
  }
  // level grid + border
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
  for (let x = 120; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 120; y < H; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, W - 10, H - 10);

  const a = analyse(model(), { fast: true });
  const zones = Object.fromEntries(a.layout.zones.map((z) => [z.id, z]));
  const wall = zones.wall, L = a.L;
  const toStage = (x, y) => unitToStage(wall.quad, x / wall.res[0], y / wall.res[1]);
  const fillPoly = (pts, fill, stroke) => {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 4; ctx.stroke();
  };
  // stage target: the floor the dogs need (packed against the big box), and the tower top
  const bx = L.floorSpan[1], x0 = bx - L.floorNeed, top = L.floorY - L.H;
  fillPoly([toStage(x0, top), toStage(bx, top), toStage(bx, L.floorY), toStage(x0, L.floorY)], 'rgba(76,195,138,.35)', '#4cc38a');
  const t0 = L.towerAt(0), t1 = L.towerAt(1), th = L.H * 0.55;
  fillPoly([toStage(t0[0], t0[1] - th), toStage(t1[0], t1[1] - th), toStage(t1[0], t1[1]), toStage(t0[0], t0[1])], 'rgba(79,195,247,.3)', '#4fc3f7');
  // predicted shadows (tree, star, obstacles)
  ctx.setLineDash([18, 12]);
  for (const z of a.layout.zones.filter((o) => o.occluder)) {
    const pts = z.mask.map(([u, v]) => unitToStage(z.quad, u, v));
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.strokeStyle = '#ff5c6c'; ctx.lineWidth = 5; ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.font = 'bold 34px system-ui, sans-serif'; ctx.fillStyle = '#fff';
  const lbl = toStage(x0, top);
  ctx.fillText('STAGE TARGET: keep the real shadow off the green', Math.min(lbl[0], W - 860), Math.max(60, lbl[1] - 20));
  ctx.fillStyle = '#ff9aa4'; ctx.fillText('predicted shadow', 40, 70);
  ctx.fillStyle = '#ffd54f'; ctx.fillText('tap to close', W - 260, H - 40);
}

// ---------- small diagrams (schematic, not to scale) ----------
const HL = {
  rough: ['wall', 'sideboard', 'tree', 'star', 'origin'], wall: ['wall', 'origin'], sideboard: ['sideboard', 'origin'],
  obstacles: ['obstacle', 'sideboard'], tree: ['tree', 'star', 'origin'], rightwall: ['right', 'sconce'], boxes: ['boxes'],
  spots: ['projector'], guides: ['projector'], throw: ['projector'], lens: ['projector', 'origin'],
};
function diagram(kind, id) {
  const on = new Set(HL[id] || []);
  const st = (k, base = '#56607a') => `stroke="${on.has(k) ? '#ffd54f' : base}" stroke-width="${on.has(k) ? 3 : 1.5}"`;
  if (kind === 'top') {
    return `<svg class="diag" viewBox="0 0 240 130" role="img" aria-label="Top view: main wall, tree, sideboard and the projector">
      <line x1="20" y1="14" x2="200" y2="14" ${st('wall', '#cfd6e6')}/><line x1="200" y1="14" x2="200" y2="120" ${st('right', '#cfd6e6')}/>
      <rect x="110" y="14" width="90" height="16" fill="#7a5230" ${st('sideboard')}/>
      <circle cx="62" cy="36" r="20" fill="rgba(76,195,138,.4)" ${st('tree')}/>
      <rect x="40" y="104" width="22" height="12" fill="#ffd54f" ${st('projector')}/>
      <line x1="51" y1="104" x2="20" y2="14" stroke="rgba(255,213,79,.4)"/><line x1="51" y1="104" x2="200" y2="40" stroke="rgba(255,213,79,.4)"/>
      <circle cx="20" cy="14" r="4" fill="#ff5c6c" ${st('origin')}/><text x="4" y="10" fill="#9aa3b8" font-size="9">x=0 jamb</text>
      <text x="66" y="124" fill="#9aa3b8" font-size="9">y = out from the wall</text><text x="208" y="70" fill="#9aa3b8" font-size="9" transform="rotate(90 208 70)">right wall</text>
    </svg>`;
  }
  const tree = kind === 'tree';
  return `<svg class="diag" viewBox="0 0 240 130" role="img" aria-label="Front view: wall, tree, sideboard and boxes">
    <rect x="20" y="8" width="180" height="112" fill="none" ${st('wall', '#cfd6e6')}/>
    <polygon points="200,8 228,0 228,128 200,120" fill="none" ${st('right', '#cfd6e6')}/>
    <circle cx="214" cy="40" r="4" fill="#e8475f" ${st('sconce')}/>
    <rect x="108" y="84" width="92" height="36" fill="#7a5230" ${st('sideboard')}/>
    <rect x="160" y="62" width="22" height="22" fill="#f4f7ff" ${st('boxes')}/><rect x="164" y="46" width="16" height="16" fill="#f4f7ff" ${st('boxes')}/>
    <rect x="118" y="70" width="10" height="14" fill="#6b8e5a" ${st('obstacle')}/>
    <polygon points="60,${tree ? 26 : 30} 32,112 88,112" fill="rgba(76,195,138,.45)" ${st('tree')}/>
    <polygon points="60,14 63,22 71,22 64,27 67,35 60,30 53,35 56,27 49,22 57,22" fill="#ffd54f" ${st('star', '#ffd54f')}/>
    ${tree ? '<line x1="60" y1="14" x2="60" y2="120" stroke="#9aa3b8" stroke-dasharray="3 3"/><line x1="32" y1="104" x2="88" y2="104" stroke="#ffd54f"/><text x="92" y="106" fill="#9aa3b8" font-size="9">widest</text>' : ''}
    <circle cx="20" cy="120" r="4" fill="#ff5c6c" ${st('origin')}/><text x="2" y="129" fill="#9aa3b8" font-size="9">x=0, floor z=0</text>
  </svg>`;
}
