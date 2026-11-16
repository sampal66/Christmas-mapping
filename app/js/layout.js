// Default zone layout for the dining-room wall, in stage pixels (1920 x 1080).
// Derived from the stage survey (docs/STAGE_SURVEY.md v1.6): wall 2.10 x 2.20 m, sideboard 1.07 x 0.79 m,
// tree tip ≈1.8 m, 25 cm star with its top at 2.03 m (taped), tree ≈0.45 m out from the wall. Reference set-up:
// tripod behind the kitchen bar ≈3.7 m back, lens ≈1.3 m, image ≈2.74 x 1.54 m spanning ≈0.70–2.24 m.
// The real spot is off-axis left, so calibration will skew these.
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
      { id: 'wall',       label: 'Wall',            color: '#4fc3f7', res: [1920, 1080], quad: rect(224, 27, 1472, 987) },
      { id: 'rightStrip', label: 'Right wall strip', color: '#9575cd', res: [256, 1024],  quad: rect(1696, 27, 224, 1053) },
      { id: 'backdrop',   label: 'Backdrop',        color: '#81c784', res: [1024, 1200], quad: rect(946, 27, 750, 987) },
      // The drawers sit mostly below the image (and are dark wood), so this is only a thin footlight strip.
      { id: 'stage',      label: 'Sideboard front', color: '#ffb74d', res: [1024, 64],   quad: rect(946, 1014, 750, 66), occlude: true },
      { id: 'box1',       label: 'Gift box 1',      color: '#f06292', res: [256, 256],   quad: rect(1104, 808, 216, 216), occlude: true },
      { id: 'box2',       label: 'Gift box 2',      color: '#ba68c8', res: [256, 256],   quad: rect(1356, 736, 288, 288), occlude: true },
      { id: 'tree',       label: 'Tree',            color: '#aed581', res: [768, 1024],  quad: rect(83, 258, 797, 822), occlude: true, mask: TREE_MASK },
      { id: 'star',       label: 'Star',            color: '#ffd54f', res: [256, 256],   quad: rect(382, 75, 199, 199) },
    ],
  };
}
