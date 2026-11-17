// Constellation shapes for s06, taken from Alexander Jamieson's Celestial Atlas (1822, public domain; plates 24-26,
// see assets/CREDITS.md). Star positions are read off the engravings, in 0..1 of each figure's cut-out (aspect =
// width/height), so the stars sit exactly on the atlas art in app/assets/atlas/. Star order is the draw-on order.
// Orion: Betelgeuse, Meissa, Bellatrix, Alnitak, Alnilam, Mintaka, Saiph, Rigel (Jamieson draws him from behind).
// Canis Major: Sirius, Mirzam, Muliphein, Wezen, Adhara, Furud, Aludra. Canis Minor: Gomeisa, Procyon.
// Felis: the old (obsolete) cat constellation, lying under Hydra.
export const ORION = {"src": "assets/atlas/orion.png", "aspect": 0.9167, "stars": [[0.2, 0.2153, 1.0], [0.3939, 0.1639, 0.4], [0.5227, 0.275, 0.7], [0.3409, 0.5972, 0.6], [0.3939, 0.5736, 0.65], [0.4364, 0.5375, 0.6], [0.2909, 0.9014, 0.6], [0.6242, 0.8569, 1.0]], "lines": [[0, 1], [1, 2], [0, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]]};
export const CANIS_MAJOR = {"src": "assets/atlas/canisMajor.png", "aspect": 0.726, "stars": [[0.5377, 0.2014, 1.0], [0.817, 0.2644, 0.6], [0.3208, 0.1753, 0.4], [0.2358, 0.589, 0.7], [0.3679, 0.6877, 0.8], [0.7962, 0.7356, 0.4], [0.066, 0.6945, 0.6]], "lines": [[1, 0], [0, 2], [0, 3], [3, 4], [4, 5], [3, 6]]};
export const CANIS_MINOR = {"src": "assets/atlas/canisMinor.png", "aspect": 1.1754, "stars": [[0.7104, 0.2596, 0.6], [0.4806, 0.5684, 1.0]], "lines": [[0, 1]]};
export const FELIS = {"src": "assets/atlas/felis.png", "aspect": 2.0833, "stars": [[0.132, 0.6417, 0.6], [0.216, 0.5583, 0.5], [0.356, 0.425, 0.5], [0.45, 0.3167, 0.5], [0.488, 0.2292, 0.6], [0.616, 0.375, 0.5], [0.72, 0.2833, 0.6], [0.802, 0.4833, 0.7], [0.616, 0.4667, 0.4], [0.822, 0.75, 0.6], [0.304, 0.6125, 0.4], [0.558, 0.875, 0.5]], "lines": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [1, 10], [10, 11]]};
