// Copyright IBM Corp. 2026

import { renderHook } from "@testing-library/react";
import { webDarkTheme, webLightTheme } from "@fluentui/react-components";
import React from "react";

import { ThemeContext } from "../context/ThemeContext";
import { useCarbonTheme } from "./useCarbonTheme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps renderHook with a ThemeContext.Provider supplying the given value.
 * This avoids spinning up the full ThemeProvider (which requires Office +
 * window.matchMedia) and isolates useCarbonTheme logic completely.
 */
function renderWithThemeContext(isDark: boolean) {
  const contextValue = {
    theme: isDark ? webDarkTheme : webLightTheme,
    isDark,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );

  return renderHook(() => useCarbonTheme(), { wrapper });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useCarbonTheme", () => {
  describe("when used outside ThemeProvider", () => {
    it("should throw an error", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => renderHook(() => useCarbonTheme())).toThrow(
        "useTheme must be used within ThemeProvider"
      );

      consoleSpy.mockRestore();
    });

    it("should throw an Error instance", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => renderHook(() => useCarbonTheme())).toThrow(Error);

      consoleSpy.mockRestore();
    });
  });

  describe("when isDark is false (light mode)", () => {
    it("should return theme as 'white'", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current.theme).toBe("white");
    });

    it("should return an object with a theme property", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current).toHaveProperty("theme");
    });

    it("should not return 'g90' in light mode", () => {
      const { result } = renderWithThemeContext(false);

      expect(result.current.theme).not.toBe("g90");
    });
  });

  describe("when isDark is true (dark mode)", () => {
    it("should return theme as 'g90'", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current.theme).toBe("g90");
    });

    it("should return an object with a theme property", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current).toHaveProperty("theme");
    });

    it("should not return 'white' in dark mode", () => {
      const { result } = renderWithThemeContext(true);

      expect(result.current.theme).not.toBe("white");
    });
  });

  describe("return value shape", () => {
    it("should return an object (not a primitive)", () => {
      const { result } = renderWithThemeContext(false);

      expect(typeof result.current).toBe("object");
      expect(result.current).not.toBeNull();
    });

    it("should only contain the theme property", () => {
      const { result } = renderWithThemeContext(false);

      expect(Object.keys(result.current)).toEqual(["theme"]);
    });

    it("should return a valid Carbon theme token in light mode", () => {
      const validTokens = ["white", "g10", "g90", "g100"];
      const { result } = renderWithThemeContext(false);

      expect(validTokens).toContain(result.current.theme);
    });

    it("should return a valid Carbon theme token in dark mode", () => {
      const validTokens = ["white", "g10", "g90", "g100"];
      const { result } = renderWithThemeContext(true);

      expect(validTokens).toContain(result.current.theme);
    });
  });

  describe("theme switching", () => {
    it("should return 'white' when context switches from dark to light", () => {
      const { result: light } = renderWithThemeContext(false);
      const { result: dark } = renderWithThemeContext(true);

      expect(light.current.theme).toBe("white");
      expect(dark.current.theme).toBe("g90");
    });

    it("light and dark mode should return different theme tokens", () => {
      const { result: light } = renderWithThemeContext(false);
      const { result: dark } = renderWithThemeContext(true);

      expect(light.current.theme).not.toBe(dark.current.theme);
    });
  });
});
