// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { Theme } from "@carbon/react";
import { Tab, TabList } from "@fluentui/react-components";
import { makeStyles } from "@griffel/react";
import { useEffect, useRef, useState } from "react";

import { getMCPServerUrl } from "../../../common/env";
import { AnnouncementBar, AnnouncementBarProps } from "../AnnouncementBar/AnnouncementBar";
import { useActivityRecommender } from "../../context/ActivityRecommenderContext";
import { useAccountSubscription, useCarbonTheme } from "../../hooks";
import { AccountTab } from "../AccountTab/AccountTab";
import { ActivityTypeRecommender } from "../ActivityTypeRecommender/ActivityTypeRecommender";
import { ActivityTypeRecommenderContent } from "../ActivityTypeRecommenderContent/ActivityTypeRecommenderContent";
import { DismissibleTab } from "../DismissibleTab/DismissibleTab";
import { QuickHelpTab } from "../QuickHelpTab/QuickHelpTab";
import { ResourcesTab } from "../ResourcesTab/ResourcesTab";
import { TrialCountHeader } from "../TrialCountHeader/TrialCountHeader";
import { getIsTaskpaneOpen } from "../../../commands/taskPaneVisibility";
import { openTaskpane } from "../../../commands/commands";
import { RecommendedParams } from "../../../commands/commands-entry";

type TabValue = "quickHelp" | "account" | "resources" | "activityTypeRecommender";

type ActivityRecommenderRequestedDetail = { recommendedParams: RecommendedParams };

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

const announcementConfig: AnnouncementBarProps = {
  title: "New feature!",
  body: "The Model Context Protocol (MCP) server connects Envizi data to AI tools like Claude to enhance sustainability insights and automate emissions reporting.",
  intent: "info",
  actions: [
    {
      label: "Learn more about MCP",
      href: getMCPServerUrl(),
    },
  ],
};

const announcementLocalStorageKey = "showMcpBanner";

export function MainPage() {
  const styles = useStyles();
  const theme = useCarbonTheme();
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");
  const [previousTab, setPreviousTab] = useState<TabValue>("quickHelp");
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(
    () => localStorage.getItem(announcementLocalStorageKey) !== "false"
  );
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

  // Stable ref so the event handler always reads the latest state without
  // needing to be re-registered on every state change.
  const activityRecommenderStateRef = useRef(activityRecommenderState);
  useEffect(() => {
    activityRecommenderStateRef.current = activityRecommenderState;
  }, [activityRecommenderState]);

  useEffect(() => {
    const handleActivityRecommenderRequested = (
      event: CustomEvent<ActivityRecommenderRequestedDetail>
    ): void => {
      const { recommendedParams } = event.detail ?? {};
      if (!recommendedParams) return;

      setRecommendedParams(recommendedParams);

      const wasAlreadyOpen = getIsTaskpaneOpen();
      if (wasAlreadyOpen) {
        // Task pane was already open.
        // Only promote to "dismissable" when no recommender session is active;
        // keep "standalone" unchanged.
        if (activityRecommenderStateRef.current === undefined) {
          setActivityRecommenderState("dismissable");
        }
      } else {
        setActivityRecommenderState("standalone");
        openTaskpane().catch((error) => {
          console.error("Failed to open taskpane:", error);
        });
      }
    };

    window.addEventListener(
      "ACTIVITY_RECOMMENDER_REQUESTED",
      handleActivityRecommenderRequested as EventListener
    );

    // Bootstrap: pane was opened with pre-set params from the ribbon command —
    // run once on mount only, always treated as standalone.
    if (window.recommendedParams) {
      handleActivityRecommenderRequested(
        new CustomEvent<ActivityRecommenderRequestedDetail>("ACTIVITY_RECOMMENDER_REQUESTED", {
          detail: { recommendedParams: window.recommendedParams },
        })
      );
    }

    return () => {
      window.removeEventListener(
        "ACTIVITY_RECOMMENDER_REQUESTED",
        handleActivityRecommenderRequested as EventListener
      );
    };
  }, [setActivityRecommenderState, setRecommendedParams]);

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
              label="Activity type recommendations"
              onDismiss={onClose}
            />
          )}
        </TabList>
        <div className="tab-content">
          {showAnnouncement && (
            <AnnouncementBar
              {...announcementConfig}
              onDismiss={() => {
                localStorage.setItem(announcementLocalStorageKey, "false");
                setShowAnnouncement(false);
              }}
            />
          )}
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
