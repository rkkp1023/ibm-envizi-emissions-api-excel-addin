// Copyright IBM Corp. 2026

import { useQuery } from "@tanstack/react-query";

import {
  ActivityTypeRecommenderSearchParams,
  recommendActivityType,
} from "../services/activityTypeRecommenderService";

/**
 * React hook to fetch activity type recommendations using TanStack Query
 *
 * @param params - Search parameters for activity type recommendations
 * @returns Query result with recommendations data, loading state, and error
 */
export function useActivityTypeRecommendations(params: ActivityTypeRecommenderSearchParams) {
  return useQuery({
    queryKey: ["activityTypeRecommendations", params],
    queryFn: () => recommendActivityType(params),
    enabled: !!params.search,
  });
}
