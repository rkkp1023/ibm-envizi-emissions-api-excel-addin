/*
 * Copyright IBM Corp. 2025, 2026
 * Licensed Materials - Property of IBM
 */

/* global Office, localStorage */

// Feature flag to switch between old and new React version
const USE_REACT_VERSION_KEY = "useReactVersion";

// Extend Window interface for version switching functions
declare global {
  interface Window {
    switchToReactVersion: () => void;
    switchToOldVersion: () => void;
    getCurrentVersion: () => string;
  }
}

// Check if React version should be used (default: false to maintain backward compatibility)
function shouldUseReactVersion(): boolean {
  const flag = localStorage.getItem(USE_REACT_VERSION_KEY);
  return flag === "true";
}

// Initialize the appropriate version
Office.onReady(() => {
  if (shouldUseReactVersion()) {
    // Load React version
    loadReactVersion();
  } else {
    // Load TypeScript version
    loadOldVersion();
  }
});

// Load React version
async function loadReactVersion() {
  const React = await import("react");
  const ReactDOM = await import("react-dom/client");
  const { FluentProvider, webLightTheme, webDarkTheme } =
    await import("@fluentui/react-components");
  const AppModule = await import("./TaskpaneApp");
  const App = (AppModule as any).default || AppModule;

  // Hide sideload message
  const sideloadMsg = document.getElementById("sideload-msg");
  if (sideloadMsg) {
    sideloadMsg.style.display = "none";
  }

  // Determine theme
  const isDark = Office.context?.officeTheme?.isDarkTheme ?? false;
  const theme = isDark ? webDarkTheme : webLightTheme;

  // Render React app
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(FluentProvider, { theme }, React.createElement(App))
      )
    );
  }

  console.log("React version loaded");
}

// Load TypeScript version
async function loadOldVersion() {
  // Import the original taskpane.ts module
  await import("./taskpane");
  console.log("TypeScript version loaded");
}

// Expose functions to switch versions (for debugging/testing)
window.switchToReactVersion = () => {
  localStorage.setItem(USE_REACT_VERSION_KEY, "true");
  console.log("Switched to React version. Please reload the add-in.");
};

window.switchToOldVersion = () => {
  localStorage.setItem(USE_REACT_VERSION_KEY, "false");
  console.log("Switched to Typescript version. Please reload the add-in.");
};

window.getCurrentVersion = () => {
  const version = shouldUseReactVersion() ? "React version" : "TypeScript version";
  console.log(`Current version: ${version}`);
  return version;
};

export {};
