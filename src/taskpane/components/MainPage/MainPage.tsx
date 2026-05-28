// Copyright IBM Corp. 2026

import { Tab, TabList } from "@fluentui/react-components";
import { useEffect, useState } from "react";

import { useAccountSubscription } from "../../hooks";
import { AccountTab } from "../AccountTab/AccountTab";
import { ActivityRecommender } from "../ActivityRecommender/ActivityRecommender";
import { QuickHelpTab } from "../QuickHelpTab/QuickHelpTab";
import { ResourcesTab } from "../ResourcesTab/ResourcesTab";
import { TrialCountHeader } from "../TrialCountHeader/TrialCountHeader";

type TabValue = "quickHelp" | "account" | "resources";

export function MainPage() {
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");
  const [contextData, setContextData] = useState<any>(null);
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
    return <ActivityRecommender />;
  }

  return (
    <>
      {shouldShowTrialCountHeader && <TrialCountHeader {...subscriptionInfo}></TrialCountHeader>}
      <div className="page main-page">
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
