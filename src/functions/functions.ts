// Copyright IBM Corp. 2025

import { factorHelper } from "./factorHelper";
import { factorSearch } from "./factorSearchHelper";
import { genericApiCall } from "./generic-api-call";
import { getInputHeaders, getOutputHeaders, isValidFunctionName, VALID_FUNCTION_NAMES } from "./headers-config";
import { typeRecommender } from "./typeRecommenderHelper";
import { buildHeadersList, parseBooleanParameter } from "./utils";

/**
 * Calculates location-based emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#location-based-emissions
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 * @param powerGrid Power grid region identifier
 */
export async function location(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string
): Promise<any[][]> {
  return genericApiCall("location", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
    powerGrid,
  });
}

/**
 * Calculates location-based emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#location-based-emissions
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function location_by_factorId(
  factorId: number,
  value: number,
  unit?: string
): Promise<any[][]> {
  return genericApiCall("location", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#stationary-source-emissions
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function stationary(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("stationary", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#stationary-source-emissions
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function stationary_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("stationary", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#fugitive-emissions
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function fugitive(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("fugitive", { type, value, unit, country, stateProvince, date });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#fugitive-emissions
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function fugitive_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("fugitive", { factorId, value, unit });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#mobile-emissions
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function mobile(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("mobile", { type, value, unit, country, stateProvince, date });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#mobile-emissions
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function mobile_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("mobile", { factorId, value, unit });
}

/**
 * Calculates emissions using the transportation and distribution endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#transportation-and-distribution
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function transportation_and_distribution(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("transportation_and_distribution", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates emissions using the transportation and distribution endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#transportation-and-distribution
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function transportation_and_distribution_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("transportation_and_distribution", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#calculation
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 * @param powerGrid Power grid region identifier
 */
export async function calculation(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string
): Promise<any[][]> {
  return genericApiCall("calculation", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
    powerGrid,
  });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#calculation
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function calculation_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("calculation", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates emissions using the factor search endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#factor-search
 * @param search Search query string
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 * @param page Page number for pagination
 * @param size Number of results per page
 */
export async function factor_search(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string,
  page?: number,
  size?: number
): Promise<any[][]> {
  return factorSearch(search, country, stateProvince, date, page, size);
}

/**
 * Recommends activity types based on search query and location context.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#data-type-recommender
 * @param search Search query string describing the activity
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function RECOMMEND_ACTIVITY_TYPE(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return typeRecommender(search, country, stateProvince, date);
}

/**
 * Calculates emissions using the factor endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#factor
 * @param type Activity type
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function factor(
  type: string,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return factorHelper(type, unit, country, stateProvince, date);
}

/**
 * Calculates emissions using the factor endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#factor
 * @param factorId Emission factor ID
 * @param unit Unit of measurement
 */
export async function factor_by_id(factorId: number, unit?: string): Promise<any[][]> {
  return factorHelper(factorId, unit);
}

/**
 * Calculates emissions using the economic activity endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#economic-activity
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function economic_activity(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("economic_activity", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates emissions using the economic activity endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#economic-activity
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function economic_activity_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("economic_activity", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates emissions using the real estate endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#real-estate
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 */
export async function real_estate(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("real_estate", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates emissions using the real estate endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#real-estate
 * @param factorId Emission factor ID
 * @param value Numeric activity value
 * @param unit Unit of measurement
 */
export async function real_estate_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("real_estate", {
    factorId,
    value,
    unit,
  });
}

/**
 * Returns the input and/or output headers for a specific endpoint.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#headers
 * @param functionName Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor, factor_search, RECOMMEND_ACTIVITY_TYPE)
 * @param input Whether to return input headers (default: true). Set to false to exclude input headers.
 * @param output Whether to return output headers (default: true). Set to false to exclude output headers.
 * @param includeActivityTypeRecommender Whether to include activity type recommender headers after "type" field for input headers (default: false). Only applies when input=true. Ignored when input=false.
 * @returns Array of header names as a single row. If both input and output are true, returns both sets of headers in one row.
 */
export async function headers(
  functionName?: string,
  input?: boolean | string,
  output?: boolean | string,
  includeActivityTypeRecommender?: boolean | string
): Promise<string[][]> {
  try {
    // Default to "calculation" if no endpoint provided
    const selectedEndpoint = functionName?.trim().toLowerCase() || "calculation";
    
    // Handle boolean parameters using helper function
    // Default values: input=true, output=true, includeActivityTypeRecommender=false
    const showInput = parseBooleanParameter(input, true);
    const showOutput = parseBooleanParameter(output, true);
    
    // Handle includeActivityTypeRecommender parameter - only relevant when showInput is true
    const includeRecommender = showInput && parseBooleanParameter(includeActivityTypeRecommender, false);

    // Validate function name
    if (!isValidFunctionName(selectedEndpoint)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        `Invalid function name: "${selectedEndpoint}". Valid function names are: ${VALID_FUNCTION_NAMES.join(", ")}`
      );
    }

    // Build the headers array using helper function
    const headersList = buildHeadersList(
      showInput,
      showOutput,
      () => getInputHeaders(selectedEndpoint, false, includeRecommender),
      () => getOutputHeaders(selectedEndpoint)
    );

    // Return as a single row array
    return [headersList];
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.message || "Unknown error";
    console.error("Headers function failed: ", message);

    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}

/**
 * Returns the input and/or output headers for factorId-based calculations.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#headers-by-factorid
 * @param functionName Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor)
 * @param input Whether to return input headers (default: true). Set to false to exclude input headers.
 * @param output Whether to return output headers (default: true). Set to false to exclude output headers.
 * @param includeActivityTypeRecommender Whether to include activity type recommender headers (default: false). This parameter is ignored for factorId-based functions as they don't support recommender headers.
 * @returns Array of header names as a single row. If both input and output are true, returns both sets of headers in one row.
 */
export async function headers_by_factorid(
  functionName?: string,
  input?: boolean | string,
  output?: boolean | string,
  includeActivityTypeRecommender?: boolean | string
): Promise<string[][]> {
  try {
    // Default to "calculation" if no endpoint provided
    const selectedEndpoint = functionName?.trim().toLowerCase() || "calculation";
    
    // Handle boolean parameters using helper function
    // Default values: input=true, output=true
    const showInput = parseBooleanParameter(input, true);
    const showOutput = parseBooleanParameter(output, true);

    // Note: includeActivityTypeRecommender is ignored for factorId-based functions
    // as they don't support recommender headers

    // Validate function name
    if (!isValidFunctionName(selectedEndpoint)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        `Invalid function name: "${selectedEndpoint}". Valid function names are: ${VALID_FUNCTION_NAMES.join(", ")}`
      );
    }

    // factor_search and recommend_activity_type don't support factorId-based calls
    if (selectedEndpoint === "factor_search" || selectedEndpoint === "recommend_activity_type") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        `Function "${selectedEndpoint}" does not support factorId-based calls`
      );
    }

    // Build the headers array using helper function
    const headersList = buildHeadersList(
      showInput,
      showOutput,
      () => getInputHeaders(selectedEndpoint, true, false),  // true = use factorId headers, false = no recommender for factorId
      () => getOutputHeaders(selectedEndpoint)
    );

    // Return as a single row array
    return [headersList];
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.message || "Unknown error";
    console.error("Headers by factorId function failed: ", message);

    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}