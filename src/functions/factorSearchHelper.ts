// Copyright IBM Corp. 2025

import { Factor } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

function buildFactorSearchParams(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string,
  page?: number,
  size?: number
): any {
  const params: any = {
    activity: { search },
    location: { country },
  };

  if (stateProvince) {
    params.location.stateProvince = stateProvince;
  }

  if (date?.trim()) {
    const formattedDate = convertExcelDateToISO(date);
    params.time = { date: formattedDate };
  }

  params.pagination = {
    page: page || 1,
    size: size || 30
  };

  return params;
}



function formatFactorSearchResponse(response: any): (string | number | null)[][] {
  return response.factors.map((factor: any) => {
    // Handle activityUnit as array (join with ", " to maintain single column)
    const activityUnit = Array.isArray(factor.activityUnit)
      ? factor.activityUnit.join(", ")
      : (factor.activityUnit ?? "");
    
    return [
      factor.factorSet ?? "",
      factor.source ?? "",
      factor.activityType ?? "",
      activityUnit,
      factor.region ?? "",
      factor.factorId ?? ""
    ];
  });
}

export async function factorSearch(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string,
  page?: number,
  size?: number
): Promise<any[][]> {
  try {
    await ensureClient();

    const apiParams = buildFactorSearchParams(search, country, stateProvince, date, page, size);

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
