// Placeholder scene A (0–10 s): snow over the wall, a gentle fade in.
import { snow } from '../effects.js';

export default {
  id: 's00-test-a',
  title: 'Test A · snow',
  start: 0,
  duration: 10,
  zones: ['wall', 'rightStrip'],
  draw(zoneId, ctx, w, h, t, local) {
    ctx.globalAlpha = Math.min(1, local / 2);
    snow(ctx, w, h, t, zoneId === 'wall' ? 220 : 40);
    ctx.globalAlpha = 1;
  },
};
