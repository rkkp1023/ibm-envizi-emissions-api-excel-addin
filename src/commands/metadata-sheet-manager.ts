// Copyright IBM Corp. 2026

import {
  ACTIVITY_TYPE_ENDPOINTS,
  ActivityTypeEndpoint,
  CompleteMetadata,
} from "./metadata-service";

/**
 * Hidden sheet name for storing metadata
 */
export const METADATA_SHEET_NAME = "_EnviziMetadata";

/**
 * Storage key for metadata state
 */
const METADATA_STATE_KEY = "EnviziMetadataState";

/**
 * Metadata state stored in Excel custom properties
 */
interface MetadataState {
  lastRefreshTimestamp: string;
  sheetExists: boolean;
}

/**
 * Column mapping for the hidden sheet
 */
interface ColumnMapping {
  timestamp: number; // Column A (0)
  activityTypes: { [key in ActivityTypeEndpoint]: number }; // Starting from column B (1)
  countries: number;
  stateProvinces: number;
  powerGrids: number;
  units: number;
}

/**
 * Gets the metadata state from Excel custom properties
 */
async function getMetadataState(): Promise<MetadataState | null> {
  return new Promise((resolve) => {
    Excel.run(async (context) => {
      try {
        const customProperties = context.workbook.properties.custom;
        const stateProperty = customProperties.getItemOrNullObject(METADATA_STATE_KEY);
        stateProperty.load("value");
        await context.sync();

        if (stateProperty.isNullObject) {
          resolve(null);
        } else {
          const state = JSON.parse(stateProperty.value as string);
          resolve(state);
        }
      } catch (error) {
        console.error("Failed to get metadata state:", error);
        resolve(null);
      }
    });
  });
}

/**
 * Sets the metadata state in Excel custom properties
 */
async function setMetadataState(state: MetadataState): Promise<void> {
  return new Promise((resolve, reject) => {
    Excel.run(async (context) => {
      try {
        const customProperties = context.workbook.properties.custom;
        const stateProperty = customProperties.getItemOrNullObject(METADATA_STATE_KEY);
        await context.sync();

        if (stateProperty.isNullObject) {
          customProperties.add(METADATA_STATE_KEY, JSON.stringify(state));
        } else {
          stateProperty.value = JSON.stringify(state);
        }

        await context.sync();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Checks if metadata sheet exists
 */
export async function metadataSheetExists(): Promise<boolean> {
  return new Promise((resolve) => {
    Excel.run(async (context) => {
      try {
        const sheets = context.workbook.worksheets;
        const metadataSheet = sheets.getItemOrNullObject(METADATA_SHEET_NAME);
        await context.sync();
        resolve(!metadataSheet.isNullObject);
      } catch (error) {
        console.error("Failed to check if metadata sheet exists:", error);
        resolve(false);
      }
    });
  });
}

/**
 * Deletes the metadata sheet (used for cleanup on errors)
 */
export async function deleteMetadataSheet(): Promise<void> {
  return new Promise((resolve) => {
    Excel.run(async (context) => {
      try {
        const sheets = context.workbook.worksheets;
        const metadataSheet = sheets.getItemOrNullObject(METADATA_SHEET_NAME);
        await context.sync();
        
        if (!metadataSheet.isNullObject) {
          metadataSheet.delete();
          await context.sync();
        }
        
        // Also clear the metadata state
        await setMetadataState({
          lastRefreshTimestamp: "",
          sheetExists: false,
        });
        
        resolve();
      } catch (error) {
        console.error("Failed to delete metadata sheet:", error);
        resolve(); // Don't fail on cleanup errors
      }
    });
  });
}

/**
 * Checks if metadata needs refresh
 * Returns true if:
 * - Sheet doesn't exist
 * - No state found
 * - Timestamp is older than configDays
 */
export async function needsMetadataRefresh(configDays: number = 3): Promise<boolean> {
  // First check if sheet exists
  const sheetExists = await metadataSheetExists();
  if (!sheetExists) {
    return true;
  }

  // Check state
  const state = await getMetadataState();
  // Use optional chaining for cleaner null checks
  if (!state?.lastRefreshTimestamp) {
    return true;
  }

  // Check timestamp
  const lastRefresh = new Date(state.lastRefreshTimestamp);
  const now = new Date();
  const daysDiff = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);

  return daysDiff >= configDays;
}

/**
 * Gets or creates the hidden metadata sheet
 */
async function getOrCreateMetadataSheet(context: Excel.RequestContext): Promise<Excel.Worksheet> {
  const sheets = context.workbook.worksheets;
  let metadataSheet = sheets.getItemOrNullObject(METADATA_SHEET_NAME);
  await context.sync();

  if (metadataSheet.isNullObject) {
    metadataSheet = sheets.add(METADATA_SHEET_NAME);
    // TODO: Uncomment this line to hide the sheet in production
    // metadataSheet.visibility = Excel.SheetVisibility.hidden;
    await context.sync();
  }

  return metadataSheet;
}

/**
 * Calculates column mapping based on activity type endpoints
 */
function calculateColumnMapping(): ColumnMapping {
  const mapping: ColumnMapping = {
    timestamp: 0,
    activityTypes: {} as any,
    countries: 0,
    stateProvinces: 0,
    powerGrids: 0,
    units: 0,
  };

  let currentColumn = 1; // Start from column B (after timestamp in A)

  // Map activity type endpoints to columns
  for (const endpoint of ACTIVITY_TYPE_ENDPOINTS) {
    mapping.activityTypes[endpoint] = currentColumn++;
  }

  // Map area and unit columns
  mapping.countries = currentColumn++;
  mapping.stateProvinces = currentColumn++;
  mapping.powerGrids = currentColumn++;
  mapping.units = currentColumn++;

  return mapping;
}

/**
 * Writes metadata to the hidden sheet (no headers, data only)
 */
export async function writeMetadataToSheet(metadata: CompleteMetadata): Promise<void> {
  return new Promise((resolve, reject) => {
    Excel.run(async (context) => {
      try {
        const sheet = await getOrCreateMetadataSheet(context);
        const columnMapping = calculateColumnMapping();

        // Clear existing content
        const usedRange = sheet.getUsedRangeOrNullObject();
        await context.sync();
        if (!usedRange.isNullObject) {
          usedRange.clear();
        }

        // Write timestamp in column A, row 1
        const timestampCell = sheet.getRange("A1");
        timestampCell.values = [[metadata.timestamp]];

        // Write activity types (no headers, data starts from row 1)
        for (const endpoint of ACTIVITY_TYPE_ENDPOINTS) {
          const col = columnMapping.activityTypes[endpoint];
          const types = metadata.activityTypes[endpoint] || [];
          
          if (types.length > 0) {
            const dataRange = sheet.getRangeByIndexes(0, col, types.length, 1);
            dataRange.values = types.map((type) => [type]);
          }
        }

        // Write countries
        const countries = metadata.areas.countries;
        if (countries.length > 0) {
          const dataRange = sheet.getRangeByIndexes(0, columnMapping.countries, countries.length, 1);
          dataRange.values = countries.map((c) => [c]);
        }

        // Write state/provinces
        const stateProvinces = metadata.areas.stateProvinces;
        if (stateProvinces.length > 0) {
          const dataRange = sheet.getRangeByIndexes(0, columnMapping.stateProvinces, stateProvinces.length, 1);
          dataRange.values = stateProvinces.map((sp) => [sp]);
        }

        // Write power grids
        const powerGrids = metadata.areas.powerGrids;
        if (powerGrids.length > 0) {
          const dataRange = sheet.getRangeByIndexes(0, columnMapping.powerGrids, powerGrids.length, 1);
          dataRange.values = powerGrids.map((pg) => [pg]);
        }

        // Write units
        const units = metadata.units.units;
        if (units.length > 0) {
          const dataRange = sheet.getRangeByIndexes(0, columnMapping.units, units.length, 1);
          dataRange.values = units.map((u) => [u]);
        }

        await context.sync();

        // Update metadata state
        await setMetadataState({
          lastRefreshTimestamp: metadata.timestamp,
          sheetExists: true,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Creates named ranges for all metadata columns using entire column references
 * Only creates named range if column has data
 */
export async function createNamedRanges(): Promise<void> {
  return new Promise((resolve, reject) => {
    Excel.run(async (context) => {
      try {
        const sheet = context.workbook.worksheets.getItem(METADATA_SHEET_NAME);
        const namedItems = context.workbook.names;
        const columnMapping = calculateColumnMapping();

        // Helper function to get column letter from index (0=A, 1=B, etc.)
        const getColumnLetter = (columnIndex: number): string => {
          let letter = '';
          let temp = columnIndex;
          while (temp >= 0) {
            // Use String.fromCodePoint for better Unicode support
            letter = String.fromCodePoint((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
          }
          return letter;
        };

        // Helper function to create or update a named range for entire column
        const createOrUpdateNamedRange = async (
          name: string,
          columnIndex: number
        ) => {
          try {
            // Check if column has any data by reading first cell
            const firstCell = sheet.getRangeByIndexes(0, columnIndex, 1, 1);
            firstCell.load("values");
            await context.sync();

            // Only create named range if column has data
            // Use optional chaining for cleaner null checks
            if (firstCell.values?.[0]?.[0] === "" || firstCell.values?.[0]?.[0] === null) {
              return;
            }

            // Use entire column reference (e.g., "B:B", "C:C")
            const columnLetter = getColumnLetter(columnIndex);
            const columnRange = sheet.getRange(`${columnLetter}:${columnLetter}`);
            
            // Delete existing named range if it exists
            const existingRange = namedItems.getItemOrNullObject(name);
            await context.sync();
            if (!existingRange.isNullObject) {
              existingRange.delete();
              await context.sync();
            }

            // Create new named range for entire column
            namedItems.add(name, columnRange);
          } catch (error) {
            console.error(`Failed to create named range ${name}:`, error);
            // Don't throw - continue with other ranges
          }
        };

        // Create named ranges for activity types
        for (const endpoint of ACTIVITY_TYPE_ENDPOINTS) {
          const col = columnMapping.activityTypes[endpoint];
          // Use replaceAll for better clarity
          const rangeName = `ActivityType_${endpoint.replaceAll("-", "_")}`;
          await createOrUpdateNamedRange(rangeName, col);
        }

        // Create named ranges for areas
        await createOrUpdateNamedRange("Area_Country", columnMapping.countries);
        await createOrUpdateNamedRange("Area_StateProvince", columnMapping.stateProvinces);
        await createOrUpdateNamedRange("Area_PowerGrid", columnMapping.powerGrids);

        // Create named range for units
        await createOrUpdateNamedRange("Units_All", columnMapping.units);

        await context.sync();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Gets the named range name for an activity type endpoint
 */
export function getActivityTypeRangeName(endpoint: ActivityTypeEndpoint | "all"): string {
  if (endpoint === "all") {
    // For "all", we'll use the calculation endpoint which has all types
    return "ActivityType_calculation";
  }
  // Use replaceAll for better clarity
  return `ActivityType_${endpoint.replaceAll("-", "_")}`;
}

/**
 * Gets the named range name for an area type
 */
export function getAreaRangeName(areaType: "country" | "stateprovince" | "powergrid"): string {
  const mapping = {
    country: "Area_Country",
    stateprovince: "Area_StateProvince",
    powergrid: "Area_PowerGrid",
  };
  return mapping[areaType];
}

/**
 * Gets the named range name for units
 */
export function getUnitsRangeName(): string {
  return "Units_All";
}

// Made with Bob
