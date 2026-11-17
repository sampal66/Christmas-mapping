// Beat tap tool (WP-05): play a recording, tap along where the auto beat map (tools/beats.js) drifts, nudge, and
// export `beats = { perBar, times }` for a light-show scene. Times are scene-local seconds (file time − offset).
import { scenes } from './scenes/index.js';
import { beatGrid } from './fx/cues.js';
import * as media from './media.js';

const $ = (id) => document.getElementById(id);
const DRAFT_KEY = 'christmas-mapping.beats.v1';
const audio = new Audio();
audio.preload = 'auto';
if ('preservesPitch' in audio) audio.preservesPitch = true;

const beatScenes = scenes.filter((s) => s.beats);
let scene = beatScenes[0];
let times = [];
let perBar = 3;
let history = [];
let taps = [];
let tapTimer = 0;
let fromMaster = false;

const offset = () => +$('offset').value || 0;
const local = () => audio.currentTime - offset();

function loadDrafts() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; } }
function saveDraft() {
  try { const d = loadDrafts(); d[scene.id] = { perBar, times }; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* storage blocked: drafts are a convenience */ }
}

/** The scene's current map: its real `times`, or the placeholder tempo laid over its duration. */
function sceneTimes(s) {
  if (s.beats.times?.length) return s.beats.times.slice();
  const g = beatGrid(s.beats);
  const out = [];
  for (let n = 0; g.time(n) <= s.duration; n++) out.push(+g.time(n).toFixed(3));
  return out;
}

function pickScene(id, useDraft = true) {
  scene = beatScenes.find((s) => s.id === id) || beatScenes[0];
  const d = useDraft ? loadDrafts()[scene.id] : null;
  perBar = d?.perBar || scene.beats.perBar || 4;
  times = d?.times?.length ? d.times.slice() : sceneTimes(scene);
  history = [];
  $('perBar').value = perBar;
  if (fromMaster) $('offset').value = scene.start.toFixed(2);
  render();
}

function commit(next) {
  history.push(times);
  if (history.length > 50) history.shift();
  times = next.map((t) => Math.round(t * 1000) / 1000).sort((a, b) => a - b);
  saveDraft();
  render();
}

function nearestIndex(t) {
  let best = -1, d = Infinity;
  times.forEach((b, i) => { const e = Math.abs(b - t); if (e < d) { d = e; best = i; } });
  return best;
}

function medianGap() {
  const g = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
  return g.length ? g[g.length >> 1] : 0.5;
}

// ---------- taps ----------
function tap(e) {
  e.preventDefault();
  if (audio.paused) return;
  taps.push(local() - (+$('lat').value || 0) / 1000);
  $('tap').classList.add('hit');
  setTimeout(() => $('tap').classList.remove('hit'), 80);
  clearTimeout(tapTimer);
  tapTimer = setTimeout(applyTaps, 2000);
}

/** Replace the beats in the tapped stretch (± half a beat) with the taps. A single stray tap is ignored. */
function applyTaps() {
  const t = taps; taps = [];
  if (t.length < 3) return;
  const half = medianGap() / 2;
  const a = t[0] - half, b = t.at(-1) + half;
  // If the tapped stretch gains or loses a beat, later downbeats shift: "Move downbeat" fixes that.
  commit([...times.filter((x) => x < a || x > b), ...t]);
}

// ---------- drawing + metronome ----------
const lane = $('lane');
const g2 = lane.getContext('2d');
let lastBeat = -1;
let actx = null;

function tick(down) {
  if (!$('click').checked) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    // A soft, short sine "tock": quiet and rounded on purpose (no sharp clicks; the dog is listening).
    const o = actx.createOscillator(), gn = actx.createGain(), now = actx.currentTime;
    o.frequency.value = down ? 880 : 660;
    gn.gain.setValueAtTime(0, now);
    gn.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    o.connect(gn).connect(actx.destination);
    o.start(now); o.stop(now + 0.1);
  } catch { /* no audio context: visual flash only */ }
}

function render() {
  const W = lane.width, H = lane.height, t = local(), span = 4;   // ±4 s around the playhead
  g2.fillStyle = '#000'; g2.fillRect(0, 0, W, H);
  const x = (s) => ((s - t + span) / (2 * span)) * W;
  times.forEach((b, i) => {
    if (b < t - span || b > t + span) return;
    const down = i % perBar === 0;
    g2.fillStyle = down ? '#4cc38a' : '#9aa3b8';
    g2.fillRect(x(b) - 1.5, down ? 10 : 40, 3, down ? H - 20 : H - 80);
  });
  taps.forEach((b) => { g2.fillStyle = '#ffd54f'; g2.beginPath(); g2.arc(x(b), H - 12, 5, 0, 7); g2.fill(); });
  g2.fillStyle = '#e8475f'; g2.fillRect(W / 2 - 1, 0, 2, H);
  $('out').value = `'${scene.id}': { perBar: ${perBar}, times: [${times.join(', ')}] },`;
  const n = times.length > 1 ? (60 * (times.length - 1)) / (times.at(-1) - times[0]) : 0;
  $('status').textContent = `${audio.currentTime.toFixed(2)} s · scene ${t.toFixed(2)} s · ${times.length} beats ≈ ${n.toFixed(1)} bpm`;
  if (audio.duration) { $('seek').max = audio.duration; $('seek').value = audio.currentTime; }
}

function frame() {
  const t = local();
  let i = -1;
  for (let k = 0; k < times.length && times[k] <= t; k++) i = k;
  if (i !== lastBeat && !audio.paused && i >= 0 && t - times[i] < 0.1) {
    const down = i % perBar === 0;
    $('flash').className = down ? 'down' : 'on';
    setTimeout(() => { $('flash').className = ''; }, 90);
    tick(down);
  }
  lastBeat = i;
  render();
  requestAnimationFrame(frame);
}

// ---------- sources ----------
async function listMedia() {
  try {
    const files = await media.list();
    for (const f of files) {
      const o = document.createElement('option');
      o.value = f.name; o.textContent = f.name;
      $('media').append(o);
    }
  } catch { /* storage blocked: the file picker still works */ }
}

function setSource(url, master) {
  fromMaster = master;
  audio.src = url;
  if (master) $('offset').value = scene.start.toFixed(2);
}

// ---------- wiring ----------
function init() {
  for (const s of beatScenes) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.title || s.id;
    $('scene').append(o);
  }
  $('scene').onchange = (e) => pickScene(e.target.value);
  $('media').onchange = async (e) => { const n = e.target.value; if (n) setSource(await media.objectUrl(n), n === 'master-mix'); };
  $('file').onchange = (e) => { const f = e.target.files[0]; if (f) setSource(URL.createObjectURL(f), false); };
  $('perBar').onchange = (e) => { perBar = Math.max(1, Math.round(+e.target.value) || 1); saveDraft(); render(); };
  $('rate').onchange = (e) => { audio.playbackRate = +e.target.value; };
  $('play').onclick = () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
  audio.onplay = () => { $('play').textContent = '❚❚ Pause'; };
  audio.onpause = () => { $('play').textContent = '▶ Play'; };
  $('back').onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 5); };
  $('fwd').onclick = () => { audio.currentTime += 5; };
  $('seek').oninput = (e) => { audio.currentTime = +e.target.value; };
  $('tap').addEventListener('pointerdown', tap);
  document.addEventListener('keydown', (e) => { if (e.code === 'Space') tap(e); });
  document.querySelectorAll('[data-nudge]').forEach((b) => { b.onclick = () => commit(times.map((t) => t + +b.dataset.nudge)); });
  document.querySelectorAll('[data-near]').forEach((b) => {
    b.onclick = () => { const i = nearestIndex(local()); if (i >= 0) commit(times.map((t, k) => (k === i ? t + +b.dataset.near : t))); };
  });
  $('insert').onclick = () => commit([...times, local()]);
  $('del').onclick = () => { const i = nearestIndex(local()); if (i >= 0) commit(times.filter((_, k) => k !== i)); };
  $('fill').onclick = () => {
    const m = medianGap(), out = [];
    times.forEach((t, i) => {
      out.push(t);
      const next = times[i + 1];
      if (next === undefined) return;
      const k = Math.round((next - t) / m);
      for (let j = 1; j < k; j++) out.push(t + ((next - t) * j) / k);
    });
    commit(out);
  };
  // beatGrid counts bars from times[0], so moving the downbeat drops the first beat (or adds one before it).
  $('phase').onclick = () => commit(times.length > perBar ? times.slice(1) : times);
  $('undo').onclick = () => { if (history.length) { times = history.pop(); saveDraft(); render(); } };
  $('reset').onclick = () => pickScene(scene.id, false);
  $('copy').onclick = () => navigator.clipboard?.writeText($('out').value).catch(() => {});
  $('dl').onclick = () => {
    const blob = new Blob([JSON.stringify({ scene: scene.id, perBar, times }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${scene.id}-beats.json`; a.click();
  };
  pickScene(scene.id);
  listMedia();
  requestAnimationFrame(frame);
}

init();
