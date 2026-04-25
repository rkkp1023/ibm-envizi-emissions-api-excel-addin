// Copyright IBM Corp. 2025, 2026

export type EnvType = "prod" | "np" | "local";
export type ApiId = "saascore" | "ghgemissions";

declare global {
  interface Window {
    envType?: EnvType;
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
  np: "https://us006t.envizi.com",
  local: "https://local.us006t.envizi.com",
};

export const enviziApiOrigins: Record<EnvType, string> = {
  prod: "https://envizi.ibm.com",
  np: "https://us006t.envizi.com",
  local: "https://us006t.envizi.com",
};

export const enviziGraphQLUrls: Record<string, string> = {
  "https://envizi.ibm.com": "https://envizi.ibm.com/graphqlapi-uxm",
  "https://pentest.envizi.ibm.com": "https://pentest.envizi.ibm.com/graphqlapi-uxm",
  "https://us006t.envizi.com": "https://us006t.envizi.com/graphqlapi-dev",
};

export const enviziApiHomeUrls: Record<EnvType, string> = {
  prod: `${getEnviziUiOrigin("prod")}/emissions`,
  np: `${getEnviziUiOrigin("np")}/emissions`,
  local: `${getEnviziUiOrigin("local")}/emissions-bridge`,
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

export function getEnviziApiHomeUrl(): string {
  const envType = getEnvType();
  return enviziApiHomeUrls[envType];
}

/**
 * Gets the CUI overview dashboard URL for API key authentication
 * @deprecated This function will be removed once Preview is over
 */
export function getOverviewDashboardUrl(): string {
  return `${getApiHomeUrl()}/overview`;
}

/**
 * Gets the Envizi Excel add-in overview URL for token-based authentication (GA)
 */
export function getEnviziExcelAddInOverviewUrl(): string {
  return `${getEnviziApiHomeUrl()}/excel-add-in-overview`;
}

export function getAccountUsageUrl(): string {
  return `${getEnviziApiHomeUrl()}/account-usage`;
}

export function getEnviziUiOrigin(envType?: EnvType): string {
  const override = window.localStorage.getItem("enviziUiOrigin");
  return override || enviziUiOrigins[envType || getEnvType()];
}

export function getEnviziApiOrigin(envType?: EnvType): string {
  const override = window.localStorage.getItem("enviziApiOrigin");
  return override || enviziApiOrigins[envType || getEnvType()];
}

export function getEnviziGraphQLUrl(envType?: EnvType): string {
  const apiOrigin = getEnviziApiOrigin(envType);
  return enviziGraphQLUrls[apiOrigin];
}

/**
 * Gets the IBM Store URL for purchasing the Envizi Excel add-in
 * This function can be extended to support language/locale-specific URLs in the future
 */
export function getBuyNowUrl(): string {
  return "https://www.ibm.com/store/en/us/products/EIDSBEJC";
}

export function getPricingPageUrl(): string {
  return "https://www.ibm.com/products/envizi/pricing";
}
