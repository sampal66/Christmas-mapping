// s07 · El tarro de miel (1:15). Pooh floats down on his balloon; the star glows in his honey pot; he hands it down
// and Connor carries it a few steps toward the tree, looks up, and it rises from his mouth to settle above the tree
// tip (TREATMENT §04, SCRIPT §03; short carry: WP-08c).
// The star's motion is star-story.js's drawReturn: Pooh's pot and Connor's mouth are placed on its path.
import { cueSheet, loadFonts, easeInOutSine, clamp } from '../fx/index.js';
import { drawReturn, RETURN_PATH, carryWalk, walkSpan } from './star-story.js';
import { stageLayout, drawPets, drawPetClip, preloadTracks, talk, look, act, CONNOR_MOUTH, PET_SIZE } from './stage.js';
import { preloadClips } from '../fx/clips.js';
import { BOX_ZONES, storyTower, skyBase } from './common.js';
import { stripStarPath, pixelAspect } from '../fx/strip.js';

const cues = [{ t: 0, name: 'pooh-in' }, { t: 15, name: 'found' }, { t: 30, name: 'carry' }, { t: 50, name: 'fly' }, { t: 60, name: 'settle' }, { t: 71, name: 'out' }];
const C = cueSheet(cues);
const duration = 75;
const c = C.at;

const POOH = 's07-pooh-float', POOH_HOLD = 's07-pooh-hold', POOH_WAVE = 's07-pooh-wave';
// Pooh's 10 s clip floats, looks in the pot and holds it out; it starts 3 s in so the pot is held out (its last
// frame) at `found` − 2. Then (WP-14a) the hold loop (balloon bob, kind look down, mouth moving on s07-pooh-01) while
// the star is in his pot, and the wave goodbye as he floats away. Both start on the float clip's last frame; each
// clip's anchor is where the pot is in that clip's first frame, so the pot stays on the star's path through the
// changes.
const POOH_START = c('pooh-in') + 3;
const POOH_POT = { [POOH]: [0.75, 0.8], [POOH_HOLD]: [0.84, 0.786], [POOH_WAVE]: [0.872, 0.801] };
const POOH_CLIPS = [[POOH, POOH_START, false], [POOH_HOLD, c('found') - 2, true], [POOH_WAVE, c('carry') + 1, false]];
const POOH_XFADE = 0.3;
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
  const PL = { ...L, H: POOH_H * h }, alpha = enter * (1 - leave);
  let i = 0;
  while (i + 1 < POOH_CLIPS.length && local >= POOH_CLIPS[i + 1][1]) i++;
  const one = ([id, at, loop], a) => drawPetClip(ctx, PL, 'pooh', id, local - at, { x, y, anchor: POOH_POT[id], alpha: a, loop });
  const k = i > 0 ? clamp((local - POOH_CLIPS[i][1]) / POOH_XFADE) : 1;
  if (k < 1) one(POOH_CLIPS[i - 1], alpha * (1 - k));
  // a clip that hasn't loaded yet keeps the previous one on screen rather than leaving a gap
  if (!one(POOH_CLIPS[i], alpha * k) && i > 0 && k >= 1) one(POOH_CLIPS[i - 1], alpha);
}

export default {
  id: 's07-honey-pot',
  title: 's07 · El tarro de miel',
  duration,
  cues,
  story: true,
  zones: ['wall', 'star', ...BOX_ZONES, 'rightStrip'],
  enter() { loadFonts(); preloadTracks(tracks); preloadClips([POOH, POOH_HOLD, POOH_WAVE]); },
  draw(zoneId, ctx, w, h, t, local, env) {
    if (storyTower(zoneId, ctx, w, h, t, local, c('out'), duration)) return;
    if (zoneId === 'rightStrip') {
      // WP-13a: the star's path home lights up round the corner while it is found and carried, then guides it in.
      skyBase(zoneId, ctx, w, h, t);
      const a = easeInOutSine(clamp((local - c('found')) / 3)) * (1 - easeInOutSine(clamp((local - c('settle') - 4) / (c('out') - c('settle') - 4))));
      stripStarPath(ctx, w, h, t, { alpha: a, fill: clamp((local - c('found') - 3) / (c('fly') - c('found') - 3)), k: pixelAspect(env, w, h) });
      return;
    }
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
          gandalf: top(0.86),                                // the look-loop's tail swings wider than the look-up's
        },
      });
    }, { unit });
  },
};
