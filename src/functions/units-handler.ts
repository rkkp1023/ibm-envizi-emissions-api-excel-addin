// Copyright IBM Corp. 2025

/**
 * Handles the units function logic for triggering data validation dropdowns
 * Uses shared runtime to directly access Excel.run() API
 * Makes on-demand API calls to fetch units for each API type
 */

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
  Factor,
} from "emissions-api-sdk";
import { ensureClient } from "./client";
import { validateApiName, getTargetCell, applyListValidation, handleCustomFunctionError } from "./metadata-utils";

/**
 * Map of API names to their SDK classes
 */
const API_CLASS_MAP = {
  location: Location,
  mobile: Mobile,
  fugitive: Fugitive,
  stationary: Stationary,
  calculation: Calculation,
  transportationanddistribution: TransportationAndDistribution,
  factor: Factor,
};

/**
 * Fetches units for a specific API type
 * @param apiName The normalized API name (lowercase)
 * @param type The type parameter to pass to getUnits
 * @returns Array of unit strings
 */
export async function fetchUnits(apiName: string, type: string): Promise<string[]> {
  try {
    const ApiClass = API_CLASS_MAP[apiName];
    if (!ApiClass) {
      throw new Error(`Unknown API name: ${apiName}`);
    }

    // Call the getUnits method with the type parameter
    const response = await ApiClass.getUnits(type);
    
    if (!response?.units || !Array.isArray(response.units)) {
      throw new Error(`Invalid response format from ${apiName} API`);
    }
    
    if (response.units.length === 0) {
      throw new Error(`No units found for type: ${type}`);
    }
    
    return response.units;
  } catch (error) {
    throw new Error(`Failed to fetch units: ${error.message || "Unknown error"}`);
  }
}

/**
 * Applies data validation to a cell with the provided units
 * @param cellAddress The address of the cell to apply validation to (e.g., "Sheet1!A1")
 * @param units Array of unit strings
 */
async function applyUnitsValidation(cellAddress: string, units: string[]): Promise<void> {
  await Excel.run(async (context) => {
    // Get the target cell
    const targetCell = await getTargetCell(context, cellAddress);
    
    // Apply list validation
    applyListValidation(
      targetCell,
      units,
      "Invalid Unit",
      "Please select a valid unit from the dropdown list"
    );
    
    await context.sync();
  });
}

/**
 * Main logic for the units function
 * Uses shared runtime to directly access Excel API
 * Makes on-demand API call to fetch units
 * @param apiName The name of the API
 * @param type The type parameter for getUnits
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleUnitsFunction(
  apiName: string,
  type: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Validate type parameter first (before any async operations)
    if (!type || typeof type !== "string" || type.trim() === "") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        "Type parameter is required and must be a non-empty string"
      );
    }
    
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Fetch units from API
    const units = await fetchUnits(normalizedApiName, type.trim());
    
    // Apply data validation directly using shared runtime
    await applyUnitsValidation(invocation.address, units);
    
    // Return empty string so cell remains empty after validation is applied
    return "";
  } catch (error) {
    handleCustomFunctionError(error, "Failed to set up units validation");
  }
}

