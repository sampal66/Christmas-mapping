// Media pack: private files (family photos, narration, the final mix) stored on this device in IndexedDB.
// Nothing here ever touches the network: the files must never leave the iPad (the repo is public).

const DB_NAME = 'christmas-mapping-media';
const STORE = 'files';
const BLOCKED_MSG = 'On-device storage is blocked (private browsing or storage disabled). Media files cannot be saved.';

let dbPromise = null;
const urlCache = new Map(); // name -> object URL

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error(BLOCKED_MSG));
      req.onblocked = () => reject(new Error(BLOCKED_MSG));
    } catch (err) {
      reject(err);
    }
  }).catch((err) => { dbPromise = null; throw new Error(`${BLOCKED_MSG} (${err.message || err})`); });
  return dbPromise;
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const result = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(result.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Storage transaction aborted (storage may be full).'));
  });
}

function dropUrl(name) {
  const url = urlCache.get(name);
  if (url) { URL.revokeObjectURL(url); urlCache.delete(name); }
}

/** File name without its extension: "photo-1.jpg" → "photo-1". */
export function logicalName(fileName) {
  const i = fileName.lastIndexOf('.');
  return (i > 0 ? fileName.slice(0, i) : fileName).trim();
}

export async function put(name, blob) {
  try {
    await tx('readwrite', (s) => s.put(blob, name));
    dropUrl(name);
    return true;
  } catch (err) {
    throw new Error(`Could not store "${name}": ${err.message}`);
  }
}

export async function get(name) {
  try {
    return (await tx('readonly', (s) => s.get(name))) || null;
  } catch (err) {
    console.warn('media.get failed', err);
    return null;
  }
}

/** [{ name, size, type }], sorted by name. */
export async function list() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const out = [];
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return resolve(out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
        out.push({ name: String(c.key), size: c.value?.size || 0, type: c.value?.type || '' });
        c.continue();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('media.list failed', err);
    return [];
  }
}

export async function remove(name) {
  try {
    await tx('readwrite', (s) => s.delete(name));
    dropUrl(name);
    return true;
  } catch (err) {
    throw new Error(`Could not delete "${name}": ${err.message}`);
  }
}

/** Cached object URL for a stored file, or null when it's missing (scenes then draw a placeholder). */
export async function objectUrl(name) {
  if (urlCache.has(name)) return urlCache.get(name);
  const blob = await get(name);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(name, url);
  return url;
}

/** Throws with a clear message when IndexedDB is unusable, so the panel can tell the operator. */
export async function check() {
  await openDb();
}

/** { usage, quota } in bytes, or null when the browser can't tell. */
export async function storageEstimate() {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    return { usage: usage || 0, quota: quota || 0 };
  } catch {
    return null;
  }
}

/** Ask the browser not to evict our files under storage pressure (best effort). */
export async function persist() {
  try { return navigator.storage?.persist ? await navigator.storage.persist() : false; } catch { return false; }
}

export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
