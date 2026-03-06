/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { ApiCredentials, UserCredentials } from "../../common/credentials";
import { getEnviziGraphQLUrl } from "../../common/env";
import { performLogin, performLogout, validateCredentials } from "./authService";

// Mock axios
const mockAxiosPost = jest.fn();
jest.mock("axios", () => ({
  post: (...args: any[]) => mockAxiosPost(...args),
}));

// Mock the client module
const mockEnsureClient = jest.fn();
const mockResetClient = jest.fn();
jest.mock("../../functions/client", () => ({
  ensureClient: (...args: any[]) => mockEnsureClient(...args),
  resetClient: () => mockResetClient(),
}));

// Mock the credentials module
const mockSaveApiCredentialsToStorage = jest.fn();
const mockRemoveCredentialsFromStorage = jest.fn();
const mockRemoveApiCredentialsFromStorage = jest.fn();
const mockSetApiCredentials = jest.fn();
const mockGetUserCredentials = jest.fn();
jest.mock("../../common/credentials", () => ({
  saveApiCredentialsToStorage: (...args: any[]) => mockSaveApiCredentialsToStorage(...args),
  removeCredentialsFromStorage: () => mockRemoveCredentialsFromStorage(),
  removeApiCredentialsFromStorage: () => mockRemoveApiCredentialsFromStorage(),
  setApiCredentials: (...args: any[]) => mockSetApiCredentials(...args),
  getUserCredentials: () => mockGetUserCredentials(),
}));

describe("authService", () => {
  const mockCredentials: ApiCredentials = {
    apiKey: "test-api-key",
    tenantId: "test-tenant-id",
    orgId: "test-org-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCredentials", () => {
    it("should validate credentials successfully", async () => {
      mockEnsureClient.mockResolvedValue(undefined);

      await expect(validateCredentials(mockCredentials)).resolves.toBeUndefined();
      expect(mockEnsureClient).toHaveBeenCalledWith(mockCredentials);
      expect(mockEnsureClient).toHaveBeenCalledTimes(1);
    });

    it("should throw error with 401 status for invalid credentials", async () => {
      const error = new Error("Unauthorized");
      (error as any).status = 401;
      mockEnsureClient.mockRejectedValue(error);

      await expect(validateCredentials(mockCredentials)).rejects.toThrow(
        "Invalid credentials. Please enter your credentials and try again."
      );
      expect(mockEnsureClient).toHaveBeenCalledWith(mockCredentials);
    });

    it("should throw generic error for non-401 errors", async () => {
      const error = new Error("Network error");
      (error as any).status = 500;
      mockEnsureClient.mockRejectedValue(error);

      await expect(validateCredentials(mockCredentials)).rejects.toThrow(
        "Something went wrong. Please try again later."
      );
      expect(mockEnsureClient).toHaveBeenCalledWith(mockCredentials);
    });

    it("should preserve status code in thrown error", async () => {
      const error = new Error("Unauthorized");
      (error as any).status = 401;
      mockEnsureClient.mockRejectedValue(error);

      try {
        await validateCredentials(mockCredentials);
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.status).toBe(401);
      }
    });

    it("should handle errors without status code", async () => {
      const error = new Error("Unknown error");
      mockEnsureClient.mockRejectedValue(error);

      await expect(validateCredentials(mockCredentials)).rejects.toThrow(
        "Something went wrong. Please try again later."
      );
    });
  });

  describe("performLogin", () => {
    beforeEach(() => {
      mockEnsureClient.mockResolvedValue(undefined);
      mockSaveApiCredentialsToStorage.mockResolvedValue(undefined);
      mockRemoveCredentialsFromStorage.mockResolvedValue(undefined);
      mockSetApiCredentials.mockReturnValue(undefined);
    });

    it("should perform login with save credentials", async () => {
      await performLogin(mockCredentials, true);

      expect(mockEnsureClient).toHaveBeenCalledWith(mockCredentials);
      expect(mockSetApiCredentials).toHaveBeenCalledWith(mockCredentials);
      expect(mockSaveApiCredentialsToStorage).toHaveBeenCalledWith(mockCredentials);
      expect(mockRemoveCredentialsFromStorage).not.toHaveBeenCalled();
    });

    it("should perform login without saving credentials", async () => {
      await performLogin(mockCredentials, false);

      expect(mockEnsureClient).toHaveBeenCalledWith(mockCredentials);
      expect(mockSetApiCredentials).toHaveBeenCalledWith(mockCredentials);
      expect(mockSaveApiCredentialsToStorage).not.toHaveBeenCalled();
      expect(mockRemoveApiCredentialsFromStorage).toHaveBeenCalledTimes(1);
    });

    it("should throw error if API key is missing", async () => {
      const invalidCredentials = { ...mockCredentials, apiKey: "" };

      await expect(performLogin(invalidCredentials, true)).rejects.toThrow(
        "All fields are required"
      );
      expect(mockEnsureClient).not.toHaveBeenCalled();
    });

    it("should throw error if tenant ID is missing", async () => {
      const invalidCredentials = { ...mockCredentials, tenantId: "" };

      await expect(performLogin(invalidCredentials, true)).rejects.toThrow(
        "All fields are required"
      );
      expect(mockEnsureClient).not.toHaveBeenCalled();
    });

    it("should throw error if organization ID is missing", async () => {
      const invalidCredentials = { ...mockCredentials, orgId: "" };

      await expect(performLogin(invalidCredentials, true)).rejects.toThrow(
        "All fields are required"
      );
      expect(mockEnsureClient).not.toHaveBeenCalled();
    });

    it("should validate credentials before saving", async () => {
      const error = new Error("Invalid credentials");
      (error as any).status = 401;
      mockEnsureClient.mockRejectedValue(error);

      await expect(performLogin(mockCredentials, true)).rejects.toThrow();
      expect(mockSetApiCredentials).not.toHaveBeenCalled();
      expect(mockSaveApiCredentialsToStorage).not.toHaveBeenCalled();
    });

    it("should set credentials in memory before saving to storage", async () => {
      const callOrder: string[] = [];
      mockSetApiCredentials.mockImplementation(() => callOrder.push("setCredentials"));
      mockSaveApiCredentialsToStorage.mockImplementation(() => callOrder.push("saveToStorage"));

      await performLogin(mockCredentials, true);

      expect(callOrder).toEqual(["setCredentials", "saveToStorage"]);
    });

    it("should handle validation errors properly", async () => {
      const error = new Error("Network error");
      (error as any).status = 500;
      mockEnsureClient.mockRejectedValue(error);

      await expect(performLogin(mockCredentials, true)).rejects.toThrow(
        "Something went wrong. Please try again later."
      );
    });
  });

  describe("performLogout", () => {
    const mockUserCredentials: UserCredentials = {
      token: "test-token",
      refreshToken: "test-refresh-token",
      coreToken: "test-core-token",
    };

    beforeEach(() => {
      mockRemoveCredentialsFromStorage.mockResolvedValue(undefined);
      mockSetApiCredentials.mockReturnValue(undefined);
      mockResetClient.mockReturnValue(undefined);
      mockGetUserCredentials.mockReturnValue(null);
      mockAxiosPost.mockResolvedValue({
        data: {
          data: {
            logout: true,
          },
        },
      });
    });

    it("should perform logout successfully with API key credentials", async () => {
      mockGetUserCredentials.mockReturnValue(null);

      await performLogout();

      expect(mockAxiosPost).not.toHaveBeenCalled();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
      expect(mockRemoveCredentialsFromStorage).toHaveBeenCalledTimes(1);
    });

    it("should perform logout with GraphQL mutation for user credentials", async () => {
      mockGetUserCredentials.mockReturnValue(mockUserCredentials);

      await performLogout();

      expect(mockAxiosPost).toHaveBeenCalledWith(
        `${getEnviziGraphQLUrl()}/ui/graphql`,
        {
          query: expect.stringContaining("mutation logoutUser"),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockUserCredentials.token}`,
          },
        }
      );
      expect(mockResetClient).toHaveBeenCalledTimes(1);
      expect(mockRemoveCredentialsFromStorage).toHaveBeenCalledTimes(1);
    });

    it("should clear credentials in correct order", async () => {
      const callOrder: string[] = [];
      mockGetUserCredentials.mockReturnValue(null);
      mockResetClient.mockImplementation(() => callOrder.push("resetClient"));
      mockRemoveCredentialsFromStorage.mockImplementation(() => callOrder.push("removeStorage"));

      await performLogout();

      expect(callOrder).toEqual(["resetClient", "removeStorage"]);
    });

    it("should handle GraphQL logout errors gracefully", async () => {
      mockGetUserCredentials.mockReturnValue(mockUserCredentials);
      mockAxiosPost.mockRejectedValue(new Error("Network error"));

      // Should not throw, just log the error and continue
      await expect(performLogout()).resolves.toBeUndefined();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
      expect(mockRemoveCredentialsFromStorage).toHaveBeenCalledTimes(1);
    });

    it("should handle storage removal errors gracefully", async () => {
      mockGetUserCredentials.mockReturnValue(null);
      mockRemoveCredentialsFromStorage.mockRejectedValue(new Error("Storage error"));

      // Should not throw, just log the error
      await expect(performLogout()).resolves.toBeUndefined();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });

    it("should reset client even if storage removal fails", async () => {
      mockGetUserCredentials.mockReturnValue(null);
      mockRemoveCredentialsFromStorage.mockRejectedValue(new Error("Storage error"));

      await performLogout();

      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });

    it("should continue logout even if GraphQL mutation fails", async () => {
      mockGetUserCredentials.mockReturnValue(mockUserCredentials);
      mockAxiosPost.mockRejectedValue(new Error("GraphQL error"));

      await performLogout();

      expect(mockResetClient).toHaveBeenCalledTimes(1);
      expect(mockRemoveCredentialsFromStorage).toHaveBeenCalledTimes(1);
    });

    it("should skip GraphQL logout if user credentials have no token", async () => {
      mockGetUserCredentials.mockReturnValue({ ...mockUserCredentials, token: "" });

      await performLogout();

      expect(mockAxiosPost).not.toHaveBeenCalled();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration scenarios", () => {
    beforeEach(() => {
      mockEnsureClient.mockResolvedValue(undefined);
      mockSaveApiCredentialsToStorage.mockResolvedValue(undefined);
      mockRemoveCredentialsFromStorage.mockResolvedValue(undefined);
      mockSetApiCredentials.mockReturnValue(undefined);
      mockResetClient.mockReturnValue(undefined);
    });

    it("should handle login followed by logout", async () => {
      await performLogin(mockCredentials, true);
      await performLogout();

      expect(mockSetApiCredentials).toHaveBeenCalledWith(mockCredentials);
      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple login attempts", async () => {
      await performLogin(mockCredentials, true);
      await performLogin(mockCredentials, false);

      expect(mockEnsureClient).toHaveBeenCalledTimes(2);
      expect(mockSetApiCredentials).toHaveBeenCalledTimes(2);
    });

    it("should handle logout without prior login", async () => {
      await expect(performLogout()).resolves.toBeUndefined();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });
  });
});
