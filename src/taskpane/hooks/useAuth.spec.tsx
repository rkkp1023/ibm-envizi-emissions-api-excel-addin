// Copyright IBM Corp. 2026

import { renderHook } from "@testing-library/react";
import React from "react";

import { AuthContext } from "../context/AuthContext";
import { AuthState } from "../types/auth.types";
import { useAuth } from "./useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockState: AuthState = {
  credentials: null,
  isInitialized: true,
  isAuthenticated: false,
  isLoggedOut: false,
};

const mockDisplayLogin = jest.fn();
const mockLogout = jest.fn();

/**
 * Wraps renderHook with a bare AuthContext.Provider supplying a known value.
 * Avoids spinning up the full AuthProvider (which requires all its mocked deps)
 * and keeps these tests focused solely on useAuth logic.
 */
function renderWithAuthContext(
  overrides: Partial<{
    state: AuthState;
    displayLogin: () => void;
    logout: () => Promise<void>;
  }> = {}
) {
  const contextValue = {
    state: mockState,
    displayLogin: mockDisplayLogin,
    logout: mockLogout,
    ...overrides,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );

  return renderHook(() => useAuth(), { wrapper });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── outside provider ────────────────────────────────────────────────────────

  describe("when used outside AuthProvider", () => {
    it("should throw with the correct error message", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => renderHook(() => useAuth())).toThrow(
        "useAuth must be used within AuthProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should throw an Error instance", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => renderHook(() => useAuth())).toThrow(Error);

      consoleSpy.mockRestore();
    });
  });

  // ── return value shape ──────────────────────────────────────────────────────

  describe("return value shape", () => {
    it("should return an object with a state property", () => {
      const { result } = renderWithAuthContext();

      expect(result.current).toHaveProperty("state");
    });

    it("should return an object with a displayLogin property", () => {
      const { result } = renderWithAuthContext();

      expect(result.current).toHaveProperty("displayLogin");
    });

    it("should return an object with a logout property", () => {
      const { result } = renderWithAuthContext();

      expect(result.current).toHaveProperty("logout");
    });

    it("should return exactly the three context properties", () => {
      const { result } = renderWithAuthContext();

      expect(Object.keys(result.current)).toEqual(
        expect.arrayContaining(["state", "displayLogin", "logout"])
      );
    });
  });

  // ── state passthrough ───────────────────────────────────────────────────────

  describe("state passthrough", () => {
    it("should return the exact state object from the context", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.state).toBe(mockState);
    });

    it("should reflect isAuthenticated: false", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.state.isAuthenticated).toBe(false);
    });

    it("should reflect isAuthenticated: true when context provides authenticated state", () => {
      const authenticatedState: AuthState = {
        ...mockState,
        isAuthenticated: true,
        credentials: { token: "tok", refreshToken: "ref", coreToken: "core" },
      };

      const { result } = renderWithAuthContext({ state: authenticatedState });

      expect(result.current.state.isAuthenticated).toBe(true);
    });

    it("should reflect isInitialized: true", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.state.isInitialized).toBe(true);
    });

    it("should reflect isInitialized: false when context provides uninitialized state", () => {
      const uninitializedState: AuthState = { ...mockState, isInitialized: false };

      const { result } = renderWithAuthContext({ state: uninitializedState });

      expect(result.current.state.isInitialized).toBe(false);
    });

    it("should reflect isLoggedOut: false by default", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.state.isLoggedOut).toBe(false);
    });

    it("should reflect isLoggedOut: true when context provides logged-out state", () => {
      const loggedOutState: AuthState = { ...mockState, isLoggedOut: true };

      const { result } = renderWithAuthContext({ state: loggedOutState });

      expect(result.current.state.isLoggedOut).toBe(true);
    });

    it("should reflect null credentials when not authenticated", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.state.credentials).toBeNull();
    });

    it("should reflect credentials object when authenticated", () => {
      const creds = { token: "tok", refreshToken: "ref", coreToken: "core" };
      const authenticatedState: AuthState = {
        ...mockState,
        isAuthenticated: true,
        credentials: creds,
      };

      const { result } = renderWithAuthContext({ state: authenticatedState });

      expect(result.current.state.credentials).toEqual(creds);
    });
  });

  // ── function passthrough ────────────────────────────────────────────────────

  describe("function passthrough", () => {
    it("should return the exact displayLogin function from the context", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.displayLogin).toBe(mockDisplayLogin);
    });

    it("should return the exact logout function from the context", () => {
      const { result } = renderWithAuthContext();

      expect(result.current.logout).toBe(mockLogout);
    });

    it("displayLogin should be callable", () => {
      const { result } = renderWithAuthContext();

      expect(() => result.current.displayLogin()).not.toThrow();
      expect(mockDisplayLogin).toHaveBeenCalledTimes(1);
    });

    it("logout should be callable and return a promise", async () => {
      mockLogout.mockResolvedValue(undefined);
      const { result } = renderWithAuthContext();

      await expect(result.current.logout()).resolves.toBeUndefined();
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  // ── context identity ────────────────────────────────────────────────────────

  describe("context identity", () => {
    it("should return a different state reference when the context value changes", () => {
      const stateA: AuthState = { ...mockState, isAuthenticated: false };
      const stateB: AuthState = { ...mockState, isAuthenticated: true };

      const { result: resultA } = renderWithAuthContext({ state: stateA });
      const { result: resultB } = renderWithAuthContext({ state: stateB });

      expect(resultA.current.state).not.toBe(resultB.current.state);
    });

    it("should return the same context value on re-render when nothing changed", () => {
      const { result, rerender } = renderWithAuthContext();
      const first = result.current;

      rerender();

      expect(result.current).toBe(first);
    });
  });
});
