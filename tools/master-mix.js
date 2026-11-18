// Master mix (WP-08b): renders the whole show's soundtrack, music + every voice line + sound effects, into one
// `master-mix.m4a` for the on-device media pack. Cloud/offline tool (Node + the system ffmpeg); not an app dependency.
// The audio never goes in the repo: the 🔒 lines say the baby's real name (AGENTS §06).
//
// Usage: node tools/master-mix.js --src <dir with the source audio> --out <output dir> [--strict] [--previews]
//   Source files are looked up by base name, any audio extension (.mp3 .m4a .wav .ogg .flac):
//     music  MUSIC[scene].file below       voices  <SCRIPT §03 line id>    sfx  <SCRIPT §06 id>
//   Missing files are reported and left out (--strict makes that an error), so a music-only draft can be checked early.
//
// Timing: show time = scene start + cue time (+ offset). Scene starts and cue times come from the app's own scene
// files (cues snapped to the beat grid exactly as the scenes do), the voice cues from docs/SCRIPT.md §03, so the mix
// can't drift from the visuals. Mix (DESIGN_SYSTEM §08): every source is first levelled to its own loudness target,
// the music ducks DUCK_DB under speech with soft ramps, scene tails fade, the master is normalised to −16 LUFS with
// peaks ≤ −1 dBTP, and the report flags clipping and sudden jumps (no impulsive sounds: a baby and a dog are present).
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : dflt; };
const flag = (name) => args.includes(`--${name}`);

// ---------- tables ----------

/**
 * Music running order (TREATMENT §04): per scene, the file, where in it the excerpt starts (`from`), and the fade at
 * the scene's tail. The excerpt always runs the scene's full length (s09: its 22 s; the app loops 8–20 s live).
 */
const MUSIC = {
  's01-wall-wakes': { file: 'o-christmas-tree', from: 0, fadeOut: 4 },
  's02-tree-alive': { file: 'carol-of-the-bells', from: 0, fadeOut: 4 },
  's03-star-escapes': { file: 's03-underscore', from: 0, fadeOut: 4 },
  's04-magic-boxes': { file: 's04-box-chaos', from: 0, fadeOut: 4 },
  's05-where-is-the-star': { file: 's05-underscore', from: 0, fadeOut: 4 },
  's06-constellations': { file: 'waltz-of-the-flowers', from: 88.94, fadeOut: 4 },
  's07-honey-pot': { file: 's07-underscore', from: 0, fadeOut: 4 },
  // 1:00 picked so the swell lands in the 26–45 s music-only beat (SCRIPT §07); re-pick by ear if it doesn't.
  's08-for-baby': { file: 'silent-nights', from: 0, fadeOut: 4 },
  's09-real-star': { file: 's09-hold-bells', from: 7.97, fadeOut: 2 },
  's10-finale': { file: 'jingle-bells', from: 0, fadeOut: 4 },
};

/**
 * Sound effects (SCRIPT §06): [id, scene, cue, offset, options]. `loopTo` repeats a seamless loop up to that cue
 * (or seconds after the cue as a number), `gain` in dB relative to the sfx level.
 */
const SFX = [
  ['s03-sfx-sparkle', 's03-star-escapes', 'pets-in', 0.5],
  ['s03-sfx-boing', 's03-star-escapes', 'bat', 0],
  ['s03-sfx-whoosh', 's03-star-escapes', 'escape', 0],
  ['s04-sfx-wobble', 's04-magic-boxes', 0, 1],
  ['s04-sfx-boxopen', 's04-magic-boxes', 'box1-open', 0],
  ['s04-sfx-rummage', 's04-magic-boxes', 'box1-open', 0.5, { loopTo: 'cut', gain: -8 }],
  ['s04-sfx-tumble', 's04-magic-boxes', 'box1-open', 2],
  ['s04-sfx-flurry', 's04-magic-boxes', 'box1-open', 6],
  ['s04-sfx-boxopen', 's04-magic-boxes', 'box2-open', 0],
  ['s04-sfx-spring', 's04-magic-boxes', 'box2-open', 0.2],
  ['s04-sfx-tumble', 's04-magic-boxes', 'box2-open', 2],
  ['s04-sfx-flurry', 's04-magic-boxes', 'box2-open', 8],
  ['s04-sfx-wobble', 's04-magic-boxes', 'cut', 1],
  ['s04-sfx-rummage', 's04-magic-boxes', 'finale', 0, { loopTo: 'out', gain: -8 }],
  ['s04-sfx-tumble', 's04-magic-boxes', 'finale', 1],
  ['s04-sfx-flurry', 's04-magic-boxes', 'finale', 3],
  ['s04-sfx-tumble', 's04-magic-boxes', 'finale', 7],
  ['s05-sfx-jingle', 's05-where-is-the-star', 'jingle', 0],
  ['s05-sfx-whistle', 's05-where-is-the-star', 'mickey-in', 0, { gain: 3 }],
  ['s05-sfx-projector', 's05-where-is-the-star', 'mickey-in', 0, { loopTo: 'mickey-out', gain: -10 }],
  ['s07-sfx-chime', 's07-honey-pot', 'found', 0],
  ['s07-sfx-sleighbells', 's07-honey-pot', 'carry', 0, { gain: -3 }],
  ['s07-sfx-whoosh', 's07-honey-pot', 'fly', 0],
  ['s07-sfx-settle', 's07-honey-pot', 'settle', 0],
  ['s10-sfx-sleigh', 's10-finale', 'sleigh', 0],
];

// Loudness targets (LUFS) each source is levelled to before mixing, and the master target (DESIGN_SYSTEM §08).
const LEVEL = { music: -17, voice: -15, sfx: -23 };
const DUCK_DB = -7;          // music under speech
const DUCK_RAMP = 0.35;      // s
const MUSIC_FADE_IN = 0.8;   // s: each scene's music swells in rather than starting at full level
const MASTER = { I: -16, TP: -1.5, LRA: 11 };
const RATE = 48000;

// ---------- helpers ----------
const run = (cmd, a, o = {}) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 30, ...o });
const ffmpeg = (a) => run('ffmpeg', ['-hide_banner', '-nostdin', '-y', ...a]);
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const EXT = ['.m4a', '.mp3', '.wav', '.ogg', '.oga', '.flac', '.aac'];

function findSource(dir, base) {
  for (const e of EXT) { const f = path.join(dir, base + e); if (fs.existsSync(f)) return f; }
  return null;
}
function duration(file) {
  return Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
}
/** ffmpeg's log (stderr) for an analysis run: the measurement filters print there. */
function ffLog(a) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${(r.stderr || '').slice(-800)}`);
  return r.stderr;
}
/** Integrated loudness (LUFS) of a file or an excerpt of it. */
function loudness(file, from = 0, len = null) {
  const log = ffLog(['-ss', String(from), ...(len ? ['-t', String(len)] : []), '-i', file, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-']);
  const m = /I:\s+(-?[\d.]+) LUFS/.exec(log.slice(log.lastIndexOf('Summary')));
  return m ? Number(m[1]) : -70;
}

/** Voice lines from SCRIPT §03: { id, scene (prefix), cue, offset, est }. */
function scriptLines() {
  const md = fs.readFileSync(path.join(ROOT, 'docs/SCRIPT.md'), 'utf8');
  const sec = md.slice(md.indexOf('## 03'), md.indexOf('## 04'));
  const out = [];
  for (const row of sec.split('\n')) {
    const c = row.split('|').map((x) => x.trim());
    const m = /^(s\d\d-[a-z]+-\d\d)/.exec(c[1] || '');
    if (!m) continue;
    const cm = /^([a-z-]+)\s*([+\-−])\s*([\d.]+)$/.exec(c[2].replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim());
    if (!cm) throw new Error(`can't read cue "${c[2]}" for ${m[1]}`);
    out.push({ id: m[1], scenePrefix: m[1].slice(0, 3), cue: cm[1], offset: (cm[2] === '+' ? 1 : -1) * Number(cm[3]), est: Number(c[4]) || 0, opt: /\(opt\)/.test(c[1]) });
  }
  return out;
}

/** Scenes with absolute starts and their cue times (snapped to the beat grid as the scenes do). */
async function sceneTable() {
  const { scenes } = await import(path.join(ROOT, 'app/js/scenes/index.js'));
  const { cueSheet, beatGrid } = await import(path.join(ROOT, 'app/js/fx/cues.js'));
  return scenes.map((s) => {
    const C = cueSheet(s.cues, s.beats ? beatGrid(s.beats) : null);
    return { id: s.id, start: s.start, duration: s.duration, at: (k) => (typeof k === 'number' ? k : C.at(k)) };
  });
}

/** The ducking envelope as an ffmpeg volume expression: 1 outside speech, DUCK_DB inside, ramped. */
function duckExpr(intervals) {
  const g = 10 ** (DUCK_DB / 20);
  if (!intervals.length) return '1';
  const r = DUCK_RAMP;
  const terms = intervals.map(([a, b]) =>
    `clip((t-${(a - r).toFixed(3)})/${r},0,1)*clip((${(b + r).toFixed(3)}-t)/${r},0,1)`);
  // max over a long list, nested pairwise to keep the expression shallow
  let level = terms;
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) next.push(i + 1 < level.length ? `max(${level[i]},${level[i + 1]})` : level[i]);
    level = next;
  }
  return `1-${(1 - g).toFixed(4)}*${level[0]}`;
}

/** Loudest sudden jumps: 10 ms RMS vs the max of the previous 0.5 s (dB), from the rendered master. */
function suddenJumps(file, top = 8) {
  const sr = 8000, win = sr / 100;
  const pcm = run('ffmpeg', ['-hide_banner', '-nostdin', '-i', file, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-']);
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4);
  const rms = [];
  for (let i = 0; i + win <= x.length; i += win) { let s = 0; for (let j = 0; j < win; j++) s += x[i + j] ** 2; rms.push(10 * Math.log10(s / win + 1e-12)); }
  const jumps = [];
  for (let i = 50; i < rms.length; i++) {
    let prev = -120;
    for (let j = i - 50; j < i; j++) if (rms[j] > prev) prev = rms[j];
    if (rms[i] > -40 && rms[i] - prev > 6) jumps.push([i / 100, rms[i] - prev]);
  }
  jumps.sort((a, b) => b[1] - a[1]);
  const picked = [];
  for (const j of jumps) { if (picked.length >= top) break; if (picked.every((p) => Math.abs(p[0] - j[0]) > 1)) picked.push(j); }
  return picked.sort((a, b) => a[0] - b[0]);
}

// ---------- main ----------
(async () => {
  const src = opt('src'), out = opt('out');
  if (!src || !out) { console.error('usage: node tools/master-mix.js --src <dir> --out <dir> [--strict] [--previews]'); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  const scenes = await sceneTable();
  const total = scenes.at(-1).start + scenes.at(-1).duration;
  const sceneOf = (prefix) => scenes.find((s) => s.id.startsWith(prefix));
  const missing = [];
  const inputs = [];          // { file, kind, at, from, len, gainDb, fadeOut, loop }

  // music
  for (const s of scenes) {
    const m = MUSIC[s.id];
    const file = m && findSource(src, m.file);
    if (!file) { missing.push(m ? m.file : `(no music for ${s.id})`); continue; }
    const avail = duration(file) - m.from;
    inputs.push({ file, kind: 'music', at: s.start, from: m.from, len: Math.min(s.duration, avail), fadeOut: m.fadeOut, label: s.id });
  }
  // voices
  const lines = scriptLines().map((l) => {
    const s = sceneOf(l.scenePrefix);
    return { ...l, scene: s.id, t: s.start + s.at(l.cue) + l.offset };
  });
  for (const l of lines) {
    const file = findSource(src, l.id);
    if (!file) { missing.push(l.id); continue; }
    l.len = duration(file);
    inputs.push({ file, kind: 'voice', at: l.t, from: 0, len: l.len, label: l.id });
  }
  // sound effects
  for (const [id, sid, cue, off, o = {}] of SFX) {
    const s = scenes.find((x) => x.id === sid);
    const file = findSource(src, id);
    if (!file) { missing.push(id); continue; }
    const at = s.start + s.at(cue) + off;
    const until = o.loopTo == null ? null : s.start + (typeof o.loopTo === 'number' ? s.at(cue) + o.loopTo : s.at(o.loopTo));
    inputs.push({ file, kind: 'sfx', at, from: 0, len: until ? until - at : duration(file), loop: !!until, gainDb: o.gain || 0, fadeOut: until ? 1 : 0, label: id });
  }
  const uniqMissing = [...new Set(missing)];
  if (uniqMissing.length) {
    console.warn(`missing ${uniqMissing.length} source file(s): ${uniqMissing.join(', ')}`);
    if (flag('strict')) process.exit(1);
  }
  if (!inputs.length) { console.error('no source audio found'); process.exit(1); }

  // level every source to its loudness target (measured on the part actually used)
  const cache = new Map();
  for (const i of inputs) {
    const key = `${i.file}|${i.from}|${i.kind === 'music' ? i.len : ''}`;
    if (!cache.has(key)) cache.set(key, loudness(i.file, i.from, i.kind === 'music' ? i.len : null));
    i.lufs = cache.get(key);
    i.gainDb = (i.gainDb || 0) + Math.max(-30, Math.min(20, LEVEL[i.kind] - i.lufs));
  }

  // filter graph: each input trimmed, levelled, faded, delayed to its show time; three buses; music ducked
  const speech = lines.filter((l) => l.len).map((l) => [l.t, l.t + l.len]);
  const fa = [], fc = [];
  const bus = { music: [], voice: [], sfx: [] };
  inputs.forEach((i, n) => {
    fa.push(...(i.loop ? ['-stream_loop', '-1'] : []), '-ss', String(i.from), '-t', String(i.len.toFixed(3)), '-i', i.file);
    // music enters with a short swell (the previous scene's music has just faded out), others click-free
    const fadeIn = i.kind === 'music' && i.at > 0 ? MUSIC_FADE_IN : 0.02;
    const f = [`aresample=${RATE}`, 'aformat=channel_layouts=stereo', `volume=${i.gainDb.toFixed(2)}dB`, `afade=t=in:d=${fadeIn}`];
    if (i.fadeOut) f.push(`afade=t=out:st=${Math.max(0, i.len - i.fadeOut).toFixed(3)}:d=${i.fadeOut}`);
    else f.push(`afade=t=out:st=${Math.max(0, i.len - 0.03).toFixed(3)}:d=0.03`);
    const ms = Math.max(0, Math.round(i.at * 1000));
    f.push(`adelay=${ms}|${ms}`);
    fc.push(`[${n}:a]${f.join(',')}[a${n}]`);
    bus[i.kind].push(`[a${n}]`);
  });
  const mixBus = (name, list) => {
    if (!list.length) { fc.push(`anullsrc=r=${RATE}:cl=stereo,atrim=0:${total}[${name}]`); return; }
    fc.push(`${list.join('')}amix=inputs=${list.length}:normalize=0:duration=longest[${name}]`);
  };
  mixBus('mus0', bus.music); mixBus('voc', bus.voice); mixBus('sfx', bus.sfx);
  const exprFile = path.join(out, 'duck-expr.txt');
  fs.writeFileSync(exprFile, duckExpr(speech));
  fc.push(`[mus0]volume='${fs.readFileSync(exprFile, 'utf8')}':eval=frame[mus]`);
  fc.push(`[mus][voc][sfx]amix=inputs=3:normalize=0:duration=longest,apad,atrim=0:${total}[mix]`);
  const graph = path.join(out, 'graph.txt');
  fs.writeFileSync(graph, fc.join(';\n'));

  const premaster = path.join(out, 'premaster.wav');
  console.log(`mixing ${inputs.length} inputs (${bus.music.length} music, ${bus.voice.length} voice, ${bus.sfx.length} sfx) → ${fmt(total)}`);
  ffmpeg([...fa, '-filter_complex_script', graph, '-map', '[mix]', '-ar', String(RATE), '-c:a', 'pcm_f32le', premaster]);

  // two-pass loudness normalisation (linear when possible: keeps the music's dynamics)
  const meas = ffLog(['-i', premaster, '-af', `loudnorm=I=${MASTER.I}:TP=${MASTER.TP}:LRA=${MASTER.LRA}:print_format=json`, '-f', 'null', '-']);
  const j = JSON.parse(meas.slice(meas.lastIndexOf('{'), meas.lastIndexOf('}') + 1));
  const ln = `loudnorm=I=${MASTER.I}:TP=${MASTER.TP}:LRA=${MASTER.LRA}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  const final = path.join(out, 'master-mix.m4a');
  // Linear loudnorm can't catch inter-sample peaks and the AAC encode adds ~0.5 dB on top (first real render: −0.8
  // dBTP), so a 4×-oversampled brick-wall limiter at −2 dBFS sits after it. It only touches rare peaks.
  const limiter = `aresample=${RATE * 4},alimiter=limit=0.79:attack=1:release=60:level=false,aresample=${RATE}`;
  ffmpeg(['-i', premaster, '-af', `${ln},${limiter}`, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', final]);

  // checks
  const after = ffLog(['-i', final, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-']);
  const I = Number((/I:\s+(-?[\d.]+) LUFS/.exec(after.slice(after.lastIndexOf('Summary'))) || [])[1]);
  const TP = Number((/Peak:\s+(-?[\d.]+) dBFS/.exec(after.slice(after.lastIndexOf('Summary'))) || [])[1]);
  const len = duration(final);
  const jumps = suddenJumps(final);
  const overlaps = [];
  const sorted = lines.filter((l) => l.len).sort((a, b) => a.t - b.t);
  for (let k = 1; k < sorted.length; k++) {
    const a = sorted[k - 1], b = sorted[k];
    if (a.t + a.len > b.t + 0.05) overlaps.push(`${a.id} ends ${fmt(a.t + a.len)}, ${b.id} starts ${fmt(b.t)} (${(a.t + a.len - b.t).toFixed(1)} s)`);
  }
  const pastScene = sorted.filter((l) => { const s = scenes.find((x) => x.id === l.scene); return l.t + l.len > s.start + s.duration; }).map((l) => l.id);

  // report (no line text, no names: ids and times only)
  const rep = [
    `# Master-mix report`, '',
    `- Length ${fmt(len)} (timeline ${fmt(total)}); integrated ${I} LUFS (target ${MASTER.I}); true peak ${TP} dBTP (limit ${MASTER.TP}).`,
    `- Inputs: ${bus.music.length} music, ${bus.voice.length} voice lines, ${bus.sfx.length} sound effects.`,
    `- Missing sources: ${uniqMissing.length ? uniqMissing.join(', ') : 'none'}.`,
    `- Voice overlaps: ${overlaps.length ? '' : 'none'}`, ...overlaps.map((o) => `  - ${o}`),
    `- Lines running past their scene's end: ${pastScene.length ? pastScene.join(', ') : 'none'}.`,
    `- Sudden jumps (10 ms level vs the previous 0.5 s; listen here): ${jumps.length ? '' : 'none over 6 dB'}`,
    ...jumps.map(([t, d]) => `  - ${fmt(t)} +${d.toFixed(1)} dB (${scenes.find((s) => t >= s.start && t < s.start + s.duration)?.id || ''})`),
    '', '| Show time | Scene | Line | Length |', '|---|---|---|---|',
    ...lines.map((l) => `| ${fmt(l.t)} | ${l.scene} | ${l.id}${l.opt ? ' (opt)' : ''} | ${l.len ? l.len.toFixed(1) + ' s' : 'missing'} |`),
  ].join('\n');
  fs.writeFileSync(path.join(out, 'report.md'), rep + '\n');
  console.log(rep.split('\n').slice(0, 12).join('\n'));

  if (flag('previews')) {
    for (const s of scenes) {
      ffmpeg(['-ss', String(s.start), '-t', String(s.duration), '-i', final, '-c:a', 'aac', '-b:a', '128k', path.join(out, `preview-${s.id.slice(0, 3)}.m4a`)]);
    }
  }
  fs.rmSync(premaster, { force: true });
  const ok = Math.abs(len - total) < 0.2 && TP <= MASTER.TP + 0.5;
  if (!ok) { console.error('check failed: length or peak out of range'); process.exit(1); }
})().catch((e) => { console.error(e.stderr ? String(e.stderr).slice(-2000) : e); process.exit(1); });
