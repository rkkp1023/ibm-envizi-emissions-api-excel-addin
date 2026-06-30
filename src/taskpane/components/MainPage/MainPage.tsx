// Copyright IBM Corp. 2026

import { Theme } from "@carbon/react";
import { Tab, TabList } from "@fluentui/react-components";
import { useEffect, useState } from "react";

import { getIsTaskpaneOpen } from "../../../commands/taskPaneVisibility";
import { useActivityRecommender } from "../../context/ActivityRecommenderContext";
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
  const subscriptionInfo = useAccountSubscription();
  const shouldShowTrialCountHeader = subscriptionInfo.data?.subscriptionType === "trial";
  const isTaskPaneOpen = getIsTaskpaneOpen();

  const {
    activityRecommenderState,
    setActivityRecommenderState,
    recommendedParams,
    setRecommendedParams,
  } = useActivityRecommender();

  useEffect(() => {
    const handleActivityRecommenderRequested = (event: CustomEvent<any>) => {
      const data = event.detail;
      if (!data) return;

      const { recommendedParams } = data;
      if (!recommendedParams) return;

      setRecommendedParams(recommendedParams);

      if (!isTaskPaneOpen) {
        setActivityRecommenderState("standalone");
      } else {
        // Task pane was already open
        // If recommender state is undefined, set to dismissable
        // If it's already standalone, keep it standalone
        if (activityRecommenderState === undefined) {
          setActivityRecommenderState("dismissable");
        }
      }
    };
    console.log("isTaskpaneOpen::", isTaskPaneOpen);

    window.addEventListener(
      "ACTIVITY_RECOMMENDER_REQUESTED",
      handleActivityRecommenderRequested as EventListener
    );

    if (window.recommendedParams) {
      handleActivityRecommenderRequested({
        detail: window.recommendedParams,
      } as CustomEvent);
    }

    return () => {
      window.removeEventListener(
        "ACTIVITY_RECOMMENDER_REQUESTED",
        handleActivityRecommenderRequested as EventListener
      );
    };
  }, [activityRecommenderState, setActivityRecommenderState, setRecommendedParams]);

  const onClose = () => {
    if (activityRecommenderState === "standalone") {
      // Close the task pane
      Office.addin.hide();
    }
    // Clear recommender state and params
    setActivityRecommenderState(undefined);
    setRecommendedParams(undefined);
  };

  if (activityRecommenderState) {
    return (
      <Theme theme={theme.theme}>
        <ActivityTypeRecommender context={recommendedParams} onClose={onClose} />
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
