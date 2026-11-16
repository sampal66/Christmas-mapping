// Default zone layout for the dining-room wall, in stage pixels (1920 x 1080).
// Derived from measurements: wall 2.10 m wide, ceiling 2.20 m, projected image
// ≈ 2.6 x 1.45 m from 3.5 m (HAPPRUN H1), image assumed to span 0.60–2.05 m high.
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
      { id: 'wall',       label: 'Wall',            color: '#4fc3f7', res: [1920, 1080], quad: rect(185, 0, 1550, 1080) },
      { id: 'rightStrip', label: 'Right wall strip', color: '#9575cd', res: [256, 1024],  quad: rect(1735, 0, 185, 1080) },
      { id: 'backdrop',   label: 'Backdrop',        color: '#81c784', res: [1024, 1200], quad: rect(945, 0, 790, 939) },
      { id: 'stage',      label: 'Sideboard front', color: '#ffb74d', res: [1024, 192],  quad: rect(945, 939, 790, 141), occlude: true },
      { id: 'box1',       label: 'Gift box 1',      color: '#f06292', res: [256, 256],   quad: rect(1050, 715, 221, 224), occlude: true },
      { id: 'box2',       label: 'Gift box 2',      color: '#ba68c8', res: [256, 256],   quad: rect(1350, 641, 295, 298), occlude: true },
      { id: 'tree',       label: 'Tree',            color: '#aed581', res: [768, 1024],  quad: rect(185, 37, 664, 1043), occlude: true, mask: TREE_MASK },
      { id: 'star',       label: 'Star',            color: '#ffd54f', res: [256, 256],   quad: rect(457, 0, 120, 110) },
    ],
  };
}
