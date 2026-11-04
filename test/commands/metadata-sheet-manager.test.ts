// Copyright IBM Corp. 2026

import { CompleteMetadata } from "../../src/commands/metadata-service";
import {
  createNamedRanges,
  deleteMetadataSheet,
  getActivityTypeRangeName,
  getAreaRangeName,
  getUnitsRangeName,
  METADATA_SHEET_NAME,
  metadataSheetExists,
  needsMetadataRefresh,
  readMetadataFromSheet,
  writeMetadataToSheet,
} from "../../src/commands/metadata-sheet-manager";

// Mock Excel API
const mockContext = {
  workbook: {
    worksheets: {
      add: jest.fn(),
      getItem: jest.fn(),
      getItemOrNullObject: jest.fn(),
    },
    names: {
      add: jest.fn(),
      getItemOrNullObject: jest.fn(),
    },
    properties: {
      custom: {
        add: jest.fn(),
        getItemOrNullObject: jest.fn(),
      },
    },
    application: {
      suspendScreenUpdatingUntilNextSync: jest.fn(),
    },
  },
  sync: jest.fn().mockResolvedValue(undefined),
};

const mockSheet = {
  isNullObject: false,
  visibility: null,
  getUsedRangeOrNullObject: jest.fn(),
  getRange: jest.fn(),
  getRangeByIndexes: jest.fn(),
  delete: jest.fn(),
};

const mockRange = {
  values: [],
  clear: jest.fn(),
  load: jest.fn(),
  isNullObject: false,
};

const mockNamedRange = {
  isNullObject: false,
  name: "TestRange",
  getRange: jest.fn().mockReturnValue(mockRange),
  delete: jest.fn(),
  load: jest.fn(),
};

const mockCustomProperty = {
  isNullObject: false,
  value: JSON.stringify({
    lastRefreshTimestamp: new Date().toISOString(),
    sheetExists: true,
  }),
  load: jest.fn(),
};

// Mock Excel.run
(global as any).Excel = {
  run: jest.fn((callback) => callback(mockContext)),
  SheetVisibility: {
    hidden: "hidden",
  },
  DataValidationAlertStyle: {
    stop: "stop",
  },
};

(global as any).Office = {
  context: {},
};

// A second named range mock for getRange().getUsedRange() chaining used in readMetadataFromSheet
const mockUsedRange = {
  address: "'_EnviziMetadata'!J:J",
  values: [["USA(United States)"], ["CAN(Canada)"]],
  load: jest.fn(),
};

describe("metadata-sheet-manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSheet.isNullObject = false;
    mockRange.isNullObject = false;
    mockNamedRange.isNullObject = false;
    mockCustomProperty.isNullObject = false;
    mockCustomProperty.value = JSON.stringify({
      lastRefreshTimestamp: new Date().toISOString(),
      sheetExists: true,
    });
    mockContext.workbook.worksheets.getItemOrNullObject.mockReturnValue(mockSheet);
    mockContext.workbook.names.getItemOrNullObject.mockReturnValue(mockNamedRange);
    mockContext.workbook.properties.custom.getItemOrNullObject.mockReturnValue(mockCustomProperty);
    mockSheet.getUsedRangeOrNullObject.mockReturnValue(mockRange);
    mockSheet.getRangeByIndexes.mockReturnValue(mockRange);
    mockSheet.getRange.mockReturnValue(mockRange);
    // readMetadataFromSheet: namedRange.getRange().getUsedRange(true)
    mockNamedRange.getRange.mockReturnValue({
      getUsedRange: jest.fn().mockReturnValue(mockUsedRange),
    });
    mockRange.load.mockReturnValue(mockRange);
    mockCustomProperty.load.mockReturnValue(mockCustomProperty);
    mockUsedRange.load.mockReturnValue(mockUsedRange);
    mockUsedRange.values = [["USA(United States)"], ["CAN(Canada)"]];
  });

  describe("metadataSheetExists", () => {
    it("should return true when sheet exists", async () => {
      mockSheet.isNullObject = false;

      const result = await metadataSheetExists();

      expect(result).toBe(true);
      expect(mockContext.workbook.worksheets.getItemOrNullObject).toHaveBeenCalledWith(
        METADATA_SHEET_NAME
      );
    });

    it("should return false when sheet does not exist", async () => {
      mockSheet.isNullObject = true;

      const result = await metadataSheetExists();

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      // Suppress expected console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockContext.sync.mockRejectedValueOnce(new Error("Test error"));

      const result = await metadataSheetExists();

      expect(result).toBe(false);

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe("deleteMetadataSheet", () => {
    it("should delete sheet when it exists", async () => {
      mockSheet.isNullObject = false;

      await deleteMetadataSheet();

      expect(mockSheet.delete).toHaveBeenCalled();
    });

    it("should not delete when sheet does not exist", async () => {
      mockSheet.isNullObject = true;

      await deleteMetadataSheet();

      expect(mockSheet.delete).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      // Suppress expected console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockContext.sync.mockRejectedValueOnce(new Error("Test error"));

      await expect(deleteMetadataSheet()).resolves.not.toThrow();

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe("needsMetadataRefresh", () => {
    it("should return true when sheet does not exist", async () => {
      mockSheet.isNullObject = true;

      const result = await needsMetadataRefresh(3);

      expect(result).toBe(true);
    });

    it("should return true when no state found", async () => {
      mockSheet.isNullObject = false;
      mockCustomProperty.isNullObject = true;

      const result = await needsMetadataRefresh(3);

      expect(result).toBe(true);
    });

    it("should return true when timestamp is old", async () => {
      mockSheet.isNullObject = false;
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5);
      mockCustomProperty.value = JSON.stringify({
        lastRefreshTimestamp: oldDate.toISOString(),
        sheetExists: true,
      });

      const result = await needsMetadataRefresh(3);

      expect(result).toBe(true);
    });

    it("should return false when timestamp is fresh", async () => {
      mockSheet.isNullObject = false;
      mockCustomProperty.isNullObject = false;
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 1);
      mockCustomProperty.value = JSON.stringify({
        lastRefreshTimestamp: recentDate.toISOString(),
        sheetExists: true,
      });

      const result = await needsMetadataRefresh(3);

      expect(result).toBe(false);
    });
  });

  describe("writeMetadataToSheet", () => {
    it("should write metadata to sheet successfully", async () => {
      const metadata: CompleteMetadata = {
        activityTypes: {
          location: ["Type1", "Type2"],
          stationary: ["Type3"],
        },
        areas: {
          countries: ["USA(United States)", "CAN(Canada)"],
          stateProvinces: ["California", "Ontario"],
          powerGrids: ["WECC", "NPCC"],
        },
        units: {
          units: ["kg(kilogram)", "t(metric ton)"],
        },
        timestamp: new Date().toISOString(),
      };

      mockContext.workbook.worksheets.add.mockReturnValue(mockSheet);
      mockSheet.isNullObject = true; // Sheet doesn't exist yet

      await writeMetadataToSheet(metadata);

      expect(mockContext.workbook.worksheets.add).toHaveBeenCalledWith(METADATA_SHEET_NAME);
    });

    it("should clear existing content before writing", async () => {
      const metadata: CompleteMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };

      mockRange.isNullObject = false;

      await writeMetadataToSheet(metadata);

      expect(mockRange.clear).toHaveBeenCalled();
    });

    it("should use suspendScreenUpdatingUntilNextSync for performance", async () => {
      const metadata: CompleteMetadata = {
        activityTypes: {},
        areas: { countries: [], stateProvinces: [], powerGrids: [] },
        units: { units: [] },
        timestamp: new Date().toISOString(),
      };

      const mockApplication = {
        suspendScreenUpdatingUntilNextSync: jest.fn(),
      };
      mockContext.workbook.application = mockApplication;

      await writeMetadataToSheet(metadata);

      expect(mockApplication.suspendScreenUpdatingUntilNextSync).toHaveBeenCalled();
    });

    it("should minimize sync calls for better performance", async () => {
      const metadata: CompleteMetadata = {
        activityTypes: {
          location: ["Type1"],
        },
        areas: { countries: ["USA(United States)"], stateProvinces: [], powerGrids: [] },
        units: { units: ["kg(kilogram)"] },
        timestamp: new Date().toISOString(),
      };

      mockContext.sync.mockClear();

      await writeMetadataToSheet(metadata);

      // Verify sync was called (exact count depends on implementation details)
      // The key is that it's batched, not called for each individual operation
      expect(mockContext.sync).toHaveBeenCalled();
      expect(mockContext.sync.mock.calls.length).toBeLessThan(10); // Much less than unbatched
    });
  });

  // ── setMetadataState branches (exercised via writeMetadataToSheet) ─────────

  describe("setMetadataState branches", () => {
    const minimalMetadata: CompleteMetadata = {
      activityTypes: {},
      areas: { countries: [], stateProvinces: [], powerGrids: [] },
      units: { units: [] },
      timestamp: "2026-01-01T00:00:00.000Z",
    };

    it("should update an existing custom property when stateProperty.isNullObject is false", async () => {
      mockCustomProperty.isNullObject = false;

      await writeMetadataToSheet(minimalMetadata);

      // update path: add() must NOT be called
      expect(mockContext.workbook.properties.custom.add).not.toHaveBeenCalled();
    });

    it("should add a new custom property when stateProperty.isNullObject is true", async () => {
      mockCustomProperty.isNullObject = true;

      await writeMetadataToSheet(minimalMetadata);

      expect(mockContext.workbook.properties.custom.add).toHaveBeenCalledWith(
        "EnviziMetadataState",
        expect.any(String)
      );
    });

    it("should reject when setMetadataState sync throws", async () => {
      jest.spyOn(console, "error").mockImplementation();
      // syncs: (1) getOrCreate check, (2) getOrCreate sheet-add,
      // (3) clear+write batch, (4) setMetadataState getItemOrNullObject, (5) setMetadataState final
      mockContext.sync
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("property write failed"));

      await expect(writeMetadataToSheet(minimalMetadata)).rejects.toThrow("property write failed");
    });
  });

  // ── writeMetadataToSheet error handling ────────────────────────────────────

  describe("writeMetadataToSheet error handling", () => {
    it("should reject when the first sync inside Excel.run throws", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockContext.sync.mockRejectedValueOnce(new Error("write failed"));

      await expect(
        writeMetadataToSheet({
          activityTypes: {},
          areas: { countries: [], stateProvinces: [], powerGrids: [] },
          units: { units: [] },
          timestamp: "2026-01-01T00:00:00.000Z",
        })
      ).rejects.toThrow("write failed");
    });

    it("should wrap a non-Error throw in an Error instance", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockContext.sync.mockRejectedValueOnce("string error");

      await expect(
        writeMetadataToSheet({
          activityTypes: {},
          areas: { countries: [], stateProvinces: [], powerGrids: [] },
          units: { units: [] },
          timestamp: "2026-01-01T00:00:00.000Z",
        })
      ).rejects.toBeInstanceOf(Error);
    });
  });

  // ── createNamedRanges error + skip-empty-column ────────────────────────────

  describe("createNamedRanges additional branches", () => {
    it("should skip creating a named range when the first cell is empty string", async () => {
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      // All first-cell values are empty → no named ranges created
      mockRange.values = [[""]];

      await createNamedRanges();

      expect(mockContext.workbook.names.add).not.toHaveBeenCalled();
    });

    it("should skip creating a named range when the first cell value is null", async () => {
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockRange.values = [[null]];

      await createNamedRanges();

      expect(mockContext.workbook.names.add).not.toHaveBeenCalled();
    });

    it("should reject when sync throws inside createNamedRanges", async () => {
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockContext.sync.mockRejectedValueOnce(new Error("named range error"));

      await expect(createNamedRanges()).rejects.toThrow("named range error");
    });

    it("should wrap non-Error throws in createNamedRanges in an Error", async () => {
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockContext.sync.mockRejectedValueOnce("raw string");

      await expect(createNamedRanges()).rejects.toBeInstanceOf(Error);
    });
  });

  describe("createNamedRanges", () => {
    it("should create named ranges successfully", async () => {
      mockSheet.isNullObject = false;
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockContext.workbook.worksheets.getItemOrNullObject.mockReturnValue(mockSheet);
      mockRange.values = [["Type1"], ["Type2"], [""]];
      mockNamedRange.isNullObject = true; // Named range doesn't exist

      await createNamedRanges();

      expect(mockContext.workbook.names.add).toHaveBeenCalled();
    });

    it("should delete existing named range before creating new one", async () => {
      mockSheet.isNullObject = false;
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockContext.workbook.worksheets.getItemOrNullObject.mockReturnValue(mockSheet);
      mockRange.values = [["Type1"]];
      mockNamedRange.isNullObject = false; // Named range exists

      await createNamedRanges();

      expect(mockNamedRange.delete).toHaveBeenCalled();
      expect(mockContext.workbook.names.add).toHaveBeenCalled();
    });

    it("should use suspendScreenUpdatingUntilNextSync for performance", async () => {
      mockSheet.isNullObject = false;
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockRange.values = [["Type1"]];

      await createNamedRanges();

      expect(
        mockContext.workbook.application.suspendScreenUpdatingUntilNextSync
      ).toHaveBeenCalled();
    });

    it("should batch load operations for better performance", async () => {
      mockSheet.isNullObject = false;
      mockContext.workbook.worksheets.getItem = jest.fn().mockReturnValue(mockSheet);
      mockRange.values = [["Type1"]];
      mockContext.sync.mockClear();

      await createNamedRanges();

      // Should have optimized sync calls (batch loading)
      expect(mockContext.sync).toHaveBeenCalledTimes(3); // Load cells, load ranges, apply changes
    });
  });

  describe("getActivityTypeRangeName", () => {
    it("should return correct range name for activity types", () => {
      expect(getActivityTypeRangeName("location")).toBe("ActivityType_location");
      expect(getActivityTypeRangeName("stationary")).toBe("ActivityType_stationary");
      expect(getActivityTypeRangeName("mobile")).toBe("ActivityType_mobile");
    });

    it("should handle transportation-and-distribution with underscores", () => {
      expect(getActivityTypeRangeName("transportation-and-distribution")).toBe(
        "ActivityType_transportation_and_distribution"
      );
    });

    it("should return calculation range for all", () => {
      expect(getActivityTypeRangeName("all")).toBe("ActivityType_calculation");
    });
  });

  describe("getAreaRangeName", () => {
    it("should return correct range name for area types", () => {
      expect(getAreaRangeName("country")).toBe("Area_Country");
      expect(getAreaRangeName("stateprovince")).toBe("Area_StateProvince");
      expect(getAreaRangeName("powergrid")).toBe("Area_PowerGrid");
    });
  });

  describe("getUnitsRangeName", () => {
    it("should return correct range name for units", () => {
      expect(getUnitsRangeName()).toBe("Units_All");
    });
  });

  // ── readMetadataFromSheet ───────────────────────────────────────────────────

  describe("readMetadataFromSheet", () => {
    beforeEach(() => {
      mockContext.workbook.worksheets.getItemOrNullObject.mockReturnValue(mockSheet);
      mockSheet.isNullObject = false;
      mockNamedRange.isNullObject = false;
      mockUsedRange.values = [["USA(United States)"], ["CAN(Canada)"]];
      mockNamedRange.getRange.mockReturnValue({
        getUsedRange: jest.fn().mockReturnValue(mockUsedRange),
      });
    });

    it("should return null when the metadata sheet does not exist", async () => {
      jest.spyOn(console, "warn").mockImplementation();
      mockSheet.isNullObject = true;

      const result = await readMetadataFromSheet();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith("Metadata sheet not found.");
    });

    it("should return null when a required named range is missing", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockNamedRange.isNullObject = true;

      const result = await readMetadataFromSheet();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith("One or more named ranges are missing.");
    });

    it("should return parsed countries, stateProvinces, and units", async () => {
      const countryUsed = { values: [["USA(United States)"], ["CAN(Canada)"]], load: jest.fn() };
      const stateUsed = { values: [["California"], ["Ontario"]], load: jest.fn() };
      const unitUsed = { values: [["kg(kilogram)"], ["t(metric ton)"]], load: jest.fn() };

      let callCount = 0;
      mockContext.workbook.names.getItemOrNullObject.mockImplementation(() => {
        const usedRanges = [countryUsed, stateUsed, unitUsed];
        const used = usedRanges[callCount % 3];
        callCount++;
        return {
          isNullObject: false,
          load: jest.fn(),
          getRange: jest.fn().mockReturnValue({
            getUsedRange: jest.fn().mockReturnValue(used),
          }),
        };
      });

      const result = await readMetadataFromSheet();

      expect(result).not.toBeNull();
      expect(result!.countries).toEqual(["USA(United States)", "CAN(Canada)"]);
      expect(result!.stateProvinces).toEqual(["California", "Ontario"]);
      expect(result!.units).toEqual(["kg(kilogram)", "t(metric ton)"]);
    });

    it("should filter out empty and whitespace-only values", async () => {
      const usedWithBlanks = {
        values: [["USA(United States)"], [""], ["  "], [null], ["CAN(Canada)"]],
        load: jest.fn(),
      };

      mockContext.workbook.names.getItemOrNullObject.mockReturnValue({
        isNullObject: false,
        load: jest.fn(),
        getRange: jest.fn().mockReturnValue({
          getUsedRange: jest.fn().mockReturnValue(usedWithBlanks),
        }),
      });

      const result = await readMetadataFromSheet();

      expect(result).not.toBeNull();
      expect(result!.countries).toEqual(["USA(United States)", "CAN(Canada)"]);
    });

    it("should return empty arrays when used range values are empty", async () => {
      const emptyUsed = { values: [], load: jest.fn() };

      mockContext.workbook.names.getItemOrNullObject.mockReturnValue({
        isNullObject: false,
        load: jest.fn(),
        getRange: jest.fn().mockReturnValue({
          getUsedRange: jest.fn().mockReturnValue(emptyUsed),
        }),
      });

      const result = await readMetadataFromSheet();

      expect(result).not.toBeNull();
      expect(result!.countries).toEqual([]);
      expect(result!.stateProvinces).toEqual([]);
      expect(result!.units).toEqual([]);
    });

    it("should return null and log error when Excel.run throws", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockContext.sync.mockRejectedValueOnce(new Error("read failed"));

      const result = await readMetadataFromSheet();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to read metadata from sheet:",
        expect.any(Error)
      );
    });
  });
});

// Made with Bob
