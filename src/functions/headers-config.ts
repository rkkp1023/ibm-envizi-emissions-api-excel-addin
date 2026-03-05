// Copyright IBM Corp. 2025

/**
 * Centralized configuration for API endpoint headers
 * This file defines input and output headers for all emission calculation endpoints
 */

export type EndpointType =
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
 * Base input headers common to most calculation endpoints
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
 * Common gas emission fields for all endpoints
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
 * Additional fluorinated gases for fugitive and calculation endpoints
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
 * Standard output headers (for most endpoints)
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
 * Output headers for factor retrieval endpoint
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
 * Output headers for factor search endpoint
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
 * Configuration mapping for each endpoint type
 */
interface EndpointConfig {
  inputHeaders: readonly string[];
  outputHeaders: readonly string[];
  factorIdInputHeaders?: readonly string[];
}

const ENDPOINT_CONFIGS: Record<EndpointType, EndpointConfig> = {
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
 * Valid endpoint types for validation
 */
export const VALID_ENDPOINTS = Object.keys(ENDPOINT_CONFIGS) as EndpointType[];

/**
 * Get input headers for a specific endpoint
 * @param endpoint - The endpoint type
 * @param useFactorId - Whether to return factorId-based headers (default: false)
 * @returns Array of input header names
 */
export function getInputHeaders(endpoint: EndpointType, useFactorId: boolean = false): string[] {
  const config = ENDPOINT_CONFIGS[endpoint];
  if (!config) {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }

  if (useFactorId && config.factorIdInputHeaders) {
    return [...config.factorIdInputHeaders];
  }

  return [...config.inputHeaders];
}

/**
 * Get output headers for a specific endpoint
 * @param endpoint - The endpoint type
 * @returns Array of output header names
 */
export function getOutputHeaders(endpoint: EndpointType): string[] {
  const config = ENDPOINT_CONFIGS[endpoint];
  if (!config) {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }

  return [...config.outputHeaders];
}

/**
 * Validate if an endpoint is supported
 * @param endpoint - The endpoint to validate
 * @returns true if valid, false otherwise
 */
export function isValidEndpoint(endpoint: string): endpoint is EndpointType {
  return VALID_ENDPOINTS.includes(endpoint as EndpointType);
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
 * Build a single data row from a response object driven by the endpoint's output headers.
 * This is the single source of truth for field ordering — if you add/remove/reorder
 * a field in ENDPOINT_CONFIGS outputHeaders, the data row updates automatically.
 *
 * @param response - The raw API response object
 * @param endpoint - The endpoint type (used to look up output headers)
 * @returns A flat array of cell values in the same order as the output headers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatRow(response: any, endpoint: EndpointType): (string | number)[] {
  return getOutputHeaders(endpoint).map((key) => formatValue(response[key]));
}
