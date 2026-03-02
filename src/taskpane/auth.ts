// Copyright IBM Corp. 2026

import { UserCredentials } from "../common/credentials";
import { LoginDialogMessage } from "../login/login-dialog-message";

/* global Office */

export function displayLoginDialog(
  onConfirm: (credentials: UserCredentials) => void,
  onClose: () => void
): void {
  // Use the Office dialog API to open the login page
  // Extract the root path from the current URL (e.g., /excel-addin when deployed)
  const currentPath = window.location.pathname;
  const rootPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  const loginUrl = `${window.location.origin}${rootPath}/login.html`;
  const uiContext = Office.context.ui;
  uiContext.displayDialogAsync(
    loginUrl,
    {
      height: 75,
      width: 75,
      promptBeforeOpen: false,
    },
    (asyncResult) => {
      const dialog = asyncResult.value;
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args) => {
        dialog.close();
        const message = JSON.parse(args["message"]) as LoginDialogMessage;
        onConfirm?.(message);
      });
      dialog.addEventHandler(Office.EventType.DialogEventReceived, (args) => {
        if (args["error"] === 12006) {
          onClose?.();
        }
      });
    }
  );
}
