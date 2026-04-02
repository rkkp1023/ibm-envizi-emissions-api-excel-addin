// Copyright IBM Corp. 2026

import {
  forceMetadataRefresh,
  handleInsertActivityTypes,
  handleInsertArea,
  handleInsertUnits,
  openTaskpane,
  refreshMetadataOnLogin,
  resetMetadataPromise,
} from "../../src/commands/commands";
import {
  insertActivityTypeValidation,
  insertAreaValidation,
  insertUnitValidation,
} from "../../src/commands/data-validation-manager";
import { fetchAllMetadata } from "../../src/commands/metadata-service";
import {
  createNamedRanges,
  deleteMetadataSheet,
  metadataSheetExists,
  needsMetadataRefresh,
  writeMetadataToSheet,
} from "../../src/commands/metadata-sheet-manager";

// Mock dependencies
jest.mock("../../src/commands/data-validation-manager");
jest.mock("../../src/commands/metadata-service");
jest.mock("../../src/commands/metadata-sheet-manager");

// Mock Office global
(global as any).Office = {
  addin: {
    showAsTaskpane: jest.fn(),
  },
};

describe("commands", () => {
  const mockInsertActivityTypeValidation = insertActivityTypeValidation as jest.MockedFunction<
    typeof insertActivityTypeValidation
  >;
  const mockInsertAreaValidation = insertAreaValidation as jest.MockedFunction<
    typeof insertAreaValidation
  >;
  const mockInsertUnitValidation = insertUnitValidation as jest.MockedFunction<
    typeof insertUnitValidation
  >;
  const mockFetchAllMetadata = fetchAllMetadata as jest.MockedFunction<typeof fetchAllMetadata>;
  const mockCreateNamedRanges = createNamedRanges as jest.MockedFunction<typeof createNamedRanges>;
  const mockDeleteMetadataSheet = deleteMetadataSheet as jest.MockedFunction<
    typeof deleteMetadataSheet
  >;
  const mockMetadataSheetExists = metadataSheetExists as jest.MockedFunction<
    typeof metadataSheetExists
  >;
  const mockNeedsMetadataRefresh = needsMetadataRefresh as jest.MockedFunction<
    typeof needsMetadataRefresh
  >;
  const mockWriteMetadataToSheet = writeMetadataToSheet as jest.MockedFunction<
    typeof writeMetadataToSheet
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Reset the metadata promise between tests
    resetMetadataPromise();
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("openTaskpane", () => {
    it("should call Office.addin.showAsTaskpane", async () => {
      await openTaskpane();

      expect(Office.addin.showAsTaskpane).toHaveBeenCalled();
    });

    it("should not throw error if showAsTaskpane fails", async () => {
      (Office.addin.showAsTaskpane as jest.Mock).mockRejectedValue(
        new Error("Failed to show taskpane")
      );

      await expect(openTaskpane()).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to show taskpane:",
        expect.any(Error)
      );
    });
  });

  describe("handleInsertActivityTypes", () => {
    it("should ensure metadata is loaded and insert activity type validation", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);
      mockInsertActivityTypeValidation.mockResolvedValue(undefined);

      await handleInsertActivityTypes("stationary");

      expect(mockNeedsMetadataRefresh).toHaveBeenCalledWith(3);
      expect(mockInsertActivityTypeValidation).toHaveBeenCalledWith("stationary");
    });

    it("should refresh metadata if needed before inserting validation", async () => {
      const mockMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };
      mockNeedsMetadataRefresh.mockResolvedValue(true);
      mockFetchAllMetadata.mockResolvedValue(mockMetadata);
      mockWriteMetadataToSheet.mockResolvedValue(undefined);
      mockCreateNamedRanges.mockResolvedValue(undefined);
      mockInsertActivityTypeValidation.mockResolvedValue(undefined);

      await handleInsertActivityTypes("location");

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
      expect(mockInsertActivityTypeValidation).toHaveBeenCalledWith("location");
    });

    it("should delete metadata sheet on error", async () => {
      mockNeedsMetadataRefresh.mockRejectedValue(new Error("Metadata check failed"));
      mockDeleteMetadataSheet.mockResolvedValue(undefined);

      await expect(handleInsertActivityTypes("mobile")).rejects.toThrow("Metadata check failed");
      expect(mockDeleteMetadataSheet).toHaveBeenCalled();
    });
  });

  describe("handleInsertArea", () => {
    it("should ensure metadata is loaded and insert area validation", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);
      mockInsertAreaValidation.mockResolvedValue(undefined);

      await handleInsertArea("country");

      expect(mockNeedsMetadataRefresh).toHaveBeenCalledWith(3);
      expect(mockInsertAreaValidation).toHaveBeenCalledWith("country");
    });

    it("should refresh metadata if needed before inserting validation", async () => {
      const mockMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };
      mockNeedsMetadataRefresh.mockResolvedValue(true);
      mockFetchAllMetadata.mockResolvedValue(mockMetadata);
      mockWriteMetadataToSheet.mockResolvedValue(undefined);
      mockCreateNamedRanges.mockResolvedValue(undefined);
      mockInsertAreaValidation.mockResolvedValue(undefined);

      await handleInsertArea("stateprovince");

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
      expect(mockInsertAreaValidation).toHaveBeenCalledWith("stateprovince");
    });

    it("should delete metadata sheet on error", async () => {
      mockNeedsMetadataRefresh.mockRejectedValue(new Error("Metadata check failed"));
      mockDeleteMetadataSheet.mockResolvedValue(undefined);

      await expect(handleInsertArea("country")).rejects.toThrow("Metadata check failed");
      expect(mockDeleteMetadataSheet).toHaveBeenCalled();
    });
  });

  describe("handleInsertUnits", () => {
    it("should ensure metadata is loaded and insert unit validation", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);
      mockInsertUnitValidation.mockResolvedValue(undefined);

      await handleInsertUnits();

      expect(mockNeedsMetadataRefresh).toHaveBeenCalledWith(3);
      expect(mockInsertUnitValidation).toHaveBeenCalled();
    });

    it("should refresh metadata if needed before inserting validation", async () => {
      const mockMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };
      mockNeedsMetadataRefresh.mockResolvedValue(true);
      mockFetchAllMetadata.mockResolvedValue(mockMetadata);
      mockWriteMetadataToSheet.mockResolvedValue(undefined);
      mockCreateNamedRanges.mockResolvedValue(undefined);
      mockInsertUnitValidation.mockResolvedValue(undefined);

      await handleInsertUnits();

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
      expect(mockInsertUnitValidation).toHaveBeenCalled();
    });

    it("should delete metadata sheet on error", async () => {
      mockNeedsMetadataRefresh.mockRejectedValue(new Error("Metadata check failed"));
      mockDeleteMetadataSheet.mockResolvedValue(undefined);

      await expect(handleInsertUnits()).rejects.toThrow("Metadata check failed");
      expect(mockDeleteMetadataSheet).toHaveBeenCalled();
    });
  });

  describe("forceMetadataRefresh", () => {
    it("should fetch metadata and update sheet", async () => {
      const mockMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };
      mockFetchAllMetadata.mockResolvedValue(mockMetadata);
      mockWriteMetadataToSheet.mockResolvedValue(undefined);
      mockCreateNamedRanges.mockResolvedValue(undefined);

      await forceMetadataRefresh();

      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
    });

    it("should throw error with message if metadata fetch fails", async () => {
      mockFetchAllMetadata.mockRejectedValue(new Error("API error"));

      await expect(forceMetadataRefresh()).rejects.toThrow("Failed to refresh metadata: API error");
    });

    it("should handle error without message", async () => {
      mockFetchAllMetadata.mockRejectedValue({});

      await expect(forceMetadataRefresh()).rejects.toThrow(
        "Failed to refresh metadata: Unknown error"
      );
    });
  });

  describe("refreshMetadataOnLogin", () => {
    it("should refresh metadata if sheet exists", async () => {
      const mockMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };
      mockMetadataSheetExists.mockResolvedValue(true);
      mockFetchAllMetadata.mockResolvedValue(mockMetadata);
      mockWriteMetadataToSheet.mockResolvedValue(undefined);
      mockCreateNamedRanges.mockResolvedValue(undefined);

      await refreshMetadataOnLogin();

      expect(mockMetadataSheetExists).toHaveBeenCalled();
      expect(mockFetchAllMetadata).toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).toHaveBeenCalledWith(mockMetadata);
      expect(mockCreateNamedRanges).toHaveBeenCalled();
    });

    it("should not refresh metadata if sheet does not exist", async () => {
      mockMetadataSheetExists.mockResolvedValue(false);

      await refreshMetadataOnLogin();

      expect(mockMetadataSheetExists).toHaveBeenCalled();
      expect(mockFetchAllMetadata).not.toHaveBeenCalled();
      expect(mockWriteMetadataToSheet).not.toHaveBeenCalled();
      expect(mockCreateNamedRanges).not.toHaveBeenCalled();
    });

    it("should not throw error if refresh fails", async () => {
      mockMetadataSheetExists.mockResolvedValue(true);
      mockFetchAllMetadata.mockRejectedValue(new Error("API error"));

      await expect(refreshMetadataOnLogin()).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to refresh metadata on login:",
        expect.any(Error)
      );
    });

    it("should not throw error if sheet check fails", async () => {
      mockMetadataSheetExists.mockRejectedValue(new Error("Sheet check error"));

      await expect(refreshMetadataOnLogin()).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to refresh metadata on login:",
        expect.any(Error)
      );
    });
  });

  describe("concurrent metadata initialization", () => {
    it("should prevent concurrent initialization attempts", async () => {
      mockNeedsMetadataRefresh.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(false), 100))
      );
      mockInsertActivityTypeValidation.mockResolvedValue(undefined);

      // Start two concurrent operations
      const promise1 = handleInsertActivityTypes("stationary");
      const promise2 = handleInsertActivityTypes("location");

      await Promise.all([promise1, promise2]);

      // Should only check metadata refresh once
      expect(mockNeedsMetadataRefresh).toHaveBeenCalledTimes(1);
      // But should insert validation twice
      expect(mockInsertActivityTypeValidation).toHaveBeenCalledTimes(2);
    });
  });

  describe("metadata refresh interval", () => {
    it("should use 3-day refresh interval", async () => {
      mockNeedsMetadataRefresh.mockResolvedValue(false);
      mockInsertUnitValidation.mockResolvedValue(undefined);

      await handleInsertUnits();

      expect(mockNeedsMetadataRefresh).toHaveBeenCalledWith(3);
    });
  });
});

// Made with Bob
