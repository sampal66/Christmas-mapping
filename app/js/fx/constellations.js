// Constellation shapes for s06, in 0..1 box coordinates: stars [u, v, magnitude 0..1] and line pairs.
// Star order is the draw-on order. Positions are simplified from the real sky; Felis is the old (obsolete)
// cat constellation, drawn here as a simple sitting-cat outline.
export const ORION = {
  aspect: 0.8,
  stars: [
    [0.25, 0.16, 1.0],  // Betelgeuse
    [0.48, 0.03, 0.4],  // Meissa
    [0.70, 0.20, 0.7],  // Bellatrix
    [0.42, 0.50, 0.6],  // Alnitak
    [0.50, 0.48, 0.65], // Alnilam
    [0.58, 0.46, 0.6],  // Mintaka
    [0.32, 0.88, 0.6],  // Saiph
    [0.78, 0.85, 1.0],  // Rigel
  ],
  lines: [[0, 1], [1, 2], [0, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]],
};

export const CANIS_MAJOR = {
  aspect: 0.9,
  stars: [
    [0.40, 0.15, 1.0],  // Sirius
    [0.15, 0.12, 0.6],  // Mirzam
    [0.55, 0.04, 0.4],  // Muliphein
    [0.55, 0.60, 0.7],  // Wezen
    [0.45, 0.85, 0.8],  // Adhara
    [0.20, 0.80, 0.4],  // Furud
    [0.85, 0.75, 0.6],  // Aludra
  ],
  lines: [[1, 0], [0, 2], [0, 3], [3, 4], [4, 5], [3, 6]],
};

export const CANIS_MINOR = {
  aspect: 1.4,
  stars: [[0.2, 0.3, 0.6], [0.8, 0.7, 1.0]],         // Gomeisa, Procyon
  lines: [[0, 1]],
};

export const FELIS = {
  aspect: 1.3,
  stars: [
    [0.14, 0.10, 0.6],  // ear
    [0.30, 0.12, 0.6],  // ear
    [0.20, 0.38, 0.7],  // chin
    [0.38, 0.34, 0.5],  // neck
    [0.64, 0.30, 0.6],  // back
    [0.85, 0.42, 0.7],  // hip
    [0.95, 0.22, 0.5],  // tail
    [0.98, 0.04, 0.8],  // tail tip
    [0.30, 0.82, 0.6],  // front paw
    [0.80, 0.84, 0.6],  // back paw
  ],
  lines: [[0, 1], [0, 2], [1, 3], [2, 8], [3, 4], [4, 5], [5, 6], [6, 7], [5, 9]],
};
