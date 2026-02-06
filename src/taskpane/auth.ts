// Copyright IBM Corp. 2026

import { jwtDecode, JwtPayload } from "jwt-decode";

import { LoginDialogMessage } from "../login/login-dialog-message";

export interface CoreToken extends JwtPayload {
  tenantId: string;
}

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
          const decodedToken = jwtDecode<CoreToken>(message.coreToken);
          console.log(decodedToken);
        }
      });
    }
  );
}
