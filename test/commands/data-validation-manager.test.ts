// Copyright IBM Corp. 2026

import {
  insertActivityTypeValidation,
  insertAreaValidation,
  insertUnitValidation,
} from "../../src/commands/data-validation-manager";
import * as metadataSheetManager from "../../src/commands/metadata-sheet-manager";

// Mock dependencies
jest.mock("../../src/commands/metadata-sheet-manager");

const mockGetActivityTypeRangeName =
  metadataSheetManager.getActivityTypeRangeName as jest.MockedFunction<
    typeof metadataSheetManager.getActivityTypeRangeName
  >;
const mockGetAreaRangeName = metadataSheetManager.getAreaRangeName as jest.MockedFunction<
  typeof metadataSheetManager.getAreaRangeName
>;
const mockGetUnitsRangeName = metadataSheetManager.getUnitsRangeName as jest.MockedFunction<
  typeof metadataSheetManager.getUnitsRangeName
>;

// Mock Excel API
const mockSelectedRange = {
  address: "A1:A10",
  dataValidation: {
    clear: jest.fn(),
    rule: null,
    errorAlert: null,
    prompt: null,
  },
  load: jest.fn(),
};

const mockContext = {
  workbook: {
    getSelectedRange: jest.fn().mockReturnValue(mockSelectedRange),
    names: {
      getItemOrNullObject: jest.fn(),
    },
  },
  sync: jest.fn().mockResolvedValue(undefined),
};

const mockNamedRange = {
  isNullObject: false,
  name: "TestRange",
  getRange: jest.fn(),
  load: jest.fn(),
};

(global as any).Excel = {
  run: jest.fn((callback) => callback(mockContext)),
  DataValidationAlertStyle: {
    stop: "stop",
  },
};

describe("data-validation-manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContext.workbook.names.getItemOrNullObject.mockReturnValue(mockNamedRange);
    mockGetActivityTypeRangeName.mockReturnValue("ActivityType_location");
    mockGetAreaRangeName.mockReturnValue("Area_Country");
    mockGetUnitsRangeName.mockReturnValue("Units_All");
    mockSelectedRange.load.mockReturnValue(mockSelectedRange);
    mockNamedRange.load.mockReturnValue(mockNamedRange);
  });

  describe("insertActivityTypeValidation", () => {
    it("should apply validation for location activity type", async () => {
      await insertActivityTypeValidation("location");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("location");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
      expect(mockContext.sync).toHaveBeenCalled();
    });

    it("should apply validation for all activity types", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_calculation");

      await insertActivityTypeValidation("all");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("all");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
    });


    it("should apply validation for stationary activity type", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_stationary");

      await insertActivityTypeValidation("stationary");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("stationary");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
    });

    it("should apply validation for mobile activity type", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_mobile");

      await insertActivityTypeValidation("mobile");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("mobile");
    });

    it("should apply validation for fugitive activity type", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_fugitive");

      await insertActivityTypeValidation("fugitive");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("fugitive");
    });

    it("should apply validation for transportation-and-distribution", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_transportation_and_distribution");

      await insertActivityTypeValidation("transportation-and-distribution");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("transportation-and-distribution");
    });

    it("should apply validation for economic-activity", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_economic_activity");

      await insertActivityTypeValidation("economic-activity");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("economic-activity");
    });

    it("should apply validation for real-estate", async () => {
      mockGetActivityTypeRangeName.mockReturnValue("ActivityType_real_estate");

      await insertActivityTypeValidation("real-estate");

      expect(mockGetActivityTypeRangeName).toHaveBeenCalledWith("real-estate");
    });

    it("should handle errors gracefully", async () => {
      mockContext.sync.mockRejectedValueOnce(new Error("Excel API Error"));

      await expect(insertActivityTypeValidation("location")).rejects.toThrow();
    });

    it("should check if named range exists before applying validation", async () => {
      await insertActivityTypeValidation("location");

      // Verify getItemOrNullObject was called to check named range existence
      expect(mockContext.workbook.names.getItemOrNullObject).toHaveBeenCalledWith("ActivityType_location");
      expect(mockContext.sync).toHaveBeenCalled();
    });

    it("should throw error when named range does not exist", async () => {
      const nullNamedRange = {
        isNullObject: true,
        name: "",
        getRange: jest.fn(),
        load: jest.fn(),
      };
      mockContext.workbook.names.getItemOrNullObject.mockReturnValue(nullNamedRange);

      await expect(insertActivityTypeValidation("location")).rejects.toThrow(
        "Data not available"
      );
    });

    it("should apply validation when named range exists", async () => {
      mockNamedRange.isNullObject = false;
      mockContext.workbook.names.getItemOrNullObject.mockReturnValue(mockNamedRange);

      await insertActivityTypeValidation("location");

      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
      expect(mockSelectedRange.dataValidation.rule).toBeDefined();
    });
  });

  describe("insertAreaValidation", () => {
    it("should apply validation for country", async () => {
      await insertAreaValidation("country");

      expect(mockGetAreaRangeName).toHaveBeenCalledWith("country");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
      expect(mockContext.sync).toHaveBeenCalled();
    });

    it("should apply validation for stateprovince", async () => {
      mockGetAreaRangeName.mockReturnValue("Area_StateProvince");

      await insertAreaValidation("stateprovince");

      expect(mockGetAreaRangeName).toHaveBeenCalledWith("stateprovince");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
    });

    it("should apply validation for powergrid", async () => {
      mockGetAreaRangeName.mockReturnValue("Area_PowerGrid");

      await insertAreaValidation("powergrid");

      expect(mockGetAreaRangeName).toHaveBeenCalledWith("powergrid");
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockContext.sync.mockRejectedValueOnce(new Error("Excel API Error"));

      await expect(insertAreaValidation("country")).rejects.toThrow();
    });
  });

  describe("insertUnitValidation", () => {
    it("should apply validation for units", async () => {
      await insertUnitValidation();

      expect(mockGetUnitsRangeName).toHaveBeenCalled();
      expect(mockSelectedRange.dataValidation.clear).toHaveBeenCalled();
      expect(mockContext.sync).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockContext.sync.mockRejectedValueOnce(new Error("Excel API Error"));

      await expect(insertUnitValidation()).rejects.toThrow();
    });
  });

  describe("data validation properties", () => {
    it("should set correct validation rule", async () => {
      await insertActivityTypeValidation("location");

      expect(mockSelectedRange.dataValidation.rule).toEqual({
        list: {
          inCellDropDown: true,
          source: "=ActivityType_location",
        },
      });
    });

    it("should set error alert", async () => {
      await insertActivityTypeValidation("location");

      expect(mockSelectedRange.dataValidation.errorAlert).toEqual({
        message: expect.any(String),
        showAlert: true,
        style: "stop",
        title: "Invalid Value",
      });
    });

    it("should set input prompt", async () => {
      await insertActivityTypeValidation("location");

      expect(mockSelectedRange.dataValidation.prompt).toEqual({
        message: "Select an activity type from the dropdown or start typing to search the list.",
        showPrompt: true,
        title: "Activity Type",
      });
    });
  });

  describe("performance optimization", () => {
    it("should minimize sync calls per validation", async () => {
      await insertActivityTypeValidation("location");

      // Should have 2 syncs: 1 for named range check + 1 for applying validation
      // This is optimized - the named range check piggybacks on the first sync
      expect(mockContext.sync).toHaveBeenCalledTimes(2);
    });

    it("should not load unnecessary properties", async () => {
      await insertActivityTypeValidation("location");

      // Should not load selected range address (optimization)
      expect(mockSelectedRange.load).not.toHaveBeenCalled();
    });

    it("should check named range existence with zero additional cost", async () => {
      mockContext.sync.mockClear();
      
      await insertActivityTypeValidation("location");

      // Named range check happens in the same sync as getting selected range
      // So it adds zero additional sync calls compared to not checking
      expect(mockContext.sync).toHaveBeenCalledTimes(2);
    });
  });
});

// Made with Bob
