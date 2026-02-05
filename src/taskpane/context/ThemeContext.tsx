/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Theme, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { createContext, ReactNode, useEffect, useState } from "react";

/* global Office, window */

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [theme, setTheme] = useState<Theme>(webLightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      const officeDark = Office.context?.officeTheme?.isDarkTheme ?? false;
      const isOnline = Office.context?.diagnostics?.platform === Office.PlatformType.OfficeOnline;

      let shouldBeDark = false;
      if (!isOnline) {
        shouldBeDark = (officeDark && prefersDark) || prefersDark;
      }

      setIsDark(shouldBeDark);
      setTheme(shouldBeDark ? webDarkTheme : webLightTheme);
    };

    updateTheme();

    // Listen for system theme changes
    const darkModeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (darkModeQuery) {
      darkModeQuery.addEventListener("change", updateTheme);
      return () => darkModeQuery.removeEventListener("change", updateTheme);
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, isDark }}>{children}</ThemeContext.Provider>;
}
