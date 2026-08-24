// Copyright IBM Corp. 2026

import {
  getUserCredentials,
  loadCredentialsFromStorage,
  loadUserCredentialsFromStorage,
  removeCredentialsFromStorage,
  removeUserCredentialsFromStorage,
  saveUserCredentialsToStorage,
  setUserCredentials,
} from "./credentials";

// ─── OfficeRuntime mock ───────────────────────────────────────────────────────

const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

function setOfficeRuntimeStorage(storage: typeof mockStorage | null) {
  (global as any).OfficeRuntime = { storage };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const credentials = {
  token: "access-token-123",
  refreshToken: "refresh-token-456",
  coreToken: "core-token-789",
};

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Reset in-memory window state
  delete (window as any).userCredentials;
  // Default: storage is available
  setOfficeRuntimeStorage(mockStorage);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("credentials", () => {
  // ── getUserCredentials ───────────────────────────────────────────────────────

  describe("getUserCredentials", () => {
    it("should return undefined when no credentials have been set", () => {
      expect(getUserCredentials()).toBeUndefined();
    });

    it("should return the credentials that were set", () => {
      window.userCredentials = credentials;
      expect(getUserCredentials()).toEqual(credentials);
    });

    it("should return null after setUserCredentials(null) was called", () => {
      setUserCredentials(null);
      expect(getUserCredentials()).toBeNull();
    });
  });

  // ── setUserCredentials ───────────────────────────────────────────────────────

  describe("setUserCredentials", () => {
    it("should store credentials on window.userCredentials", () => {
      setUserCredentials(credentials);
      expect(window.userCredentials).toEqual(credentials);
    });

    it("should overwrite previously stored credentials", () => {
      setUserCredentials(credentials);
      const updated = { ...credentials, token: "new-token" };
      setUserCredentials(updated);
      expect(window.userCredentials).toEqual(updated);
    });

    it("should store null when called with null", () => {
      setUserCredentials(credentials);
      setUserCredentials(null);
      expect(window.userCredentials).toBeNull();
    });
  });

  // ── loadUserCredentialsFromStorage ───────────────────────────────────────────

  describe("loadUserCredentialsFromStorage", () => {
    it("should return null when OfficeRuntime.storage is not available", async () => {
      setOfficeRuntimeStorage(null);
      const result = await loadUserCredentialsFromStorage();
      expect(result).toBeNull();
    });

    it("should return null when storage returns null", async () => {
      mockStorage.getItem.mockResolvedValue(null);
      const result = await loadUserCredentialsFromStorage();
      expect(result).toBeNull();
    });

    it("should return null when storage returns an empty string", async () => {
      mockStorage.getItem.mockResolvedValue("");
      const result = await loadUserCredentialsFromStorage();
      expect(result).toBeNull();
    });

    it("should parse and return credentials when storage has a value", async () => {
      mockStorage.getItem.mockResolvedValue(JSON.stringify(credentials));
      const result = await loadUserCredentialsFromStorage();
      expect(result).toEqual(credentials);
    });

    it("should call storage.getItem with the correct key", async () => {
      mockStorage.getItem.mockResolvedValue(null);
      await loadUserCredentialsFromStorage();
      expect(mockStorage.getItem).toHaveBeenCalledWith("userCredentials");
    });

    it("should call setUserCredentials with the parsed credentials", async () => {
      mockStorage.getItem.mockResolvedValue(JSON.stringify(credentials));
      await loadUserCredentialsFromStorage();
      expect(window.userCredentials).toEqual(credentials);
    });

    it("should not call storage.getItem when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      await loadUserCredentialsFromStorage();
      expect(mockStorage.getItem).not.toHaveBeenCalled();
    });
  });

  // ── saveUserCredentialsToStorage ─────────────────────────────────────────────

  describe("saveUserCredentialsToStorage", () => {
    it("should set window.userCredentials immediately", async () => {
      mockStorage.setItem.mockResolvedValue(undefined);
      await saveUserCredentialsToStorage(credentials);
      expect(window.userCredentials).toEqual(credentials);
    });

    it("should call storage.setItem with the serialised credentials", async () => {
      mockStorage.setItem.mockResolvedValue(undefined);
      await saveUserCredentialsToStorage(credentials);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "userCredentials",
        JSON.stringify(credentials)
      );
    });

    it("should return without calling storage.setItem when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      await saveUserCredentialsToStorage(credentials);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("should still set window.userCredentials even when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      await saveUserCredentialsToStorage(credentials);
      expect(window.userCredentials).toEqual(credentials);
    });

    it("should serialise credentials as valid JSON", async () => {
      mockStorage.setItem.mockResolvedValue(undefined);
      await saveUserCredentialsToStorage(credentials);
      const [, json] = mockStorage.setItem.mock.calls[0];
      expect(() => JSON.parse(json)).not.toThrow();
      expect(JSON.parse(json)).toEqual(credentials);
    });
  });

  // ── removeUserCredentialsFromStorage ─────────────────────────────────────────

  describe("removeUserCredentialsFromStorage", () => {
    it("should set window.userCredentials to null", async () => {
      window.userCredentials = credentials;
      mockStorage.removeItem.mockResolvedValue(undefined);
      await removeUserCredentialsFromStorage();
      expect(window.userCredentials).toBeNull();
    });

    it("should call storage.removeItem with the correct key", async () => {
      mockStorage.removeItem.mockResolvedValue(undefined);
      await removeUserCredentialsFromStorage();
      expect(mockStorage.removeItem).toHaveBeenCalledWith("userCredentials");
    });

    it("should return without calling storage.removeItem when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      await removeUserCredentialsFromStorage();
      expect(mockStorage.removeItem).not.toHaveBeenCalled();
    });

    it("should still null window.userCredentials when storage is unavailable", async () => {
      window.userCredentials = credentials;
      setOfficeRuntimeStorage(null);
      await removeUserCredentialsFromStorage();
      expect(window.userCredentials).toBeNull();
    });
  });

  // ── loadCredentialsFromStorage ────────────────────────────────────────────────

  describe("loadCredentialsFromStorage", () => {
    it("should delegate to loadUserCredentialsFromStorage and return the same result", async () => {
      mockStorage.getItem.mockResolvedValue(JSON.stringify(credentials));
      const result = await loadCredentialsFromStorage();
      expect(result).toEqual(credentials);
    });

    it("should return null when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      const result = await loadCredentialsFromStorage();
      expect(result).toBeNull();
    });

    it("should return null when storage has no entry", async () => {
      mockStorage.getItem.mockResolvedValue(null);
      const result = await loadCredentialsFromStorage();
      expect(result).toBeNull();
    });
  });

  // ── removeCredentialsFromStorage ──────────────────────────────────────────────

  describe("removeCredentialsFromStorage", () => {
    it("should delegate to removeUserCredentialsFromStorage and null window.userCredentials", async () => {
      window.userCredentials = credentials;
      mockStorage.removeItem.mockResolvedValue(undefined);
      await removeCredentialsFromStorage();
      expect(window.userCredentials).toBeNull();
    });

    it("should call storage.removeItem", async () => {
      mockStorage.removeItem.mockResolvedValue(undefined);
      await removeCredentialsFromStorage();
      expect(mockStorage.removeItem).toHaveBeenCalledWith("userCredentials");
    });

    it("should resolve without error when storage is unavailable", async () => {
      setOfficeRuntimeStorage(null);
      await expect(removeCredentialsFromStorage()).resolves.toBeUndefined();
    });
  });
});
