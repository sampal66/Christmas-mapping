// Cue sheets: scenes key every effect off named cues ({ t, name }, seconds from scene start), so re-timing a
// scene to the real music (WP-05) only edits the numbers in its `cues` list.
import { prog, envelope } from './util.js';

export function cueSheet(cues) {
  const map = new Map(cues.map((c) => [c.name, c.t]));
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

/** Beat clock for placeholder tempos: { n: beat index, phase: 0..1 within the beat }. */
export function beat(local, bpm, offset = 0) {
  const b = Math.max(0, (local - offset) * bpm / 60);
  const n = Math.floor(b);
  return { n, phase: b - n };
}
