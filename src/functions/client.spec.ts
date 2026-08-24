// Copyright IBM Corp. 2026

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock("emissions-api-sdk", () => ({
  Client: {
    instance: null as unknown,
    getClient: jest.fn(),
  },
}));

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

jest.mock("../common/credentials", () => ({
  loadCredentialsFromStorage: jest.fn(),
}));

jest.mock("../common/env", () => ({
  getApiUrl: jest.fn((api: string) => {
    const urls: Record<string, string> = {
      ghgemissions: "https://api.ibm.com/ghgemissions/run",
      saascore: "https://api.ibm.com/saascore/run",
    };
    return urls[api] ?? "https://api.ibm.com/unknown";
  }),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { Client } from "emissions-api-sdk";
import { jwtDecode } from "jwt-decode";

import { loadCredentialsFromStorage } from "../common/credentials";
import { getApiUrl } from "../common/env";
import { ensureClient, resetClient } from "./client";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockGetClient = Client.getClient as jest.Mock;
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
const mockLoadCredentials = loadCredentialsFromStorage as jest.MockedFunction<
  typeof loadCredentialsFromStorage
>;
const mockGetApiUrl = getApiUrl as jest.MockedFunction<typeof getApiUrl>;

// ─── Globals ──────────────────────────────────────────────────────────────────

const mockShowAsTaskpane = jest.fn();

(global as any).Office = {
  addin: { showAsTaskpane: mockShowAsTaskpane },
};

(global as any).CustomFunctions = {
  Error: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
  ErrorCode: { notAvailable: "notAvailable" },
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const credentials = {
  token: "access-token",
  refreshToken: "refresh-token",
  coreToken: "core-token",
};

const decodedToken = { tenantId: "tenant-abc", sub: "user-1" };

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the singleton between tests
  Client["instance"] = null;
  mockJwtDecode.mockReturnValue(decodedToken as any);
  mockGetClient.mockResolvedValue(undefined);
  mockGetApiUrl.mockImplementation((api: string) => {
    const urls: Record<string, string> = {
      ghgemissions: "https://api.ibm.com/ghgemissions/run",
      saascore: "https://api.ibm.com/saascore/run",
    };
    return urls[api] ?? "https://api.ibm.com/unknown";
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("client", () => {
  // ── resetClient ─────────────────────────────────────────────────────────────

  describe("resetClient", () => {
    it("should set Client.instance to null", () => {
      Client["instance"] = { some: "instance" } as any;

      resetClient();

      expect(Client["instance"]).toBeNull();
    });

    it("should be idempotent — calling twice leaves instance null", () => {
      Client["instance"] = { some: "instance" } as any;

      resetClient();
      resetClient();

      expect(Client["instance"]).toBeNull();
    });

    it("should not throw when Client.instance is already null", () => {
      Client["instance"] = null;

      expect(() => resetClient()).not.toThrow();
    });
  });

  // ── ensureClient — early-exit when instance exists ──────────────────────────

  describe("ensureClient — when an instance already exists", () => {
    beforeEach(() => {
      Client["instance"] = { existing: true } as any;
    });

    it("should return without calling getClient when instance exists and no credentials passed", async () => {
      await ensureClient();

      expect(mockGetClient).not.toHaveBeenCalled();
    });

    it("should resolve to undefined when skipping re-initialisation", async () => {
      const result = await ensureClient();

      expect(result).toBeUndefined();
    });

    it("should still call getClient when credentials are explicitly passed (forced reinit)", async () => {
      await ensureClient(credentials);

      expect(mockGetClient).toHaveBeenCalledTimes(1);
    });
  });

  // ── ensureClient — credentials from argument ─────────────────────────────────

  describe("ensureClient — with credentials argument", () => {
    it("should not call loadCredentialsFromStorage when credentials are provided", async () => {
      await ensureClient(credentials);

      expect(mockLoadCredentials).not.toHaveBeenCalled();
    });

    it("should call jwtDecode with the coreToken", async () => {
      await ensureClient(credentials);

      expect(mockJwtDecode).toHaveBeenCalledWith(credentials.coreToken);
    });

    it("should call getApiUrl with 'ghgemissions' for host", async () => {
      await ensureClient(credentials);

      expect(mockGetApiUrl).toHaveBeenCalledWith("ghgemissions");
    });

    it("should call getApiUrl with 'saascore' for authUrl", async () => {
      await ensureClient(credentials);

      expect(mockGetApiUrl).toHaveBeenCalledWith("saascore");
    });

    it("should call Client.getClient with the correct config", async () => {
      await ensureClient(credentials);

      expect(mockGetClient).toHaveBeenCalledWith({
        host: "https://api.ibm.com/ghgemissions/run",
        authUrl: "https://api.ibm.com/saascore/run/authentication-retrieve/api-key",
        clientId: decodedToken.tenantId,
        token: credentials.coreToken,
        isExcelAddIn: true,
      });
    });

    it("should set clientId to the tenantId decoded from coreToken", async () => {
      mockJwtDecode.mockReturnValue({ tenantId: "tenant-xyz" } as any);

      await ensureClient(credentials);

      const config = mockGetClient.mock.calls[0][0];
      expect(config.clientId).toBe("tenant-xyz");
    });

    it("should set isExcelAddIn to true", async () => {
      await ensureClient(credentials);

      const config = mockGetClient.mock.calls[0][0];
      expect(config.isExcelAddIn).toBe(true);
    });

    it("should set token to credentials.coreToken", async () => {
      await ensureClient(credentials);

      const config = mockGetClient.mock.calls[0][0];
      expect(config.token).toBe(credentials.coreToken);
    });
  });

  // ── ensureClient — credentials from storage ──────────────────────────────────

  describe("ensureClient — credentials loaded from storage", () => {
    it("should call loadCredentialsFromStorage when no credentials are passed", async () => {
      mockLoadCredentials.mockResolvedValue(credentials);

      await ensureClient();

      expect(mockLoadCredentials).toHaveBeenCalledTimes(1);
    });

    it("should initialise the client using stored credentials", async () => {
      mockLoadCredentials.mockResolvedValue(credentials);

      await ensureClient();

      expect(mockGetClient).toHaveBeenCalledWith(
        expect.objectContaining({ token: credentials.coreToken })
      );
    });
  });

  // ── ensureClient — no credentials available ───────────────────────────────────

  describe("ensureClient — when no credentials are available", () => {
    beforeEach(() => {
      mockLoadCredentials.mockResolvedValue(null);
    });

    it("should call Office.addin.showAsTaskpane", async () => {
      await expect(ensureClient()).rejects.toThrow();

      expect(mockShowAsTaskpane).toHaveBeenCalledTimes(1);
    });

    it("should throw an error with a code property (CustomFunctions.Error shape)", async () => {
      let thrown: any;
      try {
        await ensureClient();
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(Error);
      expect(thrown).toHaveProperty("code");
    });

    it("should throw with the notAvailable error code", async () => {
      let thrown: any;
      try {
        await ensureClient();
      } catch (e) {
        thrown = e;
      }

      expect(thrown.code).toBe("notAvailable");
    });

    it("should throw with a message prompting the user to enter credentials", async () => {
      await expect(ensureClient()).rejects.toThrow(
        "Enter your credentials in the task pane."
      );
    });

    it("should not call Client.getClient when credentials are missing", async () => {
      await expect(ensureClient()).rejects.toThrow();

      expect(mockGetClient).not.toHaveBeenCalled();
    });
  });
});
