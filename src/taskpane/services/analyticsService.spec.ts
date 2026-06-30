// Copyright IBM Corp. 2026

import { analyticsService, AnalyticsService } from "./analyticsService";

// Mock the IDaasApi
const mockGetUserStatus = jest.fn();
jest.mock("../../api/IDaaSApi", () => ({
  idaasApi: {
    getUserStatus: (...args: any[]) => mockGetUserStatus(...args),
  },
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
      expect(callArgs[1]).toHaveProperty("loginMethod", "UI");
    });
  });
});

// Made with Bob
