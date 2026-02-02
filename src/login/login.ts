// Copyright IBM Corp. 2026

import { EnvType, getEnvType } from "../common/env";

// To be updated
export const loginUrls: Record<EnvType, string> = {
  prod: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  np: "https://us006t.envizi.com/ui-alpha/envizi/excel-login",
  local: "https://local-envizi.ibm.com/ui/envizi/excel-login",
};

Office.onReady(() => {
  document.getElementById("redirect-button").onclick = () => {
    window.location.href = loginUrls[getEnvType()];
  };

  document.getElementById("token-button").onclick = () => {
    const dialogMessage = { token: 'test123' };
    Office.context.ui.messageParent(JSON.stringify(dialogMessage));
  };
});
