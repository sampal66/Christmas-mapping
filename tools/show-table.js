// Shared show tables for the Node tools (master-mix.js, precheck.js): the SCRIPT §03 voice lines and the app's own
// scene running order with cue times snapped to each scene's beat grid, so every tool reads one source of truth.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** Voice lines from SCRIPT §03: { id, scene (prefix), cue, offset, est }. */
function scriptLines() {
  const md = fs.readFileSync(path.join(ROOT, 'docs/SCRIPT.md'), 'utf8');
  const sec = md.slice(md.indexOf('## 03'), md.indexOf('## 04'));
  const out = [];
  for (const row of sec.split('\n')) {
    const c = row.split('|').map((x) => x.trim());
    const m = /^(s\d\d-[a-z]+-\d\d)/.exec(c[1] || '');
    if (!m) continue;
    const cm = /^([a-z-]+)\s*([+\-−])\s*([\d.]+)$/.exec(c[2].replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim());
    if (!cm) throw new Error(`can't read cue "${c[2]}" for ${m[1]}`);
    out.push({ id: m[1], scenePrefix: m[1].slice(0, 3), cue: cm[1], offset: (cm[2] === '+' ? 1 : -1) * Number(cm[3]), est: Number(c[4]) || 0, opt: /\(opt\)/.test(c[1]) });
  }
  return out;
}

/** Scenes with absolute starts and their cue times (snapped to the beat grid as the scenes do). */
async function sceneTable() {
  const { scenes } = await import(path.join(ROOT, 'app/js/scenes/index.js'));
  const { cueSheet, beatGrid } = await import(path.join(ROOT, 'app/js/fx/cues.js'));
  return scenes.map((s) => {
    const C = cueSheet(s.cues, s.beats ? beatGrid(s.beats) : null);
    return {
      id: s.id, start: s.start, duration: s.duration, hold: s.hold || null, story: !!s.story,
      cues: (s.cues || []).map((q) => ({ name: q.name, t: C.at(q.name) })),
      at: (k) => (typeof k === 'number' ? k : C.at(k)),
    };
  });
}


module.exports = { ROOT, scriptLines, sceneTable };
