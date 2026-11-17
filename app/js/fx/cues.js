// Cue sheets and beat grids: scenes key every effect off named cues ({ t, name }, seconds from scene start) and a
// beat grid, so re-timing a scene to the real music (WP-05) only edits its `cues` and `beats`.
import { prog, envelope } from './util.js';

export function cueSheet(cues, grid = null) {
  // With a beat grid, every cue snaps to the nearest beat, so scene events always land on the music.
  const map = new Map(cues.map((c) => [c.name, grid ? grid.quantize(c.t) : c.t]));
  const at = (k) => {
    if (typeof k === 'number') return k;
    if (!map.has(k)) throw new Error(`unknown cue "${k}"`);
    return map.get(k);
  };
  return {
    at,
    /** Seconds since cue k (negative before it). */
    since: (local, k) => local - at(k),
    /** 0..1 progress from cue a to cue b (or numbers; `b` may be `a + seconds` via { after }). */
    prog: (local, a, b) => prog(local, at(a), typeof b === 'object' ? at(a) + b.after : at(b)),
    /** Eased window between two cues with fade-in/out ramps. */
    env: (local, a, b, inS = 1, outS = 1) => envelope(local, at(a), at(b), inS, outS),
  };
}

/**
 * Beat grid: every light-show animation is driven by this, so it moves to the music (DESIGN_SYSTEM §06).
 * spec: { bpm, offset = 0, perBar = 4, times? } in scene-local seconds. `times` is the real beat list taken
 * from the recording (WP-05); until then the placeholder tempo is used. Only the scene's `beats` changes when
 * the music arrives; the effects stay as they are.
 *   at(local)    → { n, phase, bar, beatInBar, barPhase, downbeat }
 *   warp(local)  → "beat time" in seconds: advances in eased surges that land on each beat; feed it to any
 *                  continuous effect (waves, spirals, chases, twinkle) instead of t to make it move on the beat
 *   pulse(local) → 0..1 accent that peaks on the beat and decays; capped to ≤ 2.5 accents/s (flash limit)
 *   barPulse(local) → the same, once per bar (for big areas)
 *   time(n)      → scene time of beat n;  quantize(t) → nearest beat time;  nextBeat(t) → first beat ≥ t
 */
export function beatGrid({ bpm = 120, offset = 0, perBar = 4, times = null } = {}) {
  const len = 60 / bpm;
  const list = times && times.length > 1 ? times : null;
  const avg = list ? (list.at(-1) - list[0]) / (list.length - 1) : len;
  // Safety: accents never come faster than 2.5/s, whatever the tempo (≤ 3 flashes/s rule).
  const every = Math.max(1, Math.ceil((1 / avg) / 2.5));
  const beatAt = (local) => {
    if (!list) { const b = Math.max(0, (local - offset) / len); const n = Math.floor(b); return [n, b - n]; }
    if (local <= list[0]) return [0, 0];
    let lo = 0, hi = list.length - 1;
    if (local >= list[hi]) { const b = hi + (local - list[hi]) / avg; const n = Math.floor(b); return [n, b - n]; }
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (list[m] <= local) lo = m; else hi = m; }
    return [lo, (local - list[lo]) / (list[lo + 1] - list[lo])];
  };
  const time = (n) => (list ? (n < list.length ? list[Math.max(0, n)] : list.at(-1) + (n - list.length + 1) * avg) : offset + n * len);
  const ease = (p) => 1 - (1 - p) ** 3;                  // surge right after the beat, settle before the next
  const accent = (p) => Math.exp(-p * 4);
  return {
    perBar,
    beatLen: avg,
    at(local) {
      const [n, phase] = beatAt(local);
      const beatInBar = n % perBar;
      return { n, phase, bar: Math.floor(n / perBar), beatInBar, barPhase: (beatInBar + phase) / perBar, downbeat: beatInBar === 0 };
    },
    warp(local) { const [n, p] = beatAt(local); return (n + ease(p)) * avg; },
    // Accent on every `every`-th beat, decaying through the beats in between.
    pulse(local) { const [n, p] = beatAt(local); return accent((n % every) + p); },
    barPulse(local) { const [n, p] = beatAt(local); return accent(((n % perBar) + p) * 1.5); },
    time,
    quantize(t) { const [n, p] = beatAt(t); return time(p < 0.5 ? n : n + 1); },
    nextBeat(t) { const [n, p] = beatAt(t); return time(p === 0 ? n : n + 1); },
    /** 0..1 progress over `count` beats from the first beat at/after `from`, advancing in eased steps on each beat. */
    steps(local, from, count) {
      const [f, fp] = beatAt(from);
      const first = fp > 1e-6 ? f + 1 : f;
      const [n, p] = beatAt(local);
      if (n < first) return 0;
      return Math.min(1, (n - first + ease(p)) / count);
    },
  };
}
