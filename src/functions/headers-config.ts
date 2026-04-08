// Copyright IBM Corp. 2025

/**
 * Centralized configuration for API function headers
 * This file defines input and output headers for all emission calculation functions
 */

export type FunctionNameType =
  | "location"
  | "stationary"
  | "fugitive"
  | "mobile"
  | "transportation_and_distribution"
  | "calculation"
  | "economic_activity"
  | "real_estate"
  | "factor"
  | "factor_search"
  | "RECOMMEND_ACTIVITY_TYPE";

/**
 * Base input headers common to most calculation functions
 */
const BASE_INPUT_HEADERS = [
  "Activity Type",
  "Value",
  "Unit",
  "Country",
  "StateProvince",
  "Date",
] as const;

/**
 * Common gas emission fields for all functions
 */
const COMMON_GAS_HEADERS = [
  "TotalCO2e",
  "CO2",
  "CH4",
  "N2O",
  "HFC",
  "PFC",
  "SF6",
  "NF3",
  "BioCO2",
  "IndirectCO2e",
] as const;

/**
 * Trailing metadata fields that appear at the end of output headers
 */
const OUTPUT_TAIL_HEADERS = ["Unit", "Description", "Transaction Id"] as const;

/**
 * Standard output headers (for most functions)
 */
const STANDARD_OUTPUT_HEADERS = [...COMMON_GAS_HEADERS, ...OUTPUT_TAIL_HEADERS] as const;



/**
 * Input headers for factor-based calculations (using factorId instead of type)
 */
const FACTOR_ID_INPUT_HEADERS = ["factorId", "value", "unit"] as const;

/**
 * Output headers for factor retrieval function
 */
const FACTOR_OUTPUT_HEADERS = [
  "Factor Set",
  "Source",
  "Methodology",
  "Scope",
  "Activity Type",
  "Activity Unit",
  "Name",
  "Description",
  "Published From",
  "Published To",
  "Region",
  "TotalCO2e",
  "CO2",
  "CH4",
  "N2O",
  "HFC",
  "PFC",
  "SF6",
  "NF3",
  "BioCO2",
  "IndirectCO2e",
  "Unit",
  "Factor Id",
  "Transaction Id",
] as const;

/**
 * Output headers for factor search function
 */
const FACTOR_SEARCH_OUTPUT_HEADERS = [
  "Factor Set",
  "Source",
  "Methodology",
  "Scope",
  "Activity Type",
  "Activity Unit",
  "Region",
  "Factor Id",
  "Published From",
  "Published To",
] as const;

/**
 * Headers for data type recommender function
 */
const DATA_TYPE_RECOMMENDER_HEADERS = [
  "Activity Name",
  "Activity Type",
  "Confidence(%)",
  "Description",
] as const;

/**
 * Configuration mapping for each function name type
 */
interface FunctionNameConfig {
  inputHeaders: readonly string[];
  outputHeaders: readonly string[];
  factorIdInputHeaders?: readonly string[];
}

const FUNCTION_NAME_CONFIGS: Record<FunctionNameType, FunctionNameConfig> = {
  location: {
    inputHeaders: [...BASE_INPUT_HEADERS, "Power Grid"],
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  stationary: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  fugitive: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  mobile: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  transportation_and_distribution: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  calculation: {
    inputHeaders: [...BASE_INPUT_HEADERS, "Power Grid"],
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  economic_activity: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  real_estate: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders:STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  factor: {
    inputHeaders: ["Activity Type", "Unit", "Country", "StateProvince", "Date"], // type, value, unit for type-based
    outputHeaders: FACTOR_OUTPUT_HEADERS,
    factorIdInputHeaders: ["factorId", "unit"], // factorId, unit for id-based
  },
  factor_search: {
    inputHeaders: ["Search", "Country", "StateProvince", "Date", "Page", "Size"],
    outputHeaders: FACTOR_SEARCH_OUTPUT_HEADERS,
  },
  RECOMMEND_ACTIVITY_TYPE: {
    inputHeaders: ["Search", "Country", "StateProvince", "Date"],
    outputHeaders: ["Activity Type", "Confidence(%)", "Description"],
  },
};

/**
 * Valid function name types for validation
 */
export const VALID_FUNCTION_NAMES = Object.keys(FUNCTION_NAME_CONFIGS) as FunctionNameType[];

/**
 * Get input headers for a specific function
 * @param functionName - The function name type
 * @param useFactorId - Whether to return factorId-based headers (default: false)
 * @param includeDataTypeRecommender - Whether to include data type recommender headers after "type" field (default: false)
 * @returns Array of input header names
 */
export function getInputHeaders(
  functionName: FunctionNameType,
  useFactorId: boolean = false,
  includeDataTypeRecommender: boolean = false
): string[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  let headers: string[];
  
  if (useFactorId && config.factorIdInputHeaders) {
    headers = [...config.factorIdInputHeaders];
  } else {
    headers = [...config.inputHeaders];
  }

  // Replace "Activity Type" with full recommender headers if requested
  if (includeDataTypeRecommender && !useFactorId) {
    const typeIndex = headers.indexOf("Activity Type");
    if (typeIndex !== -1) {
      // Remove "Activity Type" and insert all recommender headers in its place
      headers.splice(typeIndex, 1, ...DATA_TYPE_RECOMMENDER_HEADERS);
    }
  }

  return headers;
}

/**
 * Get output headers for a specific function
 * @param functionName - The function name type
 * @returns Array of output header names
 */
export function getOutputHeaders(functionName: FunctionNameType): string[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  return [...config.outputHeaders];
}

/**
 * Validate if a function name is supported
 * @param functionName - The function name to validate
 * @returns true if valid, false otherwise
 */
export function isValidFunctionName(functionName: string): functionName is FunctionNameType {
  return VALID_FUNCTION_NAMES.includes(functionName as FunctionNameType);
}

/**
 * Mapping from display headers (with proper capitalization) to API response keys (camelCase)
 * Function-specific mappings for headers that differ across functions
 */
const FUNCTION_SPECIFIC_MAPPINGS: Record<FunctionNameType, Record<string, string>> = {
  RECOMMEND_ACTIVITY_TYPE: {
    "Activity Type": "activityType",
    "Confidence(%)": "confidence",
    "Description": "activityDescription",
  },
  location: {},
  stationary: {},
  fugitive: {},
  mobile: {},
  transportation_and_distribution: {},
  calculation: {},
  economic_activity: {},
  real_estate: {},
  factor: {},
  factor_search: {},
};

/**
 * Common mapping from display headers to API response keys
 */
const COMMON_HEADER_TO_API_KEY_MAP: Record<string, string> = {
  // Standard output headers
  "TotalCO2e": "totalCO2e",
  "CO2": "CO2",
  "CH4": "CH4",
  "N2O": "N2O",
  "HFC": "HFC",
  "PFC": "PFC",
  "SF6": "SF6",
  "NF3": "NF3",
  "BioCO2": "bioCO2",
  "IndirectCO2e": "indirectCO2e",
  "Unit": "unit",
  "Description": "description",
  "Transaction Id": "transactionId",
  
  // Factor headers
  "Factor Set": "factorSet",
  "Source": "source",
  "Methodology": "methodology",
  "Scope": "scope",
  "Activity Type": "activityType",
  "Activity Unit": "activityUnit",
  "Name": "name",
  "Published From": "publishedFrom",
  "Published To": "publishedTo",
  "Region": "region",
  "Factor Id": "factorId",
  
  // Input headers (for reference, though not used in formatRow)
  "Value": "value",
  "Country": "country",
  "StateProvince": "stateProvince",
  "Date": "date",
  "Power Grid": "powerGrid",
  
  // Data type recommender headers
  "Activity Name": "activityType",
  "Confidence(%)": "confidence",
};

/**
 * Normalize a single response field value for Excel output:
 * - Arrays are joined with ", " (e.g. activityUnit: ["kg", "L"] → "kg, L")
 * - null / undefined → "" (empty cell)
 * - numbers and strings are returned as-is
 */
export function formatValue(val: unknown): string | number {
  if (Array.isArray(val)) return val.join(", ");
  if (val === null || val === undefined) return "";
  return val as string | number;
}

/**
 * Build a single data row from a response object driven by the function's output headers.
 * This is the single source of truth for field ordering — if you add/remove/reorder
 * a field in FUNCTION_NAME_CONFIGS outputHeaders, the data row updates automatically.
 *
 * Maps display headers to API response keys using HEADER_TO_API_KEY_MAP.
 *
 * @param response - The raw API response object (with camelCase keys)
 * @param functionName - The function name type (used to look up output headers)
 * @returns A flat array of cell values in the same order as the output headers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatRow(response: any, functionName: FunctionNameType): (string | number)[] {
  return getOutputHeaders(functionName).map((displayHeader) => {
    // Check function-specific mapping first, then common mapping, then fallback to display header
    const functionSpecificMapping = FUNCTION_SPECIFIC_MAPPINGS[functionName];
    const apiKey = functionSpecificMapping[displayHeader] ||
                   COMMON_HEADER_TO_API_KEY_MAP[displayHeader] ||
                   displayHeader;
    return formatValue(response[apiKey]);
  });
}