// Copyright IBM Corp. 2026

import { TypeRecommender } from "emissions-api-sdk";

import { ensureClient } from "../../functions/client";
import { buildSearchParams } from "../../functions/utils";
import {
  ActivityTypeRecommenderSearchParams,
  recommendActivityType,
} from "./activityTypeRecommenderService";

// Mock external dependencies
jest.mock("emissions-api-sdk", () => ({
  TypeRecommender: {
    search: jest.fn(),
  },
}));

jest.mock("../../functions/client", () => ({
  ensureClient: jest.fn(),
}));

jest.mock("../../functions/utils", () => ({
  buildSearchParams: jest.fn(),
}));

describe("activityTypeRecommenderService", () => {
  const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockedTypeRecommenderSearch = TypeRecommender.search as jest.MockedFunction<
    typeof TypeRecommender.search
  >;
  const mockedBuildSearchParams = buildSearchParams as jest.MockedFunction<
    typeof buildSearchParams
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEnsureClient.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  const mockSearchParams: ActivityTypeRecommenderSearchParams = {
    search: "diesel",
    country: "USA",
    stateProvince: "CA",
    unit: "L",
    scope: "1",
    date: "2024-01-01",
  };

  const mockBaseSearchParams = {
    activity: {
      search: "diesel",
      unit: "L",
      scope: "1",
    },
    location: {
      country: "USA",
      stateProvince: "CA",
    },
    time: {
      date: "2024-01-01",
    },
  };

  const mockTypeRecommenderResponse = {
    types: [
      {
        activityType: "Diesel Combustion",
        confidence: 0.95,
        activityDescription: "Combustion of diesel fuel",
        region: "USA",
        scope: "Scope 1",
        activityUnit: ["L", "gal"],
      },
      {
        activityType: "Diesel Transport",
        confidence: 0.85,
        activityDescription: "Transportation using diesel",
        region: "USA",
        scope: "Scope 1",
        activityUnit: ["km"],
      },
    ],
  };

  describe("recommendActivityType", () => {
    it("returns formatted activity type recommendations", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue(mockTypeRecommenderResponse);

      const result = await recommendActivityType(mockSearchParams);

      expect(mockedEnsureClient).toHaveBeenCalledTimes(1);
      expect(mockedBuildSearchParams).toHaveBeenCalledWith(
        "diesel",
        "USA",
        "CA",
        "L",
        "1",
        "2024-01-01"
      );
      expect(mockedTypeRecommenderSearch).toHaveBeenCalledWith({
        ...mockBaseSearchParams,
        pagination: {
          page: 1,
          size: 30,
        },
      });

      expect(result).toEqual([
        {
          id: "recommendation-0",
          activityType: "Diesel Combustion",
          confidence: 0.95,
          activityDescription: "Combustion of diesel fuel",
          region: "USA",
          scope: "Scope 1",
          units: ["L", "gal"],
        },
        {
          id: "recommendation-1",
          activityType: "Diesel Transport",
          confidence: 0.85,
          activityDescription: "Transportation using diesel",
          region: "USA",
          scope: "Scope 1",
          units: ["km"],
        },
      ]);
    });

    it("handles minimal search parameters without optional fields", async () => {
      const minimalParams: ActivityTypeRecommenderSearchParams = {
        search: "electricity",
        country: "CAN",
      };

      const minimalBaseParams = {
        activity: { search: "electricity" },
        location: { country: "CAN" },
      };

      mockedBuildSearchParams.mockReturnValue(minimalBaseParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Grid Electricity",
            confidence: 0.9,
            activityDescription: "Electricity from grid",
          },
        ],
      } as any);

      const result = await recommendActivityType(minimalParams);

      expect(mockedBuildSearchParams).toHaveBeenCalledWith(
        "electricity",
        "CAN",
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "recommendation-0",
        activityType: "Grid Electricity",
        confidence: 0.9,
        activityDescription: "Electricity from grid",
        region: "-",
        scope: "-",
        units: [],
      });
    });

    it("filters out recommendations without activityType", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Valid Type",
            confidence: 0.9,
            activityDescription: "Valid description",
          },
          {
            activityType: undefined,
            confidence: 0.8,
            activityDescription: "Invalid - no type",
          },
          {
            activityType: "",
            confidence: 0.7,
            activityDescription: "Invalid - empty type",
          },
          {
            activityType: "Another Valid Type",
            confidence: 0.85,
            activityDescription: "Another valid description",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result).toHaveLength(2);
      expect(result[0].activityType).toBe("Valid Type");
      expect(result[1].activityType).toBe("Another Valid Type");
    });

    it("handles empty response types array", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({ types: [] });

      const result = await recommendActivityType(mockSearchParams);

      expect(result).toEqual([]);
    });

    it("handles response with missing or null fields", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Test Type",
            confidence: null as any,
            activityDescription: undefined,
            region: null,
            scope: undefined,
            activityUnit: null,
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result).toEqual([
        {
          id: "recommendation-0",
          activityType: "Test Type",
          confidence: 0,
          activityDescription: "",
          region: "-",
          scope: "-",
          units: [],
        },
      ]);
    });

    it("handles confidence as string (converts to 0)", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Test Type",
            confidence: "0.95" as any,
            activityDescription: "Test description",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].confidence).toBe(0);
    });

    it("handles activityUnit as string instead of array", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Test Type",
            confidence: 0.9,
            activityDescription: "Test description",
            activityUnit: "kg" as any,
          },
        ],
      });

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].units).toEqual([]);
    });

    it("handles activityUnit as empty array", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Test Type",
            confidence: 0.9,
            activityDescription: "Test description",
            activityUnit: [],
          },
        ],
      });

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].units).toEqual([]);
    });

    it("generates unique IDs for each recommendation based on index", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          { activityType: "Type 1", confidence: 0.9, activityDescription: "Desc 1" },
          { activityType: "Type 2", confidence: 0.8, activityDescription: "Desc 2" },
          { activityType: "Type 3", confidence: 0.7, activityDescription: "Desc 3" },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].id).toBe("recommendation-0");
      expect(result[1].id).toBe("recommendation-1");
      expect(result[2].id).toBe("recommendation-2");
    });

    it("throws error when TypeRecommender.search fails", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      const error = new Error("API request failed");
      mockedTypeRecommenderSearch.mockRejectedValue(error);

      await expect(recommendActivityType(mockSearchParams)).rejects.toThrow(
        "Failed to fetch activity type recommendations: API request failed"
      );

      expect(console.error).toHaveBeenCalledWith(
        "Taskpane activity type recommender request failed:",
        "API request failed"
      );
    });

    it("throws error with unknown error message when error is not an Error instance", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockRejectedValue("String error");

      await expect(recommendActivityType(mockSearchParams)).rejects.toThrow(
        "Failed to fetch activity type recommendations: Unknown error"
      );

      expect(console.error).toHaveBeenCalledWith(
        "Taskpane activity type recommender request failed:",
        "Unknown error"
      );
    });

    it("throws error when ensureClient fails", async () => {
      const error = new Error("Authentication failed");
      mockedEnsureClient.mockRejectedValue(error);

      await expect(recommendActivityType(mockSearchParams)).rejects.toThrow(
        "Failed to fetch activity type recommendations: Authentication failed"
      );
    });

    it("includes pagination parameters in API call", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({ types: [] });

      await recommendActivityType(mockSearchParams);

      expect(mockedTypeRecommenderSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            page: 1,
            size: 30,
          },
        })
      );
    });

    it("handles response with all optional fields present", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Complete Type",
            confidence: 1.0,
            activityDescription: "Complete description",
            region: "North America",
            scope: "Scope 1",
            activityUnit: ["kg", "lb", "ton"],
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0]).toEqual({
        id: "recommendation-0",
        activityType: "Complete Type",
        confidence: 1.0,
        activityDescription: "Complete description",
        region: "North America",
        scope: "Scope 1",
        units: ["kg", "lb", "ton"],
      });
    });

    it("handles confidence value of 0", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Low Confidence Type",
            confidence: 0,
            activityDescription: "Low confidence match",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].confidence).toBe(0);
    });

    it("handles negative confidence value (converts to 0)", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Negative Confidence Type",
            confidence: -0.5,
            activityDescription: "Negative confidence",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].confidence).toBe(-0.5);
    });

    it("handles very large confidence value", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "High Confidence Type",
            confidence: 999.99,
            activityDescription: "Very high confidence",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].confidence).toBe(999.99);
    });

    it("preserves order of recommendations from API response", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          { activityType: "First", confidence: 0.5, activityDescription: "First desc" },
          { activityType: "Second", confidence: 0.9, activityDescription: "Second desc" },
          { activityType: "Third", confidence: 0.7, activityDescription: "Third desc" },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0].activityType).toBe("First");
      expect(result[1].activityType).toBe("Second");
      expect(result[2].activityType).toBe("Third");
    });

    it("handles empty string values for optional fields", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "Test Type",
            confidence: 0.9,
            activityDescription: "",
            region: "",
            scope: "",
            activityUnit: [],
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      expect(result[0]).toEqual({
        id: "recommendation-0",
        activityType: "Test Type",
        confidence: 0.9,
        activityDescription: "",
        region: "",
        scope: "",
        units: [],
      });
    });

    it("handles whitespace-only activityType (not filtered - truthy value)", async () => {
      mockedBuildSearchParams.mockReturnValue(mockBaseSearchParams);
      mockedTypeRecommenderSearch.mockResolvedValue({
        types: [
          {
            activityType: "   ",
            confidence: 0.9,
            activityDescription: "Whitespace type",
          },
          {
            activityType: "Valid Type",
            confidence: 0.8,
            activityDescription: "Valid type",
          },
        ],
      } as any);

      const result = await recommendActivityType(mockSearchParams);

      // Whitespace-only strings are truthy, so they pass the filter
      expect(result).toHaveLength(2);
      expect(result[0].activityType).toBe("   ");
      expect(result[1].activityType).toBe("Valid Type");
    });
  });
});

// Made with Bob
