// Copyright IBM Corp. 2026

import { useContext } from "react";

import { ThemeContext } from "../context/ThemeContext";

type theme = "white" | "g10" | "g90" | "g100";

interface Theme {
  theme: theme;
}

export function useCarbonTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  const carbonThemeContext = {
    theme: context.isDark ? "g90" : "white",
  } as Theme;

  return carbonThemeContext;
}
