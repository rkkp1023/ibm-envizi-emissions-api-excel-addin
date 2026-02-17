// Copyright IBM Corp. 2026

import { UserCredentials } from "../common/credentials";
import { LoginDialogMessage } from "../login/login-dialog-message";

/* global Office */

export function displayLoginDialog(
  onConfirm: (credentials: UserCredentials) => void,
  onClose: () => void
): void {
  // Use the Office dialog API to open the login page
  const loginUrl = `${window.location.origin}/login.html`;
  const uiContext = Office.context.ui;
  uiContext.displayDialogAsync(
    loginUrl,
    {
      height: 75,
      width: 75,
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
