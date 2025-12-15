// Copyright IBM Corp. 2025

import { Factor } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

export async function factorHelper(
  typeOrId: string | number,
  unit: string,
  country?: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  await ensureClient();

  let apiParams: any = {
    activity: { unit },
  };

  if (typeof typeOrId === "string") {
    apiParams.activity.type = typeOrId;

    if (country) {
      apiParams.location = { country };
      if (stateProvince) apiParams.location.stateProvince = stateProvince;
    }

    if (date?.trim()) {
      const formattedDate = convertExcelDateToISO(date);
      apiParams.time = { date: formattedDate };
    }
  } else {
    apiParams.activity.factorId = typeOrId;
  }

  const response = await Factor.retrieveFactor(apiParams);

  if (!response || typeof response === "undefined") {
    throw new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable, "Invalid API response");
  }

  // Handle activityUnit as array (join with ", " to maintain single column)
  const activityUnit = Array.isArray(response.activityUnit)
    ? response.activityUnit.join(", ")
    : (response.activityUnit ?? "");

  return [
    [
      response.factorSet ?? "",
      response.source ?? "",
      response.activityType ?? "",
      activityUnit,
      response.name ?? "",
      response.description ?? "",
      response.effectiveFrom ?? "",
      response.effectiveTo ?? "",
      response.publishedFrom ?? "",
      response.publishedTo ?? "",
      response.region ?? "",
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
      response.factorId ?? "",
      response.transactionId ?? "",
    ],
  ];
}
