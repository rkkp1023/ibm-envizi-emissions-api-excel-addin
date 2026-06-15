// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { InlineLoading, Stack, Tab, TabList, TabPanels, Tabs, Tag } from "@carbon/react";
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
        <Stack as="div" gap={3}>
          <div className="tags-container">
            <span>
              Top 30 recommendations for "<b>{context?.search}</b>"
            </span>
            <Stack as="div" gap={3} orientation="horizontal">
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
          <div className="activity-type-recom-container">
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
        </Stack>
      </TabPanels>
    </Tabs>
  );
}
