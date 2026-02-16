// Copyright IBM Corp. 2026

import axios from "axios";

import { EnvType, getEnvType } from "../common/env";
import { LoginDialogMessage } from "./login-dialog-message";

/* global Office */

// To be updated
export const loginUrls: Record<EnvType, string> = {
  prod: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  np: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  local: "https://local-envizi.ibm.com/ui/envizi/excel-login",
};

Office.onReady(() => {
  // For local development, store valid Envizi tokens in localStorage to bypass the login UI
  const token = window.localStorage.getItem("tokenForLogin");
  const refreshToken = window.localStorage.getItem("refreshTokenForLogin");
  if (token && refreshToken) {
    exchangeToken(token).then((coreToken) => {
      const dialogMessage: LoginDialogMessage = { token, refreshToken, coreToken };
      Office.context.ui.messageParent(JSON.stringify(dialogMessage));
    });
  } else {
    window.location.href = loginUrls[getEnvType()];
  }
});

async function exchangeToken(token: string): Promise<string> {
  // Using prod URL since the test accounts were created on prod
  const tokenExchangeUrl = "https://api.ibm.com/saascore/bluerun/envizi-auth/exchange";
  const enviziTokenExchangeClientId = "f3d0be6fd3fb3d938b748fe18612cf92";
  const response = await axios.post<string>(tokenExchangeUrl, null, {
    headers: { authorization: `Bearer ${token}`, "x-ibm-client-id": enviziTokenExchangeClientId },
    responseType: "text",
  });
  return response.data;
}
