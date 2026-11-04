// Copyright IBM Corp. 2026

import axios from "axios";

import { getEnviziTokenExchangeConfig } from "../common/env";

export class CoreEnviziAuth {
  async exchangeToken(token: string): Promise<string> {
    const { tokenExchangeUrl, enviziTokenExchangeClientId } = getEnviziTokenExchangeConfig();
    const response = await axios.post<string>(tokenExchangeUrl, null, {
      headers: { authorization: `Bearer ${token}`, "x-ibm-client-id": enviziTokenExchangeClientId },
      responseType: "text",
    });
    return response.data;
  }
}

export const coreEnviziAuth = new CoreEnviziAuth();
