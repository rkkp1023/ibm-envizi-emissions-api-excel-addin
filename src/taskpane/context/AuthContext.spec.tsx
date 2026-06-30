// Copyright IBM Corp. 2026

import { act, renderHook, waitFor } from "@testing-library/react";
import { jwtDecode } from "jwt-decode";
import React from "react";

import { coreEnviziAuth } from "../../api/coreEnviziAuth";
import { enviziUiGraphQL } from "../../api/enviziUiGraphQL";
import { refreshMetadataOnLogin } from "../../commands/commands";
import {
  loadCredentialsFromStorage,
  removeCredentialsFromStorage,
  saveUserCredentialsToStorage,
} from "../../common/credentials";
import { ensureClient, resetClient } from "../../functions/client";
import { displayLoginDialog } from "../auth";
import { analyticsService } from "../services/analyticsService";
import { performLogout } from "../services/authService";
import { AuthContext, AuthProvider } from "./AuthContext";

// Mock dependencies
jest.mock("jwt-decode");
jest.mock("../../api/coreEnviziAuth");
jest.mock("../../api/enviziUiGraphQL");
jest.mock("../../commands/commands");
jest.mock("../../common/credentials");
jest.mock("../../functions/client");
jest.mock("../auth");
jest.mock("../services/authService");

jest.mock("../services/analyticsService", () => ({
  analyticsService: {
    updateUserProfile: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
const mockedLoadCredentials = loadCredentialsFromStorage as jest.MockedFunction<
  typeof loadCredentialsFromStorage
>;
const mockedSaveCredentials = saveUserCredentialsToStorage as jest.MockedFunction<
  typeof saveUserCredentialsToStorage
>;
const mockedRemoveCredentials = removeCredentialsFromStorage as jest.MockedFunction<
  typeof removeCredentialsFromStorage
>;
const mockedDisplayLoginDialog = displayLoginDialog as jest.MockedFunction<
  typeof displayLoginDialog
>;
const mockedPerformLogout = performLogout as jest.MockedFunction<typeof performLogout>;
const mockedRefreshMetadata = refreshMetadataOnLogin as jest.MockedFunction<
  typeof refreshMetadataOnLogin
>;
const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
const mockedResetClient = resetClient as jest.MockedFunction<typeof resetClient>;
const mockedEnviziUiGraphQL = enviziUiGraphQL as jest.Mocked<typeof enviziUiGraphQL>;
const mockedCoreEnviziAuth = coreEnviziAuth as jest.Mocked<typeof coreEnviziAuth>;
const mockedAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

const syncAuthStateTimeout = 5 * 60 * 1000;

describe("AuthContext", () => {
  const mockCredentials = {
    token: "mock-token",
    refreshToken: "mock-refresh-token",
    coreToken: "mock-core-token",
  };

  const mockDecodedToken = {
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedAnalyticsService.updateUserProfile.mockResolvedValue(undefined);
    mockedJwtDecode.mockReturnValue(mockDecodedToken);
    mockedLoadCredentials.mockResolvedValue(null);
    mockedRefreshMetadata.mockResolvedValue(undefined);
    mockedPerformLogout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe("Initialization", () => {
    it("should initialize with no credentials", async () => {
      mockedLoadCredentials.mockResolvedValue(null);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      expect(result.current?.state.credentials).toBeNull();
      expect(result.current?.state.isAuthenticated).toBe(false);
      expect(mockedLoadCredentials).toHaveBeenCalled();
    });

    it("should initialize with valid credentials from storage", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      expect(result.current?.state.credentials).toEqual(mockCredentials);
      expect(result.current?.state.isAuthenticated).toBe(true);
      expect(mockedRefreshMetadata).toHaveBeenCalled();
    });

    it("should remove expired credentials on initialization", async () => {
      const expiredToken = {
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      mockedJwtDecode.mockReturnValue(expiredToken);
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      expect(result.current?.state.credentials).toBeNull();
      expect(result.current?.state.isAuthenticated).toBe(false);
      expect(mockedRemoveCredentials).toHaveBeenCalled();
    });

    it("should handle initialization errors gracefully", async () => {
      mockedLoadCredentials.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      expect(result.current?.state.credentials).toBeNull();
    });
  });

  describe("Login", () => {
    it("should handle successful login", async () => {
      mockedLoadCredentials.mockResolvedValue(null);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      // Simulate login
      act(() => {
        result.current?.displayLogin();
      });

      expect(mockedDisplayLoginDialog).toHaveBeenCalled();

      // Get the success callback
      const successCallback = mockedDisplayLoginDialog.mock.calls[0][0];

      // Call the success callback
      await act(async () => {
        await successCallback(mockCredentials);
      });

      expect(mockedSaveCredentials).toHaveBeenCalledWith(mockCredentials);
      expect(mockedEnsureClient).toHaveBeenCalledWith(mockCredentials);
      expect(mockedRefreshMetadata).toHaveBeenCalled();
      expect(result.current?.state.isAuthenticated).toBe(true);
      expect(result.current?.state.credentials).toEqual(mockCredentials);
    });

    it("should handle failed login", async () => {
      mockedLoadCredentials.mockResolvedValue(null);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      // Simulate login
      act(() => {
        result.current?.displayLogin();
      });

      // Get the failure callback
      const failureCallback = mockedDisplayLoginDialog.mock.calls[0][1];

      // Call the failure callback
      act(() => {
        failureCallback();
      });

      expect(result.current?.state.isAuthenticated).toBe(false);
      expect(result.current?.state.credentials).toBeNull();
    });
  });

  describe("Logout", () => {
    it("should handle logout successfully", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await result.current?.logout();
      });

      expect(mockedPerformLogout).toHaveBeenCalled();
      expect(result.current?.state.isAuthenticated).toBe(false);
      expect(result.current?.state.credentials).toBeNull();
      expect(result.current?.state.isLoggedOut).toBe(true);
    });

    it("should handle logout errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockedLoadCredentials.mockResolvedValue(mockCredentials);
      mockedPerformLogout.mockRejectedValue(new Error("Logout failed"));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Perform logout
      await act(async () => {
        await result.current?.logout();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout error:", expect.any(Error));
      expect(result.current?.state.isAuthenticated).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Token Refresh", () => {
    it("should refresh token automatically", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);
      const newCredentials = {
        token: "new-token",
        refreshToken: "new-refresh-token",
        coreToken: "new-core-token",
      };

      mockedEnviziUiGraphQL.renewToken.mockResolvedValue({
        data: {
          renewToken: {
            token: newCredentials.token,
            refreshToken: newCredentials.refreshToken,
          },
        },
      });
      mockedCoreEnviziAuth.exchangeToken.mockResolvedValue(newCredentials.coreToken);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Fast-forward 10 minutes to trigger token refresh
      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockedEnviziUiGraphQL.renewToken).toHaveBeenCalledWith({
          token: mockCredentials.token,
          refreshToken: mockCredentials.refreshToken,
        });
      });

      expect(mockedCoreEnviziAuth.exchangeToken).toHaveBeenCalledWith(newCredentials.token);
      expect(mockedSaveCredentials).toHaveBeenCalledWith(newCredentials);
    });

    it("should attempt token refresh and handle failure", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);
      mockedEnviziUiGraphQL.renewToken.mockResolvedValue({
        data: null,
        errors: [{ message: "Token expired" }],
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Fast-forward 10 minutes to trigger token refresh
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      // Verify renewToken was called
      await waitFor(() => {
        expect(mockedEnviziUiGraphQL.renewToken).toHaveBeenCalledWith({
          token: mockCredentials.token,
          refreshToken: mockCredentials.refreshToken,
        });
      });
    });
  });

  describe("Cross-Window Sync", () => {
    it("should detect login from another window", async () => {
      mockedLoadCredentials.mockResolvedValue(null);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isInitialized).toBe(true);
      });

      expect(result.current?.state.isAuthenticated).toBe(false);

      // Simulate credentials appearing in storage (login from another window)
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      // Fast-forward to trigger sync
      await act(async () => {
        jest.advanceTimersByTime(syncAuthStateTimeout);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      expect(mockedEnsureClient).toHaveBeenCalled();
      expect(mockedRefreshMetadata).toHaveBeenCalled();
    });

    it("should detect logout from another window", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Simulate credentials removed from storage (logout from another window)
      mockedLoadCredentials.mockResolvedValue(null);

      // Fast-forward to trigger sync
      await act(async () => {
        jest.advanceTimersByTime(syncAuthStateTimeout);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(false);
      });

      expect(mockedResetClient).toHaveBeenCalled();
    });

    it("should handle credential refresh without showing login dialog", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      const updatedCredentials = {
        ...mockCredentials,
        token: "updated-token",
      };

      // Simulate credentials updated in storage (token refresh from another window)
      mockedLoadCredentials.mockResolvedValue(updatedCredentials);

      // Fast-forward to trigger sync
      await act(async () => {
        jest.advanceTimersByTime(syncAuthStateTimeout);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current?.state.credentials?.token).toBe("updated-token");
      });

      // Should NOT show login dialog for credential refresh
      expect(mockedDisplayLoginDialog).not.toHaveBeenCalled();
    });

    it("should handle sync errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Simulate storage error during sync
      mockedLoadCredentials.mockRejectedValue(new Error("Storage error"));

      // Fast-forward to trigger sync
      await act(async () => {
        jest.advanceTimersByTime(syncAuthStateTimeout);
        await Promise.resolve();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error during auth state sync:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Auto Logout on Token Expiry", () => {
    it("should logout when refresh token expires", async () => {
      const expiringToken = {
        exp: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
      };
      mockedJwtDecode.mockReturnValue(expiringToken);
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(true);
      });

      // Fast-forward to token expiry
      await act(async () => {
        jest.advanceTimersByTime(60 * 1000);
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current?.state.isAuthenticated).toBe(false);
      });

      expect(mockedPerformLogout).toHaveBeenCalled();
    });
  });

  describe("Context Usage", () => {
    it("should provide auth context to children", async () => {
      mockedLoadCredentials.mockResolvedValue(mockCredentials);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      expect(result.current?.state).toBeDefined();
      expect(result.current?.displayLogin).toBeDefined();
      expect(result.current?.logout).toBeDefined();
    });
  });
});

// Made with Bob
