// Copyright IBM Corp. 2026

/**
 * Entry point for ribbon command handlers
 * Now uses SharedRuntime (taskpane.html) so commands can access
 * the same credentials as custom functions and taskpane
 */

import { getEnvType } from "../common/env";
import {
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
} from "./commands";
import { ActivityTypeOption, AreaTypeOption } from "./data-validation-manager";
import { getParamsFromCell } from "./formula-parser";

declare global {
  interface Window {
    recommendedParams?: RecommendedParams;
  }
}

export interface RecommendedParams {
  payload: any;
}

/**
 * Logs a success message to the console
 */
function logSuccess(message: string): void {
  console.log(`[Add-in ✅ SUCCESS] ${message}`);
}

/**
 * Shows an error notification dialog to the user
 */
function showErrorNotification(message: string): void {
  console.error(`[Add-in ❌ ERROR] ${message}`);

  try {
    // Ensure message is a string and not undefined/null
    const safeMessage = message || "An error occurred";
    const encodedMessage = encodeURIComponent(safeMessage);
    // Use /excel-addin root path for server deployment
    const basePath = getEnvType() === "local" ? "" : "/excel-addin";
    const notificationUrl = `${window.location.origin}${basePath}/commands/notification.html?message=${encodedMessage}`;

    console.log("Opening notification dialog with URL:", notificationUrl);

    Office.context.ui.displayDialogAsync(notificationUrl, { height: 40, width: 40 }, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Notification dialog opened successfully");
        // Listen for close message from dialog
        result.value.addEventHandler(Office.EventType.DialogMessageReceived, () => {
          try {
            result.value.close();
          } catch (e) {
            // Dialog already closed, ignore
            console.log("Dialog already closed");
          }
        });
      } else {
        // Dialog failed, but error is already in console
        console.error("Failed to show error dialog:", result.error);
      }
    });
  } catch (error) {
    // Dialog API failed, error already in console
    console.error("Error dialog error:", error);
  }
}

/**
 * Command handler for opening the taskpane
 */
async function actionOpenTaskpane(event: Office.AddinCommands.Event): Promise<void> {
  try {
    await openTaskpane();
  } catch (error) {
    console.error("Failed to open taskpane:", error);
  } finally {
    event.completed();
  }
}

/**
 * Command handler for Insert Activity Types with dropdown menu
 */
async function actionInsertActivityType(
  event: Office.AddinCommands.Event,
  activityType: ActivityTypeOption
): Promise<void> {
  try {
    await handleInsertActivityTypes(activityType);
    logSuccess(`Activity type validation (${activityType}) applied successfully!`);
    event.completed();
  } catch (error) {
    // Handle both standard Error and CustomFunctions.Error
    const errorMessage = error?.message || error?.toString() || "Failed to apply validation";
    showErrorNotification(`Error: ${errorMessage}`);
    event.completed();
  }
}

/**
 * Command handler for Insert Area with dropdown menu
 */
async function actionInsertArea(
  event: Office.AddinCommands.Event,
  areaType: AreaTypeOption
): Promise<void> {
  try {
    await handleInsertArea(areaType);
    logSuccess(`Area validation (${areaType}) applied successfully!`);
    event.completed();
  } catch (error) {
    // Handle both standard Error and CustomFunctions.Error
    const errorMessage = error?.message || error?.toString() || "Failed to apply validation";
    showErrorNotification(`Error: ${errorMessage}`);
    event.completed();
  }
}

/**
 * Command handler for Insert Units
 */
async function actionInsertUnits(event: Office.AddinCommands.Event): Promise<void> {
  try {
    await handleInsertUnits();
    logSuccess("Unit validation applied successfully!");
    event.completed();
  } catch (error) {
    // Handle both standard Error and CustomFunctions.Error
    const errorMessage = error?.message || error?.toString() || "Failed to apply validation";
    showErrorNotification(`Error: ${errorMessage}`);
    event.completed();
  }
}

/**
 * Command handler for IBM Envizi Suggestions context menu
 * Opens task pane and shows recommendations in the Suggestions tab
 */
async function actionShowActivityRecommendation(event: Office.AddinCommands.Event): Promise<void> {
  try {
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load(["address", "values"]);
      await context.sync();

      const value = range.values[0][0];
      if (value === null || value === "") {
        showErrorNotification(
          "The selected cell is empty. Please choose a valid cell or enter data before proceeding"
        );
      }

      const cellAddress = range.address.split("!")[1]; // Remove sheet name

      // Get parameters from cell (with formula detection)
      const params = await getParamsFromCell(cellAddress, context);

      // Open task pane first
      await openTaskpane();

      // Dispatch event with recommendation parameters and task pane state
      window.dispatchEvent(
        new CustomEvent("ACTIVITY_RECOMMENDER_REQUESTED", {
          detail: {
            recommendedParams: params,
          },
        })
      );
    });

    event.completed();
  } catch (error) {
    const errorMessage = error?.message || error?.toString() || "Failed to process request";
    showErrorNotification(`Error: ${errorMessage}`);
    event.completed();
  }
}

// Register command handlers globally for Office to call
(globalThis as any).actionOpenTaskpane = actionOpenTaskpane;

// Register activity type handlers
[
  { name: "All", type: "all" },
  { name: "Location", type: "location" },
  { name: "Stationary", type: "stationary" },
  { name: "Mobile", type: "mobile" },
  { name: "Fugitive", type: "fugitive" },
  { name: "TransportationDistribution", type: "transportation-and-distribution" },
  { name: "EconomicActivity", type: "economic-activity" },
  { name: "RealEstate", type: "real-estate" },
].forEach(({ name, type }) => {
  (globalThis as any)[`actionInsertActivityType_${name}`] = async (
    event: Office.AddinCommands.Event
  ) => actionInsertActivityType(event, type as ActivityTypeOption);
});

// Register area type handlers
[
  { name: "Country", type: "country" },
  { name: "StateProvince", type: "stateprovince" },
  { name: "PowerGrid", type: "powergrid" },
].forEach(({ name, type }) => {
  (globalThis as any)[`actionInsertArea_${name}`] = async (event: Office.AddinCommands.Event) =>
    actionInsertArea(event, type as AreaTypeOption);
});

(globalThis as any).actionInsertUnits = actionInsertUnits;
(globalThis as any).actionShowActivityRecommendation = actionShowActivityRecommendation;

// Initialize Office
Office.onReady(() => {
  // Commands ready
});

// Made with Bob
