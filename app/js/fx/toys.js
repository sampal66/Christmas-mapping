// s04 box chaos (WP-11): the objects that burst out of the gift boxes while the pets rummage inside for the star.
// Every object is an illustrated sprite drawn in code (gradient fills, a soft highlight, a warm cream rim and a baked
// glow; DESIGN_SYSTEM §05: no dark ink, no fill below ≈35% lightness), rendered once into a cached canvas and then only
// blitted, rotated, each frame. Motion is analytic (launch → arc → bounces → rest), so any frame can be drawn at
// any time (MP4 export, scrubbing).
import { rgb, rgba, mix } from '../palette.js';
import { TAU, rand, clamp, easeOutBack, easeInOutSine, glowSprite, dot, additive } from './util.js';

const RIM = '#FFF1D6';                                    // warm light cream rim (replaces dark ink)
const CARAMEL = '#B07A4A';
const SLATE = '#5A6478';
const GREY = '#8C96A3';
const BLONDE = '#E8C890';

const makeCanvas = (w, h) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
};

// ---------- drawing helpers (all in a 100 × 100 design box) ----------
const lighten = (c, k) => mix(c, 'snow', k);
function radial(g, c, x = 38, y = 34, r = 52) {
  const gr = g.createRadialGradient(x, y, 2, x, y, r);
  gr.addColorStop(0, lighten(c, 0.65));
  gr.addColorStop(0.45, rgba(c, 1));
  gr.addColorStop(1, mix(c, '#3a2a40', 0.25));
  return gr;
}
function linear(g, c, x0 = 0, y0 = 0, x1 = 0, y1 = 100) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, lighten(c, 0.5));
  gr.addColorStop(0.5, rgba(c, 1));
  gr.addColorStop(1, mix(c, '#3a2a40', 0.2));
  return gr;
}
/** Fill the current path, then rim it in cream. */
function paint(g, fill, rim = 3.2) {
  g.fillStyle = fill; g.fill();
  g.lineWidth = rim; g.strokeStyle = RIM; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
}
function shine(g, x, y, rx, ry, rot = -0.5, a = 0.6) {
  g.save(); g.globalAlpha = a; g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); g.restore();
}
function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// ---------- the objects ----------
// Christmas objects
function bauble(g, c = 'cranberry') {
  circle(g, 50, 74 - 18, 30); paint(g, radial(g, c, 40, 44, 40));
  // a gold band with a little zig-zag
  g.save(); circle(g, 50, 56, 28.5); g.clip();
  g.beginPath(); for (let i = 0; i <= 12; i++) g.lineTo(18 + i * 5.4, 56 + (i % 2 ? -4 : 4));
  g.lineWidth = 6; g.strokeStyle = rgba('gold', 0.95); g.stroke(); g.restore();
  rrect(g, 42, 20, 16, 9, 2); paint(g, linear(g, 'gold', 42, 0, 58, 0), 2.4);
  g.beginPath(); g.arc(50, 16, 5, 0, TAU); g.lineWidth = 3; g.strokeStyle = RIM; g.stroke();
  shine(g, 39, 44, 9, 5);
}
function candyCane(g) {
  const path = () => { g.beginPath(); g.moveTo(58, 92); g.lineTo(58, 36); g.arc(42, 36, 16, 0, Math.PI, true); g.lineTo(26, 44); };
  g.lineCap = 'round';
  path(); g.lineWidth = 19; g.strokeStyle = RIM; g.stroke();
  path(); g.lineWidth = 14; g.strokeStyle = '#ffffff'; g.stroke();
  path(); g.setLineDash([7, 7]); g.lineCap = 'butt'; g.lineWidth = 14; g.strokeStyle = rgba('cranberry', 1); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(54, 88); g.lineTo(54, 38); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineCap = 'round'; g.stroke();
}
function bow(g, c = 'cranberry') {
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(50 + s * 20, 42, 20, 13, s * -0.35, 0, TAU); paint(g, radial(g, c, 50 + s * 16, 36, 26));
    g.beginPath(); g.moveTo(50, 48); g.lineTo(50 + s * 22, 86); g.lineTo(50 + s * 12, 80); g.lineTo(50 + s * 4, 88); g.closePath();
    paint(g, linear(g, c, 0, 48, 0, 90), 2.6);
  }
  circle(g, 50, 45, 9); paint(g, radial(g, c, 47, 41, 12));
  shine(g, 36, 37, 6, 3);
}
function bell(g) {
  g.beginPath(); g.moveTo(50, 18); g.bezierCurveTo(28, 18, 28, 48, 24, 64); g.quadraticCurveTo(18, 74, 16, 78);
  g.lineTo(84, 78); g.quadraticCurveTo(82, 74, 76, 64); g.bezierCurveTo(72, 48, 72, 18, 50, 18); g.closePath();
  paint(g, radial(g, 'gold', 40, 34, 56));
  circle(g, 50, 84, 7); paint(g, radial(g, 'candle', 47, 81, 9), 2.4);
  g.beginPath(); g.ellipse(50, 14, 12, 6, 0, 0, TAU); paint(g, rgba('pine', 1), 2.4);
  shine(g, 38, 38, 5, 12, 0.25);
}
function tinsel(g) {
  g.beginPath(); for (let i = 0; i <= 40; i++) { const x = 8 + i * 2.1; g.lineTo(x, 50 + Math.sin(i * 0.55) * 18); }
  g.lineCap = 'round'; g.lineWidth = 15; g.strokeStyle = rgba(RIM, 0.6); g.stroke();
  g.lineWidth = 10; g.strokeStyle = rgba('gold', 1); g.stroke();
  for (let i = 0; i < 60; i++) {
    const k = i / 60, x = 8 + k * 84, y = 50 + Math.sin(k * 40 * 0.55) * 18;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rand(i) - 0.5) * 6, y + (rand(i + 0.5) - 0.5) * 9);
    g.lineWidth = 1.6; g.strokeStyle = i % 3 ? '#fff6d0' : rgba('candle', 1); g.stroke();
  }
}
function train(g) {
  rrect(g, 14, 40, 46, 28, 6); paint(g, linear(g, 'cranberry', 0, 40, 0, 70));           // boiler
  rrect(g, 54, 26, 32, 42, 4); paint(g, linear(g, 'pine', 0, 26, 0, 70));                // cab
  rrect(g, 50, 20, 40, 9, 3); paint(g, linear(g, 'cranberry', 0, 20, 0, 30), 2.4);       // roof
  rrect(g, 61, 33, 18, 14, 2); paint(g, rgba('ice', 0.95), 2.2);                          // window
  rrect(g, 22, 22, 11, 20, 2); paint(g, linear(g, 'gold', 22, 0, 33, 0), 2.4);           // chimney
  g.beginPath(); g.moveTo(14, 68); g.lineTo(4, 80); g.lineTo(14, 80); g.closePath(); paint(g, rgba('gold', 1), 2.2);
  for (const [x, r] of [[24, 9], [44, 9], [72, 12]]) {
    circle(g, x, 78, r); paint(g, radial(g, 'plum', x - 3, 75, r + 3), 2.6);
    circle(g, x, 78, r * 0.35); g.fillStyle = rgba('gold', 1); g.fill();
  }
  g.fillStyle = rgba('gold', 1); g.fillRect(14, 50, 46, 4);
  shine(g, 28, 46, 9, 3, 0);
}
function nutcracker(g) {
  rrect(g, 36, 4, 28, 26, 3); paint(g, linear(g, 'plum', 0, 4, 0, 30));                  // tall hat
  g.fillStyle = rgba('gold', 1); g.fillRect(36, 24, 28, 4);
  rrect(g, 37, 28, 26, 22, 6); paint(g, radial(g, 'candle', 46, 34, 24), 2.6);           // face
  g.beginPath(); g.moveTo(37, 42); g.quadraticCurveTo(50, 60, 63, 42); g.lineTo(63, 48); g.quadraticCurveTo(50, 66, 37, 48); g.closePath();
  paint(g, '#ffffff', 2.2);                                                                  // beard
  circle(g, 44, 37, 2.2); circle(g, 56, 37, 2.2); g.fillStyle = SLATE; g.fill();
  rrect(g, 33, 52, 34, 26, 5); paint(g, linear(g, 'cranberry', 0, 52, 0, 80));            // jacket
  for (const y of [57, 64, 71]) { circle(g, 50, y, 2.4); g.fillStyle = rgba('gold', 1); g.fill(); }
  rrect(g, 26, 54, 8, 20, 3); paint(g, linear(g, 'cranberry', 0, 54, 0, 74), 2.2);
  rrect(g, 66, 54, 8, 20, 3); paint(g, linear(g, 'cranberry', 0, 54, 0, 74), 2.2);
  rrect(g, 38, 78, 10, 16, 2); paint(g, '#ffffff', 2.2);
  rrect(g, 52, 78, 10, 16, 2); paint(g, '#ffffff', 2.2);
}
function gift(g, c = 'pine', r = 'gold') {
  rrect(g, 18, 36, 64, 52, 4); paint(g, linear(g, c, 18, 36, 82, 88));
  g.fillStyle = rgba(r, 1); g.fillRect(44, 36, 12, 52); g.fillRect(18, 56, 64, 10);
  rrect(g, 14, 28, 72, 12, 3); paint(g, linear(g, c, 0, 28, 0, 40), 2.6);
  g.fillStyle = rgba(r, 1); g.fillRect(44, 28, 12, 12);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(50 + s * 11, 21, 11, 7, s * -0.5, 0, TAU); paint(g, radial(g, r, 50 + s * 9, 18, 14), 2.4); }
  shine(g, 28, 46, 6, 3, 0);
}
// Pet objects
function yarn(g) {
  circle(g, 50, 52, 30); paint(g, radial(g, 'rose', 40, 42, 40));
  g.save(); circle(g, 50, 52, 29); g.clip(); g.lineWidth = 2.4; g.strokeStyle = lighten('rose', 0.6);
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(50, 52, 30, 10 + i * 3, 0.6 + i * 0.42, 0, TAU); g.stroke(); }
  g.restore();
  g.beginPath(); g.moveTo(74, 70); g.bezierCurveTo(88, 80, 70, 92, 90, 96);
  g.lineWidth = 3.4; g.strokeStyle = rgba('rose', 1); g.stroke();
  shine(g, 38, 40, 7, 4);
}
function bone(g) {
  g.beginPath();
  g.moveTo(28, 42); g.lineTo(72, 42);
  g.arc(78, 36, 9, Math.PI * 0.75, Math.PI * 0.2, false); g.arc(80, 58, 9, -Math.PI * 0.2, Math.PI * 0.75, false);
  g.lineTo(72, 58); g.lineTo(28, 58);
  g.arc(20, 64, 9, Math.PI * 0.25, -Math.PI * 1.2, false); g.arc(22, 40, 9, Math.PI * 0.8, -Math.PI * 0.25, false);
  g.closePath(); paint(g, linear(g, 'ice', 0, 26, 0, 74));
  shine(g, 40, 46, 12, 2.5, 0);
}
function fish(g) {
  g.beginPath(); g.moveTo(14, 50); g.bezierCurveTo(30, 22, 62, 24, 72, 50); g.bezierCurveTo(62, 76, 30, 78, 14, 50); g.closePath();
  paint(g, linear(g, 'pine', 0, 26, 0, 76));
  g.save(); g.clip(); g.fillStyle = rgba('ice', 0.9); for (const x of [30, 44, 58]) g.fillRect(x, 20, 6, 60); g.restore();
  g.beginPath(); g.moveTo(14, 50); g.bezierCurveTo(30, 22, 62, 24, 72, 50); g.bezierCurveTo(62, 76, 30, 78, 14, 50);
  g.lineWidth = 3.2; g.strokeStyle = RIM; g.stroke();
  g.beginPath(); g.moveTo(70, 50); g.lineTo(90, 34); g.lineTo(86, 50); g.lineTo(90, 66); g.closePath(); paint(g, linear(g, 'ice', 0, 34, 0, 66), 2.6);
  circle(g, 26, 46, 4); paint(g, '#ffffff', 2); circle(g, 26, 46, 1.8); g.fillStyle = SLATE; g.fill();
  g.beginPath(); g.moveTo(40, 30); g.quadraticCurveTo(44, 12, 54, 8); g.lineWidth = 2.4; g.strokeStyle = rgba('rose', 1); g.stroke();
}
function collar(g) {
  g.beginPath(); g.ellipse(50, 40, 32, 20, 0, 0, TAU); g.lineWidth = 15; g.strokeStyle = RIM; g.stroke();
  g.lineWidth = 11; g.strokeStyle = rgba('cranberry', 1); g.stroke();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; circle(g, 50 + Math.cos(a) * 32, 40 + Math.sin(a) * 20, 2); g.fillStyle = rgba('gold', 1); g.fill(); }
  g.beginPath(); g.moveTo(50, 60); g.lineTo(50, 68); g.lineWidth = 2.6; g.strokeStyle = rgba('gold', 1); g.stroke();
  circle(g, 50, 78, 11); paint(g, radial(g, 'gold', 46, 74, 14), 2.6);
  // a paw print on the tag
  g.fillStyle = mix('gold', 'candle', 0.6);
  circle(g, 50, 81, 3.4); g.fill();
  for (const [x, y] of [[45, 75], [49, 73], [53, 73], [57, 75]]) { circle(g, x - 1, y + 0.5, 1.5); g.fill(); }
}
function slipper(g) {
  g.beginPath(); g.moveTo(10, 70); g.quadraticCurveTo(8, 50, 30, 46); g.quadraticCurveTo(52, 30, 74, 40); g.quadraticCurveTo(94, 50, 90, 70); g.closePath();
  paint(g, linear(g, 'plum', 0, 34, 0, 72));
  rrect(g, 8, 68, 84, 12, 6); paint(g, linear(g, 'candle', 0, 68, 0, 80), 2.6);
  for (let i = 0; i < 9; i++) { circle(g, 24 + i * 6, 46 - Math.sin((i / 8) * Math.PI) * 10, 6); g.fillStyle = '#fbf7ff'; g.fill(); }
  shine(g, 66, 50, 9, 3, -0.2);
}
// Cameo objects (Shepard's Pooh, 1928 Steamboat Willie: generic props only, no character art)
function honeyPot(g) {
  g.beginPath(); g.moveTo(28, 30); g.bezierCurveTo(8, 50, 14, 90, 50, 90); g.bezierCurveTo(86, 90, 92, 50, 72, 30); g.closePath();
  paint(g, radial(g, 'candle', 38, 48, 52));
  rrect(g, 24, 22, 52, 12, 5); paint(g, linear(g, 'sepia', 0, 22, 0, 34), 2.6);
  g.beginPath(); g.moveTo(26, 30);
  for (const [x, d] of [[34, 14], [42, 6], [52, 18], [62, 8], [72, 12]]) { g.quadraticCurveTo(x - 4, 34, x - 2, 34 + d); g.arc(x, 34 + d, 2.4, Math.PI, 0, true); }
  g.lineTo(74, 30); g.closePath(); g.fillStyle = rgba('gold', 1); g.fill();
  shine(g, 34, 52, 5, 11, 0.2);
}
function balloon(g) {
  g.beginPath(); g.moveTo(52, 70); g.bezierCurveTo(46, 82, 60, 88, 50, 98); g.lineWidth = 2.2; g.strokeStyle = RIM; g.stroke();
  g.beginPath(); g.ellipse(50, 38, 26, 31, 0, 0, TAU); paint(g, radial(g, 'cranberry', 40, 26, 40));
  g.beginPath(); g.moveTo(46, 72); g.lineTo(54, 72); g.lineTo(50, 66); g.closePath(); paint(g, rgba('cranberry', 1), 2);
  shine(g, 40, 26, 6, 10, 0.4);
}
function captainHat(g) {
  g.beginPath(); g.moveTo(20, 54); g.quadraticCurveTo(14, 26, 50, 22); g.quadraticCurveTo(86, 26, 80, 54); g.closePath();
  paint(g, linear(g, 'snow', 0, 20, 0, 56));
  rrect(g, 20, 52, 60, 14, 3); paint(g, linear(g, SLATE, 0, 52, 0, 66), 2.6);
  g.beginPath(); g.moveTo(22, 66); g.quadraticCurveTo(50, 84, 82, 66); g.quadraticCurveTo(50, 74, 22, 66); g.closePath(); paint(g, linear(g, SLATE, 0, 64, 0, 80), 2.6);
  // a small gold anchor badge
  g.strokeStyle = rgba('gold', 1); g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(50, 31); g.lineTo(50, 46); g.moveTo(44, 35); g.lineTo(56, 35); g.stroke();
  g.beginPath(); g.arc(50, 40, 7, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  circle(g, 50, 29, 2.6); g.stroke();
}
function shipWheel(g) {
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU, x1 = 50 + Math.cos(a) * 46, y1 = 50 + Math.sin(a) * 46;
    g.beginPath(); g.moveTo(50, 50); g.lineTo(x1, y1); g.lineWidth = 9; g.strokeStyle = RIM; g.stroke();
    g.lineWidth = 5.5; g.strokeStyle = CARAMEL; g.stroke();
    circle(g, x1, y1, 4.6); paint(g, CARAMEL, 2.2);
  }
  g.beginPath(); g.arc(50, 50, 30, 0, TAU); g.lineWidth = 12; g.strokeStyle = RIM; g.stroke();
  g.lineWidth = 8; g.strokeStyle = mix(CARAMEL, 'candle', 0.3); g.stroke();
  circle(g, 50, 50, 9); paint(g, radial(g, 'gold', 47, 47, 12), 2.6);
}

/** Object types, in three families (TREATMENT owner note: Christmas, pet and cameo objects). */
export const TOYS = {
  baubleRed: { family: 'xmas', draw: (g) => bauble(g, 'cranberry'), glow: 'cranberry' },
  baubleGold: { family: 'xmas', draw: (g) => bauble(g, 'gold'), glow: 'gold' },
  baublePlum: { family: 'xmas', draw: (g) => bauble(g, 'plum'), glow: 'plum' },
  candyCane: { family: 'xmas', draw: candyCane, glow: 'rose' },
  bow: { family: 'xmas', draw: (g) => bow(g, 'cranberry'), glow: 'cranberry' },
  bell: { family: 'xmas', draw: bell, glow: 'gold' },
  tinsel: { family: 'xmas', draw: tinsel, glow: 'gold', long: true },
  train: { family: 'xmas', draw: train, glow: 'cranberry' },
  nutcracker: { family: 'xmas', draw: nutcracker, glow: 'candle', long: true },
  giftGreen: { family: 'xmas', draw: (g) => gift(g, 'pine', 'gold'), glow: 'pine' },
  giftBlue: { family: 'xmas', draw: (g) => gift(g, 'ice', 'cranberry'), glow: 'ice' },
  yarn: { family: 'pet', draw: yarn, glow: 'rose' },
  bone: { family: 'pet', draw: bone, glow: 'ice' },
  fish: { family: 'pet', draw: fish, glow: 'pine' },
  collar: { family: 'pet', draw: collar, glow: 'cranberry' },
  slipper: { family: 'pet', draw: slipper, glow: 'plum' },
  honeyPot: { family: 'cameo', draw: honeyPot, glow: 'gold' },
  balloon: { family: 'cameo', draw: balloon, glow: 'cranberry' },
  captainHat: { family: 'cameo', draw: captainHat, glow: 'snow' },
  shipWheel: { family: 'cameo', draw: shipWheel, glow: 'candle' },
};
export const TOY_NAMES = Object.keys(TOYS);

const toyCache = new Map();
/** The baked sprite for a toy at `px` (its design box edge in pixels), glow included; the canvas is 1.5 × px. */
export function toySprite(name, px = 128) {
  const key = `${name}|${px}`;
  let c = toyCache.get(key);
  if (c) return c;
  const toy = TOYS[name];
  const S = Math.ceil(px * 1.5);
  const art = makeCanvas(S, S);
  const g = art.getContext('2d');
  g.translate((S - px) / 2, (S - px) / 2); g.scale(px / 100, px / 100);
  toy.draw(g);
  // Glow: the art drawn again with a coloured shadow underneath (baked once, so it costs nothing per frame).
  c = makeCanvas(S, S);
  const o = c.getContext('2d');
  const [r, gg, b] = rgb(toy.glow);
  o.shadowColor = `rgba(${r},${gg},${b},0.9)`; o.shadowBlur = px * 0.16;
  o.drawImage(art, 0, 0);
  o.shadowBlur = 0; o.drawImage(art, 0, 0);
  toyCache.set(key, c);
  return c;
}

/** Draw a toy centred at (x, y), `size` px wide (its design box), rotated `rot` radians. */
export function drawToy(ctx, name, x, y, size, rot = 0, alpha = 1) {
  if (alpha <= 0.01 || size <= 1) return;
  const px = size > 96 ? 160 : 112;                        // two cached sizes keep the blit crisp
  const s = toySprite(name, px);
  const d = (s.width * size) / px;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.drawImage(s, -d / 2, -d / 2, d, d);
  ctx.restore();
}

// ---------- motion ----------
/**
 * A tossed object: launched from (x0, y0) with an apex `rise` px above the launch, landing at x = xT on the floor
 * line `floor` (px, y down), bouncing with restitution `e` and coming to rest. Returns a plain spec; toyAt() reads it.
 * If `into` is set, the object falls back into the box (it vanishes when it drops below the launch point).
 */
export function tossSpec({ t0, x0, y0, xT, floor, rise, g, e = 0.42, spin = 0, into = false }) {
  const vy = -Math.sqrt(2 * g * Math.max(rise, 1));
  const end = into ? y0 : floor;
  const T = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, end - y0))) / g;
  const vx = (xT - x0) / T;
  // Bounces: [start time, x at start, vx, vy up] after each impact.
  const hops = [];
  if (!into) {
    let tt = T, x = xT, v = (vy + g * T) * e, h = vx * 0.55;
    for (let i = 0; i < 4 && v > Math.sqrt(2 * g * 3); i++) {
      hops.push([tt, x, h, v]);
      const d = (2 * v) / g;
      tt += d; x += h * d; v *= e; h *= 0.55;
    }
    hops.push([tt, x, 0, 0]);
  }
  return { t0, x0, y0, vx, vy, T, g, floor, spin, into, hops, rest: hops.length ? hops[hops.length - 1][0] : T };
}

/** Position of a toss at `age` seconds: { x, y, rot, resting } or null once it has dropped back into its box. */
export function tossAt(s, age) {
  if (age < s.T) {
    return { x: s.x0 + s.vx * age, y: s.y0 + s.vy * age + 0.5 * s.g * age * age, rot: s.spin * age, resting: false };
  }
  if (s.into) return null;
  let i = 0;
  while (i + 1 < s.hops.length && age >= s.hops[i + 1][0]) i++;
  const [ts, x, h, v] = s.hops[i];
  const a = age - ts;
  // spin slows at each bounce; at rest the angle freezes
  const rot = s.spin * (s.T + 0.5 * Math.min(age - s.T, s.rest - s.T));
  if (i === s.hops.length - 1) return { x, y: s.floor, rot, resting: true };
  return { x: x + h * a, y: s.floor - (v * a - 0.5 * s.g * a * a), rot, resting: false };
}

// ---------- the pets inside (placeholders, shaped for WP-04's "rummaging in the boxes" clips) ----------
const peekCache = new Map();
function peekSprite(kind) {
  let c = peekCache.get(kind);
  if (c) return c;
  const px = 128, S = 192;
  const art = makeCanvas(S, S);
  const g = art.getContext('2d');
  g.translate(32, 32); g.scale(px / 100, px / 100);
  if (kind === 'catEars' || kind === 'tabbyEars') {
    const fur = kind === 'catEars' ? GREY : CARAMEL;
    g.beginPath(); g.moveTo(14, 100); g.bezierCurveTo(14, 56, 86, 56, 86, 100); g.closePath(); paint(g, linear(g, fur, 0, 56, 0, 100));
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(50 + s * 12, 66); g.quadraticCurveTo(50 + s * 30, 30, 50 + s * 36, 22); g.quadraticCurveTo(50 + s * 40, 50, 50 + s * 34, 78); g.closePath();
      paint(g, linear(g, fur, 0, 22, 0, 78));
      g.beginPath(); g.moveTo(50 + s * 18, 66); g.quadraticCurveTo(50 + s * 30, 42, 50 + s * 34, 34); g.quadraticCurveTo(50 + s * 36, 54, 50 + s * 32, 70); g.closePath();
      g.fillStyle = rgba('rose', 0.9); g.fill();
    }
    if (kind === 'tabbyEars') { g.strokeStyle = mix(CARAMEL, 'candle', 0.5); g.lineWidth = 3; for (const x of [42, 50, 58]) { g.beginPath(); g.moveTo(x, 66); g.lineTo(x, 80); g.stroke(); } }
    // big eyes just over the rim
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(50 + s * 14, 92, 8, 9, 0, 0, TAU); paint(g, '#C8D86A', 2.4); g.beginPath(); g.ellipse(50 + s * 14, 93, 2.6, 6, 0, 0, TAU); g.fillStyle = SLATE; g.fill(); }
  } else {
    // a plume tail (Connor: blue-grey with a white tip; Alaska: blonde, curled)
    const fur = kind === 'huskyTail' ? SLATE : BLONDE;
    g.beginPath(); g.moveTo(30, 100); g.bezierCurveTo(14, 62, 22, 18, 58, 8); g.bezierCurveTo(88, 0, 100, 28, 82, 40);
    g.bezierCurveTo(70, 48, 60, 50, 58, 62); g.bezierCurveTo(56, 76, 62, 88, 66, 100); g.closePath();
    const gr = g.createLinearGradient(0, 100, 40, 4);
    gr.addColorStop(0, rgba(fur, 1)); gr.addColorStop(0.55, lighten(fur, 0.25)); gr.addColorStop(1, kind === 'huskyTail' ? '#ffffff' : lighten(fur, 0.6));
    paint(g, gr);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(40 + i * 2, 92 - i * 14); g.quadraticCurveTo(30 + i * 7, 70 - i * 12, 44 + i * 9, 54 - i * 10); g.stroke(); }
  }
  c = makeCanvas(S, S);
  const o = c.getContext('2d');
  o.shadowColor = 'rgba(255,241,214,0.7)'; o.shadowBlur = 18; o.drawImage(art, 0, 0); o.shadowBlur = 0; o.drawImage(art, 0, 0);
  peekCache.set(kind, c);
  return c;
}

/**
 * A pet peeking out of a box top (placeholder until WP-04's clips): `kind` catEars | tabbyEars | huskyTail | pomTail,
 * standing on the box's top edge at (x, y) (its base), `size` px tall, `up` 0..1 how far out, `t` for the
 * twitch / wag. The box face (an occluding zone) hides whatever is below its top edge.
 */
export function petPeek(ctx, kind, x, y, size, up, t, alpha = 1) {
  if (up <= 0.01 || alpha <= 0.01) return;
  const s = peekSprite(kind);
  const d = size * 1.5;
  const tail = kind.endsWith('Tail');
  const wag = tail ? Math.sin(t * 9) * 0.35 : Math.sin(t * 3.1) * 0.05 + (Math.sin(t * 13) > 0.85 ? 0.08 : 0);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y + size * (1 - easeOutBack(clamp(up))) * 0.9);
  ctx.rotate(wag);
  ctx.drawImage(s, -d / 2, -d + d / 6, d, d);
  ctx.restore();
}

/**
 * A box lid of light popping off: the lid band above the box's top edge (side corner A, front corner B, front
 * right corner C, all px) lifted by `lift` px and tilted `tilt` radians. color: the box's colour token.
 */
export function boxLid(ctx, A, B, C, lift, tilt, color, alpha = 1) {
  if (lift <= 0.5 || alpha <= 0.01) return;
  const th = Math.max(8, Math.hypot(C[0] - B[0], C[1] - B[1]) * 0.16);
  const cx = (A[0] + C[0]) / 2, cy = (A[1] + C[1]) / 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy - lift); ctx.rotate(tilt); ctx.translate(-cx, -cy);
  const band = (p, q, shade) => {
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineTo(q[0], q[1] - th); ctx.lineTo(p[0], p[1] - th); ctx.closePath();
    const gr = ctx.createLinearGradient(0, p[1] - th, 0, p[1]);
    gr.addColorStop(0, lighten(color, 0.45 * shade)); gr.addColorStop(1, mix(color, '#3a2a40', 0.25 * (1 - shade)));
    ctx.fillStyle = gr; ctx.fill();
    ctx.lineWidth = Math.max(3, th * 0.18); ctx.strokeStyle = RIM; ctx.lineJoin = 'round'; ctx.stroke();
  };
  ctx.shadowColor = rgba(color, 0.8); ctx.shadowBlur = th * 1.2;
  band(A, B, 0.6);
  band(B, C, 1);
  ctx.shadowBlur = 0;
  // the ribbon across the lid front
  const mx = (B[0] + C[0]) / 2, my = (B[1] + C[1]) / 2;
  ctx.fillStyle = rgba('gold', 0.95);
  ctx.fillRect(mx - th * 0.4, my - th, th * 0.8, th);
  ctx.restore();
}

/** A soft twinkle where a resting object dissolves (k 0..1 through the poof). */
export function poof(ctx, x, y, size, k, color = 'gold') {
  if (k <= 0 || k >= 1) return;
  const a = Math.sin(k * Math.PI);
  additive(ctx, a * 0.9, () => {
    dot(ctx, glowSprite(color, 0.3), x, y, size * (0.4 + 0.5 * k));
    const sp = glowSprite('snow', 0.3);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * TAU + k;
      dot(ctx, sp, x + Math.cos(ang) * size * 0.7 * easeInOutSine(k), y + Math.sin(ang) * size * 0.7 * easeInOutSine(k), size * 0.08);
    }
  });
}
