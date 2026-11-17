// s00 · Pre-show starfield (loop). Settles the room and hides the LCD glow rectangle (TREATMENT §04).
// Drawn whenever the show is not playing; t is the wall clock, so it loops forever.
import { twinkleStars } from '../fx/index.js';
import { skyBase, stripSnow } from './common.js';

export default {
  id: 's00-preshow',
  title: 'Pre-show · starfield',
  duration: 60,
  loop: true,
  zones: ['wall', 'backdrop', 'rightStrip'],
  cues: [{ t: 0, name: 'loop' }, { t: 0, name: 'cut' }, { t: 60, name: 'out' }],
  draw(zoneId, ctx, w, h, t) {
    if (zoneId === 'backdrop') {
      twinkleStars(ctx, w, h, t, { seed: 41, density: 0.35, alpha: 0.8 });
      return;
    }
    skyBase(zoneId, ctx, w, h, t);
    if (zoneId === 'rightStrip') stripSnow(ctx, w, h, t, 0.45, 0.8);
  },
};
