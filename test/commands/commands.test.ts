// Copyright IBM Corp. 2026

import {
  forceMetadataRefresh,
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
  refreshMetadataOnLogin,
} from "../../src/commands/commands";
import * as dataValidationManager from "../../src/commands/data-validation-manager";
import * as metadataService from "../../src/commands/metadata-service";
import * as metadataSheetManager from "../../src/commands/metadata-sheet-manager";

// Mock dependencies
jest.mock("../../src/commands/metadata-service");
jest.mock("../../src/commands/metadata-sheet-manager");
jest.mock("../../src/commands/data-validation-manager");

const mockFetchAllMetadata = metadataService.fetchAllMetadata as jest.MockedFunction<
  typeof metadataService.fetchAllMetadata
>;
const mockNeedsMetadataRefresh = metadataSheetManager.needsMetadataRefresh as jest.MockedFunction<
  typeof metadataSheetManager.needsMetadataRefresh
>;
const mockWriteMetadataToSheet = metadataSheetManager.writeMetadataToSheet as jest.MockedFunction<
  typeof metadataSheetManager.writeMetadataToSheet
>;
const mockCreateNamedRanges = metadataSheetManager.createNamedRanges as jest.MockedFunction<
  typeof metadataSheetManager.createNamedRanges
>;
const mockDeleteMetadataSheet = metadataSheetManager.deleteMetadataSheet as jest.MockedFunction<
  typeof metadataSheetManager.deleteMetadataSheet
>;
const mockMetadataSheetExists = metadataSheetManager.metadataSheetExists as jest.MockedFunction<
  typeof metadataSheetManager.metadataSheetExists
>;
const mockInsertActivityTypeValidation =
  dataValidationManager.insertActivityTypeValidation as jest.MockedFunction<
    typeof dataValidationManager.insertActivityTypeValidation
  >;
const mockInsertAreaValidation = dataValidationManager.insertAreaValidation as jest.MockedFunction<
  typeof dataValidationManager.insertAreaValidation
>;
const mockInsertUnitValidation = dataValidationManager.insertUnitValidation as jest.MockedFunction<
  typeof dataValidationManager.insertUnitValidation
>;

// Mock Office API
(global as any).Office = {
  addin: {
    showAsTaskpane: jest.fn().mockResolvedValue(undefined),
  },
};

const mockMetadata = {
  activityTypes: {
    location: ["Type1", "Type2"],
  },
  areas: {
    countries: ["USA(United States)"],
    stateProvinces: ["California"],
    powerGrids: ["WECC"],
  },
  units: {
    units: ["kg(kilogram)"],
  },
  timestamp: new Date().toISOString(),
};

describe("commands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchAllMetadata.mockResolvedValue(mockMetadata);
    mockWriteMetadataToSheet.mockResolvedValue(undefined);
    mockCreateNamedRanges.mockResolvedValue(undefined);
    mockDeleteMetadataSheet.mockResolvedValue(undefined);
    mockInsertActivityTypeValidation.mockResolvedValue(undefined);
    mockInsertAreaValidation.mockResolvedValue(undefined);
    mockInsertUnitValidation.mockResolvedValue(undefined);
  });

  describe("openTaskpane", () => {
    it("should open taskpane successfully", async () => {
      await openTaskpane();

      expect(Office.addin.showAsTaskpane).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      (Office.addin.showAsTaskpane as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

      await expect(openTaskpane()).resolves.not.toThrow();
    });
  });

  describe("handleInsertActivityTypes", () => {
    it("should insert activity type validation when metadata is fresh", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);

      await handleInsertActivityTypes("location");

      expect(mockNeedsMetadataRefresh).toHaveBeenCalled();
      expect(mockFetchAllMetadata).not.toHaveBeenCalled();
      expect(mockInsertActivityTypeValidation).toHaveBeenCalledWith("location");
    });

    it("should refresh metadata when needed", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(true);

      await handleInsertActivityTypes("mobile");

      expect(mockNeedsMetadataRefresh).toHaveBeenCalled();
      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
      expect(mockInsertActivityTypeValidation).toHaveBeenCalledWith("mobile");
    });

    it("should delete metadata sheet on error", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(true);
      mockFetchAllMetadata.mockRejectedValueOnce(new Error("API Error"));

      await expect(handleInsertActivityTypes("location")).rejects.toThrow();
      expect(mockDeleteMetadataSheet).toHaveBeenCalled();
    });

    it("should handle all activity type options", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);

      const activityTypes = [
        "all",
        "location",
        "stationary",
        "mobile",
        "fugitive",
        "transportation-and-distribution",
        "economic-activity",
        "real-estate",
      ] as const;

      for (const type of activityTypes) {
        await handleInsertActivityTypes(type);
        expect(mockInsertActivityTypeValidation).toHaveBeenCalledWith(type);
      }
    });
  });

  describe("handleInsertArea", () => {
    it("should insert area validation when metadata is fresh", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);

      await handleInsertArea("country");

      expect(mockNeedsMetadataRefresh).toHaveBeenCalled();
      expect(mockFetchAllMetadata).not.toHaveBeenCalled();
      expect(mockInsertAreaValidation).toHaveBeenCalledWith("country");
    });

    it("should refresh metadata when needed", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(true);

      await handleInsertArea("stateprovince");

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockInsertAreaValidation).toHaveBeenCalledWith("stateprovince");
    });

    it("should handle all area type options", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);

      const areaTypes = ["country", "stateprovince", "powergrid"] as const;

      for (const type of areaTypes) {
        await handleInsertArea(type);
        expect(mockInsertAreaValidation).toHaveBeenCalledWith(type);
      }
    });
  });

  describe("handleInsertUnits", () => {
    it("should insert unit validation when metadata is fresh", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);

      await handleInsertUnits();

      expect(mockNeedsMetadataRefresh).toHaveBeenCalled();
      expect(mockFetchAllMetadata).not.toHaveBeenCalled();
      expect(mockInsertUnitValidation).toHaveBeenCalled();
    });

    it("should refresh metadata when needed", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(true);

      await handleInsertUnits();

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockInsertUnitValidation).toHaveBeenCalled();
    });
  });

  describe("forceMetadataRefresh", () => {
    it("should force metadata refresh", async () => {
      await forceMetadataRefresh();

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
    });

    it("should throw error on failure", async () => {
      mockFetchAllMetadata.mockRejectedValueOnce(new Error("API Error"));

      await expect(forceMetadataRefresh()).rejects.toThrow("Failed to refresh metadata");
    });
  });

  describe("refreshMetadataOnLogin", () => {
    it("should refresh metadata when sheet exists", async () => {
      mockMetadataSheetExists.mockResolvedValue(true);

      await refreshMetadataOnLogin();

      expect(mockMetadataSheetExists).toHaveBeenCalled();
      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalled();
    });

    it("should not refresh when sheet does not exist", async () => {
      mockMetadataSheetExists.mockResolvedValue(false);

      await refreshMetadataOnLogin();

      expect(mockMetadataSheetExists).toHaveBeenCalled();
      expect(mockFetchAllMetadata).not.toHaveBeenCalled();
    });

    it("should not throw error on failure", async () => {
      mockMetadataSheetExists.mockResolvedValue(true);
      mockFetchAllMetadata.mockRejectedValueOnce(new Error("API Error"));

      await expect(refreshMetadataOnLogin()).resolves.not.toThrow();
    });
  });

  describe("concurrent metadata initialization", () => {
    it("should prevent concurrent initialization", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(true);
      mockFetchAllMetadata.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockMetadata), 100))
      );

      // Start two concurrent operations
      const promise1 = handleInsertActivityTypes("location");
      const promise2 = handleInsertActivityTypes("mobile");

      await Promise.all([promise1, promise2]);

      // Should only fetch metadata once
      expect(mockFetchAllMetadata).toHaveBeenCalledTimes(1);
    });
  });
});

// Made with Bob
