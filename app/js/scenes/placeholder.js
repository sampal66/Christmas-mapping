// Stand-ins for the story scenes (s03, s05, s07, s08), built in WP-08 once the character clips and narration
// exist. They keep the real running order and lengths, so the master timeline and the cut list can be rehearsed now.
import { cueSheet, titleCard, loadFonts, easeInOutSine, clamp } from '../fx/index.js';

export function storyPlaceholder({ id, title, duration, cues }) {
  const C = cueSheet(cues);
  return {
    id,
    title: `${title} (placeholder, WP-08)`,
    duration,
    cues,
    placeholder: true,
    zones: ['backdrop'],
    enter() { loadFonts(); },
    draw(zoneId, ctx, w, h, t, local) {
      const a = easeInOutSine(clamp(local / 2)) * (1 - easeInOutSine(C.prog(local, 'out', duration)));
      titleCard(ctx, w, h, t, { lines: [title, 'llega en WP-08'], style: 'caption', size: 56, color: 'sepia', glow: 'dusk', alpha: 0.55 * a, y: 0.4 });
    },
  };
}
