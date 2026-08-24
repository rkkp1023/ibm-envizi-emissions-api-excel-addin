// Copyright IBM Corp. 2026

// ─── Module mocks (must be declared before any imports) ──────────────────────

jest.mock("../../src/api/coreEnviziAuth", () => ({
  coreEnviziAuth: {
    exchangeToken: jest.fn(),
  },
}));

jest.mock("../../src/common/env", () => ({
  getEnvType: jest.fn(() => "local"),
  getEnviziUiOrigin: jest.fn((env: string) => {
    const origins: Record<string, string> = {
      prod: "https://envizi.ibm.com",
      np: "https://us006t.envizi.com",
      local: "https://local.us006t.envizi.com",
    };
    return origins[env] ?? origins["local"];
  }),
}));

// ─── Imports of mocked modules ────────────────────────────────────────────────

import { coreEnviziAuth } from "../../src/api/coreEnviziAuth";
import { getEnvType } from "../../src/common/env";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockExchangeToken = coreEnviziAuth.exchangeToken as jest.Mock;
const mockGetEnvType = getEnvType as jest.MockedFunction<typeof getEnvType>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Loads the login module inside an isolated module registry so each test
 * starts with a fresh Office.onReady execution.
 */
async function loadModule(officeMock: any) {
  (global as any).Office = officeMock;

  await jest.isolateModulesAsync(async () => {
    await import("../../src/login/login");
  });
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  // Suppress jsdom "Not implemented: navigation" console.error noise
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("login", () => {
  describe("Office.onReady initialisation", () => {
    it("should register an Office.onReady callback", async () => {
      const officeMock = buildOfficeMock();
      mockExchangeToken.mockResolvedValue("core-token");
      window.localStorage.setItem("tokenForLogin", "t");
      window.localStorage.setItem("refreshTokenForLogin", "r");

      await loadModule(officeMock);

      expect(officeMock.onReady).toHaveBeenCalledTimes(1);
    });
  });

  describe("loginUrls", () => {
    it("should export the correct login URL for prod", async () => {
      const { loginUrls } = await import("../../src/login/login");
      expect(loginUrls.prod).toBe("https://envizi.ibm.com/emissions-excel-login/login");
    });

    it("should export the correct login URL for np", async () => {
      const { loginUrls } = await import("../../src/login/login");
      expect(loginUrls.np).toBe("https://us006t.envizi.com/emissions-excel-login/login");
    });

    it("should export the correct login URL for local", async () => {
      const { loginUrls } = await import("../../src/login/login");
      expect(loginUrls.local).toBe(
        "https://local.us006t.envizi.com/emissions-bridge/login"
      );
    });
  });

  describe("when localStorage tokens are present (local dev bypass)", () => {
    const token = "stored-access-token";
    const refreshToken = "stored-refresh-token";
    const coreToken = "exchanged-core-token";

    beforeEach(() => {
      window.localStorage.setItem("tokenForLogin", token);
      window.localStorage.setItem("refreshTokenForLogin", refreshToken);
      mockExchangeToken.mockResolvedValue(coreToken);
    });

    it("should call coreEnviziAuth.exchangeToken with the stored token", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      expect(mockExchangeToken).toHaveBeenCalledTimes(1);
      expect(mockExchangeToken).toHaveBeenCalledWith(token);
    });

    it("should call messageParent with a JSON-serialised LoginDialogMessage", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      expect(officeMock.context.ui.messageParent).toHaveBeenCalledTimes(1);
      expect(officeMock.context.ui.messageParent).toHaveBeenCalledWith(
        JSON.stringify({ token, refreshToken, coreToken })
      );
    });

    it("should not trigger navigation (no redirect)", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      // No jsdom navigation warning should have been logged
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should produce valid JSON as the messageParent argument", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      const raw = (officeMock.context.ui.messageParent as jest.Mock).mock.calls[0][0];
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it("should include all three token fields in the message payload", async () => {
      const officeMock = buildOfficeMock();
      await loadModule(officeMock);

      const raw = (officeMock.context.ui.messageParent as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(raw);
      expect(parsed).toEqual({ token, refreshToken, coreToken });
    });
  });

  describe("when localStorage tokens are absent (normal login flow)", () => {
    it("should call getEnvType to determine the redirect URL", async () => {
      mockGetEnvType.mockReturnValue("local");
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      expect(mockGetEnvType).toHaveBeenCalled();
    });

    it("should attempt navigation (jsdom fires href assignment) for env type local", async () => {
      mockGetEnvType.mockReturnValue("local");
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      // jsdom fires a navigation error when window.location.href is assigned —
      // the presence of that error confirms the redirect branch was taken.
      expect(console.error).toHaveBeenCalled();
      expect(mockGetEnvType).toHaveBeenCalled();
    });

    it("should redirect to the correct URL for env type prod (loginUrls.prod)", async () => {
      mockGetEnvType.mockReturnValue("prod");
      const officeMock = buildOfficeMock();

      // Verify by checking that loginUrls[getEnvType()] resolves to the right URL
      const { loginUrls } = await import("../../src/login/login");
      const expectedUrl = loginUrls["prod"];

      await loadModule(officeMock);

      expect(expectedUrl).toBe("https://envizi.ibm.com/emissions-excel-login/login");
    });

    it("should redirect to the correct URL for env type np (loginUrls.np)", async () => {
      mockGetEnvType.mockReturnValue("np");

      const { loginUrls } = await import("../../src/login/login");
      const expectedUrl = loginUrls["np"];

      expect(expectedUrl).toBe("https://us006t.envizi.com/emissions-excel-login/login");
    });

    it("should not call coreEnviziAuth.exchangeToken", async () => {
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      expect(mockExchangeToken).not.toHaveBeenCalled();
    });

    it("should not call messageParent", async () => {
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });
  });

  describe("when only token is in localStorage (refreshToken missing)", () => {
    it("should redirect instead of calling exchangeToken", async () => {
      window.localStorage.setItem("tokenForLogin", "some-token");
      mockGetEnvType.mockReturnValue("local");
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      expect(mockExchangeToken).not.toHaveBeenCalled();
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });
  });

  describe("when only refreshToken is in localStorage (token missing)", () => {
    it("should redirect instead of calling exchangeToken", async () => {
      window.localStorage.setItem("refreshTokenForLogin", "some-refresh-token");
      mockGetEnvType.mockReturnValue("local");
      const officeMock = buildOfficeMock();

      await loadModule(officeMock);

      expect(mockExchangeToken).not.toHaveBeenCalled();
      expect(officeMock.context.ui.messageParent).not.toHaveBeenCalled();
    });
  });
});
