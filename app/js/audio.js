// Master clock for the show.
// With music loaded, time comes from the <audio> element (stays correct even if frames drop).
// Without music, a silent performance.now()-based clock runs, so scenes can be built before audio exists.
//
// Bluetooth speakers play audio late. `latencyMs` delays the visuals by the same amount:
//   showTime = audioTime - latencyMs / 1000

export class MasterClock {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.hasAudio = false;
    this.latencyMs = 0;
    this.playing = false;
    this._silentBase = 0;      // silent clock: media time at _silentStart
    this._silentStart = 0;
    this.audio.addEventListener('ended', () => { this.playing = false; });
  }

  load(src) {
    this.audio.src = src;
    this.hasAudio = !!src;
    this.seek(0);
  }

  // Raw media time (what the speakers are playing, before latency correction).
  get mediaTime() {
    if (this.hasAudio) return this.audio.currentTime;
    return this.playing ? this._silentBase + (performance.now() - this._silentStart) / 1000 : this._silentBase;
  }

  get showTime() { return this.mediaTime - this.latencyMs / 1000; }

  async play() {
    if (this.hasAudio) {
      try { await this.audio.play(); } catch (e) { console.warn('audio play blocked', e); return; }
    } else {
      this._silentStart = performance.now();
    }
    this.playing = true;
  }

  pause() {
    if (this.hasAudio) this.audio.pause();
    else this._silentBase = this.mediaTime;
    this.playing = false;
  }

  // Seek in show time (the latency is added back to get media time).
  seek(showT) {
    const media = Math.max(0, showT + this.latencyMs / 1000);
    if (this.hasAudio) this.audio.currentTime = media;
    this._silentBase = media;
    this._silentStart = performance.now();
  }
}

// Short beep for the sync test (needs a user gesture to create the AudioContext first).
let actx = null;
export function beep() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.25, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
    o.connect(g).connect(actx.destination);
    o.start(); o.stop(actx.currentTime + 0.13);
  } catch { /* no audio available */ }
}
