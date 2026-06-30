// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { Theme } from "@carbon/react";
import { Tab, TabList } from "@fluentui/react-components";
import { makeStyles } from "@griffel/react";
import { useEffect, useState } from "react";

import { useActivityRecommender } from "../../context/ActivityRecommenderContext";
import { useAccountSubscription, useCarbonTheme } from "../../hooks";
import { AccountTab } from "../AccountTab/AccountTab";
import { ActivityTypeRecommender } from "../ActivityTypeRecommender/ActivityTypeRecommender";
import { ActivityTypeRecommenderContent } from "../ActivityTypeRecommenderContent/ActivityTypeRecommenderContent";
import { DismissibleTab } from "../DismissibleTab/DismissibleTab";
import { QuickHelpTab } from "../QuickHelpTab/QuickHelpTab";
import { ResourcesTab } from "../ResourcesTab/ResourcesTab";
import { TrialCountHeader } from "../TrialCountHeader/TrialCountHeader";

type TabValue = "quickHelp" | "account" | "resources" | "activityTypeRecommender";

export interface ActivityTypeRecomenderContext {
  search: string;
  country: string;
  date?: string;
  scope?: string;
  stateProvince?: string;
  unit?: string;
}

const useStyles = makeStyles({
  tabContainer: {
    overflowX: "auto",
    scrollbarWidth: "thin",
  },
});

export function MainPage() {
  const styles = useStyles();
  const theme = useCarbonTheme();
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");
  const [previousTab, setPreviousTab] = useState<TabValue>("quickHelp");
  const subscriptionInfo = useAccountSubscription();
  const shouldShowTrialCountHeader = subscriptionInfo.data?.subscriptionType === "trial";

  const {
    activityRecommenderState,
    setActivityRecommenderState,
    recommendedParams,
    setRecommendedParams,
  } = useActivityRecommender();

  useEffect(() => {
    if (activityRecommenderState === "dismissable") {
      if (selectedTab !== "activityTypeRecommender") {
        setPreviousTab(selectedTab);
      }
      setSelectedTab("activityTypeRecommender");
    }
  }, [activityRecommenderState]);

  useEffect(() => {
    const handleActivityRecommenderRequested = (event: CustomEvent<any>) => {
      const data = event.detail;
      if (!data) return;

      const { recommendedParams, wasAlreadyOpen } = data;
      if (!recommendedParams) return;

      setRecommendedParams(recommendedParams);
      if (!wasAlreadyOpen) {
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

    window.addEventListener(
      "ACTIVITY_RECOMMENDER_REQUESTED",
      handleActivityRecommenderRequested as EventListener
    );

    if (window.recommendedParams) {
      // Pane was just opened with pre-set params — always standalone
      handleActivityRecommenderRequested({
        detail: { ...window.recommendedParams, wasAlreadyOpen: false },
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
    } else {
      // Restore the tab that was active before the recommender was opened
      setSelectedTab(previousTab);
    }
    // Clear recommender state and params
    setActivityRecommenderState(undefined);
    setRecommendedParams(undefined);
  };

  if (activityRecommenderState === "standalone") {
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
          className={styles.tabContainer}
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
        >
          <Tab value="quickHelp">Quick help</Tab>
          <Tab value="resources">Resources</Tab>
          <Tab value="account">Account</Tab>
          {activityRecommenderState === "dismissable" && (
            <DismissibleTab
              value="activityTypeRecommender"
              icon={<AiRecommend />}
              label="Envizi Activity type recommender"
              onDismiss={onClose}
            />
          )}
        </TabList>
        <div className="tab-content">
          {selectedTab === "quickHelp" && <QuickHelpTab />}
          {selectedTab === "resources" && <ResourcesTab />}
          {selectedTab === "account" && <AccountTab />}
          {selectedTab === "activityTypeRecommender" && (
            <Theme theme={theme.theme}>
              <div className="activity-recommender-content">
                <ActivityTypeRecommenderContent context={recommendedParams} onClose={onClose} />
              </div>
            </Theme>
          )}
        </div>
      </div>
    </>
  );
}
