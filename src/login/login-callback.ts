// Copyright IBM Corp. 2026

import { LoginDialogMessage } from "./login-dialog-message";

/* global Office, URLSearchParams */

Office.onReady(() => {
  // Extract tokens from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);

  const token = urlParams.get("token");
  const refreshToken = urlParams.get("refreshToken");
  const coreToken = urlParams.get("coreToken");

  // Validate that all required tokens are present
  if (!token || !refreshToken || !coreToken) {
    console.error("Missing required tokens in callback URL");
    return;
  }

  const dialogMessage: LoginDialogMessage = {
    token,
    refreshToken,
    coreToken,
  };

  Office.context.ui.messageParent(JSON.stringify(dialogMessage));
});
