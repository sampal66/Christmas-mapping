// Default zone layout for the dining-room wall, in stage pixels (1920 x 1080).
// Generated from the spatial model (stage-model.js): the real objects projected through the projector's
// position and throw ratio (with any edits made on the Room model page). Everything here is a starting point; CALIBRATE mode moves it onto the real objects.
import { layoutFromModel } from './stage-model.js';
import { loadModel } from './model-store.js';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

export function defaultLayout() {
  return layoutFromModel(loadModel());
}
