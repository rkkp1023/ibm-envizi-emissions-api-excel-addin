// Copyright IBM Corp. 2026

// ─── Global Office mock ───────────────────────────────────────────────────────

/**
 * Loads the login-callback module inside an isolated module registry.
 * Allows each test to start with fresh module-level state.
 */
async function loadModule(officeMock: any, search = "") {
  (global as any).Office = officeMock;

  // jsdom guards window.location; mock URLSearchParams so the module reads
  // the search string we supply without triggering jsdom's navigation.
  (global as any).URLSearchParams = class {
    private params: Record<string, string>;
    constructor(_search: string) {
      this.params = {};
      const qs = search.replace(/^\?/, "");
      if (qs) {
        for (const pair of qs.split("&")) {
          const [k, v] = pair.split("=");
          this.params[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
        }
      }
    }
    get(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(this.params, key)
        ? this.params[key]
        : null;
    }
  };

  await jest.isolateModulesAsync(async () => {
    await import("../../src/login/login-callback");
  });
}

function buildOfficeMock() {
  return {
    onReady: jest.fn((cb: () => void) => {
      cb();
    }),
    context: {
      ui: {
        messageParent: jest.fn(),
      },
    },
  };
}

// ─── beforeEach / afterEach ───────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("login-callback", () => {
  describe("Office.onReady initialisation", () => {
    it("should register an Office.onReady callback", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      expect(officeMock.onReady).toHaveBeenCalledTimes(1);
    });
  });

  describe("when all required tokens are present", () => {
    const token = "access-token-123";
    const refreshToken = "refresh-token-456";
    const coreToken = "core-token-789";

    it("should call messageParent with a JSON-serialised LoginDialogMessage", async () => {
      const officeMock = buildOfficeMock();
      const search = `?token=${token}&refreshToken=${refreshToken}&coreToken=${coreToken}`;

      await loadModule(officeMock, search);

      expect(officeMock.context.ui.messageParent).toHaveBeenCalledTimes(1);
      expect(officeMock.context.ui.messageParent).toHaveBeenCalledWith(
        JSON.stringify({ token, refreshToken, coreToken })
      );
    });

    it("should not log an error when all tokens are present", async () => {
      const officeMock = buildOfficeMock();
      const search = `?token=${token}&refreshToken=${refreshToken}&coreToken=${coreToken}`;

      await loadModule(officeMock, search);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("when tokens are missing", () => {
    it("should log an error and not call messageParent when token is missing", async () => {
      const officeMock = buildOfficeMock();
      const search = `?refreshToken=r&coreToken=c`;

      await loadModule(officeMock, search);

      expect(console.error).toHaveBeenCalledWith("Missing required tokens in callback URL");
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });

    it("should log an error and not call messageParent when refreshToken is missing", async () => {
      const officeMock = buildOfficeMock();
      const search = `?token=t&coreToken=c`;

      await loadModule(officeMock, search);

      expect(console.error).toHaveBeenCalledWith("Missing required tokens in callback URL");
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });

    it("should log an error and not call messageParent when coreToken is missing", async () => {
      const officeMock = buildOfficeMock();
      const search = `?token=t&refreshToken=r`;

      await loadModule(officeMock, search);

      expect(console.error).toHaveBeenCalledWith("Missing required tokens in callback URL");
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });

    it("should log an error and not call messageParent when no query params are present", async () => {
      const officeMock = buildOfficeMock();

      await loadModule(officeMock, "");

      expect(console.error).toHaveBeenCalledWith("Missing required tokens in callback URL");
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });
  });

  describe("message payload shape", () => {
    it("should serialise all three token fields in the correct order", async () => {
      const officeMock = buildOfficeMock();
      const search = "?token=T1&refreshToken=T2&coreToken=T3";

      await loadModule(officeMock, search);

      const raw = (officeMock.context.ui.messageParent as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(raw);

      expect(parsed).toEqual({ token: "T1", refreshToken: "T2", coreToken: "T3" });
    });

    it("should produce valid JSON as the messageParent argument", async () => {
      const officeMock = buildOfficeMock();
      const search = "?token=T&refreshToken=R&coreToken=C";

      await loadModule(officeMock, search);

      const raw = (officeMock.context.ui.messageParent as jest.Mock).mock.calls[0][0];

      expect(() => JSON.parse(raw)).not.toThrow();
    });
  });
});
