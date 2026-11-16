// The owner's edits to the spatial model, kept on this device (layered over STAGE_MODEL).
import { STAGE_MODEL } from './stage-model.js';

const KEY = 'christmas-mapping.model.v1';
const clone = (o) => JSON.parse(JSON.stringify(o));

// Deep merge so new model fields added in code still appear for old saved edits.
function merge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over || {})) out[k] = k in base ? merge(base[k], over[k]) : over[k];
  return out;
}

export function loadModel() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.version === STAGE_MODEL.version) return merge(clone(STAGE_MODEL), saved);
  } catch { /* storage blocked or corrupt: use the defaults */ }
  return clone(STAGE_MODEL);
}

export function saveModel(model) {
  try { localStorage.setItem(KEY, JSON.stringify(model)); } catch { /* ignore */ }
}

export function clearModel() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
