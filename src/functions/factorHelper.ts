// Copyright IBM Corp. 2025, 2026

import { Factor } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { formatRow } from "./headers-config";
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

  return [formatRow(response, "factor")];
}
