# Script — Christmas Mapping Show (guion)

> Spanish narration and pet dialogue for the ≈12-min show, timed to the scene cues. Stage notes are in English;
> spoken lines are in **neutral Latin American Spanish, "Disney dub" style**. Related: [TREATMENT](TREATMENT.md) ·
> [DESIGN_SYSTEM §08](DESIGN_SYSTEM.md) · [WP-06 brief](work-packages/WP-06-script-voices.md)

| | |
|---|---|
| **Status** | v1.0 **approved by the owner** (2026-11-17); all lines generated, takes in review |
| **Last updated** | 2026-11-17 |

---

## 01 · How to read this script

- **Id:** `<scene>-<speaker>-<nn>`. It becomes the audio file name (`s03-alaska-01.m4a`, DESIGN_SYSTEM §09).
- **Cue:** the scene cue the line starts on, plus an offset in seconds (`tradition +0`). Cue times come from
  the scene files; WP-08 places the clips and may nudge offsets by ear.
- **≈ s:** estimated spoken length (≈ 14 characters per second for calm narration, faster for Gandalf and Alaska).
- **🔒 personal:** the line says `{BABY}`. The text here keeps the placeholder; the **real name is typed only at
  generation time** in ElevenLabs (owner decision 2026-11-17: the name is the show's personal signature and may be
  spoken in the audio). The audio file is **never committed**: it goes in the on-device media pack (WP-02).
- **(opt)**: optional line; drop it if the scene feels busy. The script works without it.
- Light-show scenes **s02, s04 and s09 have no speech** (music only). Sfx cues are noted in *italics* for WP-08.
- No barks, meows, whines or squeaks anywhere (DESIGN_SYSTEM §08): the pets **talk**.

## 02 · Cast

| Character | Voice brief (for ElevenLabs voice design) | Model (proposed) |
|---|---|---|
| **Narrador** | Warm, bright storyteller; **adult male** (owner), 40s; neutral Latin American Spanish; calm pace with a smile in the voice; classic Disney Christmas-special feel. | `eleven_multilingual_v2` (steady, consistent across lines) |
| **Gandalf** (Russian Blue, youngest) | Bright, giggly, hyperactive kid; speaks fast, voice cracks with excitement; sweet when sorry. | `eleven_v3` (expressive: [laughs], [excited]) |
| **Alaska** (pomsky) | Fast, bossy young woman, a little diva; crisp diction, theatrical sighs; warm underneath. | `eleven_v3` |
| **Connor** (husky) | Deep, soft, shy gentle giant; slow, hesitant, low volume; proud and fuller in the finale. | `eleven_v3` |
| **Orion** (tabby) | Dry, grumbly middle-aged drawl; deadpan, slow; a secret soft spot. | `eleven_v3` |
| **Pooh** (Shepard cameo) | Gentle, slow, soft-spoken older bear; a little sleepy and kind. One line only. | `eleven_v3` |
| **Mickey** (1928 cameo) | **Whistles only** (*Steamboat Bill*, 1910, PD). No speech. | sfx/whistle, WP-08 |

### Saved voices (ElevenLabs, owner picks 2026-11-17)

| Character | Voice name | voice_id |
|---|---|---|
| Narrador | CMS Narrador | `UKWT6S1zRc7tA6fyWocR` |
| Gandalf | CMS Gandalf | `LWrHIVDJIHq8VRsGKrWC` |
| Alaska | CMS Alaska | `bRPGMW3bLmeZxmFVnuaA` |
| Connor | CMS Connor | `C241plScZxHDNe72ZOXT` |
| Orion | CMS Orion | `5pC8wi2ibUVfMORndBWM` |
| Pooh | CMS Pooh | `TAyICBNyjxfszzKuFMaC` |

**Accent rule (owner):** neutral Latin American Spanish with no regional accent, like Mexican film dubbing. Never a
Castilian (Spain) accent. Generation uses `eleven_v4` with a `[neutral Mexican Spanish accent]` tag at the start of each line,
plus an emotion tag where the line needs one. Re-take any line that sounds Castilian.

**Generated (2026-11-17):** every line, 2 takes each (A/B), on the ElevenLabs flow "CMS WP-06 voices"
(id `dn8qdkhzXGF04J2wbJVl`; it keeps all takes, so they can be downloaded again). `s10-todos-01` is four separate
"¡Feliz Navidad!" clips (Gandalf, Alaska, Connor, Orion) that WP-08 layers. Cost ≈ 9,100 credits (accent test
≈ 1,400 + lines ≈ 7,700) plus 7 voice-design rounds. **Audio is not committed**; the 🔒 lines contain the real name
and go in the on-device media pack only. **Picked takes (owner, 2026-11-17): take A for every line; the optional (opt) lines are kept.**

## 03 · Lines by scene

### s01 · La pared despierta (1:00)
*Music: O Christmas Tree. One line, over the swell; it must end before `cut` (0:42.5).*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s01-narrador-01 🔒 | welcome +0 (0:32) | Narrador | 7 | Bienvenidos a una noche muy especial: la primera Nochebuena de {BABY}. | Welcome to a very special night: {BABY}'s first Christmas Eve. |

### s02 · El árbol cobra vida (1:24) — no speech

### s03 · La estrella se escapa (1:15)
*Underscore (ElevenLabs). Pets decorate → the tradition → Gandalf bats the star → it escapes. Arcs: Alaska bossy,
Orion grumpy, Gandalf careless → owns it.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s03-alaska-01 | pets-in +2 | Alaska | 5 | ¡A ver, equipo! Las esferas rojas arriba, las doradas abajo… ¡y nadie toca la estrella! | Right, team! Red baubles up top, gold ones below… and nobody touches the star! |
| s03-orion-01 | pets-in +9 | Orion | 3 | Tanto alboroto… por un árbol. Dentro de la casa. | All this fuss… for a tree. Indoors. |
| s03-narrador-01 🔒 | tradition +0 | Narrador | 9 | En esta casa hay una tradición: la estrella siempre la pone el más pequeño de la familia. Y este año, por primera vez, ese honor es de {BABY}. | This house has a tradition: the youngest always places the star. And this year, for the first time, that honour is {BABY}'s. |
| s03-narrador-02 | tradition +11 | Narrador | 7 | Dicen que su luz es la que guía a Santa hasta aquí… así que esta noche, esa estrella tiene que brillar. | They say its light guides Santa here… so tonight, that star has to shine. |
| s03-gandalf-01 | bat −4 | Gandalf | 3 | ¡Uy, qué brillante! ¡Es una pelotita! ¡Mía, mía, mía! | Ooh, shiny! It's a little ball! Mine, mine, mine! |
| s03-alaska-02 | bat +1 | Alaska | 2 | ¡Gandalf, nooo! | Gandalf, nooo! |
| s03-gandalf-02 | escape +1 | Gandalf | 2 | Ups… ¿eso fue culpa mía? | Oops… was that my fault? |
| s03-connor-01 (opt) | escape +5 | Connor | 3 | Se fue… muy, muy lejos. | It's gone… really, really far. |
| s03-orion-02 | escape +10 | Orion | 3 | Pues sin estrella… no hay Santa. | Well, no star… no Santa. |
| s03-gandalf-03 | escape +14 | Gandalf | 2.5 | ¡Yo la traigo de vuelta! ¡Lo prometo! | I'll bring it back! I promise! |
| s03-alaska-03 | escape +17 | Alaska | 2 | ¡Plan de búsqueda! ¡Primero, las cajas! | Search plan! The boxes first! |

### s04 · Cajas mágicas (1:15) — no speech
*Alaska's plan plays out as a light show; the star isn't in the boxes.*

### s05 · ¿Dónde está la estrella? (1:00)
*Underscore. Alaska regroups; a soft jingle spooks Connor; Mickey's old film whistles the clue. Arcs: Connor's fear,
Alaska listens.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s05-alaska-01 | regroup +1 | Alaska | 4 | Bien. Las cajas: nada. Pero tranquilos, ¡tengo otro plan! | OK. The boxes: nothing. But relax, I have another plan! |
| s05-orion-01 | regroup +6 | Orion | 2.5 | ¿Otro? Despiértenme cuando termine. | Another one? Wake me up when it's over. |
| s05-narrador-01 | regroup +10 | Narrador | 4 | Pero esa noche, el aire guardaba pistas… para quien supiera escuchar. | But that night, the air held clues… for anyone who knew how to listen. |
| — | jingle +0 | *sfx* | 2 | *soft, distant jingle bells (no sharp attack)* | |
| s05-connor-01 | jingle +2 | Connor | 4 | ¡Ay! ¿Qué fue eso? Yo… yo me quedo aquí atrás, ¿sí? | Ah! What was that? I'll… I'll just stay back here, OK? |
| s05-gandalf-01 | jingle +7 | Gandalf | 3 | ¡Cascabeles! ¡Son de Santa! ¡Ya viene en camino! | Bells! They're Santa's! He's on his way! |
| s05-alaska-02 | jingle +11 | Alaska | 2.5 | ¡Entonces no hay tiempo! ¿Dónde puede estar? | Then there's no time! Where can it be? |
| — | mickey-in +0 | *Mickey whistle* | 8 | *Steamboat Bill, whistled; Mickey points up at the end* | |
| s05-narrador-02 | mickey-in +10 | Narrador | 4.5 | Cuando algo se pierde en el cielo… hay que seguir a las estrellas. | When something is lost in the sky… you follow the stars. |
| s05-alaska-03 | mickey-out +2 | Alaska | 4 | Bueno… esta vez no es mi plan, pero es bueno. ¡Sigamos a las estrellas! | Well… it's not my plan this time, but it's a good one. Let's follow the stars! |
| s05-orion-02 (opt) | mickey-out +7 | Orion | 1.5 | Estrellas. Qué original. | Stars. How original. |

### s06 · Constelaciones (1:30)
*Waltz of the Flowers. One narrator line on the quiet intro; the pet reactions are short and sit on gentle
moments (the music is not ducked much here).*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s06-narrador-01 | sky +0.5 | Narrador | 6.5 | Y entonces, toda la noche se abrió sobre ellos… y las estrellas empezaron a dibujar historias. | And then the whole night opened above them… and the stars began to draw stories. |
| s06-orion-01 | orion +8 | Orion | 3 | Ese de ahí… se parece a mí. [*a rare smile*] | That one there… looks like me. |
| s06-alaska-01 (opt) | canis +6 | Alaska | 2 | ¿Canis… *Menor*? ¿Perdón? | Canis… *Minor*? Excuse me? |
| s06-gandalf-01 (opt) | felis +3 | Gandalf | 2 | ¡Un gato! ¡Ese soy yo! | A cat! That's me! |
| s06-gandalf-02 | glint +1 | Gandalf | 3 | ¡Ahí está! ¡Junto a la Estrella Polar! ¡Síganme! | There it is! By the North Star! Follow me! |

### s07 · El tarro de miel (1:15)
*Underscore + soft sleigh bells. Pooh hands the star down; Connor carries it home past the bells. Arcs: Connor
brave, Orion secretly helps, Alaska shares the lead.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s07-narrador-01 | pooh-in +2 | Narrador | 6.5 | Allá arriba, un osito flotaba con su globo, buscando miel… y encontró algo mucho más dulce. | Up there, a little bear floated with his balloon, looking for honey… and found something much sweeter. |
| s07-pooh-01 | found +1 | Pooh | 5 | Oh, cielos… esto no es miel. Pero creo que es de ustedes. | Oh, bother… this isn't honey. But I think it's yours. |
| s07-gandalf-01 | found +7 | Gandalf | 2 | ¡La estrella! ¡Gracias, osito! | The star! Thank you, little bear! |
| s07-alaska-01 | found +10 | Alaska | 3 | Connor, tú eres el más grande. ¡Llévala tú! | Connor, you're the biggest. You carry it! |
| s07-connor-01 | carry +1 | Connor | 3 | ¿Yo? Pero… esos cascabeles… | Me? But… those bells… |
| s07-orion-01 | carry +5 | Orion | 3.5 | Tranquilo, grandote. Son los de Santa. Vienen por nosotros. | Easy, big guy. They're Santa's. They're coming for us. |
| s07-connor-02 | carry +10 | Connor | 2.5 | Está bien… ¡yo puedo! ¡Yo la llevo! | OK… I can do it! I'll carry it! |
| s07-narrador-02 | settle +1 | Narrador | 3.5 | Y la estrella volvió a casa… justo a tiempo. | And the star came home… just in time. |
| s07-gandalf-02 | settle +6 | Gandalf | 2 | ¡Lo logramos! ¡Todos juntos! | We did it! All together! |

### s08 · Para ti, `{BABY}` (1:00)
*Silent Nights. The heart. The narrator speaks the message (owner decision).*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s08-narrador-01 | gather +3 | Narrador | 7 | Esta noche, la casa entera brilla por alguien muy pequeñito… que llegó este año a llenarla de luz. | Tonight the whole house shines for someone very small… who arrived this year to fill it with light. |
| s08-narrador-03 🔒 | message +0 | Narrador | 7 | ¡Feliz primera Navidad, {BABY}! Toda tu familia te quiere… con todo el corazón. | Happy first Christmas, {BABY}! Your whole family loves you… with all its heart. |
| s08-narrador-02 | missing +0 | Narrador | 5 | Ya casi todo está listo… solo falta una cosa: la estrella de verdad. | Almost everything is ready… only one thing is missing: the real star. |
| s08-gandalf-01 | missing +6 | Gandalf | 2.5 | *(softly)* Toma, chiquita. Esta te toca a ti. | Here, little one. This one's yours. |

### s09 · La estrella de verdad (live hold) — no speech

### s10 · Gran final (1:56)
*Jingle Bells. Short, happy lines on the sleigh pass and the wave; the narrator closes on the family constellation.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s10-gandalf-01 | sleigh +1 | Gandalf | 2.5 | ¡Miren! ¡Es Santa! ¡Vio la estrella! | Look! It's Santa! He saw the star! |
| s10-connor-01 | sleigh +5 | Connor | 2 | ¡Y esta vez… no me asusté! | And this time… I wasn't scared! |
| s10-alaska-01 | wave +0 | Alaska | 3.5 | ¡Todos en fila! A la una, a las dos, y… | Everyone in line! One, two, and… |
| s10-todos-01 | wave +3.5 | Gandalf, Alaska, Connor, Orion | 1.5 | ¡Feliz Navidad! | Merry Christmas! |
| s10-orion-01 | wave +6 | Orion | 3 | …Bueno. Admito que esto sí valió la pena. | …Fine. I admit this was worth it. |
| s10-narrador-01 | family-constellation +1 | Narrador | 6 | Porque las estrellas más bonitas no están en el cielo… están aquí, juntas, en familia. | Because the most beautiful stars aren't in the sky… they're right here, together, as a family. |
| s10-narrador-02 | title +0.5 | Narrador | 2 | ¡Feliz Navidad! | Merry Christmas! |

## 04 · Totals and credit estimate

| | Lines | Speech | Characters (generated) |
|---|---|---|---|
| Narrador | 13 (3 🔒) | ≈ 1:15 | ≈ 1,000 |
| Pets + Pooh | 33 (4 optional) | ≈ 1:33 | ≈ 1,280 |
| **Total** | 46 | **≈ 2:48** | **≈ 2,300** |

**Credit estimate** (ElevenLabs bills text-to-speech per character; ≈ 1 credit per character on `eleven_v3` and
`eleven_multilingual_v2`, 0.5 on the Flash/Turbo models):
- Script lines (🔒 included), default 2 takes each: ≈ 2,300 × 2 ≈ **4,600 credits**.
- Voice design for 6 new voices (3 previews each, short sample line): ≈ **1,000–2,000 credits** (or 0 if we pick
  existing library voices instead of designing).
- **Total ≈ 5,600–6,600 credits** (≈ 5% of one month on Creator). Not started: needs the owner's go-ahead (AGENTS §07).

## 05 · Owner decisions and open items

| Topic | Decision (2026-11-17) |
|---|---|
| Narrator | Male. |
| Name lines (s01, s03, s08) | Spoken with the real name; the name is typed only at generation time, never written in the repo. |
| s08 message | Said by the narrator (not recorded by Papá and Mamá). |
| Script | **Approved** as v1.0. |
| Generation | Custom voices designed and picked; all lines generated (2 takes). Owner picks takes. |

Open: exporting the A takes as `<id>.m4a` for the media pack (WP-08).

## 06 · Sound effects (planned, not generated)

Music is done (WP-05: USAF Band recordings + ElevenLabs underscores and Sugar Plum). The sound effects below are
not generated yet: their exact timing depends on the character clips (WP-04), so they are made and placed in
**WP-08**. All soft, with gentle attacks; never bangs, barks, meows, whines, doorbells or squeaky toys (DESIGN_SYSTEM §08).

| Id | Scene · cue | Sound | ≈ s |
|---|---|---|---|
| s03-sfx-sparkle | s03 · pets-in | soft twinkle as the pets hang ornaments | 2 |
| s03-sfx-boing | s03 · bat | soft cartoon "boing" as Gandalf bats the star | 1 |
| s03-sfx-whoosh | s03 · escape | magic whoosh with a shimmer tail as the star flies away | 3 |
| s04-sfx-boxopen | s04 · box1-open, box2-open | sparkle burst as a box lid opens (used twice) | 2 |
| s04-sfx-spring | s04 · box2-open | gentle jack-in-the-box spring | 1 |
| s05-sfx-jingle | s05 · jingle | soft, distant jingle bells, no sharp attack | 2 |
| s05-sfx-whistle | s05 · mickey-in | whistled *Steamboat Bill* (1910, PD) phrase, old-film tone | 8 |
| s05-sfx-projector | s05 · mickey-in → mickey-out | very quiet old film-projector purr under Mickey's clip | 15 |
| s07-sfx-chime | s07 · found | warm discovery chime | 2 |
| s07-sfx-sleighbells | s07 · carry | soft sleigh bells approaching and passing | 15 |
| s07-sfx-whoosh | s07 · fly | rising magic whoosh as the star flies up | 3 |
| s07-sfx-settle | s07 · settle | soft glowing chime as the star settles | 2 |
| s10-sfx-sleigh | s10 · sleigh | sleigh bells crossing left → right under the music | 6 |

Fireworks (s10) stay visual only, with at most a soft musical swell. Estimate ≈ 1.5–3k credits (1 take each,
plus a music-model take for the whistle if the sound-effects model can't carry the tune).

## Changelog
- **2026-11-17** — v1.3: owner picked take A for all lines, optional lines kept; §06 planned sound effects (WP-08).
- **2026-11-17** — v1.2: all lines generated (eleven_v4, 2 takes); flow id, cost, take-pick rule.
- **2026-11-17** — v1.1: saved voice ids, accent rule (neutral Latin American, Mexican-dub style; never Castilian).
- **2026-11-17** — v1.0: owner approved the script.
- **2026-11-17** — v0.2: owner decisions (male narrator, name lines spoken, narrator says the s08 message); alternatives dropped; totals re-counted.
- **2026-11-17** — v0.1: first draft (WP-06): cast, all lines with cues, totals and credit estimate.
