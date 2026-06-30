// Copyright IBM Corp. 2026

import { createContext, ReactNode, useContext, useState } from "react";

type ActivityRecommenderState = undefined | "dismissable" | "standalone";

interface ActivityRecommenderContextType {
  activityRecommenderState: ActivityRecommenderState | undefined;
  setActivityRecommenderState: (state: ActivityRecommenderState | undefined) => void;
  recommendedParams: any | undefined;
  setRecommendedParams: (params: any | undefined) => void;
}

export const ActivityRecommenderContext = createContext<ActivityRecommenderContextType | undefined>(
  undefined
);

export function ActivityRecommenderProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [activityRecommenderState, setActivityRecommenderState] = useState<
    ActivityRecommenderState | undefined
  >(undefined);
  const [recommendedParams, setRecommendedParams] = useState<any | undefined>(undefined);

  const value: ActivityRecommenderContextType = {
    activityRecommenderState,
    setActivityRecommenderState,
    recommendedParams,
    setRecommendedParams,
  };

  return <ActivityRecommenderContext value={value}>{children}</ActivityRecommenderContext>;
}

export function useActivityRecommender(): ActivityRecommenderContextType {
  const context = useContext(ActivityRecommenderContext);
  if (context === undefined) {
    throw new Error("useActivityRecommender must be used within an ActivityRecommenderProvider");
  }
  return context;
}

// Made with Bob
