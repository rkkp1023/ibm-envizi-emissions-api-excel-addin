// Copyright IBM Corp. 2026

import { renderHook } from "@testing-library/react";
import { webDarkTheme, webLightTheme } from "@fluentui/react-components";
import React from "react";

import { ThemeContext } from "../context/ThemeContext";
import { useTheme } from "./useTheme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps renderHook with a ThemeContext.Provider supplying the given value.
 * Avoids spinning up the full ThemeProvider (which requires Office +
 * window.matchMedia) and isolates useTheme logic completely.
 */
function renderWithThemeContext(isDark: boolean) {
  const contextValue = {
    theme: isDark ? webDarkTheme : webLightTheme,
    isDark,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );

  return renderHook(() => useTheme(), { wrapper });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useTheme", () => {
  describe("when used outside ThemeProvider", () => {
    it("should throw with the correct error message", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => renderHook(() => useTheme())).toThrow(
        "useTheme must be used within ThemeProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should throw an Error instance", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => renderHook(() => useTheme())).toThrow(Error);

      consoleSpy.mockRestore();
    });
  });

  describe("return value shape", () => {
    it("should return an object with a theme property", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current).toHaveProperty("theme");
    });

    it("should return an object with an isDark property", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current).toHaveProperty("isDark");
    });

    it("should return exactly the context value (theme + isDark)", () => {
      const { result } = renderWithThemeContext(false);

      expect(Object.keys(result.current)).toEqual(
        expect.arrayContaining(["theme", "isDark"])
      );
    });
  });

  describe("when isDark is false (light mode)", () => {
    it("should return isDark as false", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current.isDark).toBe(false);
    });

    it("should return the webLightTheme", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current.theme).toEqual(webLightTheme);
    });
  });

  describe("when isDark is true (dark mode)", () => {
    it("should return isDark as true", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current.isDark).toBe(true);
    });

    it("should return the webDarkTheme", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current.theme).toEqual(webDarkTheme);
    });
  });

  describe("context value passthrough", () => {
    it("should return the exact same theme reference as the context value", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current.theme).toBe(webLightTheme);
    });

    it("should return the exact same dark theme reference as the context value", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current.theme).toBe(webDarkTheme);
    });

    it("light and dark mode should return different theme objects", () => {
      const { result: light } = renderWithThemeContext(false);
      const { result: dark } = renderWithThemeContext(true);

      expect(light.current.theme).not.toBe(dark.current.theme);
    });

    it("light and dark mode should return different isDark values", () => {
      const { result: light } = renderWithThemeContext(false);
      const { result: dark } = renderWithThemeContext(true);

      expect(light.current.isDark).not.toBe(dark.current.isDark);
    });
  });
});
