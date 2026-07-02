// Copyright IBM Corp. 2025

/**
 * Centralized configuration for API function headers
 * This file defines input and output headers for all emission calculation functions
 * using a single source of truth approach where each field has both API key and display name
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
  | "physical_activity"
  | "factor"
  | "factor_search"
  | "recommend_activity_type";

/**
 * Header field definition containing both API response name (camelCase) and display name (proper capitalization)
 */
interface HeaderField {
  apiResponseName: string;
  displayName: string;
}

/**
 * Single source of truth for all header fields
 * Each field contains:
 * - apiResponseName: The key used in API responses (camelCase)
 * - displayName: The name displayed in Excel (proper capitalization with spaces)
 */
export const HEADER_FIELDS = {
  // Input fields
  ACTIVITY_TYPE: { apiResponseName: "type", displayName: "Activity Type" },
  VALUE: { apiResponseName: "value", displayName: "Value" },
  UNIT: { apiResponseName: "unit", displayName: "Unit" },
  COUNTRY: { apiResponseName: "country", displayName: "Country" },
  STATE_PROVINCE: { apiResponseName: "stateProvince", displayName: "StateProvince" },
  DATE: { apiResponseName: "date", displayName: "Date" },
  POWER_GRID: { apiResponseName: "powerGrid", displayName: "Power Grid" },

  // Recommender-specific input fields (used when includeRecommendActivityType=true)
  RECOMMENDED_ACTIVITY_TYPE: {
    apiResponseName: "activityType",
    displayName: "Recommended Activity Type",
  },
  CONFIDENCE: { apiResponseName: "confidence", displayName: "Confidence(%)" },
  ACTIVITY_DESCRIPTION: { apiResponseName: "activityDescription", displayName: "Description" },

  // Standard emission output fields
  TOTAL_CO2E: { apiResponseName: "totalCO2e", displayName: "TotalCO2e" },
  CO2: { apiResponseName: "CO2", displayName: "CO2" },
  CH4: { apiResponseName: "CH4", displayName: "CH4" },
  N2O: { apiResponseName: "N2O", displayName: "N2O" },
  HFC: { apiResponseName: "HFC", displayName: "HFC" },
  PFC: { apiResponseName: "PFC", displayName: "PFC" },
  SF6: { apiResponseName: "SF6", displayName: "SF6" },
  NF3: { apiResponseName: "NF3", displayName: "NF3" },
  BIO_CO2: { apiResponseName: "bioCO2", displayName: "BioCO2" },
  INDIRECT_CO2E: { apiResponseName: "indirectCO2e", displayName: "IndirectCO2e" },

  // Metadata output fields
  OUTPUT_UNIT: { apiResponseName: "unit", displayName: "Unit" },
  DESCRIPTION: { apiResponseName: "description", displayName: "Description" },
  TRANSACTION_ID: { apiResponseName: "transactionId", displayName: "Transaction Id" },

  // Factor-specific fields
  FACTOR_SET: { apiResponseName: "factorSet", displayName: "Factor Set" },
  SOURCE: { apiResponseName: "source", displayName: "Source" },
  METHODOLOGY: { apiResponseName: "methodology", displayName: "Methodology" },
  SCOPE: { apiResponseName: "scope", displayName: "Scope" },
  FACTOR_ACTIVITY_TYPE: { apiResponseName: "activityType", displayName: "Activity Type" },
  ACTIVITY_UNIT: { apiResponseName: "activityUnit", displayName: "Activity Unit" },
  NAME: { apiResponseName: "name", displayName: "Name" },
  PUBLISHED_FROM: { apiResponseName: "publishedFrom", displayName: "Published From" },
  PUBLISHED_TO: { apiResponseName: "publishedTo", displayName: "Published To" },
  REGION: { apiResponseName: "region", displayName: "Region" },
  FACTOR_ID: { apiResponseName: "factorId", displayName: "Factor Id" },

  // Factor ID input fields
  FACTOR_ID_INPUT: { apiResponseName: "factorId", displayName: "factorId" },
  FACTOR_VALUE: { apiResponseName: "value", displayName: "value" },
  FACTOR_UNIT: { apiResponseName: "unit", displayName: "unit" },

  // Factor search input fields
  SEARCH: { apiResponseName: "search", displayName: "Search" },
  SEARCH_UNIT: { apiResponseName: "unit", displayName: "Unit" },
  SEARCH_SCOPE: { apiResponseName: "scope", displayName: "Scope" },
  PAGE: { apiResponseName: "page", displayName: "Page" },
  SIZE: { apiResponseName: "size", displayName: "Size" },

  // Economic Activity and Real Estate specific output fields
  ENERGY: { apiResponseName: "energy(MWh)", displayName: "Energy (MWh)" },
  ASSET_TURNOVER_RATIO: {
    apiResponseName: "assetTurnoverRatio",
    displayName: "Asset Turn Over Ratio",
  },
  SCORE: { apiResponseName: "score", displayName: "Score" },
  FINANCED_EMISSION: { apiResponseName: "financedEmission", displayName: "Financed Emission" },
  ATTRIBUTION_FACTOR: { apiResponseName: "attributionFactor", displayName: "Attribution Factor" },

  // Attribution input fields (for real_estate, physical_activity, and economic_activity)
  OUTSTANDING_AMOUNT: { apiResponseName: "outstandingAmount", displayName: "Outstanding Amount" },
  PROPERTY_VALUE: { apiResponseName: "propertyValue", displayName: "Property Value" },
  TOTAL_EQUITY: { apiResponseName: "totalEquity", displayName: "Total Equity" },
  TOTAL_DEBT: { apiResponseName: "totalDebt", displayName: "Total Debt" },
  EVIC: { apiResponseName: "evic", displayName: "EVIC" },
  REVENUE: { apiResponseName: "revenue", displayName: "Revenue" },
} as const;

/**
 * Standard emission output headers (common to most calculation functions)
 */
const STANDARD_OUTPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.TOTAL_CO2E,
  HEADER_FIELDS.CO2,
  HEADER_FIELDS.CH4,
  HEADER_FIELDS.N2O,
  HEADER_FIELDS.HFC,
  HEADER_FIELDS.PFC,
  HEADER_FIELDS.SF6,
  HEADER_FIELDS.NF3,
  HEADER_FIELDS.BIO_CO2,
  HEADER_FIELDS.INDIRECT_CO2E,
  HEADER_FIELDS.OUTPUT_UNIT,
  HEADER_FIELDS.DESCRIPTION,
  HEADER_FIELDS.TRANSACTION_ID,
] as const;

/**
 * Base input headers common to most calculation functions
 */
const BASE_INPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.ACTIVITY_TYPE,
  HEADER_FIELDS.VALUE,
  HEADER_FIELDS.UNIT,
  HEADER_FIELDS.COUNTRY,
  HEADER_FIELDS.STATE_PROVINCE,
  HEADER_FIELDS.DATE,
] as const;

/**
 * Input headers with data type recommender fields
 * Includes both Activity Type (user input) and Recommended Activity Type (AI suggestion)
 */
const BASE_INPUT_HEADERS_WITH_RECOMMENDER: readonly HeaderField[] = [
  HEADER_FIELDS.ACTIVITY_TYPE,
  HEADER_FIELDS.RECOMMENDED_ACTIVITY_TYPE,
  HEADER_FIELDS.CONFIDENCE,
  HEADER_FIELDS.ACTIVITY_DESCRIPTION,
  HEADER_FIELDS.VALUE,
  HEADER_FIELDS.UNIT,
  HEADER_FIELDS.COUNTRY,
  HEADER_FIELDS.STATE_PROVINCE,
  HEADER_FIELDS.DATE,
] as const;

/**
 * Factor ID input headers (for factorId-based calculations)
 */
const FACTOR_ID_INPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.FACTOR_ID_INPUT,
  HEADER_FIELDS.FACTOR_VALUE,
  HEADER_FIELDS.FACTOR_UNIT,
] as const;

/**
 * Output headers for factor retrieval function
 */
const FACTOR_OUTPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.FACTOR_SET,
  HEADER_FIELDS.SOURCE,
  HEADER_FIELDS.METHODOLOGY,
  HEADER_FIELDS.SCOPE,
  HEADER_FIELDS.FACTOR_ACTIVITY_TYPE,
  HEADER_FIELDS.ACTIVITY_UNIT,
  HEADER_FIELDS.NAME,
  HEADER_FIELDS.DESCRIPTION,
  HEADER_FIELDS.PUBLISHED_FROM,
  HEADER_FIELDS.PUBLISHED_TO,
  HEADER_FIELDS.REGION,
  HEADER_FIELDS.TOTAL_CO2E,
  HEADER_FIELDS.CO2,
  HEADER_FIELDS.CH4,
  HEADER_FIELDS.N2O,
  HEADER_FIELDS.HFC,
  HEADER_FIELDS.PFC,
  HEADER_FIELDS.SF6,
  HEADER_FIELDS.NF3,
  HEADER_FIELDS.BIO_CO2,
  HEADER_FIELDS.INDIRECT_CO2E,
  HEADER_FIELDS.OUTPUT_UNIT,
  HEADER_FIELDS.FACTOR_ID,
  HEADER_FIELDS.TRANSACTION_ID,
] as const;

/**
 * Output headers for factor search function
 */
const FACTOR_SEARCH_OUTPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.FACTOR_SET,
  HEADER_FIELDS.SOURCE,
  HEADER_FIELDS.METHODOLOGY,
  HEADER_FIELDS.SCOPE,
  HEADER_FIELDS.FACTOR_ACTIVITY_TYPE,
  HEADER_FIELDS.ACTIVITY_UNIT,
  HEADER_FIELDS.REGION,
  HEADER_FIELDS.FACTOR_ID,
  HEADER_FIELDS.PUBLISHED_FROM,
  HEADER_FIELDS.PUBLISHED_TO,
] as const;

/**
 * Output headers for data type recommender function
 */
const RECOMMEND_ACTIVITY_TYPE_OUTPUT_HEADERS: readonly HeaderField[] = [
  HEADER_FIELDS.RECOMMENDED_ACTIVITY_TYPE,
  HEADER_FIELDS.CONFIDENCE,
  HEADER_FIELDS.ACTIVITY_DESCRIPTION,
] as const;

/**
 * Configuration mapping for each function name type
 */
interface FunctionNameConfig {
  inputHeaders: readonly HeaderField[];
  inputHeadersWithRecommender?: readonly HeaderField[];
  outputHeaders: readonly HeaderField[];
  factorIdInputHeaders?: readonly HeaderField[];
}

const FUNCTION_NAME_CONFIGS: Record<FunctionNameType, FunctionNameConfig> = {
  location: {
    inputHeaders: [...BASE_INPUT_HEADERS, HEADER_FIELDS.POWER_GRID],
    inputHeadersWithRecommender: [...BASE_INPUT_HEADERS_WITH_RECOMMENDER, HEADER_FIELDS.POWER_GRID],
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  stationary: {
    inputHeaders: BASE_INPUT_HEADERS,
    inputHeadersWithRecommender: BASE_INPUT_HEADERS_WITH_RECOMMENDER,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  fugitive: {
    inputHeaders: BASE_INPUT_HEADERS,
    inputHeadersWithRecommender: BASE_INPUT_HEADERS_WITH_RECOMMENDER,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  mobile: {
    inputHeaders: BASE_INPUT_HEADERS,
    inputHeadersWithRecommender: BASE_INPUT_HEADERS_WITH_RECOMMENDER,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  transportation_and_distribution: {
    inputHeaders: BASE_INPUT_HEADERS,
    inputHeadersWithRecommender: BASE_INPUT_HEADERS_WITH_RECOMMENDER,
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  calculation: {
    inputHeaders: [...BASE_INPUT_HEADERS, HEADER_FIELDS.POWER_GRID],
    inputHeadersWithRecommender: [...BASE_INPUT_HEADERS_WITH_RECOMMENDER, HEADER_FIELDS.POWER_GRID],
    outputHeaders: STANDARD_OUTPUT_HEADERS,
    factorIdInputHeaders: FACTOR_ID_INPUT_HEADERS,
  },
  economic_activity: {
    inputHeaders: [
      ...BASE_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
      HEADER_FIELDS.REVENUE,
    ],
    inputHeadersWithRecommender: [
      ...BASE_INPUT_HEADERS_WITH_RECOMMENDER,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
      HEADER_FIELDS.REVENUE,
    ],
    outputHeaders: [
      ...STANDARD_OUTPUT_HEADERS,
      HEADER_FIELDS.ENERGY,
      HEADER_FIELDS.ASSET_TURNOVER_RATIO,
      HEADER_FIELDS.SCORE,
      HEADER_FIELDS.FINANCED_EMISSION,
      HEADER_FIELDS.ATTRIBUTION_FACTOR,
    ],
    factorIdInputHeaders: [
      ...FACTOR_ID_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
      HEADER_FIELDS.REVENUE,
    ],
  },
  real_estate: {
    inputHeaders: [
      ...BASE_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.PROPERTY_VALUE,
    ],
    inputHeadersWithRecommender: [
      ...BASE_INPUT_HEADERS_WITH_RECOMMENDER,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.PROPERTY_VALUE,
    ],
    outputHeaders: [
      ...STANDARD_OUTPUT_HEADERS,
      HEADER_FIELDS.ENERGY,
      HEADER_FIELDS.FINANCED_EMISSION,
      HEADER_FIELDS.ATTRIBUTION_FACTOR,
    ],
    factorIdInputHeaders: [
      ...FACTOR_ID_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.PROPERTY_VALUE,
    ],
  },
  physical_activity: {
    inputHeaders: [
      ...BASE_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
    ],
    inputHeadersWithRecommender: [
      ...BASE_INPUT_HEADERS_WITH_RECOMMENDER,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
    ],
    outputHeaders: [
      ...STANDARD_OUTPUT_HEADERS,
      HEADER_FIELDS.ENERGY,
      HEADER_FIELDS.FINANCED_EMISSION,
      HEADER_FIELDS.ATTRIBUTION_FACTOR,
    ],
    factorIdInputHeaders: [
      ...FACTOR_ID_INPUT_HEADERS,
      HEADER_FIELDS.OUTSTANDING_AMOUNT,
      HEADER_FIELDS.TOTAL_EQUITY,
      HEADER_FIELDS.TOTAL_DEBT,
      HEADER_FIELDS.EVIC,
    ],
  },
  factor: {
    inputHeaders: [
      HEADER_FIELDS.ACTIVITY_TYPE,
      HEADER_FIELDS.UNIT,
      HEADER_FIELDS.COUNTRY,
      HEADER_FIELDS.STATE_PROVINCE,
      HEADER_FIELDS.DATE,
    ],
    inputHeadersWithRecommender: [
      HEADER_FIELDS.ACTIVITY_TYPE,
      HEADER_FIELDS.RECOMMENDED_ACTIVITY_TYPE,
      HEADER_FIELDS.CONFIDENCE,
      HEADER_FIELDS.ACTIVITY_DESCRIPTION,
      HEADER_FIELDS.UNIT,
      HEADER_FIELDS.COUNTRY,
      HEADER_FIELDS.STATE_PROVINCE,
      HEADER_FIELDS.DATE,
    ],
    outputHeaders: FACTOR_OUTPUT_HEADERS,
    factorIdInputHeaders: [HEADER_FIELDS.FACTOR_ID_INPUT, HEADER_FIELDS.FACTOR_UNIT],
  },
  factor_search: {
    inputHeaders: [
      HEADER_FIELDS.SEARCH,
      HEADER_FIELDS.COUNTRY,
      HEADER_FIELDS.STATE_PROVINCE,
      HEADER_FIELDS.SEARCH_UNIT,
      HEADER_FIELDS.SEARCH_SCOPE,
      HEADER_FIELDS.DATE,
      HEADER_FIELDS.PAGE,
      HEADER_FIELDS.SIZE,
    ],
    outputHeaders: FACTOR_SEARCH_OUTPUT_HEADERS,
  },
  recommend_activity_type: {
    inputHeaders: [
      HEADER_FIELDS.SEARCH,
      HEADER_FIELDS.COUNTRY,
      HEADER_FIELDS.STATE_PROVINCE,
      HEADER_FIELDS.SEARCH_UNIT,
      HEADER_FIELDS.SEARCH_SCOPE,
      HEADER_FIELDS.DATE,
    ],
    outputHeaders: RECOMMEND_ACTIVITY_TYPE_OUTPUT_HEADERS,
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
 * @param includeRecommendActivityType - Whether to include activity type recommender headers (default: false)
 * @returns Array of input header display names
 */
export function getInputHeaders(
  functionName: FunctionNameType,
  useFactorId: boolean = false,
  includeRecommendActivityType: boolean = false
): string[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  let headerFields: readonly HeaderField[];

  if (useFactorId && config.factorIdInputHeaders) {
    headerFields = config.factorIdInputHeaders;
  } else if (includeRecommendActivityType && config.inputHeadersWithRecommender) {
    headerFields = config.inputHeadersWithRecommender;
  } else {
    headerFields = config.inputHeaders;
  }

  return headerFields.map((field) => field.displayName);
}

/**
 * Get output headers for a specific function
 * @param functionName - The function name type
 * @returns Array of output header display names
 */
export function getOutputHeaders(functionName: FunctionNameType): string[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  return config.outputHeaders.map((field) => field.displayName);
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
 * Uses the HeaderField definitions to map display names to API response names.
 *
 * @param response - The raw API response object (with camelCase keys)
 * @param functionName - The function name type (used to look up output headers)
 * @returns A flat array of cell values in the same order as the output headers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatRow(response: any, functionName: FunctionNameType): (string | number)[] {
  const config = FUNCTION_NAME_CONFIGS[functionName];
  if (!config) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  return config.outputHeaders.map((field) => formatValue(response[field.apiResponseName]));
}

// Made with Bob
