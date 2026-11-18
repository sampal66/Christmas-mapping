// s03 · La estrella se escapa (1:15). The pets decorate (Alaska bossing, Orion grumbling), the narrator tells the
// tradition, Gandalf bats the star, it bounces off the gift tower and escapes into the sky (TREATMENT §04, SCRIPT §03).
// The star's motion is star-story.js's drawEscape; the pets (stage.js) act on the SCRIPT §03 cues around it.
import { cueSheet, loadFonts } from '../fx/index.js';
import { drawEscape } from './star-story.js';
import { stageLayout, drawPets, preloadTracks, talk, look, act } from './stage.js';

const cues = [{ t: 0, name: 'pets-in' }, { t: 15, name: 'tradition' }, { t: 40, name: 'bat' }, { t: 50, name: 'escape' }, { t: 71, name: 'out' }];
const C = cueSheet(cues);
const duration = 75;
const c = C.at;

// Clip timeline per pet (SCRIPT §03: cue + offset, ≈ s = line length). Look-ups hold their last frame.
const lookAll = (p, i) => look(p, c('tradition') + 11 + 0.3 * i, c('tradition') + 17);    // "its light guides Santa"
const tracks = {
  alaska: [
    act('s03-alaska-boss', c('pets-in') + 2, c('pets-in') + 8),                        // s03-alaska-01
    lookAll('alaska', 0),
    act('s03-alaska-nooo', c('bat') + 1, c('bat') + 6),                                  // s03-alaska-02
    look('alaska', c('bat') + 6, c('escape') + 17),
    talk('alaska', c('escape') + 17, 2.9),                                               // s03-alaska-03
  ],
  orion: [
    talk('orion', c('pets-in') + 9, 4.3),                                                // s03-orion-01
    lookAll('orion', 2),
    look('orion', c('bat') + 3, c('escape') + 10),
    talk('orion', c('escape') + 10, 2.8),                                                // s03-orion-02
  ],
  gandalf: [
    lookAll('gandalf', 3),
    // s03-gandalf-01 starts at bat −5.5 on the talk loop; the bat clip's swipe lands 2.5 s in, so it starts at
    // bat −3 and the knock lands on `bat`, where drawEscape knocks the star off the tree.
    talk('gandalf', c('bat') - 5.5, 2.5),
    act('s03-gandalf-bat', c('bat') - 3, c('bat') + 3),
    look('gandalf', c('bat') + 3, c('escape') + 1),
    act('s03-gandalf-oops', c('escape') + 1, c('escape') + 7),                          // s03-gandalf-02
    talk('gandalf', c('escape') + 14, 2.8),                                              // s03-gandalf-03
  ],
  connor: [
    lookAll('connor', 1),
    look('connor', c('bat') + 3, c('escape') + 5),
    talk('connor', c('escape') + 5, 3.4),                                                // s03-connor-01 (opt)
  ],
};

export default {
  id: 's03-star-escapes',
  title: 's03 · La estrella se escapa',
  duration,
  cues,
  story: true,                 // storytelling pace: no beat grid (DESIGN_SYSTEM §06)
  zones: ['wall', 'star'],
  enter() { loadFonts(); preloadTracks(tracks); },
  draw(zoneId, ctx, w, h, t, local, env) {
    drawEscape(zoneId, ctx, w, h, t, local, env, C, () => {
      drawPets(ctx, stageLayout(env, w, h), tracks, local, { inAt: c('pets-in'), outAt: c('out'), outEnd: duration - 0.5 });
    });
  },
};
