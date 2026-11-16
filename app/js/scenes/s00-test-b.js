// Placeholder scene B (10–20 s): tree colour waves + star glow. A hold point at 15 s loops 13–15 s.
import { treeWaves, starGlow } from '../effects.js';

export default {
  id: 's00-test-b',
  title: 'Test B · tree (hold at 0:15)',
  start: 10,
  duration: 10,
  zones: ['tree', 'star'],
  draw(zoneId, ctx, w, h, t) {
    if (zoneId === 'tree') treeWaves(ctx, w, h, t);
    else starGlow(ctx, w, h, t);
  },
};
