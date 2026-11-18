// Constellation shapes for s06. The art is Sidney Hall's *Urania's Mirror* cards (1824, public domain, no coordinate
// grid; see assets/CREDITS.md); WP-11b replaced the earlier Jamieson plates (owner: distorted, grid). Star positions
// are read off the cards' star symbols, in 0..1 of each figure's cut-out (aspect = width/height), so the stars sit on
// the art in app/assets/atlas/. Star order is the draw-on order.
// Orion: Betelgeuse, Meissa, Bellatrix, Alnitak, Alnilam, Mintaka, Saiph, Rigel.
// Canis Major: Sirius, Mirzam, Muliphein, Wezen, Adhara, Furud, Aludra. Canis Minor: Gomeisa, Procyon.
// Felis: the old (obsolete) cat constellation, lying on Hydra; the card marks no stars on the cat itself, so its
// 12-star figure is fitted to the cat's outline (back arc, head, paw, tail).
// `spec` = each star's spectral class (Betelgeuse M, Rigel B, Sirius A, Procyon F…), used for its colour.
export const ORION = {"src": "assets/atlas/orion.png", "aspect": 0.7082, "stars": [[0.2854, 0.4355, 1.0], [0.4805, 0.3718, 0.4], [0.5915, 0.475, 0.7], [0.4169, 0.7145, 0.6], [0.4567, 0.6964, 0.65], [0.5158, 0.6705, 0.6], [0.364, 0.928, 0.6], [0.678, 0.889, 1.0]], "lines": [[0, 1], [1, 2], [0, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]], "spec": ["M", "O", "B", "O", "B", "O", "B", "B"]};
export const CANIS_MAJOR = {"src": "assets/atlas/canisMajor.png", "aspect": 0.7091, "stars": [[0.603, 0.189, 1.0], [0.925, 0.23, 0.6], [0.365, 0.198, 0.4], [0.285, 0.598, 0.7], [0.404, 0.694, 0.8], [0.871, 0.733, 0.4], [0.089, 0.702, 0.6]], "lines": [[1, 0], [0, 2], [0, 3], [3, 4], [4, 5], [3, 6]], "spec": ["A", "B", "B", "F", "B", "B", "B"]};
export const CANIS_MINOR = {"src": "assets/atlas/canisMinor.png", "aspect": 1.2395, "stars": [[0.756, 0.331, 0.6], [0.509, 0.595, 1.0]], "lines": [[0, 1]], "spec": ["B", "F"]};
export const FELIS = {"src": "assets/atlas/felis.png", "aspect": 1.8359, "stars": [[0.12, 0.6, 0.6], [0.2, 0.5, 0.5], [0.3, 0.28, 0.5], [0.42, 0.15, 0.5], [0.54, 0.22, 0.6], [0.62, 0.36, 0.5], [0.74, 0.26, 0.6], [0.81, 0.47, 0.7], [0.62, 0.52, 0.4], [0.84, 0.72, 0.6], [0.32, 0.62, 0.4], [0.4, 0.86, 0.5]], "lines": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [1, 10], [10, 11]], "spec": ["K", "G", "F", "K", "M", "G", "K", "A", "F", "K", "G", "F"]};
