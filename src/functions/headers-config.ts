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
  | "factor_search";

/**
 * Base input headers common to most calculation functions
 */
const BASE_INPUT_HEADERS = [
  "type",
  "value",
  "unit",
  "country",
  "stateProvince",
  "date",
] as const;

/**
 * Common gas emission fields for all functions
 */
const COMMON_GAS_HEADERS = [
  "totalCO2e",
  "CO2",
  "CH4",
  "N2O",
  "bioCO2",
  "indirectCO2e",
] as const;
/**
 * Additional fluorinated gases for fugitive and calculation functions
 */
const FLUORINATED_GASES = [
  "HFC",
  "PFC",
  "SF6",
  "NF3",
] as const;

/**
 * Fugitive gas headers (common gases + fluorinated gases)
 */
const FUGITIVE_GAS_HEADERS = [
  ...COMMON_GAS_HEADERS,
  ...FLUORINATED_GASES,
] as const;

/**
 * Energy consumption field
 */
const ENERGY_HEADER = "energy(MWh)";

/**
 * Trailing metadata fields that appear at the end of output headers
 */
const OUTPUT_TAIL_HEADERS = ["unit", "description", "transactionId"] as const;

/**
 * Standard output headers (for most functions)
 */
const STANDARD_OUTPUT_HEADERS = [...COMMON_GAS_HEADERS, ...OUTPUT_TAIL_HEADERS] as const;

/**
 * Fugitive output headers
 */
const FUGITIVE_OUTPUT_HEADERS = [...FUGITIVE_GAS_HEADERS, ...OUTPUT_TAIL_HEADERS] as const;

/**
 * Real estate output headers (standard + energy)
 */
const REAL_ESTATE_OUTPUT_HEADERS = [
  ...COMMON_GAS_HEADERS,
  ENERGY_HEADER,
  ...OUTPUT_TAIL_HEADERS,
] as const;

/**
 * Calculation output headers (fugitive gases + energy)
 */
const CALCULATION_OUTPUT_HEADERS = [
  ...FUGITIVE_GAS_HEADERS,
  ENERGY_HEADER,
  ...OUTPUT_TAIL_HEADERS,
] as const;

/**
 * Input headers for factor-based calculations (using factorId instead of type)
 */
const FACTOR_ID_INPUT_HEADERS = ["factorId", "value", "unit"] as const;

/**
 * Output headers for factor retrieval function
 */
const FACTOR_OUTPUT_HEADERS = [
  "factorSet",
  "source",
  "methodology",
  "scope",
  "activityType",
  "activityUnit",
  "name",
  "description",
  "publishedFrom",
  "publishedTo",
  "region",
  "totalCO2e",
  "CO2",
  "CH4",
  "N2O",
  "HFC",
  "PFC",
  "SF6",
  "NF3",
  "bioCO2",
  "indirectCO2e",
  "unit",
  "factorId",
  "transactionId",
] as const;

/**
 * Output headers for factor search function
 */
const FACTOR_SEARCH_OUTPUT_HEADERS = [
  "factorSet",
  "source",
  "methodology",
  "scope",
  "activityType",
  "activityUnit",
  "region",
  "factorId",
  "publishedFrom",
  "publishedTo",
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
    inputHeaders: [...BASE_INPUT_HEADERS, "powerGrid"],
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
    outputHeaders: FUGITIVE_OUTPUT_HEADERS,
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
    inputHeaders: [...BASE_INPUT_HEADERS, "powerGrid"],
    outputHeaders: CALCULATION_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  economic_activity: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  real_estate: {
    inputHeaders: BASE_INPUT_HEADERS,
    outputHeaders: REAL_ESTATE_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  factor: {
    inputHeaders: ["type", "unit", "country", "stateProvince", "date"], // type, value, unit for type-based
    outputHeaders: FACTOR_OUTPUT_HEADERS,
    factorIdInputHeaders: ["factorId", "unit"], // factorId, unit for id-based
  },
  factor_search: {
    inputHeaders: ["search", "country", "stateProvince", "date", "page", "size"],
    outputHeaders: FACTOR_SEARCH_OUTPUT_HEADERS,
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
 * @returns Array of input header names
 */
export function getInputHeaders(functionName: FunctionNameType, useFactorId: boolean = false): string[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  if (useFactorId && config.factorIdInputHeaders) {
    return [...config.factorIdInputHeaders];
  }

  return [...config.inputHeaders];
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
 * @param response - The raw API response object
 * @param functionName - The function name type (used to look up output headers)
 * @returns A flat array of cell values in the same order as the output headers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatRow(response: any, functionName: FunctionNameType): (string | number)[] {
  return getOutputHeaders(functionName).map((key) => formatValue(response[key]));
}
