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

describe("metadata-sheet-manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContext.workbook.worksheets.getItemOrNullObject.mockReturnValue(mockSheet);
    mockContext.workbook.names.getItemOrNullObject.mockReturnValue(mockNamedRange);
    mockContext.workbook.properties.custom.getItemOrNullObject.mockReturnValue(mockCustomProperty);
    mockSheet.getUsedRangeOrNullObject.mockReturnValue(mockRange);
    mockSheet.getRangeByIndexes.mockReturnValue(mockRange);
    mockSheet.getRange.mockReturnValue(mockRange);
    mockNamedRange.getRange.mockReturnValue(mockRange);
    mockRange.load.mockReturnValue(mockRange);
    mockCustomProperty.load.mockReturnValue(mockCustomProperty);
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
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
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
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
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

      expect(mockContext.workbook.application.suspendScreenUpdatingUntilNextSync).toHaveBeenCalled();
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
});

// Made with Bob
