#!/usr/bin/env node
// Packs a character clip (painted on black) into a "stacked alpha" MP4 (WP-04 fix, owner: no black boxes behind the
// characters). Top half: the colour; bottom half: a grey matte (white = character). The app rebuilds a transparent
// frame from the two halves (fx/clips.js), so the clip composites normally (source-over) on any background and on
// every browser: Safari has no VP9 alpha, and blend tricks ('screen') leave a visible box when the black isn't
// perfectly black or the blend isn't honoured.
//
// Matte: black that touches the frame edge (flood fill) is background; everything enclosed by the character (pupils,
// dark mouths) stays opaque. Edge pixels get a soft ramp on brightness and are un-premultiplied (colour / alpha) so no
// dark fringe remains.
//
// Usage: node tools/clip-alpha.js <in.mp4> <out.mp4>   (needs ffmpeg/ffprobe on PATH; cloud-side tool only)
const { spawn, execFileSync } = require('child_process');

const [, , input, output] = process.argv;
if (!input || !output) { console.error('usage: clip-alpha.js <in.mp4> <out.mp4>'); process.exit(1); }

const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', input]).toString().trim().split(',');
const W = +probe[0], H = +probe[1];
const fps = probe[2];
const BG = 0.075, SOFT = 0.12;        // background below BG (max channel, 0..1), ramp up to BG + SOFT

const dec = spawn('ffmpeg', ['-v', 'error', '-i', input, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const enc = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H * 2}`, '-r', fps, '-i', '-',
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output]);
enc.stderr.pipe(process.stderr); dec.stderr.pipe(process.stderr);

const frameBytes = W * H * 3;
let buf = Buffer.alloc(0);
const bgMask = new Uint8Array(W * H);
const queue = new Int32Array(W * H);
let frames = 0;

function pack(rgb) {
  const out = Buffer.alloc(frameBytes * 2);
  const max = (i) => Math.max(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]) / 255;
  // Flood fill the dark background from the frame edges.
  bgMask.fill(0);
  let qh = 0, qt = 0;
  const seed = (i) => { if (!bgMask[i] && max(i) < BG + SOFT) { bgMask[i] = 1; queue[qt++] = i; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (qh < qt) {
    const i = queue[qh++], x = i % W;
    if (x > 0) seed(i - 1);
    if (x < W - 1) seed(i + 1);
    if (i >= W) seed(i - W);
    if (i < W * (H - 1)) seed(i + W);
  }
  for (let i = 0; i < W * H; i++) {
    let a = 1;
    if (bgMask[i]) a = Math.min(1, Math.max(0, (max(i) - BG) / SOFT));
    const o = i * 3, m = frameBytes + o;
    const k = a > 0.02 ? 1 / a : 0;
    out[o] = Math.min(255, rgb[o] * k); out[o + 1] = Math.min(255, rgb[o + 1] * k); out[o + 2] = Math.min(255, rgb[o + 2] * k);
    const v = Math.round(a * 255);
    out[m] = v; out[m + 1] = v; out[m + 2] = v;
  }
  return out;
}

dec.stdout.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  while (buf.length >= frameBytes) {
    const frame = buf.subarray(0, frameBytes);
    buf = buf.subarray(frameBytes);
    if (!enc.stdin.write(pack(frame))) { dec.stdout.pause(); enc.stdin.once('drain', () => dec.stdout.resume()); }
    frames++;
  }
});
dec.stdout.on('end', () => enc.stdin.end());
enc.on('close', (code) => {
  if (code) { console.error(`encoder exited ${code}`); process.exit(code); }
  console.log(`${output}: ${frames} frames, ${W}x${H} colour + matte`);
});
