// s05 · ¿Dónde está la estrella? (1:00). Alaska regroups the team, a soft jingle spooks Connor (he lies flat, paws
// over his eyes), Gandalf hears Santa's bells, then the old film flickers on and the drone-swarm Mickey (WP-11,
// fx/mickey-stars.js; no Mickey clip exists) whistles and points up: everyone looks up (TREATMENT §04, SCRIPT §03).
import { cueSheet, loadFonts, mickeyStars, MICKEY_TIMING } from '../fx/index.js';
import { skyBase } from './common.js';
import { stageLayout, drawPets, preloadTracks, talk, look, act } from './stage.js';

const cues = [{ t: 0, name: 'regroup' }, { t: 15, name: 'jingle' }, { t: 30, name: 'mickey-in' }, { t: 45, name: 'mickey-out' }, { t: 45, name: 'cut' }, { t: 56, name: 'out' }];
const C = cueSheet(cues);
const duration = 60;
const c = C.at;

// Mickey points up MICKEY_TIMING.point seconds after mickey-in; the pets follow his finger (staggered).
const point = c('mickey-in') + MICKEY_TIMING.point;
const up = (p, i) => look(p, point + 0.6 + 0.25 * i, c('mickey-out') + 2);
const tracks = {
  alaska: [
    talk('alaska', c('regroup') + 1, 5.0),                                               // s05-alaska-01
    talk('alaska', c('jingle') + 11, 3.1),                                               // s05-alaska-02
    up('alaska', 0),
    talk('alaska', c('mickey-out') + 2, 5.6),                                            // s05-alaska-03
  ],
  orion: [
    talk('orion', c('regroup') + 6, 2.9),                                                // s05-orion-01
    up('orion', 2),
    talk('orion', c('mickey-out') + 8, 2.5),                                             // s05-orion-02 (opt)
  ],
  connor: [
    act('s05-connor-hide', c('jingle') + 2, point + 0.6),                                // s05-connor-01: stays down
    up('connor', 1),
  ],
  gandalf: [
    act('s05-gandalf-bells', c('jingle') + 7, c('jingle') + 12.5),                      // s05-gandalf-01
    up('gandalf', 3),
  ],
};

export default {
  id: 's05-where-is-the-star',
  title: 's05 · ¿Dónde está la estrella?',
  duration,
  cues,
  story: true,
  zones: ['backdrop', 'wall'],
  enter() { loadFonts(); preloadTracks(tracks); },
  draw(zoneId, ctx, w, h, t, local, env) {
    if (zoneId === 'backdrop') {
      mickeyStars(ctx, w, h, t, local - c('mickey-in'), { x: 0.26, y: 0.5, size: 0.25 });
      return;
    }
    if (zoneId !== 'wall') return;
    skyBase(zoneId, ctx, w, h, t);
    drawPets(ctx, stageLayout(env, w, h), tracks, local, { inAt: c('regroup'), outAt: c('out'), outEnd: duration - 0.5 });
  },
};
