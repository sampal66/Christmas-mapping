// s00 · Pre-show (loop), behind closed curtains. Settles the room and hides the LCD glow rectangle (TREATMENT §04).
// Drawn whenever the show is not playing; t is the wall clock, so it loops forever.
// WP-13a: the room waits behind closed theatre curtains (fx/curtains.js); s01 opens them. The backdrop stays empty
// so the curtain on the wall shows through it.
import { curtains } from '../fx/curtains.js';

export default {
  id: 's00-preshow',
  title: 'Pre-show · curtains',
  duration: 60,
  loop: true,
  zones: ['wall', 'rightStrip'],
  cues: [{ t: 0, name: 'loop' }, { t: 0, name: 'cut' }, { t: 60, name: 'out' }],
  draw(zoneId, ctx, w, h, t) {
    curtains(ctx, w, h, t, { open: 0, zone: zoneId === 'wall' ? 'wall' : 'strip' });
  },
};
