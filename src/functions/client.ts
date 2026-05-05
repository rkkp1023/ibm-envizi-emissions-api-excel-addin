// Copyright IBM Corp. 2025, 2026

import { Client, ClientConfig } from "emissions-api-sdk";
import { jwtDecode } from "jwt-decode";

import { CoreToken, Credentials, loadCredentialsFromStorage } from "../common/credentials";
import { getApiUrl } from "../common/env";

async function getClientConfig(credentials?: Credentials): Promise<ClientConfig> {
  const resolvedCredentials = credentials || (await loadCredentialsFromStorage());
  if (!resolvedCredentials) {
    Office.addin.showAsTaskpane();
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      "Enter your credentials in the task pane."
    );
  }

  const decodedToken = jwtDecode<CoreToken>(resolvedCredentials.coreToken);
  const tenantId = decodedToken.tenantId;

  const config: ClientConfig = {
    host: getApiUrl("ghgemissions", "prod"),
    authUrl: `${getApiUrl("saascore", "prod")}/authentication-retrieve/api-key`,
    clientId: tenantId,
    token: resolvedCredentials.coreToken,
    isExcelAddIn: true,
  };

  return config;
}

/**
 * Ensures the Client object is properly initialized.
 */
export async function ensureClient(credentials?: Credentials): Promise<void> {
  if (Client["instance"] && !credentials) {
    return;
  }
  const config = await getClientConfig(credentials);
  return Client.getClient(config);
}

/**
 * Resets the client instance.
 */
export function resetClient(): void {
  // Need to find a better way to reset later.
  Client["instance"] = null;
}
