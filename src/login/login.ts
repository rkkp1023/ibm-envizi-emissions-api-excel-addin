// Copyright IBM Corp. 2026

import { EnvType, getEnvType } from "../common/env";

// To be updated
export const loginUrls: Record<EnvType, string> = {
  prod: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  np: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  local: "https://local-envizi.ibm.com/ui/envizi/excel-login",
};

Office.onReady(() => {
  // For local development, store a valid Envizi token in localStorage to bypass the login UI
  const token = window.localStorage.getItem("id_token");
  if (token) {
    const dialogMessage = { token };
    Office.context.ui.messageParent(JSON.stringify(dialogMessage));
  } else {
    window.location.href = loginUrls[getEnvType()];
  }
});
