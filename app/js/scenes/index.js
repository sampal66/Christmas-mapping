// Show running order (TREATMENT §04). Start times are laid end to end from each scene's duration, so
// re-timing a scene to the real music (WP-05) only edits its own file. s00 is the pre-show loop, drawn
// whenever the show isn't playing (and after it ends), so it is not on the timeline.
import preshow from './s00-preshow.js';
import s01 from './s01-wall-wakes.js';
import s02 from './s02-tree-alive.js';
import s04 from './s04-magic-boxes.js';
import s06 from './s06-constellations.js';
import s09 from './s09-real-star.js';
import s10 from './s10-finale.js';
import { storyPlaceholder } from './placeholder.js';
import { drawEscape, drawReturn, drawWarmStar } from './star-story.js';
import { mickeyStars, MICKEY_TIMING } from '../fx/mickey-stars.js';

const s03 = storyPlaceholder({ id: 's03-star-escapes', title: 's03 · La estrella se escapa', duration: 75,
  cues: [{ t: 0, name: 'pets-in' }, { t: 15, name: 'tradition' }, { t: 40, name: 'bat' }, { t: 50, name: 'escape' }, { t: 71, name: 'out' }],
  zones: ['wall', 'star'], draw: drawEscape });
const s05 = storyPlaceholder({ id: 's05-where-is-the-star', title: 's05 · ¿Dónde está la estrella?', duration: 60,
  cues: [{ t: 0, name: 'regroup' }, { t: 15, name: 'jingle' }, { t: 30, name: 'mickey-in' }, { t: 45, name: 'mickey-out' }, { t: 45, name: 'cut' }, { t: 56, name: 'out' }],
  // WP-11: at mickey-in the old-film frame dissolves into the star Mickey, who whistles, then points up (fx/mickey-stars.js).
  drawBackdrop(ctx, w, h, t, local, env, C) {
    const age = local - C.at('mickey-in');
    mickeyStars(ctx, w, h, t, age, { x: 0.26, y: 0.5, size: 0.25 });
    return age > -1 && age < MICKEY_TIMING.end + 1 ? 1 : 0;      // hide the placeholder caption meanwhile
  } });
const s07 = storyPlaceholder({ id: 's07-honey-pot', title: 's07 · El tarro de miel', duration: 75,
  cues: [{ t: 0, name: 'pooh-in' }, { t: 15, name: 'found' }, { t: 30, name: 'carry' }, { t: 50, name: 'fly' }, { t: 60, name: 'settle' }, { t: 71, name: 'out' }],
  zones: ['wall', 'star'], draw: drawReturn });
const s08 = storyPlaceholder({ id: 's08-for-baby', title: 's08 · Para ti, {BABY}', duration: 60,
  cues: [{ t: 0, name: 'gather' }, { t: 20, name: 'message' }, { t: 45, name: 'missing' }, { t: 56, name: 'out' }],
  zones: ['star'], draw: drawWarmStar });

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
