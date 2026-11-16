# WP-02 · Media pack + offline mode

**PRD:** M8, M9 · **Depends on:** WP-00 (merged) · **Estimated session size:** small–medium
Can run in parallel with WP-01 (avoid editing `timeline.js` / `audio.js`).

## Goal
Let the owner load **private** files (family photos, narration audio, the final mix) from the iPad's Files app
into on-device storage, and make the whole app work **offline** on show night.

## Read only
- `CLAUDE.md` → `docs/AGENTS.md` §03, §03a, §06 (privacy!), §08
- `docs/ARCHITECTURE.md` §4.5
- Code: `app/index.html`, `app/js/main.js` (panel wiring only)

## Build
1. `app/js/media.js`: IndexedDB store (`christmas-mapping-media`, object store `files`).
   - API: `put(name, blob)`, `get(name) → Blob|null`, `list()`, `remove(name)`, `objectUrl(name)` (cached).
   - All calls are wrapped in try/catch, with a clear message when storage is blocked.
2. **Panel section "Media pack":**
   - Multi-file picker. Each file is stored under its file name without the extension (e.g. `photo-1.jpg` → `photo-1`).
   - A list with size and a delete button, plus a "storage used" readout (`navigator.storage.estimate`).
   - Expected names are documented in-app: `master-mix`, `photo-1…6`, `narration-*`.
3. **Offline:** `app/sw.js` service worker that caches the app shell (HTML, CSS, JS) cache-first, with a versioned
   cache name. Register it from `main.js`. Add `app/manifest.webmanifest` + icon for "Add to Home Screen".
4. **Privacy guard:** add `.gitignore` entries for `media/`, `*.private.*` and `assets/private/`.
   Add a note in `app/README.md` that personal files never leave the device.
5. Extend `tools/smoke-test.js`: import a generated tiny PNG through the file input, assert it's listed,
   reload, and assert it's still there.

## Out of scope
Using media inside scenes (WP-03/WP-08 will call `media.objectUrl(name)`).

## Acceptance
- [ ] Files survive a reload and appear in the list; delete works.
- [ ] With the network off (DevTools offline), a reload still opens the app.
- [ ] No personal files in the diff; `.gitignore` updated.
- [ ] The smoke test passes. PRD M8/M9 status, ARCHITECTURE §4.5, CONTROL board + handoff updated.
