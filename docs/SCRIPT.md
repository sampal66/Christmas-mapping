# Script — Christmas Mapping Show (guion)

> Spanish narration and pet dialogue for the ≈12-min show, timed to the scene cues. Stage notes are in English;
> spoken lines are in **neutral Latin American Spanish, "Disney dub" style**. Related: [TREATMENT](TREATMENT.md) ·
> [DESIGN_SYSTEM §08](DESIGN_SYSTEM.md) · [WP-06 brief](work-packages/WP-06-script-voices.md)

| | |
|---|---|
| **Status** | v0.1 draft, for owner review (WP-06) |
| **Last updated** | 2026-11-17 |

---

## 01 · How to read this script

- **Id:** `<scene>-<speaker>-<nn>`. It becomes the audio file name (`s03-alaska-01.m4a`, DESIGN_SYSTEM §09).
- **Cue:** the scene cue the line starts on, plus an offset in seconds (`tradition +0`). Cue times come from
  the scene files; WP-08 places the clips and may nudge offsets by ear.
- **≈ s:** estimated spoken length (≈ 14 characters per second for calm narration, faster for Gandalf and Alaska).
- **🔒 personal:** the line says `{BABY}` (or is spoken by Papá and Mamá). It is **never committed** and never
  generated from this repo: the owner records it, or generates it in the ElevenLabs app with the cast voice and
  the real name typed there. The file goes in the on-device media pack (WP-02).
- **(opt)**: optional line; drop it if the scene feels busy. The script works without it.
- Light-show scenes **s02, s04 and s09 have no speech** (music only). Sfx cues are noted in *italics* for WP-08.
- No barks, meows, whines or squeaks anywhere (DESIGN_SYSTEM §08): the pets **talk**.

## 02 · Cast

| Character | Voice brief (for ElevenLabs voice design) | Model (proposed) |
|---|---|---|
| **Narrador** | Warm, bright storyteller; adult male or female, 40s; neutral Latin American Spanish; calm pace with a smile in the voice; classic Disney Christmas-special feel. | `eleven_multilingual_v2` (steady, consistent across lines) |
| **Gandalf** (Russian Blue, youngest) | Bright, giggly, hyperactive kid; speaks fast, voice cracks with excitement; sweet when sorry. | `eleven_v3` (expressive: [laughs], [excited]) |
| **Alaska** (pomsky) | Fast, bossy young woman, a little diva; crisp diction, theatrical sighs; warm underneath. | `eleven_v3` |
| **Connor** (husky) | Deep, soft, shy gentle giant; slow, hesitant, low volume; proud and fuller in the finale. | `eleven_v3` |
| **Orion** (tabby) | Dry, grumbly middle-aged drawl; deadpan, slow; a secret soft spot. | `eleven_v3` |
| **Pooh** (Shepard cameo) | Gentle, slow, soft-spoken older bear; a little sleepy and kind. One line only. | `eleven_v3` |
| **Mickey** (1928 cameo) | **Whistles only** (*Steamboat Bill*, 1910, PD). No speech. | sfx/whistle, WP-08 |
| **Papá y Mamá** | Their own voices, recorded on the iPad (s08). 🔒 | — |

## 03 · Lines by scene

### s01 · La pared despierta (1:00)
*Music: O Christmas Tree. One line, over the swell; it must end before `cut` (0:42.5).*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s01-narrador-01 🔒 | welcome +0 (0:32) | Narrador | 7 | Bienvenidos a una noche muy especial: la primera Nochebuena de {BABY}. | Welcome to a very special night: {BABY}'s first Christmas Eve. |
| s01-narrador-01b | (alternative, not personal) | Narrador | 7 | Bienvenidos a una noche muy especial: la primera Nochebuena de nuestra pequeña. | …our little one's first Christmas Eve. |

### s02 · El árbol cobra vida (1:24) — no speech

### s03 · La estrella se escapa (1:15)
*Underscore (ElevenLabs). Pets decorate → the tradition → Gandalf bats the star → it escapes. Arcs: Alaska bossy,
Orion grumpy, Gandalf careless → owns it.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s03-alaska-01 | pets-in +2 | Alaska | 5 | ¡A ver, equipo! Las esferas rojas arriba, las doradas abajo… ¡y nadie toca la estrella! | Right, team! Red baubles up top, gold ones below… and nobody touches the star! |
| s03-orion-01 | pets-in +9 | Orion | 3 | Tanto alboroto… por un árbol. Dentro de la casa. | All this fuss… for a tree. Indoors. |
| s03-narrador-01 🔒 | tradition +0 | Narrador | 9 | En esta casa hay una tradición: la estrella siempre la pone el más pequeño de la familia. Y este año, por primera vez, ese honor es de {BABY}. | This house has a tradition: the youngest always places the star. And this year, for the first time, that honour is {BABY}'s. |
| s03-narrador-01b | (alternative, not personal) | Narrador | 8 | En esta casa hay una tradición: la estrella siempre la pone el más pequeño de la familia. Y este año, hay alguien nuevo en casa. | …And this year, there is someone new in the house. |
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
*Silent Nights. The heart. The message is Papá and Mamá's own voices, recorded on the iPad.*

| Id | Cue | Speaker | ≈ s | Línea (ES) | Gloss (EN) |
|---|---|---|---|---|---|
| s08-narrador-01 | gather +3 | Narrador | 7 | Esta noche, la casa entera brilla por alguien muy pequeñito… que llegó este año a llenarla de luz. | Tonight the whole house shines for someone very small… who arrived this year to fill it with light. |
| s08-papas-01 🔒 | message +0 | Papá y Mamá | ≤ 15 | *Suggested:* ¡Feliz primera Navidad, {BABY}! Te amamos con todo el corazón. *(their own words)* | Happy first Christmas, {BABY}! We love you with all our hearts. |
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
| Narrador | 10 (+2 🔒, +2 alternatives) | ≈ 1:08 | ≈ 735 (+ ≈ 230 for the alternatives) |
| Pets + Pooh | 33 (4 optional) | ≈ 1:33 | ≈ 1,280 |
| Papá y Mamá 🔒 | 1 | ≈ 0:15 | recorded, not generated |
| **Total** | | **≈ 2:56** | **≈ 2,000–2,250** |

**Credit estimate** (ElevenLabs bills text-to-speech per character; ≈ 1 credit per character on `eleven_v3` and
`eleven_multilingual_v2`, 0.5 on the Flash/Turbo models):
- Script lines, default 2 takes each: ≈ 2,250 × 2 ≈ **4,500 credits**.
- Voice design for 6 new voices (3 previews each, short sample line): ≈ **1,000–2,000 credits** (or 0 if we pick
  existing library voices instead of designing).
- The 🔒 personal lines are generated by the owner in the ElevenLabs app: ≈ 250 credits.
- **Total ≈ 5,500–7,000 credits** (≈ 5% of one month on Creator). Not started: needs the owner's go-ahead (AGENTS §07).

## 05 · Open questions for the owner

1. Narrator: male or female voice?
2. Keep the 🔒 name lines (s01, s03), or use the non-personal alternatives so everything can be generated here?
3. s08 message: will Papá and Mamá record it themselves (recommended), or should the narrator say it?
4. Design new voices (more character, more credits) or pick existing library voices (cheaper)?

## Changelog
- **2026-11-17** — v0.1: first draft (WP-06): cast, all lines with cues, totals and credit estimate.
