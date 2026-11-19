// Master mix (WP-08b): renders the whole show's soundtrack, music + every voice line + sound effects, into one
// `master-mix.m4a` for the on-device media pack. Cloud/offline tool (Node + the system ffmpeg); not an app dependency.
// The audio never goes in the repo: the 🔒 lines say the baby's real name (AGENTS §06).
//
// Usage: node tools/master-mix.js --src <dir with the source audio> --out <output dir> [--strict] [--previews] [--idle]
//   --idle also renders the s00 `music-box-loop.m4a` from the `music-box` source (see IDLE_LOOP).
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
const { scriptLines, sceneTable } = require('./show-table');

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : dflt; };
const flag = (name) => args.includes(`--${name}`);

// ---------- tables ----------

/**
 * Music running order (TREATMENT §04): per scene, the file, where in it the excerpt starts (`from`), and the fade at
 * the scene's tail. Optional: `fadeIn` (s, overrides MUSIC_FADE_IN), `soften` (tames a drum kit: SOFTEN below),
 * `splice` (see spliced()). The excerpt always runs the scene's full length (s09: its 22 s; the app loops 8–20 s live).
 */
const MUSIC = {
  // WP-15 (listen check): the big band hits full level 0.7 s in from silence (+19 dB jump at 0:00.7), so a 3 s swell;
  // its drum kit softened like s10's.
  's01-wall-wakes': { file: 'o-christmas-tree', from: 0, fadeOut: 4, fadeIn: 3, soften: true },
  's02-tree-alive': { file: 'carol-of-the-bells', from: 0, fadeOut: 4 },
  's03-star-escapes': { file: 's03-underscore', from: 0, fadeOut: 4 },
  's04-magic-boxes': { file: 's04-box-chaos', from: 0, fadeOut: 4, fadeIn: 2 },   // WP-15: softer start out of s03's tail
  's05-where-is-the-star': { file: 's05-underscore', from: 0, fadeOut: 4 },
  // WP-15: the excerpt opens on a full chord (−7 dB within 1 s), so a longer swell.
  's06-constellations': { file: 'waltz-of-the-flowers', from: 88.94, fadeOut: 4, fadeIn: 2.5 },
  's07-honey-pot': { file: 's07-underscore', from: 0, fadeOut: 4 },
  // WP-15: from 13 s the track's swell (file 48–54 s, ≈ 8 dB over its surroundings) lands at scene 35–41 s, inside the
  // 26–45 s music-only beat (SCRIPT §07), instead of on the 45 s narration; it also skips the 2 s silent intro.
  's08-for-baby': { file: 'silent-nights', from: 13, fadeOut: 4 },
  // Twinkle (WP-15): 120 bpm 4/4, its 12 s melody cycle repeats best at file 4.97 → 16.97 (bar lines). The scene's
  // hold loops 8–20 s, so the first two intro bars play twice: splice → [0.95, 4.97] + [0.97, end] (20 ms crossfade),
  // which puts file 4.97 at 8.00 and file 16.97 at 20.00.
  's09-real-star': { file: 's09-twinkle', from: 0, fadeOut: 2, splice: [[0.95, 4.97], [0.97, null]] },
  's10-finale': { file: 'jingle-bells', from: 0, fadeOut: 4, soften: true },
};

/**
 * Sound effects (SCRIPT §06): [id, scene, cue, offset, options]. `loopTo` repeats a seamless loop up to that cue
 * (or seconds after the cue as a number, or [cue, seconds after it]), `gain` in dB relative to the sfx level.
 */
const SFX = [
  ['s03-sfx-sparkle', 's03-star-escapes', 'pets-in', 0.5],
  ['s03-sfx-boing', 's03-star-escapes', 'bat', 0],
  ['s03-sfx-whoosh', 's03-star-escapes', 'escape', 0],
  ['s04-sfx-wobble', 's04-magic-boxes', 0, 1],
  ['s04-sfx-boxopen', 's04-magic-boxes', 'box1-open', 0],
  // WP-15: runs on through the music's 1 s near-silent rest after `cut` so the pizzicato restart isn't a jump from silence.
  ['s04-sfx-rummage', 's04-magic-boxes', 'box1-open', 0.5, { loopTo: ['cut', 2.4], gain: -8 }],
  ['s04-sfx-tumble', 's04-magic-boxes', 'box1-open', 2],
  ['s04-sfx-flurry', 's04-magic-boxes', 'box1-open', 6],
  ['s04-sfx-boxopen', 's04-magic-boxes', 'box2-open', 0],
  ['s04-sfx-spring', 's04-magic-boxes', 'box2-open', 0.2],
  ['s04-sfx-march', 's04-magic-boxes', 'box2-open', 0.4, { gain: -3 }],   // WP-15 S4: the Nutcracker marches ≈ 0.4–2.5 s
  ['s04-sfx-tumble', 's04-magic-boxes', 'box2-open', 2],
  ['s04-sfx-flurry', 's04-magic-boxes', 'box2-open', 8],
  // WP-15: was cut +1, inside the music's 1 s near-silent rest (−50 dB) → +18.8 dB jump at 4:23.9; now after the
  // pizzicato restarts, and softer.
  ['s04-sfx-wobble', 's04-magic-boxes', 'cut', 2.2, { gain: -6 }],
  ['s04-sfx-rummage', 's04-magic-boxes', 'finale', 0, { loopTo: 'out', gain: -8 }],
  ['s04-sfx-hop', 's04-magic-boxes', 'finale', 0.4],                         // WP-15 S4: the Gingerbread Man's hop
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
// Drum-kit softener (WP-15 listen check, s01/s10 big-band kits): a gentle fast compressor shaves the snare/kick
// transients and a high shelf rounds the cymbals; the source is then levelled as usual.
const SOFTEN = 'acompressor=threshold=0.125:ratio=3:attack=2:release=120,highshelf=f=5000:g=-4';
const MASTER = { I: -16, TP: -1.5, LRA: 11 };
const RATE = 48000;

/**
 * Idle music-box loop (s00, WP-08b; seam fixed in WP-15). The ElevenLabs music box (24 s) is exactly 90 bpm 3/4, so a
 * bar is 2 s and its first downbeat is at 1.30 s (tools/beats.js). The loop is 10 bars, 1.30 → 21.30 s, and the 0.5 s
 * after its end is crossfaded over its first 0.5 s, so the HTML audio loop wraps on a bar line with no hard cut.
 */
const IDLE_LOOP = { file: 'music-box', from: 1.3, len: 20, xfade: 0.5, lufs: -20 };

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
/** Joins excerpts of one file ([from, to|null] pairs) with 20 ms crossfades into a WAV; returns its path. */
function spliced(file, parts, dest) {
  const XF = 0.02;
  const trims = parts.map(([a, b], k) => `[0]atrim=start=${a}${b == null ? '' : `:end=${b}`},asetpts=N/SR/TB[p${k}]`);
  let chain = '', last = 'p0';
  for (let k = 1; k < parts.length; k++) { chain += `;[${last}][p${k}]acrossfade=d=${XF}:c1=tri:c2=tri[x${k}]`; last = `x${k}`; }
  ffmpeg(['-i', file, '-filter_complex', trims.join(';') + chain, '-map', `[${last}]`, '-ar', String(RATE), dest]);
  return dest;
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
    let file = m && findSource(src, m.file);
    if (!file) { missing.push(m ? m.file : `(no music for ${s.id})`); continue; }
    if (m.splice) file = spliced(file, m.splice, path.join(out, `${m.file}-spliced.wav`));
    const avail = duration(file) - m.from;
    inputs.push({ file, kind: 'music', at: s.start, from: m.from, len: Math.min(s.duration, avail), fadeOut: m.fadeOut, fadeIn: m.fadeIn, soften: !!m.soften, label: s.id });
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
    const until = o.loopTo == null ? null : s.start + (typeof o.loopTo === 'number' ? s.at(cue) + o.loopTo
      : Array.isArray(o.loopTo) ? s.at(o.loopTo[0]) + o.loopTo[1] : s.at(o.loopTo));
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
    const fadeIn = i.fadeIn != null ? i.fadeIn : i.kind === 'music' && i.at > 0 ? MUSIC_FADE_IN : 0.02;
    const f = [`aresample=${RATE}`, 'aformat=channel_layouts=stereo', ...(i.soften ? [SOFTEN] : []), `volume=${i.gainDb.toFixed(2)}dB`, `afade=t=in:d=${fadeIn}`];
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
  // dBTP), so a 4×-oversampled brick-wall limiter sits after it. It only touches rare peaks. WP-15: −2.5 dBFS (at
  // −2 dBFS the full render measured −1.4 dBTP after the AAC encode).
  const limiter = `aresample=${RATE * 4},alimiter=limit=0.75:attack=1:release=60:level=false,aresample=${RATE}`;
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
  if (flag('idle')) {
    const L = IDLE_LOOP, file = findSource(src, L.file);
    if (!file) console.warn(`--idle: no ${L.file} source`);
    else {
      // in steps: one filter graph that splits, crossfades and joins the same input fails in ffmpeg 6 ("Invalid data")
      const a = L.from, b = L.from + L.len, x = L.xfade, tmp = (n) => path.join(out, `idle-${n}.wav`);
      ffmpeg(['-i', file, '-af', `atrim=${a}:${a + x},asetpts=N/SR/TB,afade=t=in:d=${x}:curve=qsin`, tmp('head')]);
      ffmpeg(['-i', file, '-af', `atrim=${b}:${b + x},asetpts=N/SR/TB,afade=t=out:d=${x}:curve=qsin`, tmp('tail')]);
      ffmpeg(['-i', file, '-af', `atrim=${a + x}:${b},asetpts=N/SR/TB`, tmp('mid')]);
      ffmpeg(['-i', tmp('head'), '-i', tmp('tail'), '-filter_complex', 'amix=inputs=2:normalize=0', tmp('seam')]);
      ffmpeg(['-i', tmp('seam'), '-i', tmp('mid'), '-filter_complex', `[0][1]concat=n=2:v=0:a=1,loudnorm=I=${L.lufs}:TP=-2:linear=true`,
        '-ar', String(RATE), '-c:a', 'aac', '-b:a', '128k', path.join(out, 'music-box-loop.m4a')]);
      for (const n of ['head', 'tail', 'mid', 'seam']) fs.rmSync(tmp(n), { force: true });
    }
  }
  fs.rmSync(premaster, { force: true });
  const ok = Math.abs(len - total) < 0.2 && TP <= MASTER.TP + 0.5;
  if (!ok) { console.error('check failed: length or peak out of range'); process.exit(1); }
})().catch((e) => { console.error(e.stderr ? String(e.stderr).slice(-2000) : e); process.exit(1); });
