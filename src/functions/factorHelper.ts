// Copyright IBM Corp. 2025, 2026

import { Factor } from "emissions-api-sdk";

import { ensureClient } from "./client";
import { formatRow } from "./headers-config";
import { convertExcelDateToISO, extractSymbolFromDisplay, extractValueAfterDash } from "./utils";

export async function factorHelper(
  typeOrId: string | number,
  unit: string,
  country?: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  await ensureClient();

  // Extract unit symbol from display format: "kg (kilogram)" → "kg"
  const unitSymbol = extractSymbolFromDisplay(unit) || unit;

  const apiParams: any = {
    activity: { unit: unitSymbol },
  };

  if (typeof typeOrId === "string") {
    apiParams.activity.type = typeOrId;

    if (country) {
      // Extract country code from display format: "USA (United States)" → "USA"
      const countryCode = extractSymbolFromDisplay(country) || country;
      apiParams.location = { country: countryCode };
      if (stateProvince) {
        // Extract state/province from display format: "USA - California" → "California"
        const stateProvinceValue = extractValueAfterDash(stateProvince) || stateProvince;
        apiParams.location.stateProvince = stateProvinceValue;
      }
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
