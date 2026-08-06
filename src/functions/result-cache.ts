// Copyright IBM Corp. 2026

const DB_NAME = "emissions-cache";
const DB_VERSION = 1;
const STORE_NAME = "responses";

// Singleton promise so all concurrent callers share one IDBDatabase connection.
// A new connection is only opened if none exists yet (or the previous one errored).
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Returns a shared IDBDatabase connection, opening it on the first call.
 * Subsequent calls — including concurrent ones — reuse the same promise so
 * only one `indexedDB.open()` request is ever in flight.
 */
function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // If another tab upgrades the database the browser fires versionchange,
      // which closes the connection. Null out dbPromise so the next call
      // re-opens a fresh connection instead of reusing a closed handle.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = (event) => {
      dbPromise = null; // allow retry on next call
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
  return dbPromise;
}

/**
 * Computes a stable SHA-256 hex digest of the given string using the Web Crypto API.
 */
export async function hashInput(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Builds the cache key from an API type and its request parameters.
 * The key is the SHA-256 hash of the deterministically serialised input so that
 * identical requests always map to the same entry regardless of call site.
 */
export async function buildCacheKey(apiType: string, params: unknown): Promise<string> {
  const raw = JSON.stringify({ apiType, params });
  return hashInput(raw);
}

/**
 * Reads the cached response for the given request hash key from IndexedDB.
 * Returns null when no matching entry exists or if storage is unavailable.
 */
export async function getSnapshot(key: string): Promise<any[][] | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
    });
  } catch {
    return null;
  }
}

/**
 * Stores the formatted response directly under the request hash key in IndexedDB.
 * The key is the SHA-256 digest of the request — the value is the raw response array.
 */
export async function setSnapshot(key: string, response: any[][]): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(response, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
    });
  } catch (e) {
    console.warn("Failed to save result snapshot:", e);
  }
}

/**
 * Removes all cached response entries from IndexedDB.
 */
export async function clearSnapshots(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
    });
  } catch (e) {
    console.warn("Failed to clear snapshots:", e);
  }
}
