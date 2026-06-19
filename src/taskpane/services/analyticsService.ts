// Copyright IBM Corp. 2026

import { idaasApi } from "../../api/IDaaSApi";
import {
  enableCarbonAutotrack,
  enviziProductInfo,
  getEnvType,
  getSegmentKey,
} from "../../common/env";
import { loadScript } from "../../utils/load-script";

export interface SegmentProperties {
  CTA?: string;
  productTitle?: string;
  productId?: string;
  productCode?: string;
  productCodeType?: string;
  UT30?: string;
  accountId?: string;
  instanceId?: string;
  resultValue?: string;
  title?: string;
  elementId?: string;
  topAction?: string;
  source?: string;
  milestoneName?: string;
  [key: string]: any;
}

export class AnalyticsService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.configureAnalytics();
      await this.loadAnalyticsScripts();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }

  private configureAnalytics(): void {
    const envType = getEnvType();
    const segmentKey = getSegmentKey(envType);
    const isProduction = envType === "prod";

    window._ibmAnalytics = {
      settings: {
        name: "Envizi Excel Add-in",
        isSpa: false,
        tealiumProfileName: "in-app-usage-growth",
      },
      onLoad: [["ibmStats.pageview", []]],
    };

    window.digitalData = {
      page: {
        pageInfo: {
          pageID: "Page Load",
          productTitle: enviziProductInfo.productTitle,
          analytics: {
            category: "Offering Interface",
          },
          ibm: {
            siteId: `IBM_${window._ibmAnalytics.settings.name}`,
          },
          segment: {
            autoPageEventSpa: false,
            enabled: true,
            key: segmentKey,
            env: isProduction ? "prod" : "test",
            commonProperties: {
              UT30: enviziProductInfo.UT30,
              productCode: enviziProductInfo.productCode,
              productCodeType: enviziProductInfo.productCodeType,
              productTitle: enviziProductInfo.productTitle,
              instanceId: enviziProductInfo.productId, // TODO: need to replace productId with accountId or organizationId
            },
            pageProperties: {
              productCode: enviziProductInfo.productCode,
              productCodeType: enviziProductInfo.productCodeType,
              productTitle: enviziProductInfo.productTitle,
            },
            carbonComponentEvents: true,
          },
        },
        category: {
          primaryCategory: "PC110",
        },
      },
    };
  }

  private async loadAnalyticsScripts(): Promise<void> {
    await loadScript("https://1.www.s81c.com/common/stats/ibm-common.js");
    if (enableCarbonAutotrack) {
      await loadScript("https://1.www.s81c.com/common/carbon/autotrack.min.js");
    }
  }

  /**
   * Updates the analytics user profile by fetching user status from IDSaaS.
   */
  async updateUserProfile(): Promise<void> {
    const userStatus = await idaasApi.getUserStatus();
    const userId = `IBMid-${userStatus.uniqueSecurityName}`;
    const traits = { email: userStatus.user };
    console.log("Analytics identify:", userId, traits);
    window.analytics?.identify(userId, traits);
    this.trackServiceLogin();
  }

  trackUiInteraction(properties?: SegmentProperties): void {
    if (!this.isAnalyticsAvailable()) {
      return;
    }

    const props = this.buildProperties({
      ...properties,
      action: "Autotrack",
    });
    window.analytics?.track("UI Interaction", props);
  }

  trackServiceLogin(): void {
    if (!this.isAnalyticsAvailable()) {
      return;
    }

    const props = this.buildProperties({
      loginMethod: "UI",
    });
    window.analytics?.track("Service Login", props);
  }

  private buildProperties(properties?: SegmentProperties): SegmentProperties {
    return {
      productTitle: enviziProductInfo.productTitle,
      productId: enviziProductInfo.productId,
      productCode: enviziProductInfo.productCode,
      productCodeType: enviziProductInfo.productCodeType,
      UT30: enviziProductInfo.UT30,
      source: window.location.origin,
      ...properties,
    };
  }

  private isAnalyticsAvailable(): boolean {
    if (!this.isInitialized) {
      console.warn("Analytics not initialized");
      return false;
    }

    if (!window.analytics) {
      console.warn("Analytics object not available");
      return false;
    }

    return true;
  }
}

export const analyticsService = new AnalyticsService();
