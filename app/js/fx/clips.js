// Character clips (WP-04): painted cel-animation clips rendered on pure black, screen-blended into a zone so the
// black vanishes and only the character shows (DESIGN_SYSTEM §05, §09). Each clip is a muted, inline <video> that is
// kept in step with show time: it plays while the show plays and is re-seeked whenever it drifts, so pausing,
// scrubbing, Cut and frame-by-frame export all show the right frame.
//
// Sources, in order: a media-pack file with the clip's id (lets the owner swap a re-take without a deploy), then the
// committed file `assets/clips/<id>.mp4` (listed in CLIP_FILES and pre-cached by sw.js). Both are loaded as blobs:
// Safari plays <video> only from sources that answer range requests, which service-worker cache hits do not.
// A clip that is missing or still loading makes drawClip() return false, and the caller draws its code placeholder.
import * as media from '../media.js';

/** Clips committed under app/assets/clips/ (others can still come from the media pack). */
export const CLIP_FILES = ['s04-gandalf-ears', 's04-gandalf-pop', 's04-connor-tail', 's04-orion-ears'];

const BASE = new URL('../../assets/clips/', import.meta.url).href;
const clips = new Map();            // id → { video, ready, failed }
let playing = false;
let frameNo = 0;

function load(id) {
  const c = { video: null, ready: false, failed: false, drawn: -1 };
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
    v.src = url;
    c.video = v;
  })();
  return c;
}

/** Starts loading clips ahead of time (call from a scene's enter()). */
export function preloadClips(ids) { for (const id of ids) if (!clips.has(id)) load(id); }

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
 * Draws a clip's frame at `time` seconds into the clip.
 * opts: x, y (anchor point, px), h (drawn height, px), anchor [ax, ay] (0..1 of the drawn box, default bottom
 * centre), alpha, loop (wrap time instead of holding the last frame), flip (mirror left-right),
 * crop [u0, v0, u1, v1] (part of the video to draw, 0..1), rotate (radians about the anchor).
 * Returns false (draws nothing) when the clip isn't available, so the caller can draw its fallback.
 */
export function drawClip(ctx, id, time, opts = {}) {
  const c = clips.get(id) || load(id);
  if (!c.ready || c.failed) return false;
  const v = c.video;
  const dur = v.duration || 0;
  if (!(dur > 0) || !v.videoWidth) return false;
  const { x = 0, y = 0, h = 100, anchor = [0.5, 1], alpha = 1, loop = false, flip = false, crop = [0, 0, 1, 1], rotate = 0 } = opts;
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

  const [u0, v0, u1, v1] = crop;
  const sw = (u1 - u0) * v.videoWidth, sh = (v1 - v0) * v.videoHeight;
  const dh = h, dw = h * sw / sh;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rotate) ctx.rotate(rotate);
  if (flip) ctx.scale(-1, 1);
  try { ctx.drawImage(v, u0 * v.videoWidth, v0 * v.videoHeight, sw, sh, -anchor[0] * dw, -anchor[1] * dh, dw, dh); }
  catch { /* frame not decodable yet */ }
  ctx.restore();
  return true;
}
