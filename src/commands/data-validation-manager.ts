// Copyright IBM Corp. 2026

import { ActivityTypeEndpoint } from "./metadata-service";
import {
  getActivityTypeRangeName,
  getAreaRangeName,
  getUnitsRangeName,
} from "./metadata-sheet-manager";

/**
 * Activity type options for the dropdown
 */
export type ActivityTypeOption =
  | "all"
  | "location"
  | "stationary"
  | "mobile"
  | "fugitive"
  | "transportation-and-distribution"
  | "economic-activity"
  | "real-estate";

/**
 * Area type options for the dropdown
 */
export type AreaTypeOption = "country" | "stateprovince" | "powergrid";

/**
 * Applies data validation to the selected range using a named range
 * Includes zero-cost error checking for better UX
 */
async function applyDataValidationFromNamedRange(
  rangeName: string,
  errorMessage: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    Excel.run(async (context) => {
      try {
        // Get the selected range and check if named range exists
        // Both loaded in parallel - no extra sync cost
        const selectedRange = context.workbook.getSelectedRange();
        const namedItem = context.workbook.names.getItemOrNullObject(rangeName);

        // Single sync for both operations
        await context.sync();

        // Check if named range exists before applying validation
        if (namedItem.isNullObject) {
          reject(
            new Error(
              `Data not available. check if you are logged in and try again.`
            )
          );
          return;
        }

        // Clear any existing validation
        selectedRange.dataValidation.clear();

        // Apply list validation using the named range
        selectedRange.dataValidation.rule = {
          list: {
            inCellDropDown: true,
            source: `=${rangeName}`,
          },
        };

        selectedRange.dataValidation.errorAlert = {
          message: errorMessage,
          showAlert: true,
          style: Excel.DataValidationAlertStyle.stop,
          title: "Invalid Value",
        };

        selectedRange.dataValidation.prompt = {
          message: `Select a value from the dropdown list`,
          showPrompt: true,
          title: "Data Validation",
        };

        // Single sync call for maximum performance
        await context.sync();
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  });
}

/**
 * Inserts activity type data validation on selected cells
 */
export async function insertActivityTypeValidation(
  activityType: ActivityTypeOption
): Promise<void> {
  const rangeName = getActivityTypeRangeName(activityType as ActivityTypeEndpoint | "all");
  
  const typeLabel = activityType === "all" ? "any activity type" : activityType;
  const errorMessage = `Please select a valid ${typeLabel} from the dropdown list.`;

  await applyDataValidationFromNamedRange(rangeName, errorMessage);
}

/**
 * Inserts area data validation on selected cells
 */
export async function insertAreaValidation(areaType: AreaTypeOption): Promise<void> {
  const rangeName = getAreaRangeName(areaType);
  const errorMessage = `Please select a valid ${areaType} from the dropdown list.`;

  await applyDataValidationFromNamedRange(rangeName, errorMessage);
}

/**
 * Inserts unit data validation on selected cells
 */
export async function insertUnitValidation(): Promise<void> {
  const rangeName = getUnitsRangeName();
  const errorMessage = "Please select a valid unit from the dropdown list.";

  await applyDataValidationFromNamedRange(rangeName, errorMessage);
}

// Made with Bob

