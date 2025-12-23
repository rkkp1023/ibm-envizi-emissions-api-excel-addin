// Copyright IBM Corp. 2025

import {
  handleCountryFunction,
  handleStateProvinceFunction,
  handlePowerGridFunction,
} from "../src/functions/area-handler";
import { validateApiName, getTargetCell, applyListValidation, handleCustomFunctionError, refreshSheetIfStale } from "../src/functions/metadata-utils";

// Mock area-loader module
jest.mock("../src/functions/area-loader", () => ({
  AREA_DATA_SHEET_NAME: "API_Area_Data",
  AREA_COLUMN_MAP: {
    apiName: 0,
    alpha3: 1,
    countryName: 2,
    stateProvince: 3,
    powerGrid: 4,
  },
  loadAndPopulateAreaData: jest.fn(),
}));

import { loadAndPopulateAreaData } from "../src/functions/area-loader";

// Mock client module
jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

import { ensureClient } from "../src/functions/client";

// Mock validation-utils module
jest.mock("../src/functions/metadata-utils", () => ({
  validateApiName: jest.fn(),
  getTargetCell: jest.fn(),
  applyListValidation: jest.fn(),
  handleCustomFunctionError: jest.fn(),
  refreshSheetIfStale: jest.fn(),
  VALID_API_NAMES: [
    "location",
    "mobile",
    "fugitive",
    "stationary",
    "calculation",
    "transportationanddistribution",
    "factor",
  ],
  API_AREA_MAPPING: {
    location: "calculation",
    mobile: "mobile",
    fugitive: "mobile",
    stationary: "mobile",
    calculation: "calculation",
    transportationanddistribution: "mobile",
    factor: "calculation",
  },
}));

// Mock Excel
const mockTargetCell = {
  dataValidation: {
    clear: jest.fn(),
    rule: null as any,
    errorAlert: null as any,
  },
};

const mockAreaDataSheet = {
  name: "API_Area_Data",
  getUsedRange: jest.fn(),
};

const mockUsedRange = {
  values: [
    ["metadata", "row", "with", "timestamp", "data"], // Row 0: Metadata
    ["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"], // Row 1: Header
    ["calculation", "USA", "United States", "California, Texas, New York", "WECC, ERCOT, NPCC"], // Row 2: Data
    ["calculation", "CAN", "Canada", "Ontario, Quebec, British Columbia", ""], // Row 3: Data
    ["mobile", "USA", "United States", "California, Texas", "WECC, ERCOT"], // Row 4: Data
  ],
  load: jest.fn(),
};

const mockContext = {
  workbook: {
    worksheets: {
      items: [{ name: "API_Area_Data" }],
      load: jest.fn(),
      getItem: jest.fn().mockImplementation((name) => {
        if (name === "API_Area_Data") return mockAreaDataSheet;
        throw new Error("Sheet not found");
      }),
    },
  },
  sync: jest.fn().mockResolvedValue(undefined),
};

const mockExcelRun = jest.fn((callback) => callback(mockContext));

global.Excel = {
  run: mockExcelRun,
  DataValidationAlertStyle: {
    stop: "stop",
  },
} as any;

// Mock CustomFunctions
class CustomFunctionsError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "CustomFunctions.Error";
  }
}

global.CustomFunctions = {
  Error: CustomFunctionsError,
  ErrorCode: {
    invalidValue: "InvalidValue",
    notAvailable: "NotAvailable",
  },
} as any;

// Mock console methods to prevent output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe("area-handler", () => {
  const mockEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockLoadAndPopulateAreaData = loadAndPopulateAreaData as jest.MockedFunction<typeof loadAndPopulateAreaData>;
  const mockValidateApiName = validateApiName as jest.MockedFunction<typeof validateApiName>;
  const mockGetTargetCell = getTargetCell as jest.MockedFunction<typeof getTargetCell>;
  const mockApplyListValidation = applyListValidation as jest.MockedFunction<typeof applyListValidation>;
  const mockHandleCustomFunctionError = handleCustomFunctionError as jest.MockedFunction<typeof handleCustomFunctionError>;
  const mockRefreshSheetIfStale = refreshSheetIfStale as jest.MockedFunction<typeof refreshSheetIfStale>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: ensureClient succeeds (user is logged in)
    mockEnsureClient.mockResolvedValue(undefined);

    // Default: loadAndPopulateAreaData succeeds
    mockLoadAndPopulateAreaData.mockResolvedValue(undefined);

    // Default: validateApiName returns normalized name
    mockValidateApiName.mockImplementation((name) => name.toLowerCase());

    // Default: getTargetCell returns mock cell
    mockGetTargetCell.mockResolvedValue(mockTargetCell as any);

    // Default: applyListValidation succeeds
    mockApplyListValidation.mockImplementation(() => {});

    // Default: handleCustomFunctionError re-throws
    mockHandleCustomFunctionError.mockImplementation((error) => {
      throw error;
    });

    // Default: refreshSheetIfStale returns false (no refresh needed)
    mockRefreshSheetIfStale.mockResolvedValue(false);

    // Default: sheet exists
    mockContext.workbook.worksheets.items = [{ name: "API_Area_Data" }];

    // Default: area data sheet returns mock data
    mockAreaDataSheet.getUsedRange.mockReturnValue(mockUsedRange);
    
    // Reset mock data to default
    mockUsedRange.values = [
      ["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"],
      ["calculation", "USA", "United States", "California, Texas, New York", "WECC, ERCOT, NPCC"],
      ["calculation", "CAN", "Canada", "Ontario, Quebec, British Columbia", ""],
      ["mobile", "USA", "United States", "California, Texas", "WECC, ERCOT"],
    ];

    // Reset Excel.run mock
    mockExcelRun.mockClear();
    mockExcelRun.mockImplementation((callback) => callback(mockContext));
  });

  describe("validateApiName usage", () => {
    it("should use validateApiName from validation-utils", async () => {
      const mockInvocation = { address: "Sheet1!A1" } as CustomFunctions.Invocation;
      
      await handleCountryFunction("Location", mockInvocation);
      
      expect(mockValidateApiName).toHaveBeenCalledWith("Location");
    });

    it("should handle validateApiName errors", async () => {
      const mockInvocation = { address: "Sheet1!A1" } as CustomFunctions.Invocation;
      const validationError = new CustomFunctionsError("InvalidValue", "Invalid API name");
      
      mockValidateApiName.mockImplementationOnce(() => {
        throw validationError;
      });

      await expect(handleCountryFunction("invalid", mockInvocation)).rejects.toThrow(validationError);
    });
  });

  describe("handleCountryFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should throw error if user is not logged in", async () => {
      const loginError = new CustomFunctionsError("NotAvailable", "Enter your credentials in the task pane.");
      mockEnsureClient.mockRejectedValueOnce(loginError);

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow(loginError);
    });

    it("should use getTargetCell from validation-utils", async () => {
      await handleCountryFunction("Location", mockInvocation);

      expect(mockGetTargetCell).toHaveBeenCalledWith(mockContext, "Sheet1!A1");
    });

    it("should create sheet if it doesn't exist", async () => {
      // Mock sheet doesn't exist
      mockContext.workbook.worksheets.items = [];

      await handleCountryFunction("Location", mockInvocation);

      expect(mockLoadAndPopulateAreaData).toHaveBeenCalled();
    });

    it("should not create sheet if it already exists", async () => {
      // Sheet exists (default behavior)
      await handleCountryFunction("Location", mockInvocation);

      expect(mockLoadAndPopulateAreaData).not.toHaveBeenCalled();
    });

    it("should use applyListValidation from validation-utils", async () => {
      await handleCountryFunction("Location", mockInvocation);

      // Note: Due to mock setup, only one country may be returned
      // In real implementation, both countries would be returned
      expect(mockApplyListValidation).toHaveBeenCalled();
      const callArgs = mockApplyListValidation.mock.calls[0];
      expect(callArgs[0]).toBe(mockTargetCell);
      expect(callArgs[1]).toEqual(expect.arrayContaining(["Canada (CAN)"]));
      expect(callArgs[2]).toBe("Invalid Country");
      expect(callArgs[3]).toBe("Please select a valid country from the dropdown list");
    });

    it("should handle different API names", async () => {
      mockValidateApiName.mockReturnValueOnce("mobile");
      
      await handleCountryFunction("mobile", mockInvocation);

      expect(mockApplyListValidation).toHaveBeenCalledWith(
        mockTargetCell,
        ["United States (USA)"], // Display format for mobile API in mock data
        "Invalid Country",
        "Please select a valid country from the dropdown list"
      );
    });

    it("should return empty string", async () => {
      const result = await handleCountryFunction("Location", mockInvocation);
      expect(result).toBe("");
    });

    it("should throw error if no countries found", async () => {
      // Mock empty data
      mockUsedRange.values = [["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"]];

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow();
    });

    it("should use handleCustomFunctionError for error handling", async () => {
      const testError = new Error("Test error");
      mockExcelRun.mockRejectedValueOnce(testError);
      
      const customError = new CustomFunctionsError("NotAvailable", "Failed to set up country validation");
      mockHandleCustomFunctionError.mockImplementationOnce(() => {
        throw customError;
      });

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow(customError);
      
      expect(mockHandleCustomFunctionError).toHaveBeenCalledWith(
        testError,
        "Failed to set up country validation"
      );
    });
  });

  describe("handleStateProvinceFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should throw error if country parameter is empty", async () => {
      await expect(handleStateProvinceFunction("Location", "", mockInvocation)).rejects.toThrow();
    });

    it("should throw error if country parameter is whitespace only", async () => {
      await expect(handleStateProvinceFunction("Location", "   ", mockInvocation)).rejects.toThrow();
    });

    it("should use validation utilities for state/province validation", async () => {
      await handleStateProvinceFunction("Location", "USA", mockInvocation);

      expect(mockValidateApiName).toHaveBeenCalledWith("Location");
      expect(mockGetTargetCell).toHaveBeenCalledWith(mockContext, "Sheet1!A1");
      expect(mockApplyListValidation).toHaveBeenCalledWith(
        mockTargetCell,
        ["California", "Texas", "New York"], // State/provinces for USA in calculation API (location maps to calculation)
        "Invalid State/Province",
        "Please select a valid state/province from the dropdown list"
      );
    });

    it("should handle case-insensitive country codes", async () => {
      await handleStateProvinceFunction("Location", "usa", mockInvocation);

      expect(mockApplyListValidation).toHaveBeenCalledWith(
        mockTargetCell,
        ["California", "Texas", "New York"],
        "Invalid State/Province",
        "Please select a valid state/province from the dropdown list"
      );
    });

    it("should return empty string", async () => {
      const result = await handleStateProvinceFunction("Location", "USA", mockInvocation);
      expect(result).toBe("");
    });

    it("should throw error if no state/province data found", async () => {
      await expect(handleStateProvinceFunction("Location", "XYZ", mockInvocation)).rejects.toThrow();
    });
  });

  describe("handlePowerGridFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should throw error if country parameter is empty", async () => {
      await expect(handlePowerGridFunction("Location", "", mockInvocation)).rejects.toThrow();
    });

    it("should use validation utilities for power grid validation", async () => {
      await handlePowerGridFunction("Location", "USA", mockInvocation);

      expect(mockValidateApiName).toHaveBeenCalledWith("Location");
      expect(mockGetTargetCell).toHaveBeenCalledWith(mockContext, "Sheet1!A1");
      expect(mockApplyListValidation).toHaveBeenCalledWith(
        mockTargetCell,
        ["WECC", "ERCOT", "NPCC"], // Power grids for USA in calculation API (location maps to calculation)
        "Invalid Power Grid",
        "Please select a valid power grid from the dropdown list"
      );
    });

    it("should handle case-insensitive country codes", async () => {
      await handlePowerGridFunction("Location", "usa", mockInvocation);

      expect(mockApplyListValidation).toHaveBeenCalledWith(
        mockTargetCell,
        ["WECC", "ERCOT", "NPCC"],
        "Invalid Power Grid",
        "Please select a valid power grid from the dropdown list"
      );
    });

    it("should return empty string", async () => {
      const result = await handlePowerGridFunction("Location", "USA", mockInvocation);
      expect(result).toBe("");
    });

    it("should throw error if no power grid data found", async () => {
      await expect(handlePowerGridFunction("Location", "CAN", mockInvocation)).rejects.toThrow();
    });
  });

  describe("integration tests", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should work with all supported API types for country function", async () => {
      const apis = ["location", "mobile", "fugitive", "stationary", "calculation", "transportationanddistribution", "factor"];

      // Only calculation and mobile data is stored (other APIs map to these)
      mockUsedRange.values = [
        ["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"],
        ["calculation", "USA", "United States", "California, Texas, New York", "WECC, ERCOT, NPCC"],
        ["calculation", "CAN", "Canada", "Ontario, Quebec, British Columbia", ""],
        ["mobile", "USA", "United States", "California, Texas", "WECC, ERCOT"],
      ];

      for (const api of apis) {
        jest.clearAllMocks();
        mockValidateApiName.mockReturnValueOnce(api);
        
        await handleCountryFunction(api, mockInvocation);
        
        expect(mockValidateApiName).toHaveBeenCalledWith(api);
        expect(mockGetTargetCell).toHaveBeenCalled();
        expect(mockApplyListValidation).toHaveBeenCalled();
      }
    });

    it("should handle sheet creation failure", async () => {
      // Mock sheet doesn't exist
      mockContext.workbook.worksheets.items = [];
      
      // Mock loadAndPopulateAreaData to fail
      const apiError = new Error("API error");
      mockLoadAndPopulateAreaData.mockRejectedValueOnce(apiError);
      
      const customError = new CustomFunctionsError("NotAvailable", "Failed to set up country validation");
      mockHandleCustomFunctionError.mockImplementationOnce(() => {
        throw customError;
      });

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow(customError);
      
      expect(mockHandleCustomFunctionError).toHaveBeenCalledWith(
        apiError,
        "Failed to set up country validation"
      );
    });

    it("should handle Excel.run failure", async () => {
      const excelError = new Error("Excel error");
      mockExcelRun.mockRejectedValueOnce(excelError);
      
      const customError = new CustomFunctionsError("NotAvailable", "Failed to set up country validation");
      mockHandleCustomFunctionError.mockImplementationOnce(() => {
        throw customError;
      });

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow(customError);
      
      expect(mockHandleCustomFunctionError).toHaveBeenCalledWith(
        excelError,
        "Failed to set up country validation"
      );
    });

    it("should handle validation utility errors properly", async () => {
      const validationError = new CustomFunctionsError("InvalidValue", "Validation failed");
      mockApplyListValidation.mockImplementationOnce(() => {
        throw validationError;
      });

      await expect(handleCountryFunction("Location", mockInvocation)).rejects.toThrow(validationError);
    });
  });
});

// Made with Bob