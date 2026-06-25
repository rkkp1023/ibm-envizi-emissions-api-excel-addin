// Copyright IBM Corp. 2026

import { AiRecommend, Idea } from "@carbon/icons-react";
import { Button, InlineLoading, Stack, Tab, TabList, TabPanels, Tabs, Tag } from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useState } from "react";

import {
  extractParameterCellAddresses,
  isRecommendActivityTypeFormula,
} from "../../../commands/formula-parser";
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
  };

  const handleUseSelectedActivityType = async () => {
    try {
      await Excel.run(async (excelContext) => {
        const activeCell = excelContext.workbook.getSelectedRange();
        activeCell.load(["address", "formulas"]);
        await excelContext.sync();

        const formula = activeCell.formulas[0][0] as string;

        // Check if the active cell has a formula
        if (formula && isRecommendActivityTypeFormula(formula)) {
          // Case 1: Formula exists - update parameter cells to preserve formula
          const cellAddresses = extractParameterCellAddresses(formula);
          const worksheet = excelContext.workbook.worksheets.getActiveWorksheet();

          // Write activity type to search cell
          if (cellAddresses.searchCell) {
            const searchRange = worksheet.getRange(cellAddresses.searchCell);
            searchRange.values = [[selectedRecommendation.activityType]];
          }
        } else {
          // Case 2: No formula - write values to consecutive cells
          // Active cell: activity type
          activeCell.values = [[selectedRecommendation.activityType]];

          // Next cell (+1): confidence
          const confidenceCell = activeCell.getOffsetRange(0, 1);
          confidenceCell.values = [[selectedRecommendation.confidence]];

          // Next cell (+2): description
          const descriptionCell = activeCell.getOffsetRange(0, 2);
          descriptionCell.values = [[selectedRecommendation.activityDescription]];
        }

        await excelContext.sync();

        // Close the recommender on success
        onClose?.();
      });
    } catch (error) {
      console.error("Error writing to Excel:", error);
    }
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
                {context?.stateProvince && (
                  <Tag size="md" title="Clear filter" type="blue">
                    {context?.stateProvince}
                  </Tag>
                )}
                {context?.unit && (
                  <Tag size="md" title="Clear filter" type="blue">
                    {context?.unit}
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
                <Button
                  kind="primary"
                  size="md"
                  iconDescription="Use selected activity type"
                  disabled={!selectedRecommendation}
                  onClick={handleUseSelectedActivityType}
                >
                  Use selected activity type
                </Button>
                <Button kind="secondary" size="md" iconDescription="Cancel" onClick={onClose}>
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
