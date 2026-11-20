// Character clips (WP-04): painted cel-animation clips stored as "stacked alpha" MP4s: colour in the top half, a grey
// matte in the bottom half (tools/clip-alpha.js). Each drawn frame is rebuilt into a transparent canvas (matte → alpha)
// and composited normally, so no box ever shows behind a character, whatever the background or browser (Safari has
// no VP9 alpha; the old 'screen' blend left visible black boxes on the wall). Each clip is a muted, inline <video> that is
// kept in step with show time: it plays while the show plays and is re-seeked whenever it drifts, so pausing,
// scrubbing, Cut and frame-by-frame export all show the right frame.
//
// Sources, in order: a media-pack file with the clip's id (lets the owner swap a re-take without a deploy), then the
// committed file `assets/clips/<id>.mp4` (listed in CLIP_FILES and pre-cached by sw.js). Both are loaded as blobs:
// Safari plays <video> only from sources that answer range requests, which service-worker cache hits do not.
// A clip that is missing or still loading makes drawClip() return false, and the caller draws its code placeholder.
import * as media from '../media.js';

/** Clips committed under app/assets/clips/ (others can still come from the media pack). */
export const CLIP_FILES = [
  's04-gandalf-ears', 's04-gandalf-pop', 's04-connor-tail', 's04-orion-ears', 'pet-alaska-idle', 'pet-alaska-lookup',
  'pet-alaska-talk', 'pet-connor-idle', 'pet-connor-lookup', 'pet-connor-talk', 'pet-gandalf-idle',
  'pet-gandalf-lookup', 'pet-gandalf-talk', 'pet-orion-idle', 'pet-orion-lookup', 'pet-orion-talk',
  's03-alaska-boss', 's03-alaska-nooo', 's03-gandalf-bat', 's03-gandalf-oops', 's04-alaska-tail', 's05-connor-hide',
  's05-gandalf-bells', 's07-connor-brave', 's07-connor-carry', 's07-pooh-float', 's08-gandalf-soft',
  's10-alaska-wave', 's10-connor-wave', 's10-gandalf-wave', 's10-orion-wave', 's10-santa-sleigh',
  // WP-14a
  'pet-alaska-lookloop', 'pet-connor-lookloop', 'pet-gandalf-lookloop', 'pet-orion-lookloop', 's03-gandalf-ready', 's05-connor-peek',
  's05-orion-yawn', 's07-pooh-hold', 's07-pooh-wave', 's10-santa-swoop', 's10-santa-goodnight',
  's04-nutcracker-march', 's04-gingerbread-run', 's08-velveteen-rabbit', 's10-rabbit-wave'
];

/**
 * topFade for pet clips: nearly every pet clip has ear tips in its top row (measured 2026-11-18, WP-08c), so all of
 * them fade the top 4 % of the frame. Re-takes framed wider can drop it.
 */
export const EAR_FADE = 0.04;

const BASE = new URL('../../assets/clips/', import.meta.url).href;
const clips = new Map();            // id → { video, ready, failed, keyed canvas }
let playing = false;
let frameNo = 0;

function load(id) {
  const c = { video: null, ready: false, failed: false, drawn: -1, src: null, out: null, keyedAt: -1 };
  clips.set(id, c);
  (async () => {
    let url = null;
    try { url = await media.objectUrl(id); } catch { url = null; }
    if (!url && CLIP_FILES.includes(id)) {
      try {
        const res = await fetch(`${BASE}${id}.mp4`);
        if (res.ok) url = URL.createObjectURL(await res.blob());
      } catch { url = null; }
    }
    if (!url || typeof document === 'undefined') { c.failed = true; return; }
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.addEventListener('loadeddata', () => { c.ready = true; }, { once: true });
    v.addEventListener('error', () => { c.failed = true; }, { once: true });
    // currentTime jumps to the target before the new frame is decoded: re-key once the seek has landed.
    v.addEventListener('seeked', () => { c.keyedAt = -1; });
    v.src = url;
    c.video = v;
  })();
  return c;
}

/** Starts loading clips ahead of time (call from a scene's enter()). */
export function preloadClips(ids) { for (const id of ids) if (!clips.has(id)) load(id); }

// Test hook (tools/precheck.js): called on every drawClip() with what was asked for and, when drawn, where it landed
// (the canvas transform at the anchor plus the drawn box). Null in the app, so it costs nothing on show night.
let probe = null;
export function setClipProbe(fn) { probe = fn; }

/** True while any clip is still loading or seeking (tools/precheck.js waits on it before reading a frame). */
export function clipsBusy() {
  for (const c of clips.values()) if (!c.failed && (!c.ready || c.video?.seeking)) return true;
  return false;
}

/** True once the clip can be drawn. */
export function clipReady(id) { return !!(clips.get(id) || load(id)).ready; }

/** Called by the render loop once per frame: whether the show clock is running. Pauses clips not drawn last frame. */
export function clipsFrame(isPlaying) {
  playing = isPlaying;
  for (const c of clips.values()) {
    if (c.ready && !c.video.paused && c.drawn < frameNo) c.video.pause();
  }
  frameNo++;
}

/**
 * The clip's current frame as a transparent canvas: colour (top half of the video) with the matte (bottom half) as
 * alpha. Rebuilt only when the video's time has moved, so a paused clip costs nothing.
 */
function keyed(c, fade = 0) {
  const v = c.video;
  const w = v.videoWidth, h2 = v.videoHeight, h = h2 >> 1;
  if (!c.out || c.out.width !== w || c.out.height !== h) {
    c.src = document.createElement('canvas'); c.src.width = w; c.src.height = h2;
    c.out = document.createElement('canvas'); c.out.width = w; c.out.height = h;
    c.keyedAt = -1;
  }
  if (c.fade !== fade) { c.fade = fade; c.keyedAt = -1; }
  if (c.keyedAt === v.currentTime || v.seeking) return c.keyedAt >= 0 || v.seeking ? c.out : null;
  try {
    const sctx = c.src.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(v, 0, 0);
    const img = sctx.getImageData(0, 0, w, h2);
    const d = img.data, n = w * h * 4;
    for (let i = 3; i < n; i += 4) d[i] = d[i + n - 3];       // alpha ← matte's red channel, same pixel one half below
    // Soft top edge: the generated clips cut some ear tips at the frame's top row, so the top rows ramp to
    // transparent and the cut reads as a soft tip instead of a flat line.
    const rows = Math.min(h, Math.round(fade * h));
    for (let y = 0; y < rows; y++) {
      const k = ((y + 0.5) / rows) ** 1.5;
      for (let i = y * w * 4 + 3, e = i + w * 4; i < e; i += 4) d[i] *= k;
    }
    c.out.getContext('2d').putImageData(new ImageData(d.subarray(0, n), w, h), 0, 0);
    c.keyedAt = v.currentTime;
  } catch { return c.keyedAt >= 0 ? c.out : null; }
  return c.out;
}

/** Test hook only: [x0, y0, x1, y1] of the keyed frame's opaque pixels (alpha > 50 %), in frame px; null if empty. */
function matteBox(c, frame) {
  if (c.matteAt === c.keyedAt && c.matte !== undefined) return c.matte;
  const { width: w, height: h } = frame;
  const d = frame.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  c.matteAt = c.keyedAt;
  c.matte = x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
  return c.matte;
}

/**
 * Draws a clip's frame at `time` seconds into the clip.
 * opts: x, y (anchor point, px), h (drawn height, px), anchor [ax, ay] (0..1 of the drawn box, default bottom
 * centre), alpha, loop (wrap time instead of holding the last frame), flip (mirror left-right),
 * crop [u0, v0, u1, v1] (part of the video to draw, 0..1), rotate (radians about the anchor), topFade (share of the
 * frame height faded to transparent at the top, for clips whose ears touch the frame's top edge; 0 = none).
 * Returns false (draws nothing) when the clip isn't available, so the caller can draw its fallback.
 */
export function drawClip(ctx, id, time, opts = {}) {
  const c = clips.get(id) || load(id);
  if (!c.ready || c.failed) { probe?.({ id, time, drawn: false, failed: c.failed }); return false; }
  const v = c.video;
  const dur = v.duration || 0;
  if (!(dur > 0) || !v.videoWidth) return false;
  const { x = 0, y = 0, h = 100, anchor = [0.5, 1], alpha = 1, loop = false, flip = false, crop = [0, 0, 1, 1], rotate = 0, topFade = 0 } = opts;
  if (alpha <= 0.01) return true;
  const ct = loop ? ((time % dur) + dur) % dur : Math.min(Math.max(time, 0), dur - 0.04);
  c.drawn = frameNo;
  v.loop = loop;
  const moving = playing && (loop || time < dur);
  if (Math.abs(v.currentTime - ct) > (moving ? 0.15 : 0.02) && !v.seeking) {
    try { v.currentTime = ct; } catch { /* not seekable yet */ }
  }
  if (moving && v.paused) v.play().catch(() => {});
  else if (!moving && !v.paused) v.pause();

  const frame = keyed(c, topFade);
  if (!frame) { probe?.({ id, time, drawn: false }); return false; }
  const [u0, v0, u1, v1] = crop;
  const fw = frame.width, fh = frame.height;
  const sw = (u1 - u0) * fw, sh = (v1 - v0) * fh;
  const dh = h, dw = h * sw / sh;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rotate) ctx.rotate(rotate);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(frame, u0 * fw, v0 * fh, sw, sh, -anchor[0] * dw, -anchor[1] * dh, dw, dh);
  if (probe) {
    // the matte's bounding box in the drawn box's coordinates (WP-16 overlap check): test-only, so the scan is fine here
    const mb = matteBox(c, frame), sx = dw / sw, sy = dh / sh, ox = -anchor[0] * dw - u0 * fw * sx, oy = -anchor[1] * dh - v0 * fh * sy;
    probe({ id, time: ct, drawn: true, held: !loop && time >= dur - 0.04, m: ctx.getTransform(), box: [-anchor[0] * dw, -anchor[1] * dh, dw, dh], alpha: ctx.globalAlpha, anchor, canvas: ctx.canvas,
      matte: mb && [ox + mb[0] * sx, oy + mb[1] * sy, (mb[2] - mb[0]) * sx, (mb[3] - mb[1]) * sy] });
  }
  ctx.restore();
  return true;
}
