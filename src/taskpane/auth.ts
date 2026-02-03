// Copyright IBM Corp. 2026

import axios from "axios";
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
          exchangeToken(message.token).then((coreToken) => {
            const decodedToken = jwtDecode<CoreToken>(coreToken);
            console.log(decodedToken);
          });
        }
      });
    }
  );
}

export async function exchangeToken(token: string): Promise<string> {
  // Using prod URL since the test accounts were created on prod
  const tokenExchangeUrl = "https://api.ibm.com/saascore/bluerun/envizi-auth/exchange";
  const enviziTokenExchangeClientId = "f3d0be6fd3fb3d938b748fe18612cf92";
  const response = await axios.post<string>(tokenExchangeUrl, null, {
    headers: { authorization: `Bearer ${token}`, "x-ibm-client-id": enviziTokenExchangeClientId },
    responseType: "text",
  });
  return response.data;
}
