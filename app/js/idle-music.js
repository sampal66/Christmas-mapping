// Idle music (WP-08b): the s00 music-box loop plays whenever the show isn't running (pre-show, and after the finale
// fades back to the starfield), so the room never drops into silence (SCRIPT §07). Source: the media-pack file
// `music-box-loop` (≈ 0.4 MB, on the device only). No file → silent, no errors.
//
// Fades go through a Web Audio gain node: iPad Safari ignores HTMLMediaElement.volume. Browsers only start audio after
// a tap, so the loop begins on the operator's first touch (call unlock() from any pointer/key event).
import * as media from './media.js';

const FADE_IN = 3;          // s: soft fade-in (DESIGN_SYSTEM §08: no sudden sounds)
const FADE_OUT = 0.4;       // s: quick but click-free when Play starts the show
const LEVEL = 0.8;

export class IdleMusic {
  constructor() {
    this.audio = null;
    this.ctx = null;
    this.gain = null;
    this.wanted = false;
    this.on = false;          // currently playing (or fading in)
    this.unlocked = false;
    this._stopTimer = null;
  }

  /** (Re)loads the loop from the media pack; returns whether a file was found. */
  async load() {
    let url = null;
    try { url = await media.objectUrl('music-box-loop'); } catch { url = null; }
    if (!url) { this._teardown(); return false; }
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.setAttribute('playsinline', '');
    }
    if (this.audio.src !== url) this.audio.src = url;
    if (this.on) { this.on = false; this.update(this.wanted); }
    return true;
  }

  get hasFile() { return !!this.audio?.src; }

  /** Call from a user gesture: creates/resumes the audio graph so playback is allowed. */
  unlock() {
    if (this.unlocked && this.ctx?.state === 'running') return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.unlocked = true; return; }
      this.ctx = this.ctx || new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.unlocked = true;
      if (this.wanted && !this.on) this.update(true);
    } catch { this.unlocked = true; }
  }

  _graph() {
    if (this.gain || !this.ctx || !this.audio) return;
    try {
      const src = this.ctx.createMediaElementSource(this.audio);
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      src.connect(this.gain).connect(this.ctx.destination);
    } catch { this.gain = null; }
  }

  /** Called every frame with whether idle music should be heard now. Cheap when nothing changes. */
  update(want) {
    this.wanted = want;
    if (!this.audio || !this.unlocked) return;
    if (want === this.on) return;
    this.on = want;
    this._graph();
    const now = this.ctx?.currentTime ?? 0;
    const g = this.gain?.gain;
    clearTimeout(this._stopTimer);
    if (want) {
      if (g) { g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(LEVEL, now + FADE_IN); }
      this.audio.play().catch(() => { this.on = false; });
    } else {
      if (g) { g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + FADE_OUT); }
      this._stopTimer = setTimeout(() => { if (!this.on) this.audio.pause(); }, (g ? FADE_OUT : 0) * 1000 + 50);
    }
  }

  _teardown() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.on = false;
  }
}
