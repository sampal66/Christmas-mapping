// s08 · Para ti, {BABY} (1:00). Gentle snow; the pets gather and look up at the star, which glows warmer while the
// narrator says the message. Silence check (SCRIPT §07, owner 2026-11-17): from 26 to 45 s only the music plays, so the
// pets' own constellations (Orion, Canis Major + Minor, Felis) twinkle softly above as a callback to s06 and the star
// warms on the swell. Ends: "only one thing is missing… the real star", and Gandalf's soft line.
import { cueSheet, loadFonts, snowfall, starHalo, constellation, ORION, CANIS_MAJOR, CANIS_MINOR, FELIS,
  easeInOutSine, clamp } from '../fx/index.js';
import { drawWarmStar } from './star-story.js';
import { skyBase, BOX_ZONES, storyTower } from './common.js';
import { stageLayout, drawPets, preloadTracks, look, act } from './stage.js';

const cues = [{ t: 0, name: 'gather' }, { t: 20, name: 'message' }, { t: 45, name: 'missing' }, { t: 56, name: 'out' }];
const C = cueSheet(cues);
const duration = 60;
const c = C.at;

const gaze = (p, i) => look(p, c('gather') + 2.5 + 0.4 * i, duration);
const tracks = {
  alaska: [gaze('alaska', 0)],
  connor: [gaze('connor', 1)],
  orion: [gaze('orion', 2)],
  gandalf: [gaze('gandalf', 3), act('s08-gandalf-soft', c('missing') + 6, duration)],     // s08-gandalf-01
};

// The callback (wall fractions: open sky right of the star, above the backdrop's pets). Each figure draws on in turn.
const BEAT = [26, 45];
const FIGURES = [
  { shape: ORION, box: [0.52, 0.04, 0.66, 0.4], at: 26.5, color: 'ice' },
  { shape: CANIS_MAJOR, box: [0.68, 0.1, 0.8, 0.38], at: 28.5, color: 'snow' },
  { shape: CANIS_MINOR, box: [0.79, 0.04, 0.86, 0.13], at: 29.5, color: 'snow' },
  { shape: FELIS, box: [0.84, 0.16, 0.98, 0.32], at: 31, color: 'gold' },
];
// 0..1: the callback's presence (eases in from 26 s, gone by the next narration at 45 s).
const callback = (local) => easeInOutSine(clamp((local - BEAT[0]) / 3)) * (1 - easeInOutSine(clamp((local - BEAT[1] + 3.5) / 3)));
// The music swell inside the beat: an extra warm glow on the star, peaking mid-way.
const swell = (local) => Math.sin(Math.PI * clamp((local - BEAT[0] - 2) / (BEAT[1] - BEAT[0] - 3))) ** 2;

export default {
  id: 's08-for-baby',
  title: 's08 · Para ti, {BABY}',
  duration,
  cues,
  story: true,
  zones: ['wall', 'star', ...BOX_ZONES],
  enter() { loadFonts(); preloadTracks(tracks); },
  draw(zoneId, ctx, w, h, t, local, env) {
    if (storyTower(zoneId, ctx, w, h, t, local, c('out'), duration)) return;
    const A = 1 - easeInOutSine(C.prog(local, 'out', duration));
    if (zoneId === 'star') {
      drawWarmStar(zoneId, ctx, w, h, t, local);
      starHalo(ctx, w, h, t, { intensity: 0.3 * swell(local) * A, color: 'candle', pulse: 0.15, period: 6, size: 0.65 });
      return;
    }
    if (zoneId !== 'wall') return;
    skyBase(zoneId, ctx, w, h, t);
    snowfall(ctx, w, h, t, { density: 0.35 * easeInOutSine(clamp(local / 4)), alpha: A, layers: 2, wind: 0.08 });
    const cb = callback(local);
    if (cb > 0) {
      for (const f of FIGURES) {
        constellation(ctx, w, h, t, { stars: f.shape.stars, lines: f.shape.lines, aspect: f.shape.aspect, box: f.box,
          progress: clamp((local - f.at) / 5), color: f.color, lineColor: 'ice', alpha: 0.55 * cb, starSize: 0.7, seed: f.at });
      }
    }
    drawPets(ctx, stageLayout(env, w, h), tracks, local, { inAt: c('gather'), outAt: c('out') });
  },
};
