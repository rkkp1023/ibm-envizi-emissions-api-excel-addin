// Copyright IBM Corp. 2025

// ---------------------------------------------------------------------------
// IndexedDB fake
// ---------------------------------------------------------------------------
const idbStore = new Map<string, any>();

const mockObjectStore = {
  get: jest.fn((key: string) => {
    const req: any = {};
    Promise.resolve().then(() => {
      req.result = idbStore.get(key) ?? undefined;
      req.onsuccess?.();
    });
    return req;
  }),
  put: jest.fn(),
  clear: jest.fn(),
};

const mockTx: any = {
  objectStore: jest.fn(() => mockObjectStore),
  oncomplete: null as (() => void) | null,
  onerror: null as (() => void) | null,
  onabort: null as (() => void) | null,
  error: null as DOMException | null,
};

const resolveTx = () => Promise.resolve().then(() => mockTx.oncomplete?.());

mockObjectStore.put.mockImplementation((value: any, key: string) => {
  idbStore.set(key, value);
  resolveTx();
  return {};
});

mockObjectStore.clear.mockImplementation(() => {
  idbStore.clear();
  resolveTx();
  return {};
});

const mockDb: any = {
  transaction: jest.fn(() => mockTx),
  objectStoreNames: { contains: jest.fn(() => true) },
  createObjectStore: jest.fn(),
  onversionchange: null as (() => void) | null,
  close: jest.fn(),
};

const mockOpenRequest: any = { onupgradeneeded: null, onsuccess: null, onerror: null };

(global as any).indexedDB = {
  open: jest.fn(() => {
    Promise.resolve().then(() => {
      mockOpenRequest.result = mockDb;
      mockOpenRequest.onsuccess?.({ target: mockOpenRequest });
    });
    return mockOpenRequest;
  }),
};

// ---------------------------------------------------------------------------
// Web Crypto fake — patch subtle onto the existing global.crypto object.
// jsdom exposes crypto as a getter so a plain assignment is silently ignored.
// digest returns a stable 32-byte ArrayBuffer seeded deterministically from
// the input bytes so that the same string always produces the same hash.
// ---------------------------------------------------------------------------
Object.defineProperty(global.crypto, "subtle", {
  value: {
    digest: async (_algo: string, data: Uint8Array): Promise<ArrayBuffer> => {
      const out = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        let v = i * 31;
        for (let j = 0; j < data.length; j++) {
          v = ((v ^ data[j]) * 16777619) >>> 0;
        }
        out[i] = v & 0xff;
      }
      return out.buffer;
    },
  },
  writable: true,
  configurable: true,
});

// jsdom doesn't expose TextEncoder — provide the Node.js built-in.
if (typeof (global as any).TextEncoder === "undefined") {
  (global as any).TextEncoder = require("util").TextEncoder;
}

// ---------------------------------------------------------------------------
// Imports (after globals are set up)
// ---------------------------------------------------------------------------
import { buildCacheKey, clearSnapshots, getSnapshot, hashInput, setSnapshot } from "../src/functions/result-cache";

beforeEach(() => {
  jest.clearAllMocks();
  idbStore.clear();
  mockTx.oncomplete = null;
  mockTx.onerror = null;
  mockTx.onabort = null;
  mockTx.error = null;
  mockDb.onversionchange = null;
  // Re-apply implementations cleared by jest.clearAllMocks()
  (indexedDB.open as jest.Mock).mockImplementation(() => {
    Promise.resolve().then(() => {
      mockOpenRequest.result = mockDb;
      mockOpenRequest.onsuccess?.({ target: mockOpenRequest });
    });
    return mockOpenRequest;
  });
  mockObjectStore.put.mockImplementation((value: any, key: string) => {
    idbStore.set(key, value);
    resolveTx();
    return {};
  });
  mockObjectStore.clear.mockImplementation(() => {
    idbStore.clear();
    resolveTx();
    return {};
  });
  mockObjectStore.get.mockImplementation((key: string) => {
    const req: any = {};
    Promise.resolve().then(() => {
      req.result = idbStore.get(key) ?? undefined;
      req.onsuccess?.();
    });
    return req;
  });
});

// ---------------------------------------------------------------------------
// hashInput
// ---------------------------------------------------------------------------
describe("hashInput", () => {
  it("returns a hex string for a given input", async () => {
    const result = await hashInput("hello");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it("returns the same hash for the same input", async () => {
    const a = await hashInput("same-input");
    const b = await hashInput("same-input");
    expect(a).toBe(b);
  });

  it("returns different hashes for different inputs", async () => {
    const a = await hashInput("input-one");
    const b = await hashInput("input-two");
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// buildCacheKey
// ---------------------------------------------------------------------------
describe("buildCacheKey", () => {
  it("returns a string for a given apiType and params", async () => {
    const key = await buildCacheKey("location", { value: 100 });
    expect(typeof key).toBe("string");
  });

  it("returns the same key for identical inputs", async () => {
    const a = await buildCacheKey("location", { value: 100 });
    const b = await buildCacheKey("location", { value: 100 });
    expect(a).toBe(b);
  });

  it("returns different keys for different api types", async () => {
    const a = await buildCacheKey("location", { value: 100 });
    const b = await buildCacheKey("stationary", { value: 100 });
    expect(a).not.toBe(b);
  });

  it("returns different keys for different params", async () => {
    const a = await buildCacheKey("location", { value: 100 });
    const b = await buildCacheKey("location", { value: 200 });
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// getSnapshot / setSnapshot
// ---------------------------------------------------------------------------
describe("setSnapshot and getSnapshot", () => {
  it("stores the response and retrieves it directly by key", async () => {
    const response = [[100, "kgCO2e"]];
    await setSnapshot("abc123", response);
    const result = await getSnapshot("abc123");
    expect(result).toEqual(response);
  });

  it("returns different values for different responses", async () => {
    await setSnapshot("r1", [[10]]);
    await setSnapshot("r2", [[20]]);
    const r1 = await getSnapshot("r1");
    const r2 = await getSnapshot("r2");
    expect(r1).not.toEqual(r2);
  });

  it("returns null when no entry exists for the key", async () => {
    const result = await getSnapshot("nonexistent-key");
    expect(result).toBeNull();
  });
  it("returns null when the transaction is aborted", async () => {
    mockObjectStore.get.mockImplementationOnce(() => {
      const req: any = {};
      Promise.resolve().then(() => {
        mockTx.error = new DOMException("Disk full", "UnknownError");
        mockTx.onabort?.();
      });
      return req;
    });
    const result = await getSnapshot("any-key");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearSnapshots
// ---------------------------------------------------------------------------
describe("clearSnapshots", () => {
  it("removes all stored entries", async () => {
    await setSnapshot("key1", [[1]]);
    await setSnapshot("key2", [[2]]);
    await clearSnapshots();
    expect(await getSnapshot("key1")).toBeNull();
    expect(await getSnapshot("key2")).toBeNull();
  });

  it("does not throw when the transaction is aborted", async () => {
    mockObjectStore.clear.mockImplementationOnce(() => {
      Promise.resolve().then(() => {
        mockTx.error = new DOMException("Quota exceeded", "QuotaExceededError");
        mockTx.onabort?.();
      });
      return {};
    });
    await expect(clearSnapshots()).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setSnapshot — abort path
// ---------------------------------------------------------------------------
describe("setSnapshot abort handling", () => {
  it("does not throw when the transaction is aborted", async () => {
    mockObjectStore.put.mockImplementationOnce((value: any, key: string) => {
      idbStore.set(key, value);
      Promise.resolve().then(() => {
        mockTx.error = new DOMException("Quota exceeded", "QuotaExceededError");
        mockTx.onabort?.();
      });
      return {};
    });
    await expect(setSnapshot("key-abort", [[1]])).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// openDb — versionchange handling
// ---------------------------------------------------------------------------
describe("openDb versionchange handling", () => {
  it("closes the db and resets dbPromise when versionchange fires", async () => {
    // Use an isolated module instance so dbPromise starts as null for this test.
    let isolatedGetSnapshot: typeof import("../src/functions/result-cache").getSnapshot;

    await jest.isolateModulesAsync(async () => {
      ({ getSnapshot: isolatedGetSnapshot } = await import("../src/functions/result-cache"));

      // Warm up the singleton so dbPromise is set and onversionchange is registered.
      await isolatedGetSnapshot!("warmup");
      expect(mockDb.close).not.toHaveBeenCalled();
      expect(mockDb.onversionchange).not.toBeNull();

      // Simulate another tab upgrading the database.
      mockDb.onversionchange?.();

      expect(mockDb.close).toHaveBeenCalledTimes(1);

      // A subsequent call must re-open the database (indexedDB.open called again).
      const openCallsBefore = (indexedDB.open as jest.Mock).mock.calls.length;
      await isolatedGetSnapshot!("after-version-change");
      expect((indexedDB.open as jest.Mock).mock.calls.length).toBeGreaterThan(openCallsBefore);
    });
  });
});
