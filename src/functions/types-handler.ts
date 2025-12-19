// Copyright IBM Corp. 2025

/**
 * Handles the types function logic for triggering data validation dropdowns
 * Uses shared runtime to directly access Excel.run() API
 */

import { API_COLUMN_MAP, loadAndPopulateApiTypes } from "./api-types-loader";
import { ensureClient } from "./client";
import { validateApiName, getTargetCell, applyListValidation, handleCustomFunctionError, refreshSheetIfStale } from "./metadata-utils";

/**
 * Sheet name where API types are stored
 */
const API_TYPES_SHEET_NAME = "API_Types_Data";

/**
 * Checks if the API types sheet exists
 * @returns Promise<boolean> indicating if the sheet exists
 */
async function apiTypesSheetExists(): Promise<boolean> {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    sheets.load("items/name");
    await context.sync();
    
    const sheet = sheets.items.find((s) => s.name === API_TYPES_SHEET_NAME);
    return !!sheet;
  });
}

/**
 * Ensures the API types sheet exists, creating it if necessary
 */
async function ensureApiTypesSheet(): Promise<void> {
  const sheetExists = await apiTypesSheetExists();
  if (!sheetExists) {
    await loadAndPopulateApiTypes();
  }
}

/**
 * Applies data validation to a cell based on API types from the hidden sheet
 * @param cellAddress The address of the cell to apply validation to (e.g., "Sheet1!A1")
 * @param apiName The normalized API name (lowercase)
 */
async function applyDataValidation(cellAddress: string, apiName: string): Promise<void> {
  await Excel.run(async (context) => {
    // Get the column index for this API
    const columnIndex = API_COLUMN_MAP[apiName];
    if (columnIndex === undefined) {
      throw new Error(`Unknown API name: ${apiName}`);
    }

    // Get the API types sheet
    const apiTypesSheet = context.workbook.worksheets.getItem(API_TYPES_SHEET_NAME);
    
    // Get the column letter (A=0, B=1, etc.)
    const columnLetter = String.fromCharCode(65 + columnIndex);
    
    // Get the entire column to find the last row with data
    const column = apiTypesSheet.getRange(`${columnLetter}:${columnLetter}`);
    const usedRange = column.getUsedRange();
    usedRange.load("rowCount, rowIndex");
    await context.sync();
    
    const rowCount = usedRange.rowCount;
    const startRow = usedRange.rowIndex;
    
    // Calculate the actual last row (startRow is 0-based)
    const lastRow = startRow + rowCount;
    
    // Data starts at row 2 (0-based index), skipping metadata (row 0) and header (row 1)
    if (lastRow <= 2) {
      throw new Error(`No types found for API: ${apiName}`);
    }
    
    // Get the actual data range (excluding metadata row 0 and header row 1)
    // Row 2 in 1-based Excel notation is index 2
    const dataRange = apiTypesSheet.getRange(`${columnLetter}3:${columnLetter}${lastRow}`);
    dataRange.load("values");
    await context.sync();
    
    // Get the target cell
    const targetCell = await getTargetCell(context, cellAddress);
    
    // Get the values from the data range and filter out empty values
    const values = dataRange.values.flat().filter(v => v !== null && v !== "") as string[];
    
    // Apply list validation
    applyListValidation(
      targetCell,
      values,
      "Invalid Type",
      "Please select a valid type from the dropdown list"
    );
    
    await context.sync();
  });
}

/**
 * Main logic for the types function
 * Uses shared runtime to directly access Excel API
 * @param apiName The name of the API
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleTypesFunction(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Trigger 2: Check if data needs refresh based on age
    await refreshSheetIfStale(API_TYPES_SHEET_NAME, loadAndPopulateApiTypes);
    
    // Ensure API types sheet exists (create if needed)
    await ensureApiTypesSheet();
    
    // Apply data validation directly using shared runtime
    await applyDataValidation(invocation.address, normalizedApiName);
    
    // Return empty string so cell remains empty after validation is applied
    return "";
  } catch (error) {
    handleCustomFunctionError(error, "Failed to set up validation");
  }
}


