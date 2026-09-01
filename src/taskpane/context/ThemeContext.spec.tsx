// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { act, renderHook } from "@testing-library/react";
import { webDarkTheme, webLightTheme } from "@fluentui/react-components";
import React from "react";

import { ThemeContext, ThemeProvider } from "./ThemeContext";

// ─── matchMedia mock helpers ──────────────────────────────────────────────────

type MediaQueryListener = (event: MediaQueryListEvent) => void;

/**
 * Installs a controllable `window.matchMedia` mock.
 * Returns a `triggerChange` function to simulate system theme changes.
 */
function mockMatchMedia(prefersDark: boolean) {
  const listeners: MediaQueryListener[] = [];

  const mql = {
    matches: prefersDark,
    addEventListener: jest.fn((_: string, cb: MediaQueryListener) => {
      listeners.push(cb);
    }),
    removeEventListener: jest.fn((_: string, cb: MediaQueryListener) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
  };

  window.matchMedia = jest.fn().mockReturnValue(mql);

  const triggerChange = (newPrefersDark: boolean) => {
    mql.matches = newPrefersDark;
    listeners.forEach((cb) =>
      cb({ matches: newPrefersDark } as unknown as MediaQueryListEvent)
    );
  };

  return { mql, triggerChange };
}

/** Builds a minimal Office global for the given scenario. */
function buildOfficeMock({
  isDarkTheme = false,
  platform = "PC",
}: {
  isDarkTheme?: boolean;
  platform?: string;
} = {}) {
  return {
    context: {
      officeTheme: { isDarkTheme },
      diagnostics: { platform },
    },
    PlatformType: {
      OfficeOnline: "OfficeOnline",
    },
  };
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).Office = buildOfficeMock();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeContext", () => {
  describe("ThemeContext default value", () => {
    it("should be undefined when consumed outside ThemeProvider", () => {
      const { result } = renderHook(() => React.useContext(ThemeContext));
      expect(result.current).toBeUndefined();
    });
  });

  describe("ThemeProvider — initial state (light mode)", () => {
    it("should default to light theme when system does not prefer dark", () => {
      mockMatchMedia(false);

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webLightTheme);
    });

    it("should set isDark to false when system does not prefer dark", () => {
      mockMatchMedia(false);

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(false);
    });

    it("should provide a defined context value", () => {
      mockMatchMedia(false);

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty("theme");
      expect(result.current).toHaveProperty("isDark");
    });
  });

  describe("ThemeProvider — dark mode via system preference", () => {
    it("should apply dark theme when system prefers dark and platform is not OfficeOnline", () => {
      mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webDarkTheme);
    });

    it("should set isDark to true when system prefers dark and platform is not OfficeOnline", () => {
      mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(true);
    });
  });

  describe("ThemeProvider — OfficeOnline platform always uses light theme", () => {
    it("should use light theme on OfficeOnline even when system prefers dark", () => {
      mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ platform: "OfficeOnline" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webLightTheme);
    });

    it("should set isDark to false on OfficeOnline even when system prefers dark", () => {
      mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ platform: "OfficeOnline" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(false);
    });

    it("should use light theme on OfficeOnline when system does not prefer dark", () => {
      mockMatchMedia(false);
      (global as any).Office = buildOfficeMock({ platform: "OfficeOnline" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webLightTheme);
      expect(result.current?.isDark).toBe(false);
    });
  });

  describe("ThemeProvider — Office dark theme flag", () => {
    it("should use dark theme when Office isDarkTheme is true and system prefers dark", () => {
      mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ isDarkTheme: true, platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(true);
      expect(result.current?.theme).toEqual(webDarkTheme);
    });

    it("should use light theme when Office isDarkTheme is true but system does not prefer dark", () => {
      // The module logic: shouldBeDark = (officeDark && prefersDark) || prefersDark
      // = (true && false) || false = false → light
      mockMatchMedia(false);
      (global as any).Office = buildOfficeMock({ isDarkTheme: true, platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(false);
      expect(result.current?.theme).toEqual(webLightTheme);
    });
  });

  describe("ThemeProvider — system theme change listener", () => {
    it("should register a change listener on the matchMedia query", () => {
      const { mql } = mockMatchMedia(false);

      renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("should switch to dark theme when system changes to dark", () => {
      const { triggerChange } = mockMatchMedia(false);
      (global as any).Office = buildOfficeMock({ platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(false);

      act(() => {
        triggerChange(true);
      });

      expect(result.current?.isDark).toBe(true);
      expect(result.current?.theme).toEqual(webDarkTheme);
    });

    it("should switch back to light theme when system changes to light", () => {
      const { triggerChange } = mockMatchMedia(true);
      (global as any).Office = buildOfficeMock({ platform: "PC" });

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.isDark).toBe(true);

      act(() => {
        triggerChange(false);
      });

      expect(result.current?.isDark).toBe(false);
      expect(result.current?.theme).toEqual(webLightTheme);
    });

    it("should remove the change listener on unmount", () => {
      const { mql } = mockMatchMedia(false);

      const { unmount } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      unmount();

      expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });
  });

  describe("ThemeProvider — when matchMedia is not available", () => {
    it("should not throw when window.matchMedia is undefined", () => {
      (window as any).matchMedia = undefined;

      expect(() => {
        renderHook(() => React.useContext(ThemeContext), { wrapper });
      }).not.toThrow();
    });

    it("should default to light theme when window.matchMedia is unavailable", () => {
      (window as any).matchMedia = undefined;

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webLightTheme);
      expect(result.current?.isDark).toBe(false);
    });
  });

  describe("ThemeProvider — when Office context data is absent", () => {
    it("should default to light theme when Office.context is undefined", () => {
      mockMatchMedia(false);
      (global as any).Office = { context: undefined, PlatformType: { OfficeOnline: "OfficeOnline" } };

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      expect(result.current?.theme).toEqual(webLightTheme);
      expect(result.current?.isDark).toBe(false);
    });

    it("should use system preference when officeTheme is absent", () => {
      mockMatchMedia(true);
      (global as any).Office = {
        context: { officeTheme: undefined, diagnostics: { platform: "PC" } },
        PlatformType: { OfficeOnline: "OfficeOnline" },
      };

      const { result } = renderHook(() => React.useContext(ThemeContext), { wrapper });

      // prefersDark=true, officeDark=false (undefined??false), isOnline=false
      // shouldBeDark = (false && true) || true = true
      expect(result.current?.isDark).toBe(true);
    });
  });
});

// Made with Bob
