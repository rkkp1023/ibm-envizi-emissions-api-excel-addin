// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { InlineLoading, Stack, Tab, TabList, TabPanels, Tabs } from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useEffect, useState } from "react";

import { activityTypeRecommenderService } from "../../services/activityTypeRecommenderService";
import ActivityTypeRecommenderTable, {
  ActivityTypeRecommendation,
} from "../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable";
import { context } from "../MainPage/MainPage";

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
  context?: context;
  onClose?: () => void;
}

// Fetch recommendations from service
const fetchRecommendations = async (
  context: context,
  setRecommendations: (recommendations: ActivityTypeRecommendation[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);

  try {
    // Sample parameters for testing the service
    const params = {
      search: context.search,
      country: context.country,
      stateProvince: context.stateProvince,
      unit: context.unit,
      scope: context.scope,
      date: context.date,
    };

    const result = await activityTypeRecommenderService.recommendActivityType(params);

    // Update recommendations if result is not empty
    if (result && result.length > 0) {
      setRecommendations(result);
    }
    setIsLoading(false);
  } catch (error) {
    console.error("Failed to fetch activity type recommendations:", error);
  }
};

export function ActivityTypeRecommender({ context, onClose }: Readonly<ActivityRecommenderProps>) {
  const styles = useStyles();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ActivityTypeRecommendation | null>(null);
  const [recommendations, setRecommendations] = useState<ActivityTypeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch recommendations only when both search and country are available
  useEffect(() => {
    // Exit early if search or country is missing/empty
    if (!context?.search || !context?.country) {
      return;
    }
    fetchRecommendations(context, setRecommendations, setIsLoading);
  }, [context?.search, context?.country, context?.stateProvince, context?.unit, context?.date]);

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
          <div className="activity-type-recom-container">
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <InlineLoading description="Loading activity type recommendations..." />
              </div>
            ) : (
              <ActivityTypeRecommenderTable
                recommendations={recommendations}
                onSelect={handleRadioSelect}
              />
            )}
          </div>
        </Stack>
      </TabPanels>
    </Tabs>
  );
}
