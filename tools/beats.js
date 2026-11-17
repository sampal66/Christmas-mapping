#!/usr/bin/env node
// Beat-map tool (WP-05): reads a recording and prints the beat times a light-show scene puts in `beats.times`.
// No dependencies. It decodes 16/24/32-bit PCM or float WAV itself; any other format (mp3, ogg, opus, flac) is
// decoded through the system `ffmpeg` binary if one is installed (it is not a project dependency, just a convenience).
//
//   node tools/beats.js <audio> [--from 12.5] [--to 102.5] [--offset 12.5] [--perBar 3] [--bpm 132]
//                               [--min 60] [--max 200] [--tight 100] [--json]
//   node tools/beats.js --self-test
//
//   --from/--to   analyse only this part of the track (seconds in the file)
//   --offset      file time where the scene starts (default --from): printed times are scene-local
//   --perBar      beats per bar; the first printed beat is a downbeat, so `beatGrid` counts bars correctly
//   --bpm         tempo hint (the tracker prefers tempi near it); --min/--max bound the search
//   --subdivide n track the bar pulse (give --bpm in bars per minute) and split each bar into n equal beats; the
//                 tracked pulse is taken as the downbeat. Steadier for rubato pieces (waltzes) than tracking fast beats.
//   --tight       how strongly the tracker keeps a steady tempo (higher = steadier; 100 is a good default)
//
// Method (Ellis 2007, "Beat tracking by dynamic programming"): log-spectral-flux onset envelope at 100 frames/s →
// tempo from its autocorrelation (weighted towards the hint) → dynamic-programming beat path that follows real
// tempo drift → downbeat phase from low-frequency energy. Fix anything it gets wrong by ear in app/beats.html.
'use strict';
const fs = require('fs');
const { execFileSync } = require('child_process');

const FPS = 100; // onset frames per second

function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = isNaN(+v) ? v : +v; i++; }
  }
  return o;
}

// ---------- decoding ----------
function decodeWav(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return null;
  let p = 12, fmt = null, data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4), size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') data = buf.subarray(p + 8, Math.min(buf.length, p + 8 + size));
    p += 8 + size + (size & 1);
  }
  if (!fmt || !data) throw new Error('WAV without fmt/data chunk');
  const fmtCode = fmt.format === 0xfffe ? (fmt.bits === 32 ? 3 : 1) : fmt.format; // treat EXTENSIBLE by bit depth
  const bps = fmt.bits / 8, frames = Math.floor(data.length / (bps * fmt.ch));
  const out = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let s = 0;
    for (let c = 0; c < fmt.ch; c++) {
      const q = (i * fmt.ch + c) * bps;
      if (fmtCode === 3) s += bps === 4 ? data.readFloatLE(q) : data.readDoubleLE(q);
      else if (bps === 2) s += data.readInt16LE(q) / 32768;
      else if (bps === 3) s += data.readIntLE(q, 3) / 8388608;
      else if (bps === 4) s += data.readInt32LE(q) / 2147483648;
      else s += (data[q] - 128) / 128;
    }
    out[i] = s / fmt.ch;
  }
  return { sr: fmt.sr, x: out };
}

function decode(file) {
  const buf = fs.readFileSync(file);
  const wav = decodeWav(buf);
  if (wav) return wav;
  const sr = 22050;
  let raw;
  try {
    raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  } catch (e) {
    throw new Error(`not a WAV file and ffmpeg could not decode it (${e.message.split('\n')[0]}); convert it to WAV first`);
  }
  return { sr, x: new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2) };
}

// ---------- DSP ----------
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

/** Onset strength (spectral flux of log magnitude) and low-band energy, both at FPS frames per second. */
function onsetEnvelope(x, sr) {
  const N = sr > 32000 ? 2048 : 1024, hop = sr / FPS;
  const win = new Float32Array(N).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  const bins = Math.min(N / 2, Math.round((8000 / sr) * N)), lowBins = Math.max(2, Math.round((200 / sr) * N));
  const frames = Math.max(0, Math.floor((x.length - N) / hop));
  const env = new Float32Array(frames), low = new Float32Array(frames);
  let prev = new Float32Array(bins);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let f = 0; f < frames; f++) {
    const s = Math.round(f * hop);
    for (let i = 0; i < N; i++) { re[i] = x[s + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const cur = new Float32Array(bins);
    let flux = 0, lo = 0;
    for (let k = 1; k < bins; k++) {
      const m = Math.hypot(re[k], im[k]);
      cur[k] = Math.log1p(1000 * m);
      const d = cur[k] - prev[k];
      if (d > 0) flux += d;
      if (k < lowBins) lo += m * m;
    }
    env[f] = flux; low[f] = lo; prev = cur;
  }
  // Remove the slow loudness trend (0.5 s moving mean) and normalise, so quiet and loud passages count alike.
  const W = FPS / 2, out = new Float32Array(frames);
  let acc = 0;
  for (let f = 0; f < frames; f++) {
    acc += env[f]; if (f >= W) acc -= env[f - W];
    out[f] = Math.max(0, env[f] - acc / Math.min(f + 1, W));
  }
  let sd = 0; for (const v of out) sd += v * v; sd = Math.sqrt(sd / Math.max(1, frames)) || 1;
  for (let f = 0; f < frames; f++) out[f] /= sd;
  return { env: out, low };
}

/** Tempo (beat period in frames) from the onset autocorrelation, weighted towards `hintBpm` (log-Gaussian, 1 octave). */
function estimatePeriod(env, { min = 60, max = 200, bpm = 110 } = {}) {
  const lo = Math.floor((60 / max) * FPS), hi = Math.ceil((60 / min) * FPS);
  const ac = new Float64Array(hi + 2);
  for (let L = lo - 1; L <= hi + 1; L++) { let s = 0; for (let i = L; i < env.length; i++) s += env[i] * env[i - L]; ac[L] = s / (env.length - L); }
  const P0 = (60 / bpm) * FPS;
  let best = lo, bestScore = -Infinity;
  const scored = [];
  for (let L = lo; L <= hi; L++) {
    const w = Math.exp(-0.5 * (Math.log2(L / P0)) ** 2);
    const s = ac[L] * w;
    scored.push([L, s]);
    if (s > bestScore) { bestScore = s; best = L; }
  }
  // Parabolic refinement for a sub-frame period.
  const a = ac[best - 1], b = ac[best], c = ac[best + 1];
  const d = a - 2 * b + c;
  const period = d < 0 ? best + (0.5 * (a - c)) / d : best;
  return { period, alternatives: [period / 2, period * 2].filter((p) => p >= lo && p <= hi) };
}

/** Dynamic-programming beat tracker: returns beat frame indices following tempo drift around `period`. */
function trackBeats(env, period, tight = 100) {
  const n = env.length, score = new Float64Array(n), back = new Int32Array(n).fill(-1);
  const pmin = Math.round(period / 2), pmax = Math.round(period * 2);
  for (let t = 0; t < n; t++) {
    let best = 0, arg = -1;
    for (let p = t - pmax; p <= t - pmin; p++) {
      if (p < 0) continue;
      const pen = -tight * Math.log((t - p) / period) ** 2;
      const s = score[p] + pen;
      if (arg < 0 || s > best) { best = s; arg = p; }
    }
    score[t] = env[t] + (arg >= 0 ? best : 0);
    back[t] = arg;
  }
  // Start from the best-scoring frame in the last period and walk back.
  let t = n - 1, top = -Infinity;
  for (let i = Math.max(0, n - Math.round(period)); i < n; i++) if (score[i] > top) { top = score[i]; t = i; }
  const beats = [];
  while (t >= 0) { beats.push(t); t = back[t]; }
  return beats.reverse();
}

/** Which beat (0..perBar-1) is the downbeat: the phase whose beats carry the most low-frequency (bass) energy. */
function downbeatPhase(beats, low, perBar) {
  if (perBar <= 1) return 0;
  const sums = new Array(perBar).fill(0);
  beats.forEach((f, i) => {
    let e = 0; for (let k = f; k < Math.min(low.length, f + 8); k++) e += low[k];
    sums[i % perBar] += Math.log1p(e);
  });
  return sums.indexOf(Math.max(...sums));
}

function analyse(x, sr, opts = {}) {
  const from = opts.from || 0, to = opts.to ?? x.length / sr;
  const seg = x.subarray(Math.floor(from * sr), Math.floor(Math.min(to, x.length / sr) * sr));
  const { env, low } = onsetEnvelope(seg, sr);
  const { period, alternatives } = estimatePeriod(env, { min: opts.min || 60, max: opts.max || 200, bpm: opts.bpm || 110 });
  const frames = trackBeats(env, period, opts.tight || 100);
  const sub = Math.max(1, Math.round(opts.subdivide || 1));
  const perBar = opts.perBar || (sub > 1 ? sub : 4);
  // Confidence: onset strength on the beats vs halfway between them (≈1 = guessing, ≥ 2 = locked on).
  const mean = (fs) => fs.reduce((a, f) => a + (env[Math.round(f)] || 0), 0) / Math.max(1, fs.length);
  const mids = frames.slice(1).map((f, i) => (f + frames[i]) / 2);
  const confidence = mean(frames) / Math.max(1e-6, mean(mids));
  const offset = opts.offset ?? from;
  let times;
  if (sub > 1) {
    times = frames.flatMap((f, i) => {
      const next = frames[i + 1];
      if (next === undefined) return [f];
      return Array.from({ length: sub }, (_, k) => f + ((next - f) * k) / sub);
    }).map((f) => from + f / FPS - offset);
  } else {
    const phase = downbeatPhase(frames, low, perBar);
    times = frames.slice(phase).map((f) => from + f / FPS - offset);
  }
  // Extend backwards by whole bars so the grid also covers the scene's opening moments.
  const beat = times.length > 1 ? (times.at(-1) - times[0]) / (times.length - 1) : 60 / (opts.bpm || 110);
  while (times.length && times[0] - perBar * beat >= 0) times = [...Array.from({ length: perBar }, (_, i) => times[0] - (perBar - i) * beat), ...times];
  times = times.map((t) => Math.round(t * 1000) / 1000);
  return { bpm: (60 * FPS) / period, confidence, alternatives: alternatives.map((p) => (60 * FPS) / p), perBar, times };
}

// ---------- self-test: a synthetic click track with a known, drifting tempo ----------
function selfTest() {
  const sr = 22050, dur = 40, x = new Float32Array(sr * dur);
  const truth = [];
  let t = 0.5, k = 0;
  while (t < dur - 0.5) {
    truth.push(t);
    const accent = k % 3 === 0 ? 1 : 0.5;            // 3/4: louder, bassier downbeat
    const f = k % 3 === 0 ? 110 : 880;
    for (let i = 0; i < sr * 0.08; i++) x[Math.floor(t * sr) + i] += accent * Math.exp(-i / (sr * 0.02)) * Math.sin((2 * Math.PI * f * i) / sr);
    const bpm = 120 + 12 * Math.sin((2 * Math.PI * t) / dur); // drifts 108–132 bpm
    t += 60 / bpm; k++;
  }
  for (let i = 0; i < x.length; i++) x[i] += 0.02 * (Math.random() * 2 - 1);
  const r = analyse(x, sr, { perBar: 3, bpm: 120 });
  const err = r.times.map((b) => Math.min(...truth.map((q) => Math.abs(q - b))));
  const hits = err.filter((e) => e < 0.05).length / r.times.length;
  const first = truth.findIndex((q) => Math.abs(q - r.times.find((b) => b >= 0.4)) < 0.05);
  console.log(`self-test: tempo ${r.bpm.toFixed(1)} bpm, ${r.times.length} beats (truth ${truth.length}), ${(hits * 100).toFixed(0)}% within 50 ms, downbeat ${first % 3 === 0 ? 'ok' : 'WRONG'}`);
  if (hits < 0.9 || first % 3 !== 0) process.exit(1);
}

if (require.main === module) {
  const o = parseArgs(process.argv.slice(2));
  if (o['self-test']) { selfTest(); process.exit(0); }
  if (!o._[0]) { console.error('usage: node tools/beats.js <audio> [--from s] [--to s] [--offset s] [--perBar n] [--bpm hint] [--subdivide n] [--json]'); process.exit(2); }
  const { sr, x } = decode(o._[0]);
  const r = analyse(x, sr, o);
  if (o.json) { console.log(JSON.stringify(r)); process.exit(0); }
  console.log(`tempo ≈ ${r.bpm.toFixed(1)} bpm (also try --bpm ${r.alternatives.map((b) => b.toFixed(0)).join(' / ') || '—'}), ${r.times.length} beats, perBar ${r.perBar}, confidence ${r.confidence.toFixed(2)}`);
  console.log(`beats = { perBar: ${r.perBar}, times: [${r.times.join(', ')}] }`);
}

module.exports = { decodeWav, analyse };
