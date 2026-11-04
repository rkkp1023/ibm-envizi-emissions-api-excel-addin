// Copyright IBM Corp. 2026

import { loadScript } from "./load-script";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Intercepts the next `document.head.appendChild` call, returns the captured
 * element, and restores the original method.
 *
 * Using a one-shot spy avoids leaving mocks active between tests.
 */
function interceptAppendChild(): Promise<HTMLScriptElement> {
  return new Promise((resolve) => {
    const original = document.head.appendChild.bind(document.head);
    jest
      .spyOn(document.head, "appendChild")
      .mockImplementationOnce((node: Node) => {
        // Resolve with the captured element before restoring
        resolve(node as HTMLScriptElement);
        return original(node);
      });
  });
}

// ─── beforeEach / afterEach ───────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Remove any <script> tags added to document.head during previous tests
  document.head.querySelectorAll("script").forEach((s) => s.remove());
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("loadScript", () => {
  describe("script element creation", () => {
    it("should set script.src to the provided URL", async () => {
      const scriptPromise = interceptAppendChild();
      const url = "https://example.com/script.js";

      loadScript(url);
      const script = await scriptPromise;

      expect(script.src).toBe(url);
    });

    it("should set script.async to true", async () => {
      const scriptPromise = interceptAppendChild();

      loadScript("https://example.com/script.js");
      const script = await scriptPromise;

      expect(script.async).toBe(true);
    });

    it("should create an HTML script element", async () => {
      const scriptPromise = interceptAppendChild();

      loadScript("https://example.com/script.js");
      const script = await scriptPromise;

      expect(script.tagName).toBe("SCRIPT");
    });

    it("should append the script to document.head", async () => {
      const scriptPromise = interceptAppendChild();

      loadScript("https://example.com/script.js");
      await scriptPromise;

      expect(document.head.appendChild).toHaveBeenCalledTimes(1);
      expect(document.head.querySelector("script")).not.toBeNull();
    });
  });

  describe("successful load (onload)", () => {
    it("should resolve the promise when onload fires", async () => {
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript("https://example.com/script.js");
      const script = await scriptPromise;

      script.onload!(new Event("load"));

      await expect(loadPromise).resolves.toBeUndefined();
    });

    it("should resolve with undefined (void return)", async () => {
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript("https://example.com/script.js");
      const script = await scriptPromise;

      script.onload!(new Event("load"));

      const result = await loadPromise;
      expect(result).toBeUndefined();
    });

    it("should resolve correctly for different URLs", async () => {
      const urls = [
        "https://cdn.example.com/lib.js",
        "https://assets.example.com/analytics.js",
        "/local/path/script.js",
      ];

      for (const url of urls) {
        const scriptPromise = interceptAppendChild();
        const loadPromise = loadScript(url);
        const script = await scriptPromise;
        script.onload!(new Event("load"));
        await expect(loadPromise).resolves.toBeUndefined();
      }
    });
  });

  describe("failed load (onerror)", () => {
    it("should reject the promise when onerror fires", async () => {
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript("https://example.com/missing.js");
      const script = await scriptPromise;

      script.onerror!(new Event("error"));

      await expect(loadPromise).rejects.toThrow();
    });

    it("should reject with an Error instance", async () => {
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript("https://example.com/missing.js");
      const script = await scriptPromise;

      script.onerror!(new Event("error"));

      await expect(loadPromise).rejects.toBeInstanceOf(Error);
    });

    it("should include the URL in the rejection error message", async () => {
      const url = "https://example.com/not-found.js";
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript(url);
      const script = await scriptPromise;

      script.onerror!(new Event("error"));

      await expect(loadPromise).rejects.toThrow(`Failed to load script: ${url}`);
    });

    it("should include the URL in the error message for any URL", async () => {
      const url = "https://cdn.example.com/404.js";
      const scriptPromise = interceptAppendChild();

      const loadPromise = loadScript(url);
      const script = await scriptPromise;

      script.onerror!(new Event("error"));

      await expect(loadPromise).rejects.toThrow(url);
    });
  });

  describe("promise behaviour", () => {
    it("should return a Promise", () => {
      const scriptPromise = interceptAppendChild();
      const result = loadScript("https://example.com/script.js");
      // Prevent unhandled rejection from the floating promise
      scriptPromise.then((s) => s.onload!(new Event("load")));
      expect(result).toBeInstanceOf(Promise);
    });

    it("should not resolve before onload fires", async () => {
      const scriptPromise = interceptAppendChild();
      let resolved = false;

      const loadPromise = loadScript("https://example.com/script.js");
      loadPromise.then(() => {
        resolved = true;
      });

      await scriptPromise; // script is appended but onload hasn't fired
      await Promise.resolve(); // flush microtasks

      expect(resolved).toBe(false);
    });

    it("should not reject before onerror fires", async () => {
      const scriptPromise = interceptAppendChild();
      let rejected = false;

      const loadPromise = loadScript("https://example.com/script.js");
      loadPromise.catch(() => {
        rejected = true;
      });

      await scriptPromise;
      await Promise.resolve();

      expect(rejected).toBe(false);
    });
  });
});
