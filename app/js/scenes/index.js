// Show running order (TREATMENT §04). Start times are laid end to end from each scene's duration, so
// re-timing a scene to the real music (WP-05) only edits its own file. s00 is the pre-show loop, drawn
// whenever the show isn't playing (and after it ends), so it is not on the timeline.
import preshow from './s00-preshow.js';
import s01 from './s01-wall-wakes.js';
import s02 from './s02-tree-alive.js';
import s03 from './s03-star-escapes.js';
import s04 from './s04-magic-boxes.js';
import s05 from './s05-where-is-the-star.js';
import s06 from './s06-constellations.js';
import s07 from './s07-honey-pot.js';
import s08 from './s08-for-baby.js';
import s09 from './s09-real-star.js';
import s10 from './s10-finale.js';

const order = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10];

let at = 0;
for (const s of order) { s.start = at; at += s.duration; }

export { preshow };
export const scenes = order;

// The live star moment (s09) loops until the operator taps Continue.
export const holds = order.filter((s) => s.hold).map((s) => ({
  id: `${s.id}-hold`, at: s.start + s.hold.loop[1], loop: [s.start + s.hold.loop[0], s.start + s.hold.loop[1]],
}));

/** Show time of a scene's `cut` cue (the on-the-night cut list), or null. */
export function cutTime(scene) {
  const c = scene?.cues?.find((q) => q.name === 'cut');
  return c ? scene.start + c.t : null;
}
