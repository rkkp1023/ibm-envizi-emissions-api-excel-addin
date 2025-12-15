// Copyright IBM Corp. 2025

import {
  fetchUnits,
  handleUnitsFunction,
} from "../src/functions/units-handler";
import { validateApiName } from "../src/functions/metadata-utils";

// Mock emissions-api-sdk
jest.mock("emissions-api-sdk", () => ({
  Location: {
    getUnits: jest.fn(),
  },
  Mobile: {
    getUnits: jest.fn(),
  },
  Fugitive: {
    getUnits: jest.fn(),
  },
  Stationary: {
    getUnits: jest.fn(),
  },
  Calculation: {
    getUnits: jest.fn(),
  },
  TransportationAndDistribution: {
    getUnits: jest.fn(),
  },
  Factor: {
    getUnits: jest.fn(),
  },
}));

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
  Factor,
} from "emissions-api-sdk";

// Mock client module
jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

import { ensureClient } from "../src/functions/client";

// Mock Excel
const mockTargetCell = {
  dataValidation: {
    clear: jest.fn(),
    rule: null as any,
    errorAlert: null as any,
  },
};

const mockTargetSheet = {
  name: "Sheet1",
  getRange: jest.fn().mockReturnValue(mockTargetCell),
};

const mockContext = {
  workbook: {
    worksheets: {
      getItem: jest.fn().mockReturnValue(mockTargetSheet),
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

describe("units-handler", () => {
  const mockEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockLocationGetUnits = Location.getUnits as jest.MockedFunction<typeof Location.getUnits>;
  const mockMobileGetUnits = Mobile.getUnits as jest.MockedFunction<typeof Mobile.getUnits>;
  const mockFugitiveGetUnits = Fugitive.getUnits as jest.MockedFunction<typeof Fugitive.getUnits>;
  const mockStationaryGetUnits = Stationary.getUnits as jest.MockedFunction<typeof Stationary.getUnits>;
  const mockCalculationGetUnits = Calculation.getUnits as jest.MockedFunction<typeof Calculation.getUnits>;
  const mockTransportationGetUnits = TransportationAndDistribution.getUnits as jest.MockedFunction<
    typeof TransportationAndDistribution.getUnits
  >;
  const mockFactorGetUnits = Factor.getUnits as jest.MockedFunction<typeof Factor.getUnits>;

  const mockUnitsArray = ["J", "KJ", "MJ", "GJ", "TJ", "BTU", "thm", "dth", "kBTU", "MMBTU", "Wh", "kWh", "mWh", "usd"];
  const mockUnitsResponse = { units: mockUnitsArray };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: ensureClient succeeds (user is logged in)
    mockEnsureClient.mockResolvedValue(undefined);

    // Default: all getUnits calls succeed
    mockLocationGetUnits.mockResolvedValue(mockUnitsResponse);
    mockMobileGetUnits.mockResolvedValue(mockUnitsResponse);
    mockFugitiveGetUnits.mockResolvedValue(mockUnitsResponse);
    mockStationaryGetUnits.mockResolvedValue(mockUnitsResponse);
    mockCalculationGetUnits.mockResolvedValue(mockUnitsResponse);
    mockTransportationGetUnits.mockResolvedValue(mockUnitsResponse);
    mockFactorGetUnits.mockResolvedValue(mockUnitsResponse);

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

  describe("fetchUnits", () => {
    it("should fetch units for location API", async () => {
      const units = await fetchUnits("location", "electricity");

      expect(mockLocationGetUnits).toHaveBeenCalledWith("electricity");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for mobile API", async () => {
      const units = await fetchUnits("mobile", "diesel");

      expect(mockMobileGetUnits).toHaveBeenCalledWith("diesel");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for fugitive API", async () => {
      const units = await fetchUnits("fugitive", "refrigerant");

      expect(mockFugitiveGetUnits).toHaveBeenCalledWith("refrigerant");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for stationary API", async () => {
      const units = await fetchUnits("stationary", "natural-gas");

      expect(mockStationaryGetUnits).toHaveBeenCalledWith("natural-gas");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for calculation API", async () => {
      const units = await fetchUnits("calculation", "electricity");

      expect(mockCalculationGetUnits).toHaveBeenCalledWith("electricity");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for transportationanddistribution API", async () => {
      const units = await fetchUnits("transportationanddistribution", "freight");

      expect(mockTransportationGetUnits).toHaveBeenCalledWith("freight");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should fetch units for factor API", async () => {
      const units = await fetchUnits("factor", "electricity");

      expect(mockFactorGetUnits).toHaveBeenCalledWith("electricity");
      expect(units).toEqual(mockUnitsArray);
    });

    it("should throw error for unknown API name", async () => {
      await expect(fetchUnits("unknown" as any, "electricity")).rejects.toThrow("Unknown API name");
    });

    it("should throw error if API returns invalid response format", async () => {
      mockLocationGetUnits.mockResolvedValueOnce({ units: null } as any);

      await expect(fetchUnits("location", "electricity")).rejects.toThrow("Invalid response format");
    });

    it("should throw error if API returns empty units array", async () => {
      mockLocationGetUnits.mockResolvedValueOnce({ units: [] } as any);

      await expect(fetchUnits("location", "electricity")).rejects.toThrow("No units found for type");
    });

    it("should handle typed object response from SDK v1.0.2+", async () => {
      const typedResponse = { units: ["kWh", "MWh", "GWh"] };
      mockLocationGetUnits.mockResolvedValueOnce(typedResponse);

      const units = await fetchUnits("location", "electricity");

      expect(units).toEqual(["kWh", "MWh", "GWh"]);
    });

    it("should throw error if API call fails", async () => {
      mockLocationGetUnits.mockRejectedValueOnce(new Error("API error"));

      await expect(fetchUnits("location", "electricity")).rejects.toThrow("Failed to fetch units");
    });
  });

  describe("handleUnitsFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should throw error if user is not logged in", async () => {
      // Mock ensureClient to throw error (user not logged in)
      const loginError = new CustomFunctionsError("NotAvailable", "Enter your credentials in the task pane.");
      mockEnsureClient.mockRejectedValueOnce(loginError);

      await expect(handleUnitsFunction("Location", "electricity", mockInvocation)).rejects.toThrow();

      try {
        await handleUnitsFunction("Location", "electricity", mockInvocation);
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
      }
    });

    it("should throw error for invalid API name", async () => {
      await expect(handleUnitsFunction("invalid", "electricity", mockInvocation)).rejects.toThrow();

      try {
        await handleUnitsFunction("invalid", "electricity", mockInvocation);
      } catch (error) {
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should throw error if type parameter is empty", async () => {
      await expect(handleUnitsFunction("Location", "", mockInvocation)).rejects.toThrow("Type parameter is required");

      try {
        await handleUnitsFunction("Location", "", mockInvocation);
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).code).toBe("InvalidValue");
        expect(error.message).toContain("Type parameter is required");
      }
    });

    it("should throw error if type parameter is whitespace only", async () => {
      await expect(handleUnitsFunction("Location", "   ", mockInvocation)).rejects.toThrow("Type parameter is required");

      try {
        await handleUnitsFunction("Location", "   ", mockInvocation);
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).code).toBe("InvalidValue");
        expect(error.message).toContain("Type parameter is required");
      }
    });

    it("should fetch units and apply validation", async () => {
      await handleUnitsFunction("Location", "electricity", mockInvocation);

      expect(mockLocationGetUnits).toHaveBeenCalledWith("electricity");
      expect(mockExcelRun).toHaveBeenCalled();
      expect(mockTargetCell.dataValidation.clear).toHaveBeenCalled();
      expect(mockTargetCell.dataValidation.rule).toEqual({
        list: {
          inCellDropDown: true,
          source: mockUnitsArray.join(","),
        },
      });
    });

    it("should set error alert for validation", async () => {
      await handleUnitsFunction("Location", "electricity", mockInvocation);

      expect(mockTargetCell.dataValidation.errorAlert).toEqual({
        showAlert: true,
        style: "stop",
        title: "Invalid Unit",
        message: "Please select a valid unit from the dropdown list",
      });
    });

    it("should handle different API names", async () => {
      await handleUnitsFunction("mobile", "diesel", mockInvocation);

      expect(mockMobileGetUnits).toHaveBeenCalledWith("diesel");
    });

    it("should trim type parameter", async () => {
      await handleUnitsFunction("Location", "  electricity  ", mockInvocation);

      expect(mockLocationGetUnits).toHaveBeenCalledWith("electricity");
    });

    it("should return empty string", async () => {
      const result = await handleUnitsFunction("Location", "electricity", mockInvocation);

      expect(result).toBe("");
    });

    it("should handle cell address without sheet name", async () => {
      const invocationWithoutSheet = {
        address: "A1", // No sheet name
      } as CustomFunctions.Invocation;

      await handleUnitsFunction("Location", "electricity", invocationWithoutSheet);

      expect(mockContext.workbook.worksheets.getActiveWorksheet).toHaveBeenCalled();
    });

    it("should handle API fetch failure", async () => {
      mockLocationGetUnits.mockRejectedValueOnce(new Error("API error"));

      await expect(handleUnitsFunction("Location", "electricity", mockInvocation)).rejects.toThrow();

      try {
        await handleUnitsFunction("Location", "electricity", mockInvocation);
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
        expect(error.message).toContain("Failed to set up units validation");
      }
    });

    it("should handle Excel.run failure", async () => {
      mockExcelRun.mockRejectedValueOnce(new Error("Excel error"));

      await expect(handleUnitsFunction("Location", "electricity", mockInvocation)).rejects.toThrow();

      try {
        await handleUnitsFunction("Location", "electricity", mockInvocation);
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
        expect(error.message).toContain("Failed to set up units validation");
      }
    });

    it("should work with all supported API types", async () => {
      const apis = [
        { name: "location", mock: mockLocationGetUnits },
        { name: "mobile", mock: mockMobileGetUnits },
        { name: "fugitive", mock: mockFugitiveGetUnits },
        { name: "stationary", mock: mockStationaryGetUnits },
        { name: "calculation", mock: mockCalculationGetUnits },
        { name: "transportationanddistribution", mock: mockTransportationGetUnits },
        { name: "factor", mock: mockFactorGetUnits },
      ];

      for (const api of apis) {
        jest.clearAllMocks();
        await handleUnitsFunction(api.name, "test-type", mockInvocation);
        expect(api.mock).toHaveBeenCalledWith("test-type");
      }
    });
  });
});

// Made with Bob