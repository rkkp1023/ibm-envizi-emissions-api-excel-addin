// Copyright IBM Corp. 2026

import { Theme } from "@carbon/react";
import { Tab, TabList } from "@fluentui/react-components";
import { useEffect, useState } from "react";

import { useAccountSubscription, useCarbonTheme } from "../../hooks";
import { AccountTab } from "../AccountTab/AccountTab";
import { ActivityTypeRecommender } from "../ActivityTypeRecommender/ActivityTypeRecommender";
import { QuickHelpTab } from "../QuickHelpTab/QuickHelpTab";
import { ResourcesTab } from "../ResourcesTab/ResourcesTab";
import { TrialCountHeader } from "../TrialCountHeader/TrialCountHeader";

type TabValue = "quickHelp" | "account" | "resources";

export interface ActivityTypeRecomenderContext {
  search: string;
  country: string;
  date?: string;
  scope?: string;
  stateProvince?: string;
  unit?: string;
}

export function MainPage() {
  const theme = useCarbonTheme();
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");
  const [contextData, setContextData] = useState<ActivityTypeRecomenderContext>();
  const subscriptionInfo = useAccountSubscription();
  const shouldShowTrialCountHeader = subscriptionInfo.data?.subscriptionType === "trial";

  useEffect(() => {
    const handleContextAction = (event: CustomEvent<any>) => {
      const data = event.detail;
      if (!data) return;
      if (data.payload) {
        setContextData(data.payload);
      }
    };

    window.addEventListener("CONTEXT_ACTION", handleContextAction as EventListener);

    if (window.recommendedParams) {
      handleContextAction({
        detail: window.recommendedParams,
      } as CustomEvent);
    }

    return () => {
      window.removeEventListener("CONTEXT_ACTION", handleContextAction as EventListener);
    };
  }, []);

  if (contextData) {
    return (
      <Theme theme={theme.theme}>
        <ActivityTypeRecommender context={contextData} onClose={() => setContextData(null)} />
      </Theme>
    );
  }

  return (
    <>
      {shouldShowTrialCountHeader && <TrialCountHeader {...subscriptionInfo}></TrialCountHeader>}
      <div className={"page main-page" + (shouldShowTrialCountHeader ? " with-header" : "")}>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
        >
          <Tab value="quickHelp">Quick help</Tab>
          <Tab value="resources">Resources</Tab>
          <Tab value="account">Account</Tab>
        </TabList>
        <div className="tab-content">
          {selectedTab === "quickHelp" && <QuickHelpTab />}
          {selectedTab === "resources" && <ResourcesTab />}
          {selectedTab === "account" && <AccountTab />}
        </div>
      </div>
    </>
  );
}
