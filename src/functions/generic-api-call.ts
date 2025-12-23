// Copyright IBM Corp. 2025

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
} from "emissions-api-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO, extractSymbolFromDisplay } from "./utils";


type ApiType =
  | "location"
  | "stationary"
  | "fugitive"
  | "mobile"
  | "transportation_and_distribution"
  | "calculation" ;

interface BasePayload {
  value: number;
  unit?: string;
  
}

export interface PayloadWithType extends BasePayload {
  type: string;
  country: string;
  stateProvince?: string;
  date?: string;
  powerGrid?: string;
}

export interface PayloadWithId extends BasePayload {
  factorId: number;
}

type Payload = PayloadWithType | PayloadWithId;


const emissionApiMap: Record<ApiType, (params: any) => Promise<any>> = {
  location: Location.calculate,
  stationary: Stationary.calculate,
  fugitive: Fugitive.calculate,
  mobile: Mobile.calculate,
  transportation_and_distribution: TransportationAndDistribution.calculate,
  calculation: Calculation.calculate,
  
};

function buildLocation(payload: PayloadWithType, apiType: ApiType): Record<string, string> | undefined {
  const { country, stateProvince, powerGrid } = payload;
  
  // Extract country alpha3 from display format
  // "United States (USA)" → "USA" or "USA" → "USA"
  const countryCode = extractSymbolFromDisplay(country) || country;
  
  const location: any = { country: countryCode };

  if (stateProvince) location.stateProvince = stateProvince;
  if ((apiType === "location" || apiType === "calculation") && powerGrid) {
    location.powerGrid = powerGrid;
  }

  return location;
}

function buildApiParams(apiType: ApiType, payload: Payload): any {
  const { value, unit } = payload;
  
  // Extract unit symbol from display format
  // "kilogram (kg)" → "kg" or "kg" → "kg"
  const unitSymbol = unit ? extractSymbolFromDisplay(unit) : undefined;
  
  const activity: any = {
    value,
    ...(unitSymbol ? { unit: unitSymbol } : {})
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
    if (formattedDate) {
      apiParams.time = { date: formattedDate };
    }
  }

  return apiParams;
}

function formatResponse(response: any): (string | number | null)[][] {
  
  return [[
    response.totalCO2e ?? 0,
    response.CO2 ?? 0,
    response.CH4 ?? 0,
    response.N2O ?? 0,
    response.HFC ?? 0,
    response.PFC ?? 0,
    response.SF6 ?? 0,
    response.NF3 ?? 0,
    response.bioCO2 ?? 0,
    response.indirectCO2e ?? 0,
    response.unit ?? "",
    response.description ?? "",
    response.transactionId ?? "",
  ]];
}

export async function genericApiCall(apiType: ApiType, payload: Payload): Promise<any[][]> {
  try {
    await ensureClient();

    const apiFn = emissionApiMap[apiType];
    if (!apiFn) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        `Unsupported API type: ${apiType}`
      );
    }

    const apiParams = buildApiParams(apiType, payload);
    const response = await apiFn(apiParams);

    if (!response || typeof response !== "object") {
      throw new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable, "Invalid API response");
    }

    return formatResponse(response);
  } catch (e: any) {
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
