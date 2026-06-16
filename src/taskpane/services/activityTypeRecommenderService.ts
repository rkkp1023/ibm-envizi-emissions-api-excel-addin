// Copyright IBM Corp. 2026

import { TypeRecommender } from "emissions-api-sdk";

import { ensureClient } from "../../functions/client";
import { buildSearchParams } from "../../functions/utils";

export interface ActivityTypeRecommenderSearchParams {
  search: string;
  country: string;
  stateProvince?: string;
  unit?: string;
  scope?: string;
  date?: string;
}

export interface ActivityTypeRecommendation {
  id: string;
  activityType: string;
  confidence: number;
  activityDescription: string;
  region?: string;
  scope?: string;
  units?: string[];
}

interface TypeRecommenderResponseItem {
  activityType?: string;
  confidence?: number;
  activityDescription?: string;
  region?: string;
  scope?: string;
  activityUnit?: string[];
}

interface TypeRecommenderResponse {
  types: TypeRecommenderResponseItem[];
}

function buildTypeRecommenderParams({
  search,
  country,
  stateProvince,
  unit,
  scope,
  date,
}: ActivityTypeRecommenderSearchParams): ReturnType<typeof buildSearchParams> & {
  pagination: {
    page: number;
    size: number;
  };
} {
  const params = buildSearchParams(search, country, stateProvince, unit, scope, date);

  return {
    ...params,
    pagination: {
      page: 1,
      size: 30,
    },
  };
}

function mapRecommendation(
  recommendation?: TypeRecommenderResponseItem,
  index: number = 0
): ActivityTypeRecommendation {
  return {
    id: `recommendation-${index}`,
    activityType: recommendation?.activityType ?? "",
    confidence: typeof recommendation?.confidence === "number" ? recommendation.confidence : 0,
    activityDescription: recommendation?.activityDescription ?? "",
    region: recommendation?.region ?? "-",
    scope: recommendation?.scope ?? "-",
    units: Array.isArray(recommendation?.activityUnit) ? recommendation.activityUnit : [],
  };
}

export async function recommendActivityType(
  params: ActivityTypeRecommenderSearchParams
): Promise<ActivityTypeRecommendation[]> {
  try {
    await ensureClient();

    const response = (await TypeRecommender.search(
      buildTypeRecommenderParams(params)
    )) as TypeRecommenderResponse;

    return response.types
      .filter((item) => item?.activityType)
      .map((item, index) => mapRecommendation(item, index));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Taskpane activity type recommender request failed:", errorMessage);
    throw new Error(`Failed to fetch activity type recommendations: ${errorMessage}`);
  }
}

// Made with Bob
