// Room model page: shows the spatial model from three sides, what the projector covers, and pushes
// model-generated zones into the Mapper. Drawing is plain Canvas 2D; no state leaves the device.
import { layoutFromModel, coverage, projectorCamera, project, requiredThrowRatio } from './stage-model.js';
import { loadModel, saveModel, clearModel } from './model-store.js';

const LAYOUT_KEY = 'christmas-mapping.layout.v1';
const $ = (id) => document.getElementById(id);

// Editable fields: [label, path into the model, step]
const FIELDS = [
  ['Projector', [
    ['Distance from wall (y)', 'projector.pos.1', 0.05],
    ['Across from jamb (x)', 'projector.pos.0', 0.05],
    ['Lens height (z)', 'projector.pos.2', 0.05],
    ['Throw ratio', 'projector.throwRatio', 0.01],
  ]],
  ['Tree', [
    ['Axis x', 'tree.x', 0.05], ['Axis y (from wall)', 'tree.y', 0.05],
    ['Bare tip height', 'tree.tipZ', 0.01], ['Base radius', 'tree.radius', 0.05],
  ]],
  ['Star', [['Top height', 'star.topZ', 0.01], ['Size', 'star.size', 0.01]]],
  ['Sideboard', [['Height', 'sideboard.height', 0.01], ['Left edge x', 'sideboard.x0', 0.01]]],
];

let model = loadModel();

const getPath = (obj, path) => path.split('.').reduce((o, k) => o[k], obj);
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((o, k) => o[k], obj)[last] = value;
}

function buildForm() {
  $('form').innerHTML = FIELDS.map(([legend, fields]) => `<fieldset><legend>${legend}</legend>${fields.map(([label, path, step]) =>
    `<label>${label}<input type="number" step="${step}" data-path="${path}" value="${getPath(model, path)}"></label>`).join('')}</fieldset>`).join('');
}

$('form').addEventListener('input', (e) => {
  const v = parseFloat(e.target.value);
  if (!e.target.dataset.path || !Number.isFinite(v)) return;
  setPath(model, e.target.dataset.path, v);
  saveModel(model);
  render();
});

// ---------- projector view ----------
const PAD = { x: 160, y: 90 }; // show what falls just outside the image too

function drawProjector() {
  const c = $('projView'), ctx = c.getContext('2d');
  const cam = projectorCamera(model);
  const s = c.width / (1920 + 2 * PAD.x);
  const P = (p) => { const q = project(cam, p); return q && [(q[0] + PAD.x) * s, (q[1] + PAD.y) * s]; };
  ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#000'; ctx.fillRect(PAD.x * s, PAD.y * s, 1920 * s, 1080 * s);

  // room wireframe
  const { room, sideboard: sb, tree, star, fixtures } = model;
  const W = room.wallWidth;
  const poly = (pts, color, width = 1.5, close = false) => {
    const q = pts.map(P);
    if (q.some((p) => !p)) return;
    ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  };
  const grey = 'rgba(255,255,255,.35)';
  poly([[0, 0, 0], [0, 0, room.ceiling], [W, 0, room.ceiling], [W, 0, 0]], grey);
  poly([[W, 0, room.ceiling], [W, room.rightWallLength, room.ceiling]], grey);
  poly([[sb.x0, 0, sb.height], [sb.x0, sb.depth, sb.height], [sb.x1, sb.depth, sb.height]], grey);
  poly([[sb.x0, sb.depth, sb.height], [sb.x0, sb.depth, 0]], grey);
  poly([[W, fixtures.sconce.y - 0.15, fixtures.sconce.z], [W, fixtures.sconce.y + 0.15, fixtures.sconce.z]], '#e8475f', 3);

  // zones from the model
  for (const z of layoutFromModel(model, cam).zones) {
    const q = z.quad.map(([x, y]) => [(x + PAD.x) * s, (y + PAD.y) * s]);
    ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.strokeStyle = z.color; ctx.lineWidth = 2; ctx.setLineDash(z.hidden ? [4, 4] : []); ctx.stroke(); ctx.setLineDash([]);
    if (z.mask) {
      const map = ([u, v]) => bilerp(q, u, v);
      const m = z.mask.map(map);
      ctx.beginPath(); m.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fillStyle = 'rgba(174,213,129,.25)'; ctx.fill();
    }
    ctx.fillStyle = z.color; ctx.font = '12px system-ui'; ctx.fillText(z.label, q[0][0] + 4, q[0][1] + 14);
  }
  // star outline, tree axis
  poly([[tree.x, tree.y, star.topZ - star.size], [tree.x, tree.y, star.topZ]], '#ffd54f', 2);

  // image frame and key points
  ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; ctx.strokeRect(PAD.x * s, PAD.y * s, 1920 * s, 1080 * s);
  for (const k of coverage(model, cam)) {
    if (!k.px) continue;
    const [x, y] = [(k.px[0] + PAD.x) * s, (k.px[1] + PAD.y) * s];
    ctx.fillStyle = k.inside ? '#4cc38a' : '#e8475f';
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// Point inside a quad from unit coords (bilinear; close enough for drawing the mask preview).
function bilerp(q, u, v) {
  const top = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
  const bot = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
  return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
}

// ---------- top and side views ----------
function frustumRays(horizontal) {
  const tr = model.projector.throwRatio;
  const half = horizontal ? Math.atan(1 / (2 * tr)) : Math.atan((9 / 16) / (2 * tr));
  return [-half, half];
}

function drawTop() {
  const c = $('topView'), ctx = c.getContext('2d');
  const { room, sideboard: sb, tree, projector: pj, counter } = model;
  const s = c.width / 4.6, ox = 0.9 * s, oy = 0.3 * s; // metres → px; x right, y down (into the room)
  const X = (x) => ox + x * s, Y = (y) => oy + y * s;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#cfd6e6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(room.wallWidth), Y(0)); ctx.lineTo(X(room.wallWidth), Y(room.rightWallLength)); ctx.stroke();
  ctx.fillStyle = '#9aa3b8'; ctx.font = '12px system-ui';
  ctx.fillText('doorway', X(-0.8), Y(0) + 14);
  ctx.fillText('main wall', X(0.6), Y(0) - 6);
  ctx.save(); ctx.translate(X(room.wallWidth) + 14, Y(1.6)); ctx.rotate(Math.PI / 2); ctx.fillText('right wall', 0, 0); ctx.restore();
  // counter
  ctx.setLineDash([5, 5]); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X(-0.6), Y(counter.y)); ctx.lineTo(X(1.4), Y(counter.y)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillText(`bar ${counter.y} m`, X(1.45), Y(counter.y) + 4);
  // sideboard, boxes, tree
  ctx.fillStyle = '#7a5230'; ctx.fillRect(X(sb.x0), Y(0), (sb.x1 - sb.x0) * s, sb.depth * s);
  ctx.fillStyle = '#f4f7ff';
  for (const b of model.boxes) ctx.fillRect(X(b.x0), Y(b.y0), b.size * s, b.size * s);
  ctx.fillStyle = 'rgba(76,195,138,.5)'; ctx.beginPath(); ctx.arc(X(tree.x), Y(tree.y), tree.radius * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(X(tree.x), Y(tree.y), 4, 0, Math.PI * 2); ctx.fill();
  // projector + horizontal field of view
  const cam = projectorCamera(model);
  ctx.strokeStyle = 'rgba(255,213,79,.8)'; ctx.lineWidth = 1.5;
  for (const a of frustumRays(true)) {
    const yaw = cam.yaw + a, len = 4.2;
    ctx.beginPath(); ctx.moveTo(X(pj.pos[0]), Y(pj.pos[1]));
    ctx.lineTo(X(pj.pos[0] + Math.sin(yaw) * len), Y(pj.pos[1] - Math.cos(yaw) * len)); ctx.stroke();
  }
  ctx.fillStyle = '#ffd54f'; ctx.fillRect(X(pj.pos[0]) - 6, Y(pj.pos[1]) - 4, 12, 8);
  ctx.fillText('projector', X(pj.pos[0]) + 8, Y(pj.pos[1]) + 16);
  scaleBar(ctx, s, c.height);
}

function drawSide() {
  const c = $('sideView'), ctx = c.getContext('2d');
  const { room, sideboard: sb, tree, star, projector: pj } = model;
  const s = c.width / 4.4, ox = 0.25 * s, base = c.height - 0.5 * s; // y → right (into the room), z → up
  const X = (y) => ox + y * s, Z = (z) => base - z * s;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#cfd6e6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(X(0), Z(room.ceiling)); ctx.lineTo(X(0), Z(0)); ctx.lineTo(X(4.0), Z(0)); ctx.stroke();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Z(room.ceiling)); ctx.lineTo(X(4.0), Z(room.ceiling)); ctx.stroke();
  ctx.fillStyle = '#7a5230'; ctx.fillRect(X(0), Z(sb.height), sb.depth * s, sb.height * s);
  ctx.fillStyle = '#f4f7ff';
  for (const b of model.boxes) ctx.fillRect(X(b.y0), Z((b.z0 ?? sb.height) + b.size), b.size * s, b.size * s);
  ctx.fillStyle = 'rgba(76,195,138,.5)';
  ctx.beginPath(); ctx.moveTo(X(tree.y), Z(tree.tipZ)); ctx.lineTo(X(tree.y + tree.radius), Z(tree.baseZ)); ctx.lineTo(X(tree.y - tree.radius), Z(tree.baseZ)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd54f'; ctx.fillRect(X(tree.y) - 5, Z(star.topZ), 10, star.size * s);
  // counter
  ctx.fillStyle = '#3a3f4b'; ctx.fillRect(X(model.counter.y), Z(model.counter.z), 0.4 * s, model.counter.z * s);
  // projector + vertical field of view (drawn in the plane through the projector's aim)
  const cam = projectorCamera(model);
  ctx.strokeStyle = 'rgba(255,213,79,.8)'; ctx.lineWidth = 1.5;
  for (const a of frustumRays(false)) {
    const pitch = cam.pitch + a, len = pj.pos[1] / Math.cos(pitch) * 1.02;
    ctx.beginPath(); ctx.moveTo(X(pj.pos[1]), Z(pj.pos[2]));
    ctx.lineTo(X(pj.pos[1] - Math.cos(pitch) * len), Z(pj.pos[2] + Math.sin(pitch) * len)); ctx.stroke();
  }
  ctx.fillStyle = '#ffd54f'; ctx.fillRect(X(pj.pos[1]) - 6, Z(pj.pos[2]) - 4, 12, 8);
  ctx.fillStyle = '#9aa3b8'; ctx.font = '12px system-ui';
  ctx.fillText('wall', X(0) + 4, Z(room.ceiling) + 14); ctx.fillText('bar', X(model.counter.y), Z(model.counter.z) - 6);
  scaleBar(ctx, s, c.height);
}

function scaleBar(ctx, s, h) {
  ctx.strokeStyle = '#9aa3b8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(12, h - 14); ctx.lineTo(12 + s, h - 14); ctx.stroke();
  ctx.fillStyle = '#9aa3b8'; ctx.fillText('1 m', 12 + s + 6, h - 10);
}

// ---------- fit summary ----------
function drawFit() {
  const req = requiredThrowRatio(model);
  const tr = model.projector.throwRatio;
  const ok = tr <= req.maxThrowRatio;
  $('verdict').innerHTML = `Needs ${req.hDeg.toFixed(0)}° × ${req.vDeg.toFixed(0)}°, so a throw ratio ≤ <b>${req.maxThrowRatio.toFixed(2)}</b>. ` +
    `Projector: ${tr.toFixed(2)} → <span class="${ok ? 'ok' : 'bad'}">${ok ? 'fits' : 'too narrow'}</span>.`;
  $('coverage').innerHTML = coverage(model).map((k) =>
    `<li><span>${k.name}</span><span class="${k.inside ? 'ok' : 'bad'}">${k.inside ? 'in image' : 'outside'}</span></li>`).join('');
}

function render() {
  drawProjector(); drawTop(); drawSide(); drawFit();
}

$('useBtn').addEventListener('click', () => {
  if (!confirm('Replace the Mapper calibration with zones generated from this model?')) return;
  const layout = layoutFromModel(model);
  try {
    const old = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
    layout.audioOffsetMs = old?.audioOffsetMs ?? 0;
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    location.href = './';
  } catch (err) { alert(`Could not save: ${err.message}`); }
});
$('resetBtn').addEventListener('click', () => { clearModel(); model = loadModel(); buildForm(); render(); });
$('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' }));
  a.download = 'stage-model.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

buildForm();
render();
