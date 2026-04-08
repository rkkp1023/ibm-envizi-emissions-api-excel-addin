// Copyright IBM Corp. 2025, 2026

import React from "react";
import { createRoot } from "react-dom/client";
import { TaskpaneApp } from "./TaskpaneApp";
import "./reset.css";
import "./taskpane.css";

/* global Office */

/**
 * Hides the sideload message once the app is ready
 */
function hideSideloadMessage() {
  const sideloadMsg = document.getElementById("sideload-msg");
  if (sideloadMsg) {
    sideloadMsg.style.display = "none";
  }
}

/**
 * Initializes and renders the React application
 */
function initializeApp() {
  hideSideloadMessage();

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <TaskpaneApp />
    </React.StrictMode>
  );
}

// Initialize the app when Office is ready
Office.onReady(() => {
  initializeApp();
});
