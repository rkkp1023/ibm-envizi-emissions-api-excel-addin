// Copyright IBM Corp. 2025, 2026

import {
  apiUrls,
  enviziTokenExchangeConfigs,
  apiHomeUrls,
  enviziUiOrigins,
  enviziApiOrigins,
  enviziGraphQLUrls,
  enviziApiHomeUrls,
  enviziProductInfo,
  enableCarbonAutotrack,
  segmentKeys,
  getEnvType,
  getApiUrl,
  getEnviziTokenExchangeConfig,
  getApiHomeUrl,
  getEnviziApiHomeUrl,
  getOverviewDashboardUrl,
  getEnviziExcelAddInOverviewUrl,
  getAccountUsageUrl,
  getMCPServerUrl,
  getEnviziUiOrigin,
  getEnviziApiOrigin,
  getEnviziGraphQLUrl,
  getBuyNowUrl,
  getPricingPageUrl,
  getSegmentKey,
} from "./env";

// ─── beforeEach ───────────────────────────────────────────────────────────────

beforeEach(() => {
  // Clear the envType cache so detectEnvType() runs fresh each test
  delete (window as any).envType;
  localStorage.clear();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

// ── Static exports ────────────────────────────────────────────────────────────

describe("static exports", () => {
  describe("apiUrls", () => {
    it("should have saascore entries for all env types", () => {
      expect(apiUrls.saascore.prod).toBe("https://api.ibm.com/saascore/run");
      expect(apiUrls.saascore.np).toBe("https://dev.api.ibm.com/saascore/test");
      expect(apiUrls.saascore.local).toBe("https://dev.api.ibm.com/saascore/test");
    });

    it("should have ghgemissions entries for all env types", () => {
      expect(apiUrls.ghgemissions.prod).toBe("https://api.ibm.com/ghgemissions/run");
      expect(apiUrls.ghgemissions.np).toBe("https://dev.api.ibm.com/ghgemissions/test");
      expect(apiUrls.ghgemissions.local).toBe("https://dev.api.ibm.com/ghgemissions/test");
    });
  });

  describe("enviziTokenExchangeConfigs", () => {
    it("should have correct prod token exchange config", () => {
      expect(enviziTokenExchangeConfigs.prod.tokenExchangeUrl).toBe(
        "https://api.ibm.com/saascore/bluerun/envizi-auth/exchange"
      );
      expect(enviziTokenExchangeConfigs.prod.enviziTokenExchangeClientId).toBe(
        "f3d0be6fd3fb3d938b748fe18612cf92"
      );
    });

    it("should have correct np token exchange config", () => {
      expect(enviziTokenExchangeConfigs.np.tokenExchangeUrl).toBe(
        "https://dev.api.ibm.com/saascore/bluetest/envizi-auth/exchange"
      );
      expect(enviziTokenExchangeConfigs.np.enviziTokenExchangeClientId).toBe(
        "c88b6c561e5e31425da9a31a87345f39"
      );
    });

    it("should have the same config for local and np", () => {
      expect(enviziTokenExchangeConfigs.local).toEqual(enviziTokenExchangeConfigs.np);
    });
  });

  describe("enviziProductInfo", () => {
    it("should have the correct UT30 code", () => {
      expect(enviziProductInfo.UT30).toBe("30BZD");
    });

    it("should have the correct productCode", () => {
      expect(enviziProductInfo.productCode).toBe("WW1171");
    });

    it("should have the correct productCodeType", () => {
      expect(enviziProductInfo.productCodeType).toBe("WWPC");
    });

    it("should have the correct productId", () => {
      expect(enviziProductInfo.productId).toBe("5900API");
    });

    it("should have the correct productTitle", () => {
      expect(enviziProductInfo.productTitle).toBe("IBM Envizi");
    });
  });

  describe("enableCarbonAutotrack", () => {
    it("should be true", () => {
      expect(enableCarbonAutotrack).toBe(true);
    });
  });

  describe("segmentKeys", () => {
    it("should have distinct prod and non-prod keys", () => {
      expect(segmentKeys.prod).not.toBe(segmentKeys.np);
    });

    it("should have the same key for np and local", () => {
      expect(segmentKeys.np).toBe(segmentKeys.local);
    });

    it("should have non-empty strings for all env types", () => {
      expect(segmentKeys.prod.length).toBeGreaterThan(0);
      expect(segmentKeys.np.length).toBeGreaterThan(0);
      expect(segmentKeys.local.length).toBeGreaterThan(0);
    });
  });
});

// ── getEnvType ────────────────────────────────────────────────────────────────
// NOTE: detectEnvType() reads window.location.origin which is non-configurable
// in jsdom 26. Tests that need specific origins live in dedicated spec files
// (env.prod.spec.ts, env.np.spec.ts, env.local.spec.ts, env.unknown.spec.ts)
// that declare the URL via the @jest-environment docblock.
// The cache-path tests below are sufficient here.

describe("getEnvType", () => {
  it("should return the cached window.envType without re-detecting when already set to 'prod'", () => {
    (window as any).envType = "prod";
    expect(getEnvType()).toBe("prod");
  });

  it("should return the cached window.envType without re-detecting when already set to 'np'", () => {
    (window as any).envType = "np";
    expect(getEnvType()).toBe("np");
  });

  it("should return the cached window.envType without re-detecting when already set to 'local'", () => {
    (window as any).envType = "local";
    expect(getEnvType()).toBe("local");
  });
});

// ── getApiUrl ─────────────────────────────────────────────────────────────────

describe("getApiUrl", () => {
  it("should return the prod saascore URL when envType is prod", () => {
    (window as any).envType = "prod";
    expect(getApiUrl("saascore")).toBe(apiUrls.saascore.prod);
  });

  it("should return the np saascore URL when envType is np", () => {
    (window as any).envType = "np";
    expect(getApiUrl("saascore")).toBe(apiUrls.saascore.np);
  });

  it("should return the local saascore URL when envType is local", () => {
    (window as any).envType = "local";
    expect(getApiUrl("saascore")).toBe(apiUrls.saascore.local);
  });

  it("should return the prod ghgemissions URL when envType is prod", () => {
    (window as any).envType = "prod";
    expect(getApiUrl("ghgemissions")).toBe(apiUrls.ghgemissions.prod);
  });

  it("should return the np ghgemissions URL when envType is np", () => {
    (window as any).envType = "np";
    expect(getApiUrl("ghgemissions")).toBe(apiUrls.ghgemissions.np);
  });
});

// ── getEnviziTokenExchangeConfig ──────────────────────────────────────────────

describe("getEnviziTokenExchangeConfig", () => {
  it("should return prod config when envType param is 'prod'", () => {
    expect(getEnviziTokenExchangeConfig("prod")).toEqual(enviziTokenExchangeConfigs.prod);
  });

  it("should return np config when envType param is 'np'", () => {
    expect(getEnviziTokenExchangeConfig("np")).toEqual(enviziTokenExchangeConfigs.np);
  });

  it("should return local config when envType param is 'local'", () => {
    expect(getEnviziTokenExchangeConfig("local")).toEqual(enviziTokenExchangeConfigs.local);
  });

  it("should fall back to window.envType when no param is provided", () => {
    (window as any).envType = "prod";
    expect(getEnviziTokenExchangeConfig()).toEqual(enviziTokenExchangeConfigs.prod);
  });
});

// ── getApiHomeUrl ─────────────────────────────────────────────────────────────

describe("getApiHomeUrl", () => {
  it("should return the prod API home URL when envType is prod", () => {
    (window as any).envType = "prod";
    expect(getApiHomeUrl()).toBe(apiHomeUrls.prod);
  });

  it("should return the np API home URL when envType is np", () => {
    (window as any).envType = "np";
    expect(getApiHomeUrl()).toBe(apiHomeUrls.np);
  });

  it("should return the local API home URL when envType is local", () => {
    (window as any).envType = "local";
    expect(getApiHomeUrl()).toBe(apiHomeUrls.local);
  });
});

// ── getEnviziApiHomeUrl ───────────────────────────────────────────────────────

describe("getEnviziApiHomeUrl", () => {
  it("should return the prod envizi API home URL when envType is prod", () => {
    (window as any).envType = "prod";
    expect(getEnviziApiHomeUrl()).toBe(enviziApiHomeUrls.prod);
  });

  it("should return the np envizi API home URL when envType is np", () => {
    (window as any).envType = "np";
    expect(getEnviziApiHomeUrl()).toBe(enviziApiHomeUrls.np);
  });

  it("should return the local envizi API home URL when envType is local", () => {
    (window as any).envType = "local";
    expect(getEnviziApiHomeUrl()).toBe(enviziApiHomeUrls.local);
  });

  it("should append /emissions-bridge for local env", () => {
    (window as any).envType = "local";
    expect(getEnviziApiHomeUrl()).toContain("/emissions-bridge");
  });

  it("should append /emissions for prod env", () => {
    (window as any).envType = "prod";
    expect(getEnviziApiHomeUrl()).toContain("/emissions");
  });
});

// ── getOverviewDashboardUrl ───────────────────────────────────────────────────

describe("getOverviewDashboardUrl", () => {
  it("should append /overview to the API home URL", () => {
    (window as any).envType = "prod";
    expect(getOverviewDashboardUrl()).toBe(`${apiHomeUrls.prod}/overview`);
  });

  it("should use the np API home URL when envType is np", () => {
    (window as any).envType = "np";
    expect(getOverviewDashboardUrl()).toBe(`${apiHomeUrls.np}/overview`);
  });
});

// ── getEnviziExcelAddInOverviewUrl ────────────────────────────────────────────

describe("getEnviziExcelAddInOverviewUrl", () => {
  it("should append /excel-add-in-overview to the envizi API home URL for prod", () => {
    (window as any).envType = "prod";
    expect(getEnviziExcelAddInOverviewUrl()).toBe(`${enviziApiHomeUrls.prod}/excel-add-in-overview`);
  });

  it("should append /excel-add-in-overview to the envizi API home URL for np", () => {
    (window as any).envType = "np";
    expect(getEnviziExcelAddInOverviewUrl()).toBe(`${enviziApiHomeUrls.np}/excel-add-in-overview`);
  });
});

// ── getAccountUsageUrl ────────────────────────────────────────────────────────

describe("getAccountUsageUrl", () => {
  it("should append /account-usage to the envizi API home URL for prod", () => {
    (window as any).envType = "prod";
    expect(getAccountUsageUrl()).toBe(`${enviziApiHomeUrls.prod}/account-usage`);
  });

  it("should append /account-usage to the envizi API home URL for np", () => {
    (window as any).envType = "np";
    expect(getAccountUsageUrl()).toBe(`${enviziApiHomeUrls.np}/account-usage`);
  });
});

// ── getMCPServerUrl ───────────────────────────────────────────────────────────

describe("getMCPServerUrl", () => {
  it("should append /mcp-server to the envizi API home URL for prod", () => {
    (window as any).envType = "prod";
    expect(getMCPServerUrl()).toBe(`${enviziApiHomeUrls.prod}/mcp-server`);
  });

  it("should append /mcp-server to the envizi API home URL for np", () => {
    (window as any).envType = "np";
    expect(getMCPServerUrl()).toBe(`${enviziApiHomeUrls.np}/mcp-server`);
  });
});

// ── getEnviziUiOrigin ─────────────────────────────────────────────────────────

describe("getEnviziUiOrigin", () => {
  it("should return the prod UI origin when envType param is 'prod'", () => {
    expect(getEnviziUiOrigin("prod")).toBe(enviziUiOrigins.prod);
  });

  it("should return the np UI origin when envType param is 'np'", () => {
    expect(getEnviziUiOrigin("np")).toBe(enviziUiOrigins.np);
  });

  it("should return the local UI origin when envType param is 'local'", () => {
    expect(getEnviziUiOrigin("local")).toBe(enviziUiOrigins.local);
  });

  it("should fall back to window.envType when no param is provided", () => {
    (window as any).envType = "prod";
    expect(getEnviziUiOrigin()).toBe(enviziUiOrigins.prod);
  });

  it("should return the localStorage override when enviziUiOrigin is set", () => {
    localStorage.setItem("enviziUiOrigin", "https://custom-envizi.example.com");
    expect(getEnviziUiOrigin("prod")).toBe("https://custom-envizi.example.com");
  });

  it("should ignore the localStorage override when it is empty", () => {
    localStorage.setItem("enviziUiOrigin", "");
    expect(getEnviziUiOrigin("prod")).toBe(enviziUiOrigins.prod);
  });
});

// ── getEnviziApiOrigin ────────────────────────────────────────────────────────

describe("getEnviziApiOrigin", () => {
  it("should return the prod API origin when envType param is 'prod'", () => {
    expect(getEnviziApiOrigin("prod")).toBe(enviziApiOrigins.prod);
  });

  it("should return the np API origin when envType param is 'np'", () => {
    expect(getEnviziApiOrigin("np")).toBe(enviziApiOrigins.np);
  });

  it("should return the local API origin when envType param is 'local'", () => {
    expect(getEnviziApiOrigin("local")).toBe(enviziApiOrigins.local);
  });

  it("should fall back to window.envType when no param is provided", () => {
    (window as any).envType = "np";
    expect(getEnviziApiOrigin()).toBe(enviziApiOrigins.np);
  });

  it("should return the localStorage override when enviziApiOrigin is set", () => {
    localStorage.setItem("enviziApiOrigin", "https://custom-api.example.com");
    expect(getEnviziApiOrigin("prod")).toBe("https://custom-api.example.com");
  });

  it("should ignore the localStorage override when it is empty", () => {
    localStorage.setItem("enviziApiOrigin", "");
    expect(getEnviziApiOrigin("prod")).toBe(enviziApiOrigins.prod);
  });
});

// ── getEnviziGraphQLUrl ───────────────────────────────────────────────────────

describe("getEnviziGraphQLUrl", () => {
  it("should return the GraphQL URL for the prod API origin", () => {
    expect(getEnviziGraphQLUrl("prod")).toBe(
      enviziGraphQLUrls[enviziApiOrigins.prod]
    );
  });

  it("should return the GraphQL URL for the np API origin", () => {
    expect(getEnviziGraphQLUrl("np")).toBe(
      enviziGraphQLUrls[enviziApiOrigins.np]
    );
  });

  it("should return undefined for an API origin not in the map", () => {
    localStorage.setItem("enviziApiOrigin", "https://unknown.example.com");
    expect(getEnviziGraphQLUrl()).toBeUndefined();
  });

  it("should return the GraphQL URL based on the localStorage API origin override", () => {
    localStorage.setItem("enviziApiOrigin", "https://envizi.ibm.com");
    expect(getEnviziGraphQLUrl()).toBe(
      enviziGraphQLUrls["https://envizi.ibm.com"]
    );
  });
});

// ── getBuyNowUrl ──────────────────────────────────────────────────────────────

describe("getBuyNowUrl", () => {
  it("should return the IBM Store URL", () => {
    expect(getBuyNowUrl()).toBe("https://www.ibm.com/store/en/us/products/EIDSBEJC");
  });
});

// ── getPricingPageUrl ─────────────────────────────────────────────────────────

describe("getPricingPageUrl", () => {
  it("should return the Envizi pricing page URL", () => {
    expect(getPricingPageUrl()).toBe("https://www.ibm.com/products/envizi/pricing");
  });
});

// ── getSegmentKey ─────────────────────────────────────────────────────────────

describe("getSegmentKey", () => {
  it("should return the prod segment key when envType param is 'prod'", () => {
    expect(getSegmentKey("prod")).toBe(segmentKeys.prod);
  });

  it("should return the np segment key when envType param is 'np'", () => {
    expect(getSegmentKey("np")).toBe(segmentKeys.np);
  });

  it("should return the local segment key when envType param is 'local'", () => {
    expect(getSegmentKey("local")).toBe(segmentKeys.local);
  });

  it("should fall back to window.envType when no param is provided", () => {
    (window as any).envType = "prod";
    expect(getSegmentKey()).toBe(segmentKeys.prod);
  });

  it("should return the prod key when useProdSegmentSetup is set in localStorage", () => {
    localStorage.setItem("useProdSegmentSetup", "true");
    expect(getSegmentKey("np")).toBe(segmentKeys.prod);
  });

  it("should return the np key when useProdSegmentSetup is not set", () => {
    expect(getSegmentKey("np")).toBe(segmentKeys.np);
  });

  it("should return the prod key regardless of the envType param when override is set", () => {
    localStorage.setItem("useProdSegmentSetup", "1");
    expect(getSegmentKey("local")).toBe(segmentKeys.prod);
  });
});
