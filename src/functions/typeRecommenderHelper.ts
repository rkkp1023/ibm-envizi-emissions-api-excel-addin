// Copyright IBM Corp. 2026

import { TypeRecommender } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { formatRow } from "./headers-config";
import { convertExcelDateToISO, extractSymbolFromDisplay, extractValueAfterDash } from "./utils";

function buildTypeRecommenderParams(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string
): any {
  // Extract country code from display format: "USA (United States)" → "USA"
  const countryCode = extractSymbolFromDisplay(country) || country;
  
  const params: any = {
    activity: { search },
    location: { country: countryCode },
  };

  if (stateProvince) {
    // Extract state/province from display format: "USA - California" → "California"
    const stateProvinceValue = extractValueAfterDash(stateProvince) || stateProvince;
    params.location.stateProvince = stateProvinceValue;
  }

  if (date?.trim()) {
    const formattedDate = convertExcelDateToISO(date);
    params.time = { date: formattedDate };
  }

  params.pagination = {
    page: 1,
    size: 1
  };

  return params;
}

function formatTypeRecommenderResponse(response: any): (string | number)[][] {
  if (!response.types || response.types.length === 0) {
    return [["No recommendations found", 0, ""]];
  }

  // Return only the first result as per requirement
  return [formatRow(response.types[0], "recommend_activity_type")];
}

export async function typeRecommender(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  try {
    await ensureClient();

    const apiParams = buildTypeRecommenderParams(search, country, stateProvince, date);

    const response = await TypeRecommender.search(apiParams);

    if (!response || !Array.isArray(response.types)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Invalid API response structure: Missing 'types' array"
      );
    }

    return formatTypeRecommenderResponse(response);
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.response?.data?.message || e?.message || "Unknown error";
    console.error("Type recommender API request failed: ", message);

    throw new CustomFunctions.Error(
      e?.status === 400
        ? CustomFunctions.ErrorCode.invalidValue
        : CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}


// Made with Bob
