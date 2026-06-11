// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { Stack, Tab, TabList, TabPanels, Tabs } from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useState } from "react";

import ActivityTypeRecommenderTable, {
  ActivityTypeRecommendation,
} from "../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable";

const useStyles = makeStyles({
  tabList: {
    "& .cds--tab--list": {
      width: "100%",
    },
  },
});

export interface ActivityRecommenderProps {
  onClose?: () => void;
}

// Sample data matching Figma design
const defaultRecommendations: ActivityTypeRecommendation[] = [
  {
    id: "1",
    activityType: "Waste Recycled - Cardboard",
    confidence: 95,
    activityDescription: "Waste Recycled - Cardboard",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "2",
    activityType: "Waste Recycled - Cardboard",
    confidence: 92,
    activityDescription: "Waste Recycled - Cardboard (Alternative)",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "3",
    activityType: "Waste Recycled - Cardboard",
    confidence: 88,
    activityDescription: "Waste Recycled - Cardboard (Regional)",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes", "lbs"],
  },
  {
    id: "4",
    activityType: "Waste Recycled - Cardboard",
    confidence: 85,
    activityDescription: "Waste Recycled - Cardboard (Standard)",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg", "tonnes"],
  },
  {
    id: "5",
    activityType: "Waste Recycled - Cardboard",
    confidence: 82,
    activityDescription: "Waste Recycled - Cardboard (Basic)",
    region: "Global",
    scope: "Scope 3 - Category 5: Waste generated in operations",
    units: ["kg"],
  },
];

export function ActivityTypeRecommender({ onClose }: Readonly<ActivityRecommenderProps>) {
  const styles = useStyles();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ActivityTypeRecommendation | null>(null);

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
            <ActivityTypeRecommenderTable
              recommendations={defaultRecommendations}
              onSelect={handleRadioSelect}
            />
          </div>
        </Stack>
      </TabPanels>
    </Tabs>
  );
}
