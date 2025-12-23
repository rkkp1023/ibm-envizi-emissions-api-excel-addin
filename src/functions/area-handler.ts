// Copyright IBM Corp. 2025

/**
 * Handles area-related custom functions (country, state_province, power_grid)
 * Uses shared runtime to directly access Excel.run() API
 */

import { AREA_DATA_SHEET_NAME, AREA_COLUMN_MAP, loadAndPopulateAreaData } from "./area-loader";
import { ensureClient } from "./client";
import { validateApiName, getTargetCell, applyListValidation, handleCustomFunctionError, API_AREA_MAPPING, refreshSheetIfStale } from "./metadata-utils";

/**
 * Checks if the area data sheet exists
 * @returns Promise<boolean> indicating if the sheet exists
 */
async function areaDataSheetExists(): Promise<boolean> {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    sheets.load("items/name");
    await context.sync();
    
    const sheet = sheets.items.find((s) => s.name === AREA_DATA_SHEET_NAME);
    return !!sheet;
  });
}

/**
 * Ensures the area data sheet exists, creating it if necessary
 */
async function ensureAreaDataSheet(): Promise<void> {
  const sheetExists = await areaDataSheetExists();
  if (!sheetExists) {
    await loadAndPopulateAreaData();
  }
}

/**
 * Maps API names to their representative API for area data queries
 * Group 1 (calculation): calculation, location, factor
 * Group 2 (mobile): mobile, stationary, fugitive, transportationanddistribution
 * @param apiName The API name to map
 * @returns The mapped API name
 */
function mapApiNameForAreaData(apiName: string): string {
  return API_AREA_MAPPING[apiName] || apiName;
}

/**
 * Gets unique country display strings for a specific API from the area data sheet
 * Returns format: "CountryName (alpha3)"
 * @param apiName The normalized API name
 * @returns Promise<string[]> Array of country display strings
 */
async function getCountryDisplayForApi(apiName: string): Promise<string[]> {
  // Map factor/factorsearch to calculation
  const queryApiName = mapApiNameForAreaData(apiName);
  
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(AREA_DATA_SHEET_NAME);
    const usedRange = sheet.getUsedRange();
    usedRange.load("values");
    await context.sync();
    
    const values = usedRange.values;
    const countries: string[] = [];
    
    // Skip metadata row (index 0) and header row (index 1)
    for (let i = 2; i < values.length; i++) {
      const row = values[i];
      const rowApiName = row[AREA_COLUMN_MAP.apiName]?.toString().toLowerCase();
      const alpha3 = row[AREA_COLUMN_MAP.alpha3]?.toString();
      const countryName = row[AREA_COLUMN_MAP.countryName]?.toString();
      
      if (rowApiName === queryApiName && alpha3 && countryName) {
        // Create display format: "CountryName (alpha3)"
        countries.push(`${countryName} (${alpha3})`);
      }
    }
    
    return countries;
  });
}

/**
 * Gets state/province or power grid data for a specific API and country
 * @param apiName The normalized API name
 * @param alpha3 The country alpha3 code
 * @param columnIndex The column index (stateProvince or powerGrid)
 * @returns Promise<string[]> Array of values
 */
async function getAreaDataForCountry(
  apiName: string,
  alpha3: string,
  columnIndex: number
): Promise<string[]> {
  // Map factor/factorsearch to calculation
  const queryApiName = mapApiNameForAreaData(apiName);
  
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(AREA_DATA_SHEET_NAME);
    const usedRange = sheet.getUsedRange();
    usedRange.load("values");
    await context.sync();
    
    const values = usedRange.values;
    
    // Find the row matching API name and alpha3
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowApiName = row[AREA_COLUMN_MAP.apiName]?.toString().toLowerCase();
      const rowAlpha3 = row[AREA_COLUMN_MAP.alpha3]?.toString();
      
      if (rowApiName === queryApiName && rowAlpha3 === alpha3) {
        const dataString = row[columnIndex]?.toString() || "";
        
        // Split by comma and trim whitespace
        if (dataString) {
          return dataString.split(",").map(item => item.trim()).filter(item => item);
        }
        return [];
      }
    }
    
    return [];
  });
}

/**
 * Handles the COUNTRY custom function
 * @param apiName The name of the API
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleCountryFunction(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Trigger 2: Check if data needs refresh based on age
    await refreshSheetIfStale(AREA_DATA_SHEET_NAME, loadAndPopulateAreaData);
    
    // Ensure area data sheet exists (create if needed)
    await ensureAreaDataSheet();
    
    // Get country display strings for this API
    const countryDisplays = await getCountryDisplayForApi(normalizedApiName);
    
    if (countryDisplays.length === 0) {
      throw new Error(`No countries found for API: ${apiName}`);
    }
    
    // Apply data validation
    await Excel.run(async (context) => {
      const targetCell = await getTargetCell(context, invocation.address);
      
      applyListValidation(
        targetCell,
        countryDisplays,
        "Invalid Country",
        "Please select a valid country from the dropdown list"
      );
      
      await context.sync();
    });
    
    return "";
  } catch (error) {
    handleCustomFunctionError(error, "Failed to set up country validation");
  }
}

/**
 * Handles the STATE_PROVINCE custom function
 * @param apiName The name of the API
 * @param country The country alpha3 code
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleStateProvinceFunction(
  apiName: string,
  country: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Validate country parameter
    if (!country || typeof country !== "string" || country.trim() === "") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        "Country parameter is required and must be a non-empty string"
      );
    }
    
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Trigger 2: Check if data needs refresh based on age
    await refreshSheetIfStale(AREA_DATA_SHEET_NAME, loadAndPopulateAreaData);
    
    // Ensure area data sheet exists (create if needed)
    await ensureAreaDataSheet();
    
    // Extract alpha3 from country parameter (handles both "USA" and "United States (USA)")
    const { extractSymbolFromDisplay } = await import("./utils");
    const alpha3 = extractSymbolFromDisplay(country.trim())?.toUpperCase() || country.trim().toUpperCase();
    
    // Get state/province data for this API and country
    const stateProvinces = await getAreaDataForCountry(
      normalizedApiName,
      alpha3,
      AREA_COLUMN_MAP.stateProvince
    );
    
    if (stateProvinces.length === 0) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        `No stateProvince data available for ${country}`
      );
    }
    
    // Apply data validation
    await Excel.run(async (context) => {
      const targetCell = await getTargetCell(context, invocation.address);
      
      applyListValidation(
        targetCell,
        stateProvinces,
        "Invalid State/Province",
        "Please select a valid state/province from the dropdown list"
      );
      
      await context.sync();
    });
    
    return "";
  } catch (error) {
    handleCustomFunctionError(error, "Failed to set up state/province validation");
  }
}

/**
 * Handles the POWER_GRID custom function
 * @param apiName The name of the API
 * @param country The country alpha3 code
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handlePowerGridFunction(
  apiName: string,
  country: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Validate country parameter
    if (!country || typeof country !== "string" || country.trim() === "") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        "Country parameter is required and must be a non-empty string"
      );
    }
    
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Trigger 2: Check if data needs refresh based on age
    await refreshSheetIfStale(AREA_DATA_SHEET_NAME, loadAndPopulateAreaData);
    
    // Ensure area data sheet exists (create if needed)
    await ensureAreaDataSheet();
    
    // Extract alpha3 from country parameter (handles both "USA" and "United States (USA)")
    const { extractSymbolFromDisplay } = await import("./utils");
    const alpha3 = extractSymbolFromDisplay(country.trim())?.toUpperCase() || country.trim().toUpperCase();
    
    // Get power grid data for this API and country
    const powerGrids = await getAreaDataForCountry(
      normalizedApiName,
      alpha3,
      AREA_COLUMN_MAP.powerGrid
    );
    
    if (powerGrids.length === 0) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        `No power grid data available for ${country}`
      );
    }
    
    // Apply data validation
    await Excel.run(async (context) => {
      const targetCell = await getTargetCell(context, invocation.address);
      
      applyListValidation(
        targetCell,
        powerGrids,
        "Invalid Power Grid",
        "Please select a valid power grid from the dropdown list"
      );
      
      await context.sync();
    });
    
    return "";
  } catch (error) {
    handleCustomFunctionError(error, "Failed to set up power grid validation");
  }
}


