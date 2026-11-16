// Demo effects drawn into each zone's own (unwarped) canvas.
// Signature: (ctx, w, h, t) where t is seconds. Black = no light.

const TAU = Math.PI * 2;
const rand = (seed) => { const x = Math.sin(seed * 9301.17) * 49297.31; return x - Math.floor(x); };

export function snow(ctx, w, h, t, count = 160, size = 1) {
  ctx.fillStyle = '#fff';
  for (let i = 0; i < count; i++) {
    const speed = 30 + rand(i) * 70;
    const x = (rand(i + 1) * w + Math.sin(t * 0.8 + i) * 20 + w) % w;
    const y = (rand(i + 2) * h + t * speed) % h;
    const r = (1.5 + rand(i + 3) * 3.5) * size * (w / 1000 + 0.5);
    ctx.globalAlpha = 0.5 + rand(i + 4) * 0.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function stars(ctx, w, h, t) {
  for (let i = 0; i < 90; i++) {
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + rand(i) * 2) + i);
    ctx.globalAlpha = 0.2 + 0.8 * tw;
    ctx.fillStyle = i % 7 === 0 ? '#ffe9a8' : '#fff';
    const r = 1 + rand(i + 9) * 2.5;
    ctx.beginPath(); ctx.arc(rand(i + 5) * w, rand(i + 6) * h, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Colour bands climbing the tree from bottom to top.
export function treeWaves(ctx, w, h, t) {
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const p = ((t * 0.35 + i / bands) % 1);
    const y = h - p * h * 1.2;
    const hue = (t * 40 + i * 60) % 360;
    const g = ctx.createLinearGradient(0, y - h * 0.12, 0, y + h * 0.12);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, `hsla(${hue},90%,60%,0.9)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - h * 0.12, w, h * 0.24);
  }
  // sparkles
  for (let i = 0; i < 40; i++) {
    const a = Math.max(0, Math.sin(t * 3 + i * 1.7));
    ctx.globalAlpha = a * a;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(rand(i) * w, rand(i + 1) * h, 4, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function starGlow(ctx, w, h, t) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 2);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, `rgba(255,236,160,${pulse})`);
  g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// Faces light up one after another, like presents opening.
export function boxPulse(index) {
  return (ctx, w, h, t) => {
    const phase = (t * 0.5 + index * 0.5) % 2;
    const on = phase < 1 ? Math.sin(phase * Math.PI) : 0;
    const hue = index ? 330 : 280;
    ctx.fillStyle = `hsla(${hue},80%,55%,${on})`;
    ctx.fillRect(0, 0, w, h);
    // ribbon
    ctx.fillStyle = `rgba(255,215,90,${0.3 + on * 0.7})`;
    ctx.fillRect(w * 0.44, 0, w * 0.12, h);
    ctx.fillRect(0, h * 0.44, w, h * 0.12);
  };
}

// A light that runs along the sideboard's top edge.
export function edgeChase(ctx, w, h, t) {
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a = 0.15 + 0.85 * Math.max(0, Math.cos((i / n - t * 0.4) * TAU * 2));
    ctx.fillStyle = `rgba(255,${180 + (i % 2) * 60},90,${a})`;
    ctx.beginPath(); ctx.arc((i + 0.5) * w / n, h * 0.12, h * 0.07, 0, TAU); ctx.fill();
  }
}

// Calibration pattern: outline, grid, label.
export function calibrationPattern(ctx, w, h, zone, selected) {
  ctx.fillStyle = selected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = zone.color; ctx.lineWidth = Math.max(2, w / 200);
  ctx.globalAlpha = 0.5;
  const step = 8;
  for (let i = 1; i < step; i++) {
    ctx.beginPath(); ctx.moveTo((i * w) / step, 0); ctx.lineTo((i * w) / step, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, (i * h) / step); ctx.lineTo(w, (i * h) / step); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(4, w / 80);
  ctx.strokeRect(0, 0, w, h);
  ctx.fillStyle = zone.color;
  ctx.font = `bold ${Math.round(Math.min(w, h) / 7)}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(zone.label, w / 2, h / 2);
}

export const demoEffects = {
  wall: (c, w, h, t) => snow(c, w, h, t, 220),
  rightStrip: (c, w, h, t) => snow(c, w, h, t, 40, 0.6),
  backdrop: (c, w, h, t) => stars(c, w, h, t),
  stage: edgeChase,
  box1: boxPulse(0),
  box2: boxPulse(1),
  tree: treeWaves,
  star: starGlow,
};
