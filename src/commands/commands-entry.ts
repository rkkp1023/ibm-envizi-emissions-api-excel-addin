// Copyright IBM Corp. 2026

/**
 * Entry point for ribbon command handlers
 * Now uses SharedRuntime (taskpane.html) so commands can access
 * the same credentials as custom functions and taskpane
 */

import {
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
} from "./commands";
import { ActivityTypeOption, AreaTypeOption } from "./data-validation-manager";

/**
 * Shows a notification message to the user
 * Only shows dialog for errors (stays open until user clicks OK)
 * Success messages only go to console
 */
function showNotification(message: string, type: "info" | "error" = "info"): void {
  // Always log to console for debugging (F12 developer tools)
  const prefix = type === "error" ? "❌ ERROR" : "✅ SUCCESS";
  const logMessage = `[Add-in ${prefix}] ${message}`;
  
  if (type === "error") {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // Only show dialog for errors
  if (type === "error") {
    try {
      const encodedMessage = encodeURIComponent(message);
      const notificationUrl = `${window.location.origin}/commands/notification.html?message=${encodedMessage}`;
      
      Office.context.ui.displayDialogAsync(
        notificationUrl,
        { height: 40, width: 40 },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            // Listen for close message from dialog
            result.value.addEventHandler(Office.EventType.DialogMessageReceived, () => {
              try {
                result.value.close();
              } catch (e) {
                // Dialog already closed, ignore
              }
            });
          } else {
            // Dialog failed, but error is already in console
            console.error("Failed to show error dialog:", result.error);
          }
        }
      );
    } catch (error) {
      // Dialog API failed, error already in console
      console.error("Error dialog error:", error);
    }
  }
  // Success messages only go to console (no popup)
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
    showNotification(`Activity type validation (${activityType}) applied successfully!`);
    event.completed();
  } catch (error) {
    showNotification(`Error: ${error.message || "Failed to apply validation"}`, "error");
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
    showNotification(`Area validation (${areaType}) applied successfully!`);
    event.completed();
  } catch (error) {
    showNotification(`Error: ${error.message || "Failed to apply validation"}`, "error");
    event.completed();
  }
}

/**
 * Command handler for Insert Units
 */
async function actionInsertUnits(event: Office.AddinCommands.Event): Promise<void> {
  try {
    await handleInsertUnits();
    showNotification("Unit validation applied successfully!");
    event.completed();
  } catch (error) {
    showNotification(`Error: ${error.message || "Failed to apply validation"}`, "error");
    event.completed();
  }
}

// Create wrapper functions for each activity type menu item
async function actionInsertActivityType_All(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "all");
}
async function actionInsertActivityType_Location(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "location");
}
async function actionInsertActivityType_Stationary(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "stationary");
}
async function actionInsertActivityType_Mobile(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "mobile");
}
async function actionInsertActivityType_Fugitive(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "fugitive");
}
async function actionInsertActivityType_TransportationDistribution(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "transportation-and-distribution");
}
async function actionInsertActivityType_EconomicActivity(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "economic-activity");
}
async function actionInsertActivityType_RealEstate(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertActivityType(event, "real-estate");
}

// Create wrapper functions for each area type menu item
async function actionInsertArea_Country(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertArea(event, "country");
}
async function actionInsertArea_StateProvince(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertArea(event, "stateprovince");
}
async function actionInsertArea_PowerGrid(event: Office.AddinCommands.Event): Promise<void> {
  return actionInsertArea(event, "powergrid");
}

// Register command handlers globally for Office to call
(globalThis as any).actionOpenTaskpane = actionOpenTaskpane;
(globalThis as any).actionInsertActivityType_All = actionInsertActivityType_All;
(globalThis as any).actionInsertActivityType_Location = actionInsertActivityType_Location;
(globalThis as any).actionInsertActivityType_Stationary = actionInsertActivityType_Stationary;
(globalThis as any).actionInsertActivityType_Mobile = actionInsertActivityType_Mobile;
(globalThis as any).actionInsertActivityType_Fugitive = actionInsertActivityType_Fugitive;
(globalThis as any).actionInsertActivityType_TransportationDistribution = actionInsertActivityType_TransportationDistribution;
(globalThis as any).actionInsertActivityType_EconomicActivity = actionInsertActivityType_EconomicActivity;
(globalThis as any).actionInsertActivityType_RealEstate = actionInsertActivityType_RealEstate;
(globalThis as any).actionInsertArea_Country = actionInsertArea_Country;
(globalThis as any).actionInsertArea_StateProvince = actionInsertArea_StateProvince;
(globalThis as any).actionInsertArea_PowerGrid = actionInsertArea_PowerGrid;
(globalThis as any).actionInsertUnits = actionInsertUnits;

// Initialize Office
Office.onReady(() => {
  // Commands ready
});

// Made with Bob
