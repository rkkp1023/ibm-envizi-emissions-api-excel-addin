// Copyright IBM Corp. 2026

import { Metadata } from "emissions-api-sdk";

import {
  ACTIVITY_TYPE_ENDPOINTS,
  fetchAllMetadata,
  fetchAreaMetadata,
  fetchUnitMetadata,
} from "../../src/commands/metadata-service";
import { ensureClient } from "../../src/functions/client";

// Mock dependencies
jest.mock("../../src/functions/client");
jest.mock("emissions-api-sdk");

const mockEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
const mockMetadata = Metadata as jest.Mocked<typeof Metadata>;

describe("metadata-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureClient.mockResolvedValue(undefined);
  });

  describe("fetchAllMetadata", () => {
    it("should fetch all metadata successfully", async () => {
      // Mock responses
      mockMetadata.getTypes = jest.fn().mockResolvedValue({
        types: ["Type1", "Type2"],
      });
      mockMetadata.getArea = jest.fn().mockResolvedValue({
        locations: [
          {
            alpha3: "USA",
            countryName: "United States",
            stateProvinces: ["California", "Texas"],
            powerGrids: ["WECC", "ERCOT"],
          },
        ],
      });
      mockMetadata.getUnits = jest.fn().mockResolvedValue({
        units: [
          { unit: "kg", unitName: "kilogram" },
          { unit: "t", unitName: "metric ton" },
        ],
      });

      const result = await fetchAllMetadata();

      expect(result).toHaveProperty("activityTypes");
      expect(result).toHaveProperty("areas");
      expect(result).toHaveProperty("units");
      expect(result).toHaveProperty("timestamp");
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should fetch activity types for all endpoints in parallel", async () => {
      mockMetadata.getTypes = jest.fn().mockResolvedValue({
        types: ["Type1"],
      });
      mockMetadata.getArea = jest.fn().mockResolvedValue({ locations: [] });
      mockMetadata.getUnits = jest.fn().mockResolvedValue({ units: [] });

      const result = await fetchAllMetadata();

      // Verify all endpoints were called
      expect(mockMetadata.getTypes).toHaveBeenCalledTimes(ACTIVITY_TYPE_ENDPOINTS.length);
      expect(Object.keys(result.activityTypes)).toHaveLength(ACTIVITY_TYPE_ENDPOINTS.length);
    });

    it("should use Promise.all for parallel execution", async () => {
      const mockPromiseAll = jest.spyOn(Promise, 'all');
      
      mockMetadata.getTypes = jest.fn().mockResolvedValue({
        types: ["Type1"],
      });
      mockMetadata.getArea = jest.fn().mockResolvedValue({ locations: [] });
      mockMetadata.getUnits = jest.fn().mockResolvedValue({ units: [] });

      await fetchAllMetadata();

      // Verify Promise.all was used (indicates parallel execution)
      expect(mockPromiseAll).toHaveBeenCalled();
      
      mockPromiseAll.mockRestore();
    });

    it("should handle partial failures in parallel calls", async () => {
      mockMetadata.getTypes = jest.fn()
        .mockResolvedValueOnce({ types: ["Type1"] })
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValue({ types: ["Type2"] });
      mockMetadata.getArea = jest.fn().mockResolvedValue({ locations: [] });
      mockMetadata.getUnits = jest.fn().mockResolvedValue({ units: [] });

      // Should not throw, failed endpoints return empty arrays
      const result = await fetchAllMetadata();
      
      expect(result.activityTypes).toBeDefined();
    });
  });

  describe("fetchAreaMetadata", () => {
    it("should fetch and process area metadata successfully", async () => {
      mockMetadata.getArea = jest.fn().mockResolvedValue({
        locations: [
          {
            alpha3: "USA",
            countryName: "United States",
            stateProvinces: ["California", "Texas"],
            powerGrids: ["WECC", "ERCOT"],
          },
          {
            alpha3: "CAN",
            countryName: "Canada",
            stateProvinces: ["Ontario", "Quebec"],
            powerGrids: ["NPCC"],
          },
        ],
      });

      const result = await fetchAreaMetadata();

      expect(result.countries).toContain("USA (United States)");
      expect(result.countries).toContain("CAN (Canada)");
      expect(result.stateProvinces).toContain("USA - California");
      expect(result.stateProvinces).toContain("CAN - Ontario");
      expect(result.powerGrids).toContain("USA - WECC");
      expect(result.powerGrids).toContain("CAN - NPCC");
    });

    it("should remove duplicates and sort results", async () => {
      mockMetadata.getArea = jest.fn().mockResolvedValue({
        locations: [
          {
            alpha3: "USA",
            countryName: "United States",
            stateProvinces: ["California", "Texas", "California"],
            powerGrids: ["WECC"],
          },
        ],
      });

      const result = await fetchAreaMetadata();

      expect(result.stateProvinces).toEqual(["USA - California", "USA - Texas"]);
      expect(result.stateProvinces.length).toBe(2);
    });

    it("should handle empty response", async () => {
      mockMetadata.getArea = jest.fn().mockResolvedValue({ locations: [] });

      const result = await fetchAreaMetadata();

      expect(result.countries).toEqual([]);
      expect(result.stateProvinces).toEqual([]);
      expect(result.powerGrids).toEqual([]);
    });

    it("should handle invalid response structure", async () => {
      mockMetadata.getArea = jest.fn().mockResolvedValue(null);

      const result = await fetchAreaMetadata();

      expect(result.countries).toEqual([]);
      expect(result.stateProvinces).toEqual([]);
      expect(result.powerGrids).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      mockMetadata.getArea = jest.fn().mockRejectedValue(new Error("API Error"));

      const result = await fetchAreaMetadata();

      expect(result.countries).toEqual([]);
      expect(result.stateProvinces).toEqual([]);
      expect(result.powerGrids).toEqual([]);
    });
  });

  describe("fetchUnitMetadata", () => {
    it("should fetch and process unit metadata successfully", async () => {
      mockMetadata.getUnits = jest.fn().mockResolvedValue({
        units: [
          { unit: "kg", unitName: "kilogram" },
          { unit: "t", unitName: "metric ton" },
          { unit: "lb", unitName: "pound" },
        ],
      });

      const result = await fetchUnitMetadata();

      expect(result.units).toContain("kg (kilogram)");
      expect(result.units).toContain("t (metric ton)");
      expect(result.units).toContain("lb (pound)");
      expect(result.units.length).toBe(3);
    });

    it("should remove duplicates and sort results", async () => {
      mockMetadata.getUnits = jest.fn().mockResolvedValue({
        units: [
          { unit: "kg", unitName: "kilogram" },
          { unit: "t", unitName: "metric ton" },
          { unit: "kg", unitName: "kilogram" },
        ],
      });

      const result = await fetchUnitMetadata();

      expect(result.units).toEqual(["kg (kilogram)", "t (metric ton)"]);
      expect(result.units.length).toBe(2);
    });

    it("should handle empty response", async () => {
      mockMetadata.getUnits = jest.fn().mockResolvedValue({ units: [] });

      const result = await fetchUnitMetadata();

      expect(result.units).toEqual([]);
    });

    it("should handle invalid response structure", async () => {
      mockMetadata.getUnits = jest.fn().mockResolvedValue(null);

      const result = await fetchUnitMetadata();

      expect(result.units).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      mockMetadata.getUnits = jest.fn().mockRejectedValue(new Error("API Error"));

      const result = await fetchUnitMetadata();

      expect(result.units).toEqual([]);
    });

    it("should skip invalid unit entries", async () => {
      mockMetadata.getUnits = jest.fn().mockResolvedValue({
        units: [
          { unit: "kg", unitName: "kilogram" },
          { unit: null, unitName: "invalid" },
          { unit: "t", unitName: null },
          { unit: "lb", unitName: "pound" },
        ],
      });

      const result = await fetchUnitMetadata();

      expect(result.units).toEqual(["kg (kilogram)", "lb (pound)"]);
      expect(result.units.length).toBe(2);
    });
  });
});

// Made with Bob
