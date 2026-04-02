// Copyright IBM Corp. 2026

import {
  ActivityTypeOption,
  AreaTypeOption,
  insertActivityTypeValidation,
  insertAreaValidation,
  insertUnitValidation,
} from "./data-validation-manager";
import {
  fetchAllMetadata,
} from "./metadata-service";
import {
  createNamedRanges,
  deleteMetadataSheet,
  metadataSheetExists,
  needsMetadataRefresh,
  writeMetadataToSheet,
} from "./metadata-sheet-manager";

/**
 * Configuration for metadata refresh interval (in days)
 */
const METADATA_REFRESH_DAYS = 3;

/**
 * Promise to track metadata initialization
 */
let initializeMetadataPromise: Promise<void> | null = null;

/**
 * Ensures metadata is loaded and up-to-date
 * This is called before any data validation operation
 */
async function ensureMetadataLoaded(): Promise<void> {
  // If initialization is not in progress, start it
  if (!initializeMetadataPromise) {
    initializeMetadataPromise = (async () => {
      try {
        // Check if metadata needs refresh
        const needsRefresh = await needsMetadataRefresh(METADATA_REFRESH_DAYS);

        if (needsRefresh) {
          console.log("Creating/updating metadata...");
          await refreshMetadata();
        }
      } catch (error) {
        // On any error, cleanup the metadata sheet
        await deleteMetadataSheet();
        throw error;
      }
    })();

    // Once complete, set to resolved promise so we don't need to do it again
    initializeMetadataPromise.then(
      () => {
        initializeMetadataPromise = Promise.resolve();
      },
      () => {
        // On error, reset so next call can try again
        initializeMetadataPromise = null;
      }
    );
  }

  // Wait for initialization to complete (or return immediately if already resolved)
  await initializeMetadataPromise;
}

/**
 * Refreshes metadata from the API and updates the hidden sheet
 */
async function refreshMetadata(): Promise<void> {
  try {
    const metadata = await fetchAllMetadata();
    await writeMetadataToSheet(metadata);
    await createNamedRanges();
    console.log("Metadata refreshed successfully");
  } catch (error) {
    throw new Error(`Failed to refresh metadata: ${error.message || "Unknown error"}`);
  }
}

/**
 * Opens the taskpane
 */
export async function openTaskpane(): Promise<void> {
  try {
    await Office.addin.showAsTaskpane();
  } catch (error) {
    console.error("Failed to show taskpane:", error);
    // Don't throw - taskpane opening is not critical
  }
}

/**
 * Handles the Insert Activity Types button click
 * Shows a dialog to select activity type, then applies validation
 */
export async function handleInsertActivityTypes(activityType: ActivityTypeOption): Promise<void> {
  await ensureMetadataLoaded();
  await insertActivityTypeValidation(activityType);
}

/**
 * Handles the Insert Area button click
 * Shows a dialog to select area type, then applies validation
 */
export async function handleInsertArea(areaType: AreaTypeOption): Promise<void> {
  await ensureMetadataLoaded();
  await insertAreaValidation(areaType);
}

/**
 * Handles the Insert Units button click
 * Applies unit validation to selected cells
 */
export async function handleInsertUnits(): Promise<void> {
  await ensureMetadataLoaded();
  await insertUnitValidation();
}

/**
 * Forces a metadata refresh (can be called manually)
 */
export async function forceMetadataRefresh(): Promise<void> {
  await refreshMetadata();
}

/**
 * Refreshes metadata on login if sheet exists
 * Should be called on login
 */
export async function refreshMetadataOnLogin(): Promise<void> {
  try {
    const sheetExists = await metadataSheetExists();
    
    // Only refresh if sheet exists
    if (sheetExists) {
      console.log("Refreshing metadata on login...");
      await refreshMetadata();
    }
  } catch (error) {
    console.error("Failed to refresh metadata on login:", error);
    // Don't throw - login should succeed even if metadata refresh fails
  }
}

/**
 * Resets the metadata initialization promise (for testing purposes)
 * @internal
 */
export function resetMetadataPromise(): void {
  initializeMetadataPromise = null;
}

// Made with Bob
