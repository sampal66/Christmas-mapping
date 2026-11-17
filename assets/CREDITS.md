# Asset credits and licences

Every third-party or downloaded asset must be listed here before it is committed (see docs/AGENTS.md §06).

| File | Source (URL) | Author / performer | Licence | Notes |
|---|---|---|---|---|
| `app/fonts/mountains-of-christmas-latin-700-normal.woff2` | Google Fonts via npm `@fontsource/mountains-of-christmas` 5.3.0 | Tart Workshop | Apache License 2.0 (`app/fonts/LICENSE-MountainsOfChristmas-Apache.txt`) | title cards |
| `app/fonts/playfair-display-latin-400-italic.woff2`, `…-400-normal.woff2` | Google Fonts via npm `@fontsource/playfair-display` 5.3.0 | Claus Eggers Sørensen | SIL Open Font License 1.1 (`app/fonts/LICENSE-PlayfairDisplay-OFL.txt`) | names and captions |
| `app/assets/atlas/orion.png`, `canisMajor.png`, `canisMinor.png`, `felis.png` | Alexander Jamieson, *A Celestial Atlas* (1822), plates 24, 25, 26 — Wikimedia Commons, `File:Alexander_Jamieson_Celestial_Atlas-Plate_24.jpg` (and 25, 26), 1920 px thumbnails | Alexander Jamieson (drawn), Neele & Son (engraved) | Public domain (published 1822; Commons tag "Public domain") | Derived: each figure cropped and masked from its plate, ink converted to white-on-transparent line art (tinted in the app). Star positions in `app/js/fx/constellations.js` read off the same plates. |
