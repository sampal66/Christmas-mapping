// Scene scheduler. A scene owns some zones for a time window on the master clock:
//   { id, title?, start, duration, zones: ['tree', ...], enter?(), draw(zoneId, ctx, w, h, t, local) }
// Hold points loop a segment until the operator presses Continue:
//   { id, at, loop: [from, to] }   (at === loop[1] usually)

export class Timeline {
  constructor(scenes = [], holds = []) {
    this.scenes = [...scenes].sort((a, b) => a.start - b.start);
    this.holds = [...holds].sort((a, b) => a.at - b.at);
    this.duration = this.scenes.reduce((m, s) => Math.max(m, s.start + s.duration), 0);
    this.released = new Set();   // hold ids already continued
    this.entered = new Set();    // scene ids whose enter() ran
  }

  reset() { this.released.clear(); this.entered.clear(); }

  // Releases holds that lie before t (used when jumping forward).
  releaseBefore(t) { for (const h of this.holds) if (h.at <= t) this.released.add(h.id); }
  unreleaseAfter(t) { for (const h of this.holds) if (h.at > t) this.released.delete(h.id); }

  // Active hold at time t, or null.
  holdAt(t) {
    return this.holds.find((h) => !this.released.has(h.id) && t >= h.at) || null;
  }

  // The scene that draws `zoneId` at time t (latest-starting scene wins on overlap).
  sceneFor(zoneId, t) {
    let found = null;
    for (const s of this.scenes) {
      if (s.start > t) break;
      if (t < s.start + s.duration && s.zones.includes(zoneId)) found = s;
    }
    return found;
  }

  sceneAt(t) {
    let found = null;
    for (const s of this.scenes) { if (s.start > t) break; if (t < s.start + s.duration) found = s; }
    return found;
  }

  enterIfNeeded(scene) {
    if (this.entered.has(scene.id)) return;
    this.entered.add(scene.id);
    try { scene.enter?.(); } catch (e) { console.error(`scene ${scene.id} enter failed`, e); }
  }
}

export const fmtTime = (t) => {
  const s = Math.max(0, Math.floor(t));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
