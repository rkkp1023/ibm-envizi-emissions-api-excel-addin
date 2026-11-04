// Copyright IBM Corp. 2026

import { analyticsService, AnalyticsService } from "./analyticsService";
import * as loadScriptModule from "../../utils/load-script";
import * as envModule from "../../common/env";

// Mock the IDaasApi
const mockGetUserStatus = jest.fn();
jest.mock("../../api/IDaaSApi", () => ({
  idaasApi: {
    getUserStatus: (...args: any[]) => mockGetUserStatus(...args),
  },
}));

// Mock load-script so tests don't actually inject <script> tags
jest.mock("../../utils/load-script", () => ({
  loadScript: jest.fn().mockResolvedValue(undefined),
}));

describe("AnalyticsService", () => {
  // Default mock response for getUserStatus
  const defaultMockUserStatus = {
    isFederated: true,
    realmName: "IBMid",
    uniqueSecurityName: "12345678",
    user: "test@ibm.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    mockGetUserStatus.mockResolvedValue(defaultMockUserStatus);
    // Clear console mocks
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    // Reset window globals between tests
    delete (window as any)._ibmAnalytics;
    delete (window as any).digitalData;
    delete (window as any).analytics;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("AnalyticsService singleton", () => {
    it("should return the same instance", () => {
      const instance1 = analyticsService;
      const instance2 = analyticsService;

      expect(instance1).toBe(instance2);
    });

    it("should be an instance of AnalyticsService", () => {
      expect(analyticsService).toBeDefined();
      expect(typeof analyticsService.updateUserProfile).toBe("function");
    });
  });

  describe("initialize", () => {
    it("should set isInitialized to true on success", async () => {
      const service = new AnalyticsService();

      await service.initialize();

      expect((service as any).isInitialized).toBe(true);
    });

    it("should call loadScript for the ibm-common.js script", async () => {
      const service = new AnalyticsService();

      await service.initialize();

      expect(loadScriptModule.loadScript).toHaveBeenCalledWith(
        "https://1.www.s81c.com/common/stats/ibm-common.js"
      );
    });

    it("should call loadScript for the autotrack script when enableCarbonAutotrack is true", async () => {
      jest.replaceProperty(envModule, "enableCarbonAutotrack", true);
      const service = new AnalyticsService();

      await service.initialize();

      expect(loadScriptModule.loadScript).toHaveBeenCalledWith(
        "https://1.www.s81c.com/common/carbon/autotrack.min.js"
      );
    });

    it("should not call loadScript for autotrack when enableCarbonAutotrack is false", async () => {
      jest.replaceProperty(envModule, "enableCarbonAutotrack", false);
      const service = new AnalyticsService();

      await service.initialize();

      expect(loadScriptModule.loadScript).not.toHaveBeenCalledWith(
        "https://1.www.s81c.com/common/carbon/autotrack.min.js"
      );
    });

    it("should not call loadScript a second time when already initialized", async () => {
      const service = new AnalyticsService();

      await service.initialize();
      await service.initialize();

      // loadScript is called once for ibm-common.js (and once for autotrack),
      // but NOT duplicated on the second initialize() call.
      const calls = (loadScriptModule.loadScript as jest.Mock).mock.calls;
      const ibmCommonCalls = calls.filter(([url]) => url.includes("ibm-common.js"));
      expect(ibmCommonCalls).toHaveLength(1);
    });

    it("should set window._ibmAnalytics with the correct settings", async () => {
      const service = new AnalyticsService();

      await service.initialize();

      expect(window._ibmAnalytics).toEqual({
        settings: {
          name: "Envizi Excel Add-in",
          isSpa: false,
          tealiumProfileName: "in-app-usage-growth",
        },
        onLoad: [["ibmStats.pageview", []]],
      });
    });

    it("should set window.digitalData with correct page info", async () => {
      const service = new AnalyticsService();

      await service.initialize();

      const pageInfo = window.digitalData.page.pageInfo;
      expect(pageInfo.pageID).toBe("Page Load");
      expect(pageInfo.productTitle).toBe(envModule.enviziProductInfo.productTitle);
      expect(pageInfo.analytics).toEqual({ category: "Offering Interface" });
      expect(pageInfo.ibm?.siteId).toBe(`IBM_Envizi Excel Add-in`);
    });

    it("should set segment config with correct key and env for np", async () => {
      (window as any).envType = "np";
      const service = new AnalyticsService();

      await service.initialize();

      const segment = window.digitalData.page.pageInfo.segment!;
      expect(segment.key).toBe(envModule.segmentKeys.np);
      expect(segment.env).toBe("test");
      delete (window as any).envType;
    });

    it("should set segment env to prod when envType is prod", async () => {
      (window as any).envType = "prod";
      const service = new AnalyticsService();

      await service.initialize();

      const segment = window.digitalData.page.pageInfo.segment!;
      expect(segment.key).toBe(envModule.segmentKeys.prod);
      expect(segment.env).toBe("prod");
      delete (window as any).envType;
    });

    it("should set digitalData.page.category.primaryCategory to PC110", async () => {
      const service = new AnalyticsService();

      await service.initialize();

      expect(window.digitalData.page.category?.primaryCategory).toBe("PC110");
    });

    it("should log an error and not throw when loadScript rejects", async () => {
      (loadScriptModule.loadScript as jest.Mock).mockRejectedValueOnce(new Error("network error"));
      const service = new AnalyticsService();

      await expect(service.initialize()).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to initialize analytics:",
        expect.any(Error)
      );
      expect((service as any).isInitialized).toBe(false);
    });
  });

  describe("updateUserProfile", () => {
    const mockUserStatus = {
      isFederated: true,
      realmName: "IBMid",
      uniqueSecurityName: "12345678",
      user: "test@ibm.com",
    };

    it("should update user ID and traits", async () => {
      mockGetUserStatus.mockResolvedValue(mockUserStatus);

      await analyticsService.updateUserProfile();

      expect(console.log).toHaveBeenCalledWith("Analytics identify:", "IBMid-12345678", {
        email: "test@ibm.com",
      });
    });

    it("should not fire Service Login immediately when partNumber is not yet set", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack, identify: jest.fn() } as any;

      await service.updateUserProfile();

      expect(mockTrack).not.toHaveBeenCalledWith("Service Login", expect.anything());
    });

    it("should fire Service Login once setPartNumber is called after updateUserProfile", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack, identify: jest.fn() } as any;

      await service.updateUserProfile();
      expect(mockTrack).not.toHaveBeenCalledWith("Service Login", expect.anything());

      service.setPartNumber("D09SJZX");

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        "Service Login",
        expect.objectContaining({ partNumber: "D09SJZX", loginMethod: "UI" })
      );
    });

    it("should fire Service Login immediately when partNumber is already set before updateUserProfile", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack, identify: jest.fn() } as any;

      service.setPartNumber("D09SJZX");
      await service.updateUserProfile();

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        "Service Login",
        expect.objectContaining({ partNumber: "D09SJZX", loginMethod: "UI" })
      );
    });

    it("should fire Service Login only once even if setPartNumber is called multiple times", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack, identify: jest.fn() } as any;

      await service.updateUserProfile();
      service.setPartNumber("D09SJZX");
      service.setPartNumber("D11IQZX");

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        "Service Login",
        expect.objectContaining({ partNumber: "D09SJZX" })
      );
    });
  });

  describe("trackUiInteraction", () => {
    it("should not track when analytics is not initialized", () => {
      const mockTrack = jest.fn();
      window.analytics = { track: mockTrack } as any;

      analyticsService.trackUiInteraction({ CTA: "test-button" });

      expect(console.warn).toHaveBeenCalledWith("Analytics not initialized");
      expect(mockTrack).not.toHaveBeenCalled();
    });

    it("should not track when window.analytics is not available", async () => {
      const service = new AnalyticsService();
      // Set isInitialized to true by accessing private property
      (service as any).isInitialized = true;

      window.analytics = undefined;

      service.trackUiInteraction({ CTA: "test-button" });

      expect(console.warn).toHaveBeenCalledWith("Analytics object not available");
    });

    it("should track UI interaction with default properties", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = { track: mockTrack } as any;

      service.trackUiInteraction();

      expect(mockTrack).toHaveBeenCalledWith("UI Interaction", {
        productTitle: expect.any(String),
        productId: expect.any(String),
        productCode: expect.any(String),
        productCodeType: expect.any(String),
        UT30: expect.any(String),
        partNumber: "",
        source: window.location.origin,
        action: "Autotrack",
      });
    });

    it("should track UI interaction with custom properties", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = { track: mockTrack } as any;

      const customProps = {
        CTA: "submit-button",
        elementId: "form-submit",
        topAction: "form-submission",
      };

      service.trackUiInteraction(customProps);

      expect(mockTrack).toHaveBeenCalledWith(
        "UI Interaction",
        expect.objectContaining({
          ...customProps,
          action: "Autotrack",
          productTitle: expect.any(String),
          source: window.location.origin,
        })
      );
    });

    it("should merge custom properties with default properties", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = { track: mockTrack } as any;

      service.trackUiInteraction({
        CTA: "custom-cta",
        resultValue: "success",
      });

      expect(mockTrack).toHaveBeenCalledWith("UI Interaction", {
        productTitle: expect.any(String),
        productId: expect.any(String),
        productCode: expect.any(String),
        productCodeType: expect.any(String),
        UT30: expect.any(String),
        partNumber: "",
        source: window.location.origin,
        action: "Autotrack",
        CTA: "custom-cta",
        resultValue: "success",
      });
    });
  });

  describe("trackServiceLogin", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation();
    });

    it("should not track when analytics is not initialized", () => {
      const mockTrack = jest.fn();
      window.analytics = { track: mockTrack } as any;

      analyticsService.trackServiceLogin();

      expect(console.warn).toHaveBeenCalledWith("Analytics not initialized");
      expect(mockTrack).not.toHaveBeenCalled();
    });

    it("should not track when window.analytics is not available", async () => {
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = undefined;

      service.trackServiceLogin();

      expect(console.warn).toHaveBeenCalledWith("Analytics object not available");
    });

    it("should track service login with correct event and properties", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = { track: mockTrack } as any;

      service.trackServiceLogin();

      expect(mockTrack).toHaveBeenCalledWith("Service Login", {
        productTitle: expect.any(String),
        productId: expect.any(String),
        productCode: expect.any(String),
        productCodeType: expect.any(String),
        UT30: expect.any(String),
        partNumber: "",
        source: window.location.origin,
        loginMethod: "UI",
      });
    });

    it("should include all product information in login tracking", async () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;

      window.analytics = { track: mockTrack } as any;

      service.trackServiceLogin();

      const callArgs = mockTrack.mock.calls[0];
      expect(callArgs[0]).toBe("Service Login");
      expect(callArgs[1]).toHaveProperty("productTitle");
      expect(callArgs[1]).toHaveProperty("productId");
      expect(callArgs[1]).toHaveProperty("productCode");
      expect(callArgs[1]).toHaveProperty("productCodeType");
      expect(callArgs[1]).toHaveProperty("UT30");
      expect(callArgs[1]).toHaveProperty("partNumber", "");
      expect(callArgs[1]).toHaveProperty("loginMethod", "UI");
    });
  });

  describe("setPartNumber", () => {
    it("should update window.digitalData commonProperties with the given partNumber", () => {
      const service = new AnalyticsService();

      window.digitalData = {
        page: {
          pageInfo: {
            segment: {
              key: "test-key",
              commonProperties: {
                UT30: "30BZD",
                instanceId: "inst-1",
                productCode: "WW1171",
                productCodeType: "WWPC",
                productTitle: "IBM Envizi",
                partNumber: "",
              },
            },
          },
        },
      } as any;

      service.setPartNumber("D09SJZX");

      expect(window.digitalData.page.pageInfo.segment!.commonProperties!.partNumber).toBe(
        "D09SJZX"
      );
    });

    it("should not throw when window.digitalData is not present", () => {
      const service = new AnalyticsService();
      window.digitalData = undefined as any;

      expect(() => service.setPartNumber("D09SJZX")).not.toThrow();
    });

    it("should include the partNumber in trackServiceLogin payload after setPartNumber is called", () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack } as any;

      service.setPartNumber("D09SJZX");
      service.trackServiceLogin();

      expect(mockTrack).toHaveBeenCalledWith(
        "Service Login",
        expect.objectContaining({ partNumber: "D09SJZX" })
      );
    });

    it("should include the partNumber in trackUiInteraction payload after setPartNumber is called", () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack } as any;

      service.setPartNumber("D11IQZX");
      service.trackUiInteraction({ CTA: "test-button" });

      expect(mockTrack).toHaveBeenCalledWith(
        "UI Interaction",
        expect.objectContaining({ partNumber: "D11IQZX" })
      );
    });

    it("should send empty string partNumber in payload before setPartNumber is called", () => {
      const mockTrack = jest.fn();
      const service = new AnalyticsService();
      (service as any).isInitialized = true;
      window.analytics = { track: mockTrack } as any;

      service.trackServiceLogin();

      const payload = mockTrack.mock.calls[0][1];
      expect(payload).toHaveProperty("partNumber", "");
    });
  });
});

// Made with Bob
