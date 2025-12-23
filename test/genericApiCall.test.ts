// Copyright IBM Corp. 2025

(global as any).CustomFunctions = {
  Error: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = "CustomFunctions.Error";
    }
  },
  ErrorCode: {
    notAvailable: "NotAvailable",
    invalidValue: "InvalidValue",
  },
};

(global as any).OfficeRuntime = {
  storage: {
    setItem: jest.fn().mockResolvedValue(undefined),
  },
};

// Mock the utils module BEFORE imports
jest.mock("../src/functions/utils", () => ({
  convertExcelDateToISO: jest.fn().mockReturnValue("2025-08-23"),
  extractSymbolFromDisplay: jest.fn((value) => {
    // Mock implementation: extract symbol from "Name (Symbol)" or return as-is
    if (!value) return value;
    const match = value.match(/\(([^)]+)\)$/);
    return match ? match[1] : value;
  }),
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn().mockResolvedValue(undefined),
}));

import { genericApiCall } from "../src/functions/generic-api-call";
import { ensureClient } from "../src/functions/client";
import { convertExcelDateToISO, extractSymbolFromDisplay } from "../src/functions/utils";

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
} from "emissions-api-sdk";

// Mock Emission classes
jest.mock("emissions-api-sdk", () => {
  return {
    __esModule: true,
    Location: { calculate: jest.fn() },
    Mobile: { calculate: jest.fn() },
    Fugitive: { calculate: jest.fn() },
    Stationary: { calculate: jest.fn() },
    Calculation: { calculate: jest.fn() },
    TransportationAndDistribution: { calculate: jest.fn() },
    default: {},
  };
});

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

const mockResponse = {
  totalCO2e: 100,
  CO2: 50,
  CH4: 10,
  N2O: 5,
  HFC: 0,
  PFC: 0,
  SF6: 0,
  NF3: 0,
  bioCO2: 0,
  indirectCO2e: 2,
  unit: "kgCO2e",
  description: "Mock description",
  transactionId: "txn-123",
};

type ApiCase = {
  name: string;
  apiType:
    | "location"
    | "stationary"
    | "fugitive"
    | "mobile"
    | "calculation"
    | "transportation_and_distribution";
  emissionMock: jest.Mock;
};

const apiCases: ApiCase[] = [
  { name: "Location", apiType: "location", emissionMock: Location.calculate as jest.Mock },
  {
    name: "Stationary",
    apiType: "stationary",
    emissionMock: Stationary.calculate as jest.Mock,
  },
  { name: "Fugitive", apiType: "fugitive", emissionMock: Fugitive.calculate as jest.Mock },
  { name: "Mobile", apiType: "mobile", emissionMock: Mobile.calculate as jest.Mock },
  {
    name: "Generic Calculation",
    apiType: "calculation",
    emissionMock: Calculation.calculate as jest.Mock,
  },
  {
    name: "Transportation & Distribution",
    apiType: "transportation_and_distribution",
    emissionMock: TransportationAndDistribution.calculate as jest.Mock,
  },
];

describe("genericApiCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiCases.forEach((c) => c.emissionMock.mockResolvedValue(mockResponse));
  });

  describe.each(apiCases)("$name API", ({ apiType, emissionMock }) => {
    it("should call the correct emission API and return excelResponse (type-based payload)", async () => {
      const payload = {
        value: 100,
        unit: "kWh",
        country: "USA",
        stateProvince: "New York",
        date: "2025-01-01",
        type: "Natural Gas",
      };

      const result = await genericApiCall(apiType, payload);

      expect(ensureClient).toHaveBeenCalled();
      expect(convertExcelDateToISO).toHaveBeenCalledWith("2025-01-01");
      expect(emissionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: expect.objectContaining({
            value: 100,
            unit: "kWh",
            type: "Natural Gas",
          }),
          location: expect.objectContaining({ country: "USA", stateProvince: "New York" }),
          time: { date: "2025-08-23" },
        })
      );

      expect(result).toEqual([
        [100, 50, 10, 5, 0, 0, 0, 0, 0, 2, "kgCO2e", "Mock description", "txn-123"],
      ]);
    });

    it("should call the correct emission API and return excelResponse (factorId-based payload)", async () => {
      const payload = {
        value: 200,
        unit: "kg",
        factorId: 9999,
      };

      const result = await genericApiCall(apiType, payload);

      expect(ensureClient).toHaveBeenCalled();
      expect(emissionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: expect.objectContaining({
            value: 200,
            unit: "kg",
            factorId: 9999,
          }),
        })
      );
      // No location or time for factorId case
      expect(result).toEqual([
        [100, 50, 10, 5, 0, 0, 0, 0, 0, 2, "kgCO2e", "Mock description", "txn-123"],
      ]);
    });
  });

  it("should throw error for unsupported apiType", async () => {
    await expect(
      genericApiCall("invalid" as any, {
        value: 1,
        unit: "kg",
        type: "Electricity",
        country: "US",
      })
    ).rejects.toThrow(/Unsupported API type/);
  });

  it("should throw CustomFunctions.Error if emission returns invalid response", async () => {
    (Location.calculate as jest.Mock).mockResolvedValueOnce(null);
    await expect(
      genericApiCall("location", {
        value: 1,
        unit: "kg",
        type: "Electricity",
        country: "US",
      })
    ).rejects.toThrow("Invalid API response");
  });

  it("should handle thrown error gracefully", async () => {
    (Stationary.calculate as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    await expect(
      genericApiCall("stationary", {
        value: 1,
        unit: "kg",
        type: "Electricity",
        country: "US",
      })
    ).rejects.toThrow("boom");
  });
});