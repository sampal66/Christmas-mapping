# Asset credits and licences

Every third-party or downloaded asset must be listed here before it is committed (see docs/AGENTS.md §06).

| File | Source (URL) | Author / performer | Licence | Notes |
|---|---|---|---|---|
| `app/fonts/mountains-of-christmas-latin-700-normal.woff2` | Google Fonts via npm `@fontsource/mountains-of-christmas` 5.3.0 | Tart Workshop | Apache License 2.0 (`app/fonts/LICENSE-MountainsOfChristmas-Apache.txt`) | title cards |
| `app/fonts/playfair-display-latin-400-italic.woff2`, `…-400-normal.woff2` | Google Fonts via npm `@fontsource/playfair-display` 5.3.0 | Claus Eggers Sørensen | SIL Open Font License 1.1 (`app/fonts/LICENSE-PlayfairDisplay-OFL.txt`) | names and captions |
| `app/assets/atlas/orion.png`, `canisMajor.png`, `canisMinor.png`, `felis.png` | Sidney Hall, *Urania's Mirror; or, a View of the Heavens* (1824): plates *Orion*, *Canis Major, Lepus, Columba Noachi & Cela Sculptoris*, *Monoceros, Canis Minor, and Atelier Typographique*, and *Noctua, Corvus, Crater, Sextans Uraniæ, Hydra, Felis, …*. Wikimedia Commons, `File:Sidney Hall - Urania's Mirror - <plate>.jpg`, standard thumbnails (960–3840 px) | Sidney Hall (engraver), after Jamieson | Public domain (published 1824; Commons tag "Public domain") | Derived (WP-11b): each figure cut out along a hand-traced outline. The engraved lines became soft white-on-transparent alpha (local darkening, no hard threshold) plus a faint body tone; the hand colouring was dropped. 800 px long side. Replaces the earlier Jamieson (1822) plate crops (owner: distorted, coordinate grid). Star positions in `app/js/fx/constellations.js` were read off the cards; the cards mark no stars on Felis, so its figure is fitted to the cat. |

## Characters (WP-04) — original, generated for this show

All characters are original designs (the four pets) made with ElevenLabs Flows (flow "Christmas mapping – WP-04
characters"; style anchor: Gandalf #4 from flow "Christmas mapping – style test (Gandalf)"). Generated 2026-11-18 for
this show, owned by the account holder under the ElevenLabs plan terms. No third-party character designs.

| File | Model | What | Notes |
|---|---|---|---|
| `assets/characters/connor/model-sheet.jpg`, `alaska/…`, `orion/…` | gpt-image-2.5-sunburst | model sheets (owner picks: Connor take 2, Alaska 1, Orion 1) | 4 takes each, ≈ 760 credits each |
| `assets/characters/gandalf/style-ref.jpg` | gpt-image-2.5-sunburst | style test still #4 (TREATMENT §09) | style anchor |
| `app/assets/clips/s04-*.mp4` | start frame gpt-image-2.5-sunburst → kling-2.5-turbo image-to-video, 5 s | s04 rummaging shots (WP-04 brief) | prepped with `tools/clip-prep.sh` |
| `assets/characters/<pet>/start-standing.jpg`, `santa/start-sleigh.jpg` | gpt-image-2.5-sunburst, text-only | WP-04b start frames (owner picks: Connor 3, Alaska 2, Orion 3, Gandalf 1, Santa 1) | 4 takes each, 190 credits per take |
| `app/assets/clips/pet-*.mp4`, `s03-*`, `s05-*`, `s07-*`, `s08-*`, `s10-*`, `s04-alaska-tail.mp4` | start frame → kling-2.5-turbo image-to-video, 5 s (2,121 credits each); `s07-pooh-float` 10 s (4,242) | WP-04b story acting clips + Alaska tail + Santa sleigh | prepped with `tools/clip-prep.sh`. Santa, sleigh and reindeer are an original design |
| `assets/characters/<pet>/start-lookloop.jpg`, `connor/start-peek.jpg`, `pooh/start-hold.jpg` | last frames of our own WP-04b clips (`pet-<pet>-lookup`, `s05-connor-hide`, `s07-pooh-float`), extracted with ffmpeg | WP-14a start frames | our own generated art |
| `app/assets/clips/pet-*-lookloop.mp4`, `s03-gandalf-ready`, `s05-connor-peek`, `s05-orion-yawn`, `s07-pooh-hold`, `s07-pooh-wave`, `s10-santa-goodnight`, `s10-santa-swoop` | start frame → kling-2.5-turbo image-to-video, 5 s (2,121 credits each); `s10-santa-swoop` 10 s (4,242) | WP-14a story clips round 2 (25,452 credits) | prepped with `tools/clip-prep.sh`; `s03-gandalf-ready` had its top 116 px cut before prep to drop a glint Kling drew |
| `app/assets/clips/s07-pooh-float.mp4` | same chain; start frame (Pooh take 2) prompted as a generic 1920s storybook teddy bear (pencil and watercolour, no clothes) | Pooh cameo, after E.H. Shepard's public-domain 1926 book style (allowed cameo, AGENTS §06) | the provider blocked prompts that named the artist or the 1928 mouse film: no Mickey clip exists |

## Public-domain characters (WP-14b) — generated for this show in the original book look

Allowed cameos (AGENTS §06, owner 2026-11-19). Each is a fresh generated drawing (ElevenLabs flow `63DYIGTm4n0F8ectFnlO`,
gpt-image-2.5-sunburst start frame, 2 takes, owner pick → kling-2.5-turbo 5 s), never a studio design. No names on screen.

| File | Character | Public-domain basis | Notes |
|---|---|---|---|
| `assets/characters/nutcracker/start-standing.jpg`, `app/assets/clips/s04-nutcracker-march.mp4` | Nutcracker soldier (take 1) | E.T.A. Hoffmann, *Nussknacker und Mausekönig* (1816); Tchaikovsky's ballet (1892) | original design (red coat, tall hat, wooden jaw); not any film or ballet production's design |
| `assets/characters/velveteen/start-standing.jpg`, `app/assets/clips/s08-velveteen-rabbit.mp4` | The Velveteen Rabbit (take 2) | Margery Williams, illustrated by William Nicholson (1922): US public domain since 1998 | worn plush toy after the 1922 book look |
| `assets/characters/gingerbread/start-standing.jpg`, `app/assets/clips/s04-gingerbread-run.mp4` | The Gingerbread Man (take 1) | American folk tale, *St. Nicholas Magazine* (1875) | generic iced cookie |
| `assets/characters/rabbit/start-standing.jpg`, `app/assets/clips/s10-rabbit-wave.mp4` | small rabbit in a blue jacket (take 2) | after Beatrix Potter's *The Tale of Peter Rabbit* (1902): public domain (US, and UK/EU since 2014) | prompt describes him without naming him or the author; never named on screen; the name may still be a trademark |

## Music (WP-05) — kept on the device, not committed

Recordings are **not in the repo** (size); the ElevenLabs originals were sent to the owner in the WP-05 session; the owner downloads the others from the links below (original file, from a home
connection) and assembles `master-mix`. **Update (WP-08b, 2026-11-18):** `master-mix.m4a` was rendered in the cloud instead; the five Commons recordings came from Commons' own Ogg Vorbis transcodes (`upload.wikimedia.org/wikipedia/commons/transcoded/…/<file>.ogg`, 112 kbps: the original MP3s returned HTTP 429), same recordings and licence. "Check" lists the loudest sudden jumps found by the analysis script (10 ms
level vs the previous 0.5 s): the owner must listen there for drum/cymbal hits (DESIGN_SYSTEM §08) before final approval.

| Scene | Recording (Wikimedia Commons file page) | Performer | Licence evidence | Length · tempo | Excerpt used | Check (impulsive sounds) |
|---|---|---|---|---|---|---|
| s01 | [O Christmas Tree - Airmen of Note - United States Air Force Band.mp3](https://commons.wikimedia.org/wiki/File:O_Christmas_Tree_-_Airmen_of_Note_-_United_States_Air_Force_Band.mp3) | USAF Band, Airmen of Note (jazz big band, instrumental) | PD: US federal government work (USAF); composition trad. PD | 5:47 · 152 bpm swing 4/4 | 0:00–1:00, fade 0:56–1:00 | **jazz drum kit**: jumps at 0:07 (+14 dB); listen to 0:00–1:00 |
| s02 | [Carol of the Bells - Concert Band - United States Air Force Band of the Rockies.mp3](https://commons.wikimedia.org/wiki/File:Carol_of_the_Bells_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3) | USAF Band of the Rockies, Concert Band (1993), via music.af.mil Public Domain Music | PD: US federal government work; Leontovych (d. 1921) PD | 2:45 · ≈130 bpm 3/4 | 0:00–1:24 (section ends 1:22) | jumps at 0:30 (+11 dB), 0:54 (+10 dB): likely tutti entrances; listen |
| s04 | `s04-sugar-plum.mp3`: original celesta/music-box arrangement of *Dance of the Sugar Plum Fairy* (Tchaikovsky 1892, PD composition) | ElevenLabs Music v2.5, generated 2026-11-17 for this show (flow "Christmas show — WP-05 music"), 1 take; original recording, owned by the account holder under the ElevenLabs plan terms | original + PD composition | 1:15 · ≈72 bpm 2/4 | whole piece | jumps of +18 dB at 0:14, 0:21, 0:34, 0:41 are plucked notes after rests (sparse texture, −17.6 LUFS); listen |
| s06 | [Waltz of the Flowers - Concert Band - United States Air Force Band.mp3](https://commons.wikimedia.org/wiki/File:Waltz_of_the_Flowers_-_Concert_Band_-_United_States_Air_Force_Band.mp3) | USAF Band, Concert Band, arr. Lawrence Odom (1996), via music.af.mil | PD: US federal government work; Tchaikovsky (d. 1893) PD | 7:30 · ≈176 bpm 3/4 (bars ≈59/min) | 1:28.94–2:58.94 (main waltz theme → tutti → peak) | jumps at 0:48, 1:09 are outside the excerpt; inside: tutti at 2:00, peak 2:33 |
| s08 | [Silent Nights - Concert Band - United States Air Force Band of the Rockies.mp3](https://commons.wikimedia.org/wiki/File:Silent_Nights_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3) | USAF Band of the Rockies, Concert Band | PD: US federal government work (Commons tag; verify on the file page); Gruber 1818 PD | 2:42 · ≈78 bpm | 1:00 to pick by ear (narration on top) | soft; no jumps > 9 dB inside the piece |
| s10 | [Jingle Bells (2020) - Starlifter and Roots in Blue - United States Air Force Band of Mid-America.mp3](https://commons.wikimedia.org/wiki/File:Jingle_Bells_(2020)_-_Starlifter_and_Roots_in_Blue_-_United_States_Air_Force_Band_of_Mid-America.mp3) | USAF Band of Mid-America, Starlifter + Roots in Blue (2020), via music.af.mil | PD: US federal government work; Pierpont 1857 PD | 2:13 file, music ends ≈1:51 · 159 bpm 4/4 | whole track 0:00–1:56 | **pop band, drum kit, loud master (−12 LUFS)**: jumps 0:45, 1:04, 1:31 (+10 dB); needs owner OK |
| s00/s09 | `s00-s09-musicbox-loop.mp3`: music-box *O Tannenbaum* (trad., PD composition) | ElevenLabs Music v2.5, generated 2026-11-17 for this show (flow "Christmas show — WP-05 music"), 1 take; original recording, owned by the account holder under the ElevenLabs plan terms | original | 0:24 · exactly 90 bpm 3/4 (first downbeat 1.64 s) | s09: file 1.64–23.64; hold loops file 9.64–21.64; s00: whole file on repeat | soft (−18.8 LUFS, peak −6 dB); check the loop seam by ear |
| s03/s05/s07 | `s03-underscore.mp3` (1:15, whimsical → wonder), `s05-underscore.mp3` (1:00, tiptoe comedy), `s07-underscore.mp3` (1:15, tender → swell) | ElevenLabs Music v2.5, generated 2026-11-17 for this show (flow "Christmas show — WP-05 music"), 1 take; original recording, owned by the account holder under the ElevenLabs plan terms | original | 100 / 90 / 80 bpm (prompted) | whole pieces | s05 has plucked notes after rests (+15–18 dB, but quiet overall: −21.5 LUFS); s07 is the loudest (−13.5 LUFS): duck under dialogue |

Alternatives checked: *Carol of the Bells, Ukrainian* (USAF Heritage of America Band, 2:24, 162 bpm, PD); *P.I. Tchaikovsky's
Waltz of the Flowers* (US Army Band c. 2019, PD, very quiet master −31 LUFS); *We Wish You a Merry Christmas* (2020,
Starlifter, 136 bpm 3/4, PD); *Joy to the World* (USAF Concert Band, 0:31, PD); *U.S. Army Band - O Tannenbaum* is the
**Army Chorus** (sung, rejected: it would clash with narration).

## Voices and sound effects (WP-06)

Generated 2026-11-17 for this show; original recordings, owned by the account holder under the ElevenLabs plan terms.
**Not in the repo.** Lines that say the baby's name are personal and live only in the on-device media pack.

| Asset | Source | Licence | Notes |
|---|---|---|---|
| Narration + pet dialogue: 46 lines, `<line-id>.mp3` (ids in `docs/SCRIPT.md` §03), take A | ElevenLabs `eleven_v4`, 6 custom designed voices (`eleven_ttv_v3`; ids in SCRIPT §02), flow "CMS WP-06 voices" | original | all takes stay in the flow; accent: neutral Latin American. Take A = the earlier-created generation of each node's pair (matches every SCRIPT §03 length). `s10-todos-01` = the four clips layered (offsets 0/40/60/120 ms) by WP-08b |
| 12 sound effects, `<scene>-sfx-<name>.mp3` (SCRIPT §06) | ElevenLabs Sound Effects v2, flow "CMS WP-06 sound effects", 1 take each | original | soft attacks; projector is a seamless 10 s loop |
| `s05-sfx-whistle.mp3`: jaunty 1920s-style whistled tune, 8 s | ElevenLabs Music v2.5, same flow, 1 take | original (not *Steamboat Bill*; an original melody in that style) | for Mickey's old-film moment |
| `s04-box-chaos.mp3`: joyful chaotic cartoon-orchestra romp, 75 s, 132 bpm 4/4 (replaces `s04-sugar-plum.mp3` in the mix) | ElevenLabs Music v2.5, flow "CMS WP-06 sound effects", 1 take | original | sections: tiptoe → burst 0:15 → bigger 0:26 → quiet 0:44 → finale 0:57 → last chord 1:11; level −21…−13 dB RMS, max rise 6.8 dB/s (no hits) |
| `s09-hold-bells.mp3`: warm bell "magic train" cue, 32 s, 120 bpm 4/4 (replaces the music box in s09; s00 keeps it) | ElevenLabs Music v2.5, same flow, 1 take | original (in that spirit; no film melody) | scene 0 = file 7.97 s; loop file 15.97–27.97 s (6 bars, 1 dB seam) |
| `s04-sfx-rummage` (12 s loop), `s04-sfx-tumble`, `s04-sfx-wobble`, `s04-sfx-flurry` | ElevenLabs Sound Effects v2, same flow, 1 take each | original | soft box-search layers for s04 (SCRIPT §06) |

## Star-swarm portraits (2026-11-18)

| File | Source | Licence | Notes |
|---|---|---|---|
| `app/js/fx/pet-portraits.js` | derived from `assets/characters/<pet>/start-standing.jpg` (our own generated art, above) by `tools/portrait.js` | as the source art | light points only |
| `app/js/scenes/family-portrait.js` | derived from one family photo supplied by the owner (not in the repo) by `tools/portrait.js` | owner's own; published at the owner's request (2026-11-18) | light points only; the photo was processed in a scratch folder and not kept |

## Changelog
- **2026-11-19** — WP-14b: four public-domain characters (start frames + clips) with their sources.
- **2026-11-19** — WP-14a: 11 clips and 6 last-frame start images.
- **2026-11-18** — WP-08b: music sourced from Commons Ogg transcodes for the cloud master mix; take-A rule and `s10-todos-01` layering noted.
