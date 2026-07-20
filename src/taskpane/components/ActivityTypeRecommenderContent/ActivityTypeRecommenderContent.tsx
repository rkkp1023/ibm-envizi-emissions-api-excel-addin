// Copyright IBM Corp. 2026

import { Idea, Search, WarningAlt } from "@carbon/icons-react";
import { Button, InlineLoading, Stack, Tag } from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useEffect, useState } from "react";

import {
  extractParameterCellAddresses,
  isRecommendActivityTypeFormula,
} from "../../../commands/formula-parser";
import { useActivityTypeRecommendations } from "../../hooks/useActivityTypeRecommendations";
import { ActivityRecommenderProps } from "../ActivityTypeRecommender/ActivityTypeRecommender";
import ActivityTypeRecommenderModifySearch, {
  SearchParams,
} from "../ActivityTypeRecommenderModifySearch/ActivityTypeRecommenderModifySearch";
import ActivityTypeRecommenderTable, {
  ActivityTypeRecommendation,
} from "../ActivityTypeRecommenderTable/ActivityTypeRecommenderTable";
import type { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

interface ManualUpdateField {
  label: string;
  value: string;
}

const useStyles = makeStyles({
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
});

export function ActivityTypeRecommenderContent({
  context,
  onClose,
}: Readonly<ActivityRecommenderProps>) {
  const styles = useStyles();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<ActivityTypeRecommendation | null>(null);
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [localContext, setLocalContext] = useState<ActivityTypeRecomenderContext | undefined>(
    context
  );
  const [manualUpdateFields, setManualUpdateFields] = useState<ManualUpdateField[] | null>(null);
  const [pendingSearch, setPendingSearch] = useState(false);
  const [showNoResultsNotification, setShowNoResultsNotification] = useState(false);

  const { data: recommendations, isLoading, status } = useActivityTypeRecommendations({
    search: localContext?.search || "",
    country: localContext?.country || "",
    ...localContext,
  });

  useEffect(() => {
    // Wait until the query has settled (success or error — not loading/idle)
    if (status === "pending") return;

    const isEmpty = status === "error" || !recommendations || recommendations.length === 0;

    // Initial load with no results — auto-open Modify Search with notification
    if (!pendingSearch && isEmpty && !showModifySearch) {
      setShowModifySearch(true);
      setShowNoResultsNotification(true);
      return;
    }

    // Modify search submit resolved
    if (pendingSearch) {
      if (!isEmpty) {
        setShowModifySearch(false);
        setShowNoResultsNotification(false);
      } else {
        setShowNoResultsNotification(true);
      }
      setPendingSearch(false);
    }
  }, [status, recommendations, pendingSearch, showModifySearch]);

  const handleRadioSelect = (recommendation: ActivityTypeRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  const handleUseSelectedActivityType = async () => {
    if (!selectedRecommendation) return;
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

          // Write back modified filter values to their parameter cells, or collect
          // fields that have no cell address but were edited by the user
          const filterFields: Array<{
            label: string;
            cellKey: keyof typeof cellAddresses;
            localValue: string | undefined;
            originalValue: string | undefined;
          }> = [
            {
              label: "Country",
              cellKey: "countryCell",
              localValue: localContext?.country,
              originalValue: context?.country,
            },
            {
              label: "State/Province",
              cellKey: "stateProvinceCell",
              localValue: localContext?.stateProvince,
              originalValue: context?.stateProvince,
            },
            {
              label: "Unit",
              cellKey: "unitCell",
              localValue: localContext?.unit,
              originalValue: context?.unit,
            },
            {
              label: "Scope",
              cellKey: "scopeCell",
              localValue: localContext?.scope,
              originalValue: context?.scope,
            },
          ];

          const missingCellFields: ManualUpdateField[] = [];

          for (const field of filterFields) {
            const cellAddress = cellAddresses[field.cellKey];
            if (cellAddress) {
              // Has a cell address — always write (empty string clears the cell)
              worksheet.getRange(cellAddress).values = [[field.localValue ?? ""]];
            } else if (!cellAddress && (field.localValue ?? "") !== (field.originalValue ?? "")) {
              // No cell address but value changed (including cleared) — flag for manual update
              missingCellFields.push({ label: field.label, value: field.localValue ?? "" });
            }
          }

          await excelContext.sync();

          if (missingCellFields.length > 0) {
            setManualUpdateFields(missingCellFields);
            return;
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

  const handleSearch = (searchParams: SearchParams) => {
    setLocalContext({
      search: searchParams.activityName,
      country: searchParams.country?.text ?? "",
      stateProvince: searchParams.state?.text ?? undefined,
      unit: searchParams.unit?.text ?? undefined,
      scope: searchParams.scope?.text ?? undefined,
      date: localContext?.date, // no date field in form — preserve original value
    });
    setPendingSearch(true);
  };

  const isEmpty = status === "error" || !recommendations || recommendations.length === 0;

  if (showModifySearch) {
    return (
      <ActivityTypeRecommenderModifySearch
        context={localContext}
        onBack={isEmpty ? undefined : () => { setShowModifySearch(false); setShowNoResultsNotification(false); }}
        onCancel={isEmpty ? onClose : () => { setShowModifySearch(false); setShowNoResultsNotification(false); }}
        onSearch={handleSearch}
        showNoResultsNotification={showNoResultsNotification}
        disableBack={isEmpty}
      />
    );
  }

  if (manualUpdateFields) {
    return (
      <Stack gap={5} className="manual-update-container">
        <div className="manual-update-header">
          <WarningAlt size={20} />
          <span className="heading-title">Manual update required</span>
        </div>
        <span className="manual-update-body">
          The following search parameters could not be written automatically because the formula
          does not reference a cell for them. Please update these values in your sheet manually:
        </span>
        <Stack gap={3}>
          {manualUpdateFields.map((field) => (
            <div key={field.label} className="manual-update-field">
              <strong>{field.label}:</strong> {field.value}
            </div>
          ))}
        </Stack>
        <Button kind="primary" size="md" onClick={onClose}>
          Done
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <div className="tags-container">
        <span>
          Top 30 recommendations for "<b>{localContext?.search}</b>"
        </span>
        <div className="tags-row">
          {localContext?.country && (
            <Tag size="md" title="Clear filter" type="blue">
              {localContext?.country}
            </Tag>
          )}
          {localContext?.unit && (
            <Tag size="md" title="Clear filter" type="blue">
              {localContext?.unit}
            </Tag>
          )}
        </div>
      </div>
      <Button
        kind="ghost"
        size="md"
        renderIcon={Search}
        iconDescription="Modify search"
        onClick={() => setShowModifySearch(true)}
      >
        Modify Search
      </Button>
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
            If you can't locate what you need in this list, use the "Insert activity type" in the
            ribbon and search in the dropdown menu.
          </span>
        </div>
      </Stack>
    </Stack>
  );
}
