// Stand-ins for the story scenes (s03, s05, s07, s08), built in WP-08 once the character clips and narration
// exist. They keep the real running order and lengths, so the master timeline and the cut list can be rehearsed now.
import { cueSheet, titleCard, loadFonts, easeInOutSine, clamp } from '../fx/index.js';

// `drawBackdrop` adds finished pieces (e.g. WP-11's star Mickey in s05) on the backdrop, under the placeholder caption.
export function storyPlaceholder({ id, title, duration, cues, zones = [], draw = null, drawBackdrop = null }) {
  const C = cueSheet(cues);
  return {
    id,
    title: `${title} (placeholder, WP-08)`,
    duration,
    cues,
    placeholder: true,
    effects: !!drawBackdrop,              // has finished pieces: the flash check renders it
    zones: ['backdrop', ...zones],
    enter() { loadFonts(); },
    draw(zoneId, ctx, w, h, t, local, env) {
      if (zoneId !== 'backdrop') { draw?.(zoneId, ctx, w, h, t, local, env, C); return; }
      const a = easeInOutSine(clamp(local / 2)) * (1 - easeInOutSine(C.prog(local, 'out', duration)));
      const busy = drawBackdrop ? drawBackdrop(ctx, w, h, t, local, env, C) || 0 : 0;
      titleCard(ctx, w, h, t, { lines: [title, 'llega en WP-08'], style: 'caption', size: 56, color: 'sepia', glow: 'dusk', alpha: 0.55 * a * (1 - busy), y: 0.4 });
    },
  };
}
