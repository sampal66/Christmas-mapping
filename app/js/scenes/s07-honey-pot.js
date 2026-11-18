// s07 · El tarro de miel (1:15). Pooh floats down on his balloon; the star glows in his honey pot; he hands it down
// and Connor carries it a few steps toward the tree, looks up, and it rises from his mouth to settle above the tree
// tip (TREATMENT §04, SCRIPT §03; short carry: WP-08c).
// The star's motion is star-story.js's drawReturn: Pooh's pot and Connor's mouth are placed on its path.
import { cueSheet, loadFonts, easeInOutSine, clamp } from '../fx/index.js';
import { drawReturn, RETURN_PATH, carryWalk, walkSpan } from './star-story.js';
import { stageLayout, drawPets, drawPetClip, preloadTracks, talk, look, act, CONNOR_MOUTH, PET_SIZE } from './stage.js';
import { preloadClips } from '../fx/clips.js';
import { BOX_ZONES, storyTower } from './common.js';

const cues = [{ t: 0, name: 'pooh-in' }, { t: 15, name: 'found' }, { t: 30, name: 'carry' }, { t: 50, name: 'fly' }, { t: 60, name: 'settle' }, { t: 71, name: 'out' }];
const C = cueSheet(cues);
const duration = 75;
const c = C.at;

const POOH = 's07-pooh-float';
// Pooh's 10 s clip floats, looks in the pot and holds it out; it starts 3 s in so the pot is held out (its last
// frame) when the star appears in it at `found`. The pot sits at (0.75, 0.80) of that frame.
const POOH_START = c('pooh-in') + 3;
const POOH_POT = [0.75, 0.8];
const POOH_H = 0.36;                     // share of the wall height, balloon included

const settleLook = (p, i) => look(p, c('fly') + 1 + 0.3 * i, duration);   // follow the star up to the tree tip
// Connor's walk: the carry clip's time follows the distance walked (star-story.js WALK), so the paws never skate.
const [WALK_AT] = walkSpan(C);
const WALK_EV = { ...act('s07-connor-carry', WALK_AT, c('fly'), true), time: (local) => carryWalk(local, C).clip };
const tracks = {
  gandalf: [talk('gandalf', c('found') + 7, 2.9), settleLook('gandalf', 3), talk('gandalf', c('settle') + 6, 2.8)],
  alaska: [talk('alaska', c('found') + 10, 3.5), settleLook('alaska', 0)],
  orion: [talk('orion', c('carry') + 5, 4.5), settleLook('orion', 2)],
  connor: [
    act('s07-connor-brave', c('carry') + 1, c('carry') + 6),                            // s07-connor-01
    talk('connor', c('carry') + 10, 3.3),                                                // s07-connor-02
    WALK_EV,                                                                             // a few steps toward the tree
    look('connor', c('fly'), duration),                                                  // lifts his head: the star rises
  ],
};

/** Pooh: drifts down from above the wall, bobs on his balloon, holds still while the star is in his pot, floats off. */
function drawPooh(ctx, L, w, h, local, env) {
  const pot = env?.from?.('backdrop', ...RETURN_PATH.pot) || [0.53 + RETURN_PATH.pot[0] * 0.47, RETURN_PATH.pot[1]];
  const enter = easeInOutSine(clamp((local - c('pooh-in') - 0.5) / 5));
  const leave = easeInOutSine(clamp((local - c('carry') - 2) / 7));
  if (enter <= 0 || leave >= 1) return;
  const still = clamp((local - c('found') + 2) / 2) * (1 - clamp((local - c('carry')) / 2));  // no bob while it holds the star
  const bob = (1 - still) * Math.sin(local * 1.3) * 0.012 * h;
  const y = pot[1] * h - (1 - enter) * 0.55 * h - leave * 0.7 * h + bob;
  const x = pot[0] * w + leave * 0.06 * w + (1 - still) * Math.sin(local * 0.7) * 0.004 * w;
  drawPetClip(ctx, { ...L, H: POOH_H * h }, 'pooh', POOH, local - POOH_START, { x, y, anchor: POOH_POT, alpha: enter * (1 - leave) });
}

export default {
  id: 's07-honey-pot',
  title: 's07 · El tarro de miel',
  duration,
  cues,
  story: true,
  zones: ['wall', 'star', ...BOX_ZONES],
  enter() { loadFonts(); preloadTracks(tracks); preloadClips([POOH]); },
  draw(zoneId, ctx, w, h, t, local, env) {
    if (storyTower(zoneId, ctx, w, h, t, local, c('out'), duration)) return;
    const L = zoneId === 'wall' ? stageLayout(env, w, h) : null;
    const unit = L ? L.H * L.k * PET_SIZE.connor : undefined;
    drawReturn(zoneId, ctx, w, h, t, local, env, C, () => {
      drawPooh(ctx, L, w, h, local, env);
      // Connor faces left (toward the tree) all scene, his mouth on the star's path: at PAW, then a few steps
      // toward the tree. Alaska joins the cats on the tower, out of his way.
      const P = (v) => { const q = env?.from?.('backdrop', ...v) || [0.53 + v[0] * 0.47, v[1]]; return [q[0] * w, q[1] * h]; };
      const mouthX = P(RETURN_PATH.paw)[0] - carryWalk(local, C).d * unit;
      const top = (s) => { const [x, y] = L.towerAt(s); return { x, y, flip: true }; };
      drawPets(ctx, L, tracks, local, {
        inAt: c('found') - 4, outAt: c('out'),
        override: {
          connor: { x: mouthX + CONNOR_MOUTH * L.H * L.k * PET_SIZE.connor, flip: true },
          alaska: { ...top(0.1), flip: false },
          orion: top(0.53),
          gandalf: top(0.9),
        },
      });
    }, { unit });
  },
};
