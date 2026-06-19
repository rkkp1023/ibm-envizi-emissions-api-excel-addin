// Copyright IBM Corp. 2026

import { AiRecommend, Idea } from "@carbon/icons-react";
import { Button, InlineLoading, Stack, Tab, TabList, TabPanels, Tabs, Tag } from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useState } from "react";

import { useActivityTypeRecommendations } from "../../hooks/useActivityTypeRecommendations";
import ActivityTypeRecommenderTable, {
  ActivityTypeRecommendation,
} from "../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable";
import { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

const useStyles = makeStyles({
  tabList: {
    "& .cds--tab--list": {
      width: "100%",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
});

export interface ActivityRecommenderProps {
  context?: ActivityTypeRecomenderContext;
  onClose?: () => void;
}

export function ActivityTypeRecommender({ context, onClose }: Readonly<ActivityRecommenderProps>) {
  const styles = useStyles();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ActivityTypeRecommendation | null>(null);

  const { data: recommendations, isLoading } = useActivityTypeRecommendations({
    search: context?.search || "",
    country: context?.country || "",
    ...context,
  });

  const handleRadioSelect = (recommendation: ActivityTypeRecommendation) => {
    setSelectedRecommendation(recommendation);
    // TODO: Add logic to handle the selected recommendation
    // For example: insert into Excel, update UI, etc.
    console.log("Selected recommendation:", recommendation);
  };

  return (
    <Tabs dismissable onTabCloseRequest={onClose}>
      <TabList fullWidth={true} className={styles.tabList}>
        <Tab>
          <span className="activity-tab-item">
            <AiRecommend />
            <span>Envizi Activity type recommender</span>
          </span>
        </Tab>
      </TabList>
      <TabPanels>
        <div className="recommender-wrapper">
          <Stack gap={3}>
            <div className="tags-container">
              <span>
                Top 30 recommendations for "<b>{context?.search}</b>"
              </span>
              <Stack gap={3} orientation="horizontal">
                {context?.country && (
                  <Tag size="md" title="Clear filter" type="blue">
                    {context?.country}
                  </Tag>
                )}
                {context?.stateProvince && (
                  <Tag size="md" title="Clear filter" type="blue">
                    {context?.stateProvince}
                  </Tag>
                )}
              </Stack>
            </div>
            <Stack gap={5}>
              <div className="activty-recom-table">
                {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <InlineLoading description="Loading activity type recommendations..." />
                  </div>
                ) : (
                  <ActivityTypeRecommenderTable
                    recommendations={recommendations || []}
                    onSelect={handleRadioSelect}
                  />
                )}
              </div>

              <div className="button-group">
                <Button kind="primary" size="md" iconDescription="Use selected activity type">
                  Use selected activity type
                </Button>
                <Button kind="secondary" size="md" iconDescription="Use selected activity type">
                  Cancel
                </Button>
              </div>

              <div className="information-banner">
                <div>
                  <Idea />
                </div>
                <span>
                  If you can't locate what you need in this list, use the "Insert activity type" in
                  the ribbon and search in the dropdown menu.
                </span>
              </div>
            </Stack>
          </Stack>
        </div>
      </TabPanels>
    </Tabs>
  );
}
