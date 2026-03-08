// Copyright IBM Corp. 2026

import axios from "axios";

export class CoreEnviziAuth {
  async exchangeToken(token: string): Promise<string> {
    // Using prod URL since the test accounts were created on prod
    const tokenExchangeUrl = "https://api.ibm.com/saascore/bluerun/envizi-auth/exchange";
    const enviziTokenExchangeClientId = "f3d0be6fd3fb3d938b748fe18612cf92";
    const response = await axios.post<string>(tokenExchangeUrl, null, {
      headers: { authorization: `Bearer ${token}`, "x-ibm-client-id": enviziTokenExchangeClientId },
      responseType: "text",
    });
    return response.data;
  }
}

export const coreEnviziAuth = new CoreEnviziAuth();
