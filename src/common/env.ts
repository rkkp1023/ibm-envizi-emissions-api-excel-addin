// Copyright IBM Corp. 2025, 2026

export type EnvType = "prod" | "np" | "local";
export type ApiId = "saascore" | "ghgemissions";

declare global {
  interface Window {
    envType?: EnvType;
    enableEnviziLogin?: boolean;
  }
}

export const apiUrls: Record<ApiId, Record<EnvType, string>> = {
  saascore: {
    prod: "https://api.ibm.com/saascore/run",
    np: "https://dev.api.ibm.com/saascore/test",
    local: "https://dev.api.ibm.com/saascore/test",
  },
  ghgemissions: {
    prod: "https://api.ibm.com/ghgemissions/run",
    np: "https://dev.api.ibm.com/ghgemissions/test",
    local: "https://dev.api.ibm.com/ghgemissions/test",
  },
};

export const apiHomeUrls: Record<EnvType, string> = {
  prod: "https://www.app.ibm.com/envizi/emissions-api-home",
  np: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
  local: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
};

export const enviziUiOrigins: Record<EnvType, string> = {
  prod: "https://envizi.ibm.com",
  np: "https://pentest.envizi.ibm.com",
  local: "https://local.us006t.envizi.com",
};

export const enviziApiOrigins: Record<EnvType, string> = {
  prod: "https://envizi.ibm.com",
  np: "https://pentest.envizi.ibm.com",
  local: "https://us006t.envizi.com",
};

export const enviziGraphQLUrls: Record<string, string> = {
  "https://envizi.ibm.com": "https://envizi.ibm.com/graphqlapi-uxm",
  "https://pentest.envizi.ibm.com": "https://pentest.envizi.ibm.com/graphqlapi-uxm",
  "https://us006t.envizi.com": "https://us006t.envizi.com/graphqlapi-dev",
};

function detectEnvType(): EnvType {
  const origin = window.location.origin;
  if (origin === "https://plugins.app.ibm.com") {
    return "prod";
  } else if (origin === "https://plugins-dev.app.ibm.com") {
    return "np";
  } else if (/localhost/gi.test(origin)) {
    return "local";
  }
  return "np";
}

export function getEnvType(): EnvType {
  if (!window.envType) {
    window.envType = detectEnvType();
  }
  return window.envType;
}

export function getApiUrl(api: ApiId, envType?: EnvType) {
  return apiUrls[api][envType || getEnvType()];
}

export function getApiHomeUrl(): string {
  const envType = getEnvType();
  return apiHomeUrls[envType];
}

export function getOverviewDashboardUrl(): string {
  return `${getApiHomeUrl()}/overview`;
}

export function getEnviziUiOrigin(envType?: EnvType): string {
  return enviziUiOrigins[envType || getEnvType()];
}

export function getEnviziApiOrigin(envType?: EnvType): string {
  return enviziApiOrigins[envType || getEnvType()];
}

export function getEnviziGraphQLUrl(envType?: EnvType): string {
  const apiOrigin = getEnviziApiOrigin(envType);
  return enviziGraphQLUrls[apiOrigin];
}

export function getEnableEnviziLogin(): boolean {
  if (window.enableEnviziLogin === undefined) {
    window.enableEnviziLogin = window.localStorage.getItem("enableEnviziLogin") !== "false";
  }
  return window.enableEnviziLogin;
}
