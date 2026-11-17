# Asset credits and licences

Every third-party or downloaded asset must be listed here before it is committed (see docs/AGENTS.md §06).

| File | Source (URL) | Author / performer | Licence | Notes |
|---|---|---|---|---|
| `app/fonts/mountains-of-christmas-latin-700-normal.woff2` | Google Fonts via npm `@fontsource/mountains-of-christmas` 5.3.0 | Tart Workshop | Apache License 2.0 (`app/fonts/LICENSE-MountainsOfChristmas-Apache.txt`) | title cards |
| `app/fonts/playfair-display-latin-400-italic.woff2`, `…-400-normal.woff2` | Google Fonts via npm `@fontsource/playfair-display` 5.3.0 | Claus Eggers Sørensen | SIL Open Font License 1.1 (`app/fonts/LICENSE-PlayfairDisplay-OFL.txt`) | names and captions |
| `app/assets/atlas/orion.png`, `canisMajor.png`, `canisMinor.png`, `felis.png` | Alexander Jamieson, *A Celestial Atlas* (1822), plates 24, 25, 26 — Wikimedia Commons, `File:Alexander_Jamieson_Celestial_Atlas-Plate_24.jpg` (and 25, 26), 1920 px thumbnails | Alexander Jamieson (drawn), Neele & Son (engraved) | Public domain (published 1822; Commons tag "Public domain") | Derived: each figure cropped and masked from its plate, ink converted to white-on-transparent line art (tinted in the app). Star positions in `app/js/fx/constellations.js` read off the same plates. |

## Music (WP-05) — kept on the device, not committed

Recordings are **not in the repo** (size); the owner downloads them from the links below (original file, from a home
connection) and assembles `master-mix`. "Check" lists the loudest sudden jumps found by the analysis script (10 ms
level vs the previous 0.5 s): the owner must listen there for drum/cymbal hits (DESIGN_SYSTEM §08) before final approval.

| Scene | Recording (Wikimedia Commons file page) | Performer | Licence evidence | Length · tempo | Excerpt used | Check (impulsive sounds) |
|---|---|---|---|---|---|---|
| s01 | [O Christmas Tree - Airmen of Note - United States Air Force Band.mp3](https://commons.wikimedia.org/wiki/File:O_Christmas_Tree_-_Airmen_of_Note_-_United_States_Air_Force_Band.mp3) | USAF Band, Airmen of Note (jazz big band, instrumental) | PD: US federal government work (USAF); composition trad. PD | 5:47 · 152 bpm swing 4/4 | 0:00–1:00, fade 0:56–1:00 | **jazz drum kit**: jumps at 0:07 (+14 dB); listen to 0:00–1:00 |
| s02 | [Carol of the Bells - Concert Band - United States Air Force Band of the Rockies.mp3](https://commons.wikimedia.org/wiki/File:Carol_of_the_Bells_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3) | USAF Band of the Rockies, Concert Band (1993), via music.af.mil Public Domain Music | PD: US federal government work; Leontovych (d. 1921) PD | 2:45 · ≈130 bpm 3/4 | 0:00–1:24 (section ends 1:22) | jumps at 0:30 (+11 dB), 0:54 (+10 dB): likely tutti entrances; listen |
| s04 | **not chosen** — the two Commons Sugar Plum recordings are CC BY / CC BY-SA (not allowed); no US-band or CC0 recording found yet | — | — | — | — | owner decision (CONTROL) |
| s06 | [Waltz of the Flowers - Concert Band - United States Air Force Band.mp3](https://commons.wikimedia.org/wiki/File:Waltz_of_the_Flowers_-_Concert_Band_-_United_States_Air_Force_Band.mp3) | USAF Band, Concert Band, arr. Lawrence Odom (1996), via music.af.mil | PD: US federal government work; Tchaikovsky (d. 1893) PD | 7:30 · ≈176 bpm 3/4 (bars ≈59/min) | 1:28.94–2:58.94 (main waltz theme → tutti → peak) | jumps at 0:48, 1:09 are outside the excerpt; inside: tutti at 2:00, peak 2:33 |
| s08 | [Silent Nights - Concert Band - United States Air Force Band of the Rockies.mp3](https://commons.wikimedia.org/wiki/File:Silent_Nights_-_Concert_Band_-_United_States_Air_Force_Band_of_the_Rockies.mp3) | USAF Band of the Rockies, Concert Band | PD: US federal government work (Commons tag; verify on the file page); Gruber 1818 PD | 2:42 · ≈78 bpm | 1:00 to pick by ear (narration on top) | soft; no jumps > 9 dB inside the piece |
| s10 | [Jingle Bells (2020) - Starlifter and Roots in Blue - United States Air Force Band of Mid-America.mp3](https://commons.wikimedia.org/wiki/File:Jingle_Bells_(2020)_-_Starlifter_and_Roots_in_Blue_-_United_States_Air_Force_Band_of_Mid-America.mp3) | USAF Band of Mid-America, Starlifter + Roots in Blue (2020), via music.af.mil | PD: US federal government work; Pierpont 1857 PD | 2:13 file, music ends ≈1:51 · 159 bpm 4/4 | whole track 0:00–1:56 | **pop band, drum kit, loud master (−12 LUFS)**: jumps 0:45, 1:04, 1:31 (+10 dB); needs owner OK |
| s00/s09 | music-box *O Christmas Tree* loop — **ElevenLabs original, not generated yet** (needs owner go-ahead) | — | original | 90 bpm 3/4, 12 s multiple | loop | — |
| s03/s05/s07 | three short underscores — **ElevenLabs originals, not generated yet** | — | original | — | — | — |

Alternatives checked: *Carol of the Bells, Ukrainian* (USAF Heritage of America Band, 2:24, 162 bpm, PD); *P.I. Tchaikovsky's
Waltz of the Flowers* (US Army Band c. 2019, PD, very quiet master −31 LUFS); *We Wish You a Merry Christmas* (2020,
Starlifter, 136 bpm 3/4, PD); *Joy to the World* (USAF Concert Band, 0:31, PD); *U.S. Army Band - O Tannenbaum* is the
**Army Chorus** (sung, rejected: it would clash with narration).
