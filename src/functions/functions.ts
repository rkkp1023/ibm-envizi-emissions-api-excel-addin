// Copyright IBM Corp. 2025

import { genericApiCall } from "./generic-api-call";
import { factorSearch } from "./factorSearchHelper";
import { factorHelper } from "./factorHelper";
import { handleTypesFunction } from "./types-handler";
import { handleUnitsFunction } from "./units-handler";
import { handleCountryFunction, handleStateProvinceFunction, handlePowerGridFunction } from "./area-handler";

/**
 * Triggers data validation dropdown for API types.
 * Returns the API name and stores a request for the taskpane to apply validation.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#types
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution, factor)
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function types(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  return handleTypesFunction(apiName, invocation);
}

/**
 * Triggers data validation dropdown for API units.
 * Fetches units on-demand from the API and applies validation to the cell.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#units
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution, factor)
 * @param type The type parameter to fetch units for (e.g., "electricity")
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function units(
  apiName: string,
  type: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  return handleUnitsFunction(apiName, type, invocation);
}

/**
 * Triggers data validation dropdown for country selection.
 * Fetches countries from the API and applies validation to the cell.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#country
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution, factor, factorsearch)
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function country(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  return handleCountryFunction(apiName, invocation);
}

/**
 * Triggers data validation dropdown for state/province selection.
 * Fetches state/province data for the specified country and applies validation to the cell.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#state-province
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution, factor, factorsearch)
 * @param country The country alpha3 code (e.g., "USA", "CAN")
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function state_province(
  apiName: string,
  country: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  return handleStateProvinceFunction(apiName, country, invocation);
}

/**
 * Triggers data validation dropdown for power grid selection.
 * Fetches power grid data for the specified country and applies validation to the cell.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#power-grid
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution, factor, factorsearch)
 * @param country The country alpha3 code (e.g., "USA", "CAN")
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function power_grid(
  apiName: string,
  country: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  return handlePowerGridFunction(apiName, country, invocation);
}

/**
 * Calculates location-based emissions.
 * @customfunction
 * @helpurl https://ibm.github.io/ibm-envizi-emissions-api-excel-addin/reference.html#location-based-emissions
 * @param type Activity type
 * @param value Numeric activity value
 * @param unit Unit of measurement (default: kWh if not specified)
 * @param country ISO alpha-3 country code
 * @param stateProvince Geographic state or province
 * @param date Activity date
 * @param powerGrid Power grid region identifier
 */
export async function location(
  type: string,
  value: number,
  unit: string | undefined,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string
): Promise<any[][]> {
  const finalUnit = unit || "kwh";
  return genericApiCall("location", {
    type,
    value,
    unit: finalUnit,
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