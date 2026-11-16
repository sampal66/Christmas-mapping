// Default zone layout for the dining-room wall, in stage pixels (1920 x 1080).
// Derived from the stage survey (docs/STAGE_SURVEY.md): wall 2.10 x 2.20 m, sideboard ≈1.01 x 0.66 m,
// tree ≈1.77 m (bare tip) and ≈0.45 m out from the wall. Recommended set-up: projector ≈3.8 m back, lens ≈0.95 m,
// image ≈2.81 x 1.58 m spanning ≈0.60–2.19 m on the wall (the star needs that height; see survey §03).
// Everything here is a starting guess; CALIBRATE mode moves it onto the real objects.

export const STAGE_W = 1920;
export const STAGE_H = 1080;

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

// Tree silhouette in unit coords of the tree quad (0..1), clockwise from the tip.
const TREE_MASK = [
  [0.5, 0.0], [0.6, 0.18], [0.7, 0.4], [0.84, 0.65], [0.97, 0.92], [0.6, 1.0],
  [0.4, 1.0], [0.03, 0.92], [0.16, 0.65], [0.3, 0.4], [0.4, 0.18],
];

export function defaultLayout() {
  return {
    version: 1,
    audioOffsetMs: 0,
    zones: [
      // order = draw order (bottom → top). occlude: paints black under its mask
      // so zones below don't spill light onto this object.
      { id: 'wall',       label: 'Wall',            color: '#4fc3f7', res: [1920, 1080], quad: rect(244, 0, 1432, 1080) },
      { id: 'rightStrip', label: 'Right wall strip', color: '#9575cd', res: [256, 1024],  quad: rect(1676, 0, 244, 1080) },
      { id: 'backdrop',   label: 'Backdrop',        color: '#81c784', res: [1024, 1200], quad: rect(980, 0, 696, 1039) },
      // The drawers sit mostly below the image (and are dark wood), so this is only a thin footlight strip.
      { id: 'stage',      label: 'Sideboard front', color: '#ffb74d', res: [1024, 64],   quad: rect(980, 1039, 696, 41), occlude: true },
      { id: 'box1',       label: 'Gift box 1',      color: '#f06292', res: [256, 256],   quad: rect(1100, 834, 210, 210), occlude: true },
      { id: 'box2',       label: 'Gift box 2',      color: '#ba68c8', res: [256, 256],   quad: rect(1345, 764, 281, 280), occlude: true },
      { id: 'tree',       label: 'Tree',            color: '#aed581', res: [768, 1024],  quad: rect(72, 195, 800, 885), occlude: true, mask: TREE_MASK },
      { id: 'star',       label: 'Star',            color: '#ffd54f', res: [256, 256],   quad: rect(395, 37, 155, 170) },
    ],
  };
}
