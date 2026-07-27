// Copyright IBM Corp. 2026

/**
 * Entry point for ribbon command handlers
 * Now uses SharedRuntime (taskpane.html) so commands can access
 * the same credentials as custom functions and taskpane
 */

import { getEnvType } from "../common/env";
import { analyticsService } from "../taskpane/services/analyticsService";
import {
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
} from "./commands";
import { ActivityTypeOption, AreaTypeOption } from "./data-validation-manager";
import { getParamsFromCell, isRecommendActivityTypeFormula } from "./formula-parser";
import { getIsTaskpaneOpen } from "./taskPaneVisibility";

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

    Office.context.ui.displayDialogAsync(notificationUrl, { height: 20, width: 40 }, (result) => {
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
  activityType: ActivityTypeOption,
  CTA: string
): Promise<void> {
  try {
    analyticsService.trackUiInteraction({
      CTA,
      actionType: "click",
    });
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
  areaType: AreaTypeOption,
  CTA: string
): Promise<void> {
  analyticsService.trackUiInteraction({
    CTA,
    actionType: "click",
  });
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
  analyticsService.trackUiInteraction({
    CTA: "Insert Units",
    actionType: "click",
  });
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

// Tracks the last-set enabled state of the Activity Recommendation controls
let activityRecommendationEnabled = false;

/**
 * Checks the selected cell and enables/disables the Activity Recommendation
 * ribbon button and context menu item accordingly.
 */
async function updateActivityRecommendationButtonState(): Promise<void> {
  try {
    let shouldEnable = false;
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load("formulas");
      await context.sync();
      const formula = range.formulas[0][0] as string;
      shouldEnable = isRecommendActivityTypeFormula(formula);
    });

    if (shouldEnable === activityRecommendationEnabled) {
      return;
    }

    // Update ribbon button (RibbonApi 1.1)
    Office.ribbon.requestUpdate({
      tabs: [
        {
          id: "EnviziTab",
          groups: [
            {
              id: "ActivityRecommendationsGroup",
              controls: [{ id: "ActivityRecommendationsButton", enabled: shouldEnable }],
            },
          ],
        },
      ],
    });

    // Update context menu item (ContextMenuApi 1.1 — available from Office)
    if ((Office as any).contextMenu) {
      await (Office as any).contextMenu.requestUpdate({
        controls: [{ id: "ActivityRecommendation", enabled: shouldEnable }],
      });
    }

    activityRecommendationEnabled = shouldEnable;
  } catch (error) {
    console.log("[Add-in] Activity recommendation button state update failed:", error);
  }
}

/**
 * Command handler for IBM Envizi Suggestions context menu
 * Opens task pane and shows recommendations in the Suggestions tab
 */
async function actionShowActivityRecommendation(event: Office.AddinCommands.Event): Promise<void> {
  // Guard against race condition where button fires before state update catches up
  if (!activityRecommendationEnabled) {
    updateActivityRecommendationButtonState();
    event.completed();
    return;
  }

  try {
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load(["address", "formulas"]);
      await context.sync();

      const cellAddress = range.address.split("!")[1]; // Remove sheet name

      // Get parameters from cell (with formula detection)
      const params = await getParamsFromCell(cellAddress, context);

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
  { name: "All", type: "all", CTA: "Insert all Activity Types" },
  { name: "Location", type: "location", CTA: "Location" },
  { name: "Stationary", type: "stationary", CTA: "Stationary" },
  { name: "Mobile", type: "mobile", CTA: "Mobile" },
  { name: "Fugitive", type: "fugitive", CTA: "Fugitive" },
  {
    name: "TransportationDistribution",
    type: "transportation-and-distribution",
    CTA: "Transportation and Distribution",
  },
  { name: "EconomicActivity", type: "economic-activity", CTA: "Economic Activity" },
  { name: "RealEstate", type: "real-estate", CTA: "Real Estate" },
].forEach(({ name, type, CTA }) => {
  (globalThis as any)[`actionInsertActivityType_${name}`] = async (
    event: Office.AddinCommands.Event
  ) => actionInsertActivityType(event, type as ActivityTypeOption, CTA);
});

// Register area type handlers
[
  { name: "Country", type: "country", CTA: "Country" },
  { name: "StateProvince", type: "stateprovince", CTA: "State/Province" },
  { name: "PowerGrid", type: "powergrid", CTA: "Power Grid" },
].forEach(({ name, type, CTA }) => {
  (globalThis as any)[`actionInsertArea_${name}`] = async (event: Office.AddinCommands.Event) =>
    actionInsertArea(event, type as AreaTypeOption, CTA);
});

(globalThis as any).actionInsertUnits = actionInsertUnits;
(globalThis as any).actionShowActivityRecommendation = actionShowActivityRecommendation;

// Initialize Office and register selection-change listener
Office.onReady(async () => {
  try {
    await Excel.run(async (context) => {
      context.workbook.worksheets.onSelectionChanged.add(() =>
        updateActivityRecommendationButtonState()
      );
      await context.sync();
    });
    // Set initial button state based on current selection
    updateActivityRecommendationButtonState();
  } catch (error) {
    console.log("[Add-in] Failed to register selection change handler:", error);
  }
});

// Made with Bob
