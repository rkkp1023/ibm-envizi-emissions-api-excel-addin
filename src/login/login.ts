// Copyright IBM Corp. 2026

import { coreEnviziAuth } from "../api/coreEnviziAuth";
import { EnvType, getEnviziUiOrigin, getEnvType } from "../common/env";
import { LoginDialogMessage } from "./login-dialog-message";

/* global Office */

export const loginUrls: Record<EnvType, string> = {
  prod: `${getEnviziUiOrigin("prod")}/emissions-excel-login/login`,
  np: `${getEnviziUiOrigin("np")}/emissions-excel-login/login`,
  local: `${getEnviziUiOrigin("local")}/emissions-bridge/login`,
};

Office.onReady(() => {
  // For local development, store valid Envizi tokens in localStorage to bypass the login UI
  const token = window.localStorage.getItem("tokenForLogin");
  const refreshToken = window.localStorage.getItem("refreshTokenForLogin");
  if (token && refreshToken) {
    coreEnviziAuth.exchangeToken(token).then((coreToken) => {
      const dialogMessage: LoginDialogMessage = { token, refreshToken, coreToken };
      Office.context.ui.messageParent(JSON.stringify(dialogMessage));
    });
  } else {
    window.location.href = loginUrls[getEnvType()];
  }
});
