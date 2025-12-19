// Copyright IBM Corp. 2025

import { handleTypesFunction } from "../src/functions/types-handler";
import { validateApiName, refreshSheetIfStale } from "../src/functions/metadata-utils";

// Mock api-types-loader module
jest.mock("../src/functions/api-types-loader", () => ({
  API_COLUMN_MAP: {
    location: 0,
    mobile: 1,
    fugitive: 2,
    stationary: 3,
    calculation: 4,
    transportationanddistribution: 5,
    factor: 4,
  },
  loadAndPopulateApiTypes: jest.fn(),
}));

import { loadAndPopulateApiTypes } from "../src/functions/api-types-loader";

// Mock client module
jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

import { ensureClient } from "../src/functions/client";

// Mock metadata-utils
jest.mock("../src/functions/metadata-utils", () => ({
  ...jest.requireActual("../src/functions/metadata-utils"),
  refreshSheetIfStale: jest.fn(),
}));

// Mock Excel
const mockTargetCell = {
  dataValidation: {
    clear: jest.fn(),
    rule: null as any,
    errorAlert: null as any,
  },
};

const mockDataRange = {
  values: [["type1"], ["type2"], ["type3"]],
  load: jest.fn(),
};

const mockUsedRange = {
  rowCount: 4,
  rowIndex: 0,
  load: jest.fn(),
};

const mockColumn = {
  getUsedRange: jest.fn().mockReturnValue(mockUsedRange),
};

const mockApiTypesSheet = {
  name: "API_Types_Data",
  getRange: jest.fn().mockImplementation((address) => {
    if (address.includes("3:")) {
      return mockDataRange;
    }
    return mockColumn;
  }),
};

const mockTargetSheet = {
  name: "Sheet1",
  getRange: jest.fn().mockReturnValue(mockTargetCell),
};

const mockContext = {
  workbook: {
    worksheets: {
      items: [{ name: "API_Types_Data" }],
      load: jest.fn(),
      getItem: jest.fn().mockImplementation((name) => {
        if (name === "API_Types_Data") return mockApiTypesSheet;
        return mockTargetSheet;
      }),
      getActiveWorksheet: jest.fn().mockReturnValue(mockTargetSheet),
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

describe("types-handler", () => {
  const mockEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockLoadAndPopulateApiTypes = loadAndPopulateApiTypes as jest.MockedFunction<typeof loadAndPopulateApiTypes>;
  const mockRefreshSheetIfStale = refreshSheetIfStale as jest.MockedFunction<typeof refreshSheetIfStale>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default: ensureClient succeeds (user is logged in)
    mockEnsureClient.mockResolvedValue(undefined);
    
    // Default: loadAndPopulateApiTypes succeeds
    mockLoadAndPopulateApiTypes.mockResolvedValue(undefined);
    
    // Default: refreshSheetIfStale returns false (no refresh needed)
    mockRefreshSheetIfStale.mockResolvedValue(false);
    
    // Default: sheet exists
    mockContext.workbook.worksheets.items = [{ name: "API_Types_Data" }];
    
    // Reset Excel.run mock
    mockExcelRun.mockClear();
    mockExcelRun.mockImplementation((callback) => callback(mockContext));
  });

  describe("validateApiName", () => {
    it("should validate and normalize valid API names", () => {
      expect(validateApiName("Location")).toBe("location");
      expect(validateApiName("MOBILE")).toBe("mobile");
      expect(validateApiName("  fugitive  ")).toBe("fugitive");
      expect(validateApiName("Stationary")).toBe("stationary");
      expect(validateApiName("CALCULATION")).toBe("calculation");
      expect(validateApiName("TransportationAndDistribution")).toBe("transportationanddistribution");
      expect(validateApiName("Factor")).toBe("factor");
    });

    it("should throw error for invalid API names", () => {
      expect(() => validateApiName("invalid")).toThrow();
      expect(() => validateApiName("")).toThrow();
      expect(() => validateApiName("unknown")).toThrow();
    });

    it("should throw error with correct error code", () => {
      try {
        validateApiName("invalid");
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).code).toBe("InvalidValue");
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should include valid options in error message", () => {
      try {
        validateApiName("invalid");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("location");
        expect(error.message).toContain("mobile");
        expect(error.message).toContain("fugitive");
        expect(error.message).toContain("stationary");
        expect(error.message).toContain("calculation");
        expect(error.message).toContain("transportationanddistribution");
        expect(error.message).toContain("factor");
      }
    });
  });

  describe("handleTypesFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should throw error if user is not logged in", async () => {
      // Mock ensureClient to throw error (user not logged in)
      const loginError = new CustomFunctionsError("NotAvailable", "Enter your credentials in the task pane.");
      mockEnsureClient.mockRejectedValueOnce(loginError);

      await expect(handleTypesFunction("Location", mockInvocation)).rejects.toThrow();

      try {
        await handleTypesFunction("Location", mockInvocation);
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
      }
    });

    it("should create sheet if it doesn't exist", async () => {
      // Mock sheet doesn't exist
      mockContext.workbook.worksheets.items = [];

      await handleTypesFunction("Location", mockInvocation);

      expect(mockLoadAndPopulateApiTypes).toHaveBeenCalled();
    });

    it("should not create sheet if it already exists", async () => {
      // Sheet exists (default behavior)
      await handleTypesFunction("Location", mockInvocation);

      expect(mockLoadAndPopulateApiTypes).not.toHaveBeenCalled();
    });

    it("should apply data validation to cell", async () => {
      await handleTypesFunction("Location", mockInvocation);

      expect(mockExcelRun).toHaveBeenCalled();
      expect(mockTargetCell.dataValidation.clear).toHaveBeenCalled();
      expect(mockTargetCell.dataValidation.rule).toEqual({
        list: {
          inCellDropDown: true,
          source: "type1,type2,type3",
        },
      });
    });

    it("should set error alert for validation", async () => {
      await handleTypesFunction("Location", mockInvocation);

      expect(mockTargetCell.dataValidation.errorAlert).toEqual({
        showAlert: true,
        style: "stop",
        title: "Invalid Type",
        message: "Please select a valid type from the dropdown list",
      });
    });

    it("should handle different API names", async () => {
      await handleTypesFunction("mobile", mockInvocation);

      expect(mockApiTypesSheet.getRange).toHaveBeenCalledWith("B:B"); // Column B for mobile
    });

    it("should handle factor API (uses calculation column)", async () => {
      await handleTypesFunction("factor", mockInvocation);

      expect(mockApiTypesSheet.getRange).toHaveBeenCalledWith("E:E"); // Column E for calculation/factor
    });

    it("should return empty string", async () => {
      const result = await handleTypesFunction("Location", mockInvocation);

      expect(result).toBe("");
    });

    it("should throw error for invalid API name", async () => {
      await expect(handleTypesFunction("invalid", mockInvocation)).rejects.toThrow();

      try {
        await handleTypesFunction("invalid", mockInvocation);
      } catch (error) {
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should handle sheet creation failure", async () => {
      // Mock sheet doesn't exist
      mockContext.workbook.worksheets.items = [];
      
      // Mock loadAndPopulateApiTypes to fail
      mockLoadAndPopulateApiTypes.mockRejectedValueOnce(new Error("API error"));

      await expect(handleTypesFunction("Location", mockInvocation)).rejects.toThrow();

      try {
        await handleTypesFunction("Location", mockInvocation);
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
        expect(error.message).toContain("Failed to set up validation");
      }
    });

    it("should handle cell address without sheet name", async () => {
      const invocationWithoutSheet = {
        address: "A1", // No sheet name
      } as CustomFunctions.Invocation;

      await handleTypesFunction("Location", invocationWithoutSheet);

      expect(mockContext.workbook.worksheets.getActiveWorksheet).toHaveBeenCalled();
    });

    it("should handle empty types data", async () => {
      // Mock empty data range
      mockUsedRange.rowCount = 2; // Only metadata and header rows (no data)
      mockUsedRange.rowIndex = 0;

      await expect(handleTypesFunction("Location", mockInvocation)).rejects.toThrow();

      try {
        await handleTypesFunction("Location", mockInvocation);
      } catch (error) {
        expect(error.message).toContain("No types found for API");
      }
    });
  });
});

// Made with Bob
