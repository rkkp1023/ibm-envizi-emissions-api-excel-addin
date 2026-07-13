// Copyright IBM Corp. 2026

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { useActivityTypeRecommendations } from "./useActivityTypeRecommendations";
import {
  ActivityTypeRecommenderSearchParams,
  recommendActivityType,
} from "../services/activityTypeRecommenderService";

jest.mock("../services/activityTypeRecommenderService", () => ({
  recommendActivityType: jest.fn(),
}));

const mockRecommendActivityType = recommendActivityType as jest.MockedFunction<
  typeof recommendActivityType
>;

const mockRecommendations = [
  {
    id: "1",
    activityType: "Waste Recycled - Cardboard",
    confidence: 95,
    activityDescription: "Waste Recycled - Cardboard",
    region: "Global",
    scope: "Scope 3",
    units: ["kg"],
  },
];

describe("useActivityTypeRecommendations", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe("when search is empty", () => {
    it("does not call recommendActivityType", () => {
      const params: ActivityTypeRecommenderSearchParams = { search: "", country: "Australia" };
      renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      expect(mockRecommendActivityType).not.toHaveBeenCalled();
    });

    it("returns undefined data", () => {
      const params: ActivityTypeRecommenderSearchParams = { search: "", country: "Australia" };
      const { result } = renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      expect(result.current.data).toBeUndefined();
    });

    it("is not loading", () => {
      const params: ActivityTypeRecommenderSearchParams = { search: "", country: "Australia" };
      const { result } = renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("when search is non-empty", () => {
    it("calls recommendActivityType with the provided params", async () => {
      mockRecommendActivityType.mockResolvedValue(mockRecommendations);
      const params: ActivityTypeRecommenderSearchParams = {
        search: "electricity",
        country: "Australia",
      };
      renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      await waitFor(() => expect(mockRecommendActivityType).toHaveBeenCalledTimes(1));
      expect(mockRecommendActivityType).toHaveBeenCalledWith(params);
    });

    it("returns data on successful fetch", async () => {
      mockRecommendActivityType.mockResolvedValue(mockRecommendations);
      const params: ActivityTypeRecommenderSearchParams = {
        search: "electricity",
        country: "Australia",
      };
      const { result } = renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRecommendations);
    });

    it("returns error status when recommendActivityType rejects", async () => {
      mockRecommendActivityType.mockRejectedValue(new Error("API error"));
      const params: ActivityTypeRecommenderSearchParams = {
        search: "electricity",
        country: "Australia",
      };
      const { result } = renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.data).toBeUndefined();
    });

    it("does not retry on failure", async () => {
      mockRecommendActivityType.mockRejectedValue(new Error("API error"));
      const params: ActivityTypeRecommenderSearchParams = {
        search: "electricity",
        country: "Australia",
      };
      renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      await waitFor(() => expect(mockRecommendActivityType).toHaveBeenCalledTimes(1));
      // With retry:false the service is called exactly once even on failure
      expect(mockRecommendActivityType).toHaveBeenCalledTimes(1);
    });
  });

  describe("query key", () => {
    it("includes activityTypeRecommendations and the params object", async () => {
      mockRecommendActivityType.mockResolvedValue(mockRecommendations);
      const params: ActivityTypeRecommenderSearchParams = {
        search: "fuel",
        country: "Canada",
      };
      renderHook(() => useActivityTypeRecommendations(params), { wrapper });
      await waitFor(() => expect(mockRecommendActivityType).toHaveBeenCalledTimes(1));

      const cache = queryClient.getQueryCache().getAll();
      expect(cache).toHaveLength(1);
      expect(cache[0].queryKey).toEqual(["activityTypeRecommendations", params]);
    });
  });
});
