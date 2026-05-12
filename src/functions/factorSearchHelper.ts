// Copyright IBM Corp. 2025, 2026

import { Factor } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { formatRow } from "./headers-config";
import { buildSearchParams } from "./utils";

function buildFactorSearchParams(
  search: string,
  country: string,
  stateProvince?: string,
  unit?: string,
  scope?: string,
  date?: string,
  page?: number,
  size?: number
): any {
  // Use shared utility for common parameter building
  const params = buildSearchParams(search, country, stateProvince, unit, scope, date);

  // Add pagination specific to factor search
  params.pagination = {
    page: page || 1,
    size: size || 30
  };

  return params;
}



function formatFactorSearchResponse(response: any): (string | number)[][] {
  return response.factors.map((factor: any) => formatRow(factor, "factor_search"));
}

export async function factorSearch(
  search: string,
  country: string,
  stateProvince?: string,
  unit?: string,
  scope?: string,
  date?: string,
  page?: number,
  size?: number
): Promise<any[][]> {
  try {
    await ensureClient();

    const apiParams = buildFactorSearchParams(search, country, stateProvince, unit, scope, date, page, size);

    const response = await Factor.search(apiParams);


    if (!response || !Array.isArray(response.factors)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Invalid API response structure: Missing 'factors' array"
      );
    }

    return formatFactorSearchResponse(response);
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.response?.data?.message || e?.message || "Unknown error";
    console.error("Factor search API request failed: ", message);

    throw new CustomFunctions.Error(
      e?.status === 400
        ? CustomFunctions.ErrorCode.invalidValue
        : CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}
