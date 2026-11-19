// Performance safety valves (WP-13a, WP-12 F4). All off by default: nothing changes unless the iPad drops frames on
// the wall (WP-09). Each valve lightens one heavy moment without changing its story or timing.
//
// Switch them on without editing code (both are read once, when the app loads):
//   • URL:      index.html?perf=portrait,toys,fireworks      (or ?perf=all; ?perf=none clears a saved choice)
//   • Saved:    a ?perf=… URL also stores the choice on this device (localStorage 'xmas.perf'), so a later plain
//               open of the app (e.g. from the home-screen icon) keeps it.
// Or set a default below to true and commit it.
//
//   portrait   s10 family portrait: 4,877 → 3,500 lights, thinned evenly (any star-swarm portrait over 3,500; the
//              pet portraits are smaller and unchanged). The lights grow a little to keep the picture solid.
//   toys       s04 box chaos: ≈ 1/3 fewer objects in each toss wave (singles stay), so fewer to fly and bounce.
//   fireworks  s10 fireworks: ≈ 1/3 fewer shells (every third non-willow shell; the willow crown stays).
export const PERF = { portrait: false, toys: false, fireworks: false };

const KEY = 'xmas.perf';

function apply(list) {
  const names = list === 'all' ? Object.keys(PERF) : String(list).split(',').map((s) => s.trim());
  for (const n of names) if (n in PERF) PERF[n] = true;
}

(() => {
  let q = null;
  try { q = new URLSearchParams(globalThis.location?.search || '').get('perf'); } catch { /* not in a page */ }
  try {
    if (q === 'none') { globalThis.localStorage?.removeItem(KEY); return; }
    if (q) globalThis.localStorage?.setItem(KEY, q);
    else q = globalThis.localStorage?.getItem(KEY) || null;
  } catch { /* storage blocked: the URL still works for this visit */ }
  if (q) apply(q);
})();
