// Copyright IBM Corp. 2025

import {
  Calculation,
  EconomicActivity,
  Fugitive,
  Location,
  Mobile,
  RealEstate,
  Stationary,
  TransportationAndDistribution,
  PhysicalActivity
} from "emissions-api-sdk";

import { ensureClient } from "./client";
import { formatRow, FunctionNameType } from "./headers-config";
import { buildCacheKey, getSnapshot, setSnapshot } from "./result-cache";
import { convertExcelDateToISO, extractSymbolFromDisplay, extractValueAfterDash } from "./utils";

type ApiType = Extract<
  FunctionNameType,
  | "location"
  | "stationary"
  | "fugitive"
  | "mobile"
  | "transportation_and_distribution"
  | "calculation"
  | "economic_activity"
  | "real_estate"
  | "physical_activity"
>;

interface BasePayload {
  value: number;
  unit?: string;
}

export interface AttributionPayload {
  outstandingAmount?: number;
  propertyValue?: number;
  totalEquity?: number;
  totalDebt?: number;
  evic?: number;
  revenue?: number;
}

export interface PayloadWithType extends BasePayload {
  type: string;
  country: string;
  stateProvince?: string;
  date?: string;
  powerGrid?: string;
  attribution?: AttributionPayload;
}

export interface PayloadWithId extends BasePayload {
  factorId: number;
  attribution?: AttributionPayload;
}

type Payload = PayloadWithType | PayloadWithId;

const emissionApiMap: Record<ApiType, (params: any) => Promise<any>> = {
  location: Location.calculate,
  stationary: Stationary.calculate,
  fugitive: Fugitive.calculate,
  mobile: Mobile.calculate,
  transportation_and_distribution: TransportationAndDistribution.calculate,
  calculation: Calculation.calculate,
  economic_activity: EconomicActivity.calculate,
  real_estate: RealEstate.calculate,
  physical_activity: PhysicalActivity.calculate,
};

function buildLocation(
  payload: PayloadWithType,
  apiType: ApiType
): Record<string, string> | undefined {
  const { country, stateProvince, powerGrid } = payload;

  // Extract country alpha3 from display format
  // "United States (USA)" → "USA" or "USA" → "USA"
  const countryCode = extractSymbolFromDisplay(country) || country;

  const location: any = { country: countryCode };

  if (stateProvince) {
    // Extract state/province from display format: "USA - California" → "California"
    const stateProvinceValue = extractValueAfterDash(stateProvince) || stateProvince;
    location.stateProvince = stateProvinceValue;
  }
  if ((apiType === "location" || apiType === "calculation") && powerGrid) {
    // Extract power grid from display format: "USA - WECC" → "WECC"
    const powerGridValue = extractValueAfterDash(powerGrid) || powerGrid;
    location.powerGrid = powerGridValue;
  }

  return location;
}

/** Returns true when a numeric field should be included in the request payload. */
function isValidValue(value: number | undefined | null | ""): boolean {
  return value !== undefined && value !== null && value !== ("" as any) && value !== 0;
}

/**
 * Builds a compact attribution object from an AttributionPayload,
 * omitting any field that is undefined, null, or zero.
 * Returns undefined when nothing would be included.
 */
function buildAttribution(attribution: AttributionPayload): AttributionPayload | undefined {
  const result: AttributionPayload = {};
  const keys = Object.keys(attribution) as (keyof AttributionPayload)[];

  for (const key of keys) {
    const val = attribution[key];
    if (isValidValue(val)) {
      (result as any)[key] = val;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function buildApiParams(apiType: ApiType, payload: Payload): any {
  const { value, unit, attribution } = payload;

  // Extract unit symbol from display format: "kilogram (kg)" → "kg"
  const unitSymbol = unit ? extractSymbolFromDisplay(unit) : undefined;

  const includeValue = apiType !== "economic_activity" || isValidValue(value);
  const activity: any = {
    ...(includeValue ? { value } : {}),
    ...(unitSymbol ? { unit: unitSymbol } : {}),
  };

  if ("type" in payload) {
    activity.type = payload.type;
  } else {
    activity.factorId = payload.factorId;
  }

  const apiParams: any = { activity, includeDetails: false };

  if ("type" in payload) {
    const location = buildLocation(payload, apiType);
    if (location) apiParams.location = location;

    const formattedDate = payload.date?.trim() ? convertExcelDateToISO(payload.date) : null;
    if (formattedDate) apiParams.time = { date: formattedDate };
  }

  // Add attribution if provided (for real_estate, physical_activity, and economic_activity)
  if (attribution) {
    const attributionObj = buildAttribution(attribution);
    if (attributionObj) apiParams.attribution = attributionObj;
  }

  return apiParams;
}

function formatResponse(response: any, apiType: ApiType): (string | number)[][] {
  return [formatRow(response, apiType)];
}

export async function genericApiCall(apiType: ApiType, payload: Payload): Promise<any[][]> {
  const apiParams = buildApiParams(apiType, payload);
  const cacheKey = await buildCacheKey(apiType, apiParams);

  try {
    await ensureClient();

    const apiFn = emissionApiMap[apiType];
    if (!apiFn) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        `Unsupported API type: ${apiType}`
      );
    }

    const response = await apiFn(apiParams);

    if (!response || typeof response !== "object") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Invalid API response"
      );
    }

    const formatted = formatResponse(response, apiType);
    await setSnapshot(cacheKey, formatted);

    return formatted;
  } catch (e: any) {
    const cached = await getSnapshot(cacheKey);
    if (cached) {
      return cached;
    }

    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.response?.data?.message || e?.message || "Unknown error";
    console.error(`${apiType} API request failed: `, message);

    throw new CustomFunctions.Error(
      e?.status === 400
        ? CustomFunctions.ErrorCode.invalidValue
        : CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}
