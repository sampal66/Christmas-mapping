// Default zone layout for the dining-room wall, in stage pixels (1920 x 1080).
// Derived from the stage survey (docs/STAGE_SURVEY.md v1.2): wall 2.10 x 2.20 m, sideboard 1.07 x 0.79 m,
// tree ≈2.0 m (bare tip) and ≈0.45 m out from the wall. Centred reference set-up: projector ≈3.8 m back, lens ≈1.0 m,
// image ≈2.81 x 1.58 m spanning ≈0.74–2.33 m (its top falls on the ceiling). The real counter is off-axis.
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
      { id: 'wall',       label: 'Wall',            color: '#4fc3f7', res: [1920, 1080], quad: rect(244, 87, 1432, 962) },
      { id: 'rightStrip', label: 'Right wall strip', color: '#9575cd', res: [256, 1024],  quad: rect(1676, 87, 244, 993) },
      { id: 'backdrop',   label: 'Backdrop',        color: '#81c784', res: [1024, 1200], quad: rect(946, 87, 730, 962) },
      // The drawers sit mostly below the image (and are dark wood), so this is only a thin footlight strip.
      { id: 'stage',      label: 'Sideboard front', color: '#ffb74d', res: [1024, 64],   quad: rect(946, 1049, 730, 31), occlude: true },
      { id: 'box1',       label: 'Gift box 1',      color: '#f06292', res: [256, 256],   quad: rect(1100, 843, 210, 210), occlude: true },
      { id: 'box2',       label: 'Gift box 2',      color: '#ba68c8', res: [256, 256],   quad: rect(1345, 773, 281, 280), occlude: true },
      { id: 'tree',       label: 'Tree',            color: '#aed581', res: [768, 1024],  quad: rect(109, 132, 774, 948), occlude: true, mask: TREE_MASK },
      { id: 'star',       label: 'Star',            color: '#ffd54f', res: [256, 256],   quad: rect(426, 0, 139, 139) },
    ],
  };
}
