// Copyright IBM Corp. 2026

import { UserCredentials } from "../../common/credentials";
import { getEnviziGraphQLUrl } from "../../common/env";
import { performLogout } from "./authService";

// Mock axios
const mockAxiosPost = jest.fn();
jest.mock("axios", () => ({
  post: (...args: any[]) => mockAxiosPost(...args),
}));

// Mock the client module
const mockResetClient = jest.fn();
jest.mock("../../functions/client", () => ({
  resetClient: () => mockResetClient(),
}));

// Mock the credentials module
const mockRemoveCredentialsFromStorage = jest.fn();
const mockGetUserCredentials = jest.fn();
jest.mock("../../common/credentials", () => ({
  removeCredentialsFromStorage: () => mockRemoveCredentialsFromStorage(),
  getUserCredentials: () => mockGetUserCredentials(),
}));

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("performLogout", () => {
    const mockUserCredentials: UserCredentials = {
      token: "test-token",
      refreshToken: "test-refresh-token",
      coreToken: "test-core-token",
    };

    beforeEach(() => {
      mockRemoveCredentialsFromStorage.mockResolvedValue(undefined);
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

    it("should perform logout successfully without user credentials", async () => {
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

    it("should handle logout without prior login", async () => {
      await expect(performLogout()).resolves.toBeUndefined();
      expect(mockResetClient).toHaveBeenCalledTimes(1);
    });
  });
});
