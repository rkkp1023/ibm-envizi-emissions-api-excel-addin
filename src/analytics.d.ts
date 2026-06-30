// Copyright IBM Corp. 2026

declare global {
  interface Window {
    // https://w3.ibm.com/w3publisher/digital-behavior-data-management/privacy-and-compliance/cookie-consent-adoption
    _ibmAnalytics?: {
      settings: {
        name: string;
        isSpa: boolean;
        tealiumProfileName: string;
      };
      onLoad?: Array<[string, any[]]>;
    };
    // https://pages.github.ibm.com/carbon/ibm-products/developing/instrumentation/overview/#client-side-instrumentation
    digitalData: {
      page: {
        pageInfo: {
          pageID?: string; // Your page name
          productTitle?: string; // Your product’s title
          analytics?: {
            category: string; // Your page category
          };
          ibm?: {
            siteId: string; // Your site name prefixed with “IBM_”
          };
          segment?: {
            autoPageEventSpa?: boolean;
            enabled?: boolean;
            key: string; // Required. This key is designed for public exposure and have very restricted capabilities
            env?: string; // Which bluemix analytics script to load. Values are: “dev”, “test”, “prod”. For localhost use “test”
            pageProperties?: Record<string, any>; // PROPERTIES THAT ARE SENT WITH EVERY PAGE EVENT.
            commonProperties?: {
              // PROPERTIES THAT ARE SENT WITH EVERY UI INTERACTION.
              UT30: string; // Required. Unified Taxonomy Level 30 Code - Name e.g., 30BQJ - IBM Order Management
              instanceId: string; // Required. Unique identifier for the product instance. This is required for Common Milestones and Common Metrics
              productCode: string; // Required. The numeric code tied to your product found on FedCat
              productCodeType: string; // Required. The type of product code you will be supplying in the productCode field. The options are PID, WWPC, MTM, OCC. Product code must be associated to a FedCat record.
              productTitle: string; // Required. The name of the offering as registered in the Growth portal
              subscriptionId?: string; // The unique identifier for MCSP Subscriptions. This will hold subscriptionIds across different cloud providers.
              productPlanName?: string; // The name of the plan the user is subscribed to
              productPlanType?: string; // Must be one of the following three values: “trial”, “subscription”, or “contract”
            };
            carbonComponentEvents?: boolean; // Boolean toggle for Automatic Carbon Component Events
          };
        };
        category?: {
          primaryCategory: string; // Designates the category for the current page.
        };
      };
    };
    analytics?: {
      page: (category: string, name: string, properties?: any, options?: any) => void;
      track: (event: string, properties?: any, options?: any) => void;
      identify: (id: string, user?: any) => void;
    };
    bluemixAnalytics?: {
      trackEvent: (eventName: string, properties: Record<string, any>) => void;
    };
    autoTrack?: {
      updateCallback: (
        callback: (eventName: string, eventData: Record<string, any>) => void
      ) => void;
    };
  }
}

export {};
