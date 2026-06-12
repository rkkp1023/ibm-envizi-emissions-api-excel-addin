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
  types?: TypeRecommenderResponseItem[];
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
): ActivityTypeRecommendation | null {
  if (!recommendation?.activityType) {
    return null;
  }

  return {
    id: `recommendation-${index}`,
    activityType: recommendation.activityType,
    confidence: typeof recommendation.confidence === "number" ? recommendation.confidence : 0,
    activityDescription: recommendation.activityDescription ?? "",
    region: recommendation.region ?? "-",
    scope: recommendation.scope ?? "-",
    units: Array.isArray(recommendation.activityUnit) ? recommendation.activityUnit : [],
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const responseMessage =
      "response" in error ? (error.response as { data?: { message?: string } }) : undefined;
    if (responseMessage?.data?.message) {
      return responseMessage.data.message;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return "Unknown error";
}

export async function recommendActivityType(
  params: ActivityTypeRecommenderSearchParams
): Promise<ActivityTypeRecommendation[]> {
  try {
    await ensureClient();

    const response = (await TypeRecommender.search(
      buildTypeRecommenderParams(params)
    )) as TypeRecommenderResponse;

    if (!response || !Array.isArray(response.types)) {
      throw new Error("Invalid API response structure: Missing 'types' array");
    }

    return response.types
      .map((item, index) => mapRecommendation(item, index))
      .filter((item): item is ActivityTypeRecommendation => item !== null);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Taskpane activity type recommender request failed:", message);
    throw new Error(message);
  }
}

export const activityTypeRecommenderService = {
  recommendActivityType,
};

// Made with Bob
