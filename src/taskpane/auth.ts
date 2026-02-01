// Copyright IBM Corp. 2026

import { LoginDialogMessage } from "../login/login-dialog-message";

export function displayLoginDialog(): void {
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
        if ("message" in args) {
          // TODO: Process the message
          const message = JSON.parse(args.message) as LoginDialogMessage;
        }
      });
    }
  );
}
