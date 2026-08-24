// Copyright IBM Corp. 2026

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a minimal Office mock.
 * `onVisibilityModeChanged` is a jest.fn() so tests can capture and invoke
 * the registered callback.
 */
function buildOfficeMock() {
  return {
    onReady: jest.fn((cb: () => void) => {
      cb();
    }),
    addin: {
      onVisibilityModeChanged: jest.fn(),
    },
    VisibilityMode: {
      taskpane: "Taskpane",
    },
  };
}

/**
 * Loads the taskPaneVisibility module inside an isolated module registry.
 * Each call gets a fresh module-level `isTaskpaneOpen` variable.
 *
 * @param officeMock - pass `undefined` to simulate Office being absent.
 */
async function loadModule(officeMock?: any) {
  if (officeMock === undefined) {
    delete (global as any).Office;
  } else {
    (global as any).Office = officeMock;
  }

  let mod: typeof import("../../src/commands/taskPaneVisibility");

  await jest.isolateModulesAsync(async () => {
    mod = await import("../../src/commands/taskPaneVisibility");
  });

  return mod!;
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("taskPaneVisibility", () => {
  describe("getIsTaskpaneOpen — default state", () => {
    it("should return true before any visibility change event", async () => {
      const officeMock = buildOfficeMock();
      const { getIsTaskpaneOpen } = await loadModule(officeMock);

      expect(getIsTaskpaneOpen()).toBe(true);
    });
  });

  describe("Office.onReady registration", () => {
    it("should call Office.onReady once on module load", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      expect(officeMock.onReady).toHaveBeenCalledTimes(1);
    });

    it("should register an onVisibilityModeChanged handler inside Office.onReady", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      expect(officeMock.addin.onVisibilityModeChanged).toHaveBeenCalledTimes(1);
      expect(officeMock.addin.onVisibilityModeChanged).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe("when Office is not defined", () => {
    it("should not throw when Office is absent", async () => {
      await expect(loadModule(undefined)).resolves.toBeDefined();
    });

    it("should still export getIsTaskpaneOpen", async () => {
      const { getIsTaskpaneOpen } = await loadModule(undefined);

      expect(typeof getIsTaskpaneOpen).toBe("function");
    });

    it("should return true (default) when Office is absent", async () => {
      const { getIsTaskpaneOpen } = await loadModule(undefined);

      expect(getIsTaskpaneOpen()).toBe(true);
    });
  });

  describe("onVisibilityModeChanged callback", () => {
    /**
     * Helper — loads the module and returns both the exported function and
     * the visibility-change callback that was registered with Office.
     */
    async function loadAndCaptureCallback() {
      const officeMock = buildOfficeMock();
      const { getIsTaskpaneOpen } = await loadModule(officeMock);

      const visibilityCallback: (args: { visibilityMode: string }) => void =
        officeMock.addin.onVisibilityModeChanged.mock.calls[0][0];

      return { getIsTaskpaneOpen, visibilityCallback, officeMock };
    }

    it("should set isTaskpaneOpen to true when visibilityMode equals taskpane", async () => {
      const { getIsTaskpaneOpen, visibilityCallback, officeMock } =
        await loadAndCaptureCallback();

      visibilityCallback({ visibilityMode: officeMock.VisibilityMode.taskpane });

      expect(getIsTaskpaneOpen()).toBe(true);
    });

    it("should set isTaskpaneOpen to false when visibilityMode is not taskpane", async () => {
      const { getIsTaskpaneOpen, visibilityCallback } = await loadAndCaptureCallback();

      visibilityCallback({ visibilityMode: "Hidden" });

      expect(getIsTaskpaneOpen()).toBe(false);
    });

    it("should set isTaskpaneOpen to false for an empty visibilityMode string", async () => {
      const { getIsTaskpaneOpen, visibilityCallback } = await loadAndCaptureCallback();

      visibilityCallback({ visibilityMode: "" });

      expect(getIsTaskpaneOpen()).toBe(false);
    });

    it("should update state on multiple consecutive visibility changes", async () => {
      const { getIsTaskpaneOpen, visibilityCallback, officeMock } =
        await loadAndCaptureCallback();

      visibilityCallback({ visibilityMode: "Hidden" });
      expect(getIsTaskpaneOpen()).toBe(false);

      visibilityCallback({ visibilityMode: officeMock.VisibilityMode.taskpane });
      expect(getIsTaskpaneOpen()).toBe(true);

      visibilityCallback({ visibilityMode: "Hidden" });
      expect(getIsTaskpaneOpen()).toBe(false);
    });

    it("should reflect the last visibility change when called multiple times", async () => {
      const { getIsTaskpaneOpen, visibilityCallback, officeMock } =
        await loadAndCaptureCallback();

      // Rapid successive changes — only the final state matters
      visibilityCallback({ visibilityMode: "Hidden" });
      visibilityCallback({ visibilityMode: officeMock.VisibilityMode.taskpane });

      expect(getIsTaskpaneOpen()).toBe(true);
    });
  });
});
