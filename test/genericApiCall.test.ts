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
    // Mock implementation: extract symbol from "Symbol(Name)" or return as-is
    if (!value) return value;
    const match = value.match(/\(([^)]+)\)$/);
    return match ? match[1] : value;
  }),
  extractValueAfterDash: jest.fn((value) => value), // pass-through by default
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn().mockResolvedValue(undefined),
}));

import {
  Calculation,
  EconomicActivity,
  Fugitive,
  Location,
  Mobile,
  PhysicalActivity,
  RealEstate,
  Stationary,
  TransportationAndDistribution,
} from "emissions-api-sdk";

import { ensureClient } from "../src/functions/client";
import { genericApiCall } from "../src/functions/generic-api-call";
import { convertExcelDateToISO } from "../src/functions/utils";

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
    EconomicActivity: { calculate: jest.fn() },
    RealEstate: { calculate: jest.fn() },
    PhysicalActivity: { calculate: jest.fn() },
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

const mockEconomicActivityResponse = {
  ...mockResponse,
  "energy(MWh)": "",
  assetTurnoverRatio: "",
  score: "",
};

const mockRealEstateResponse = {
  ...mockResponse,
  "energy(MWh)": 42,
  assetTurnoverRatio: "",
};

type ApiCase = {
  name: string;
  apiType:
    | "location"
    | "stationary"
    | "fugitive"
    | "mobile"
    | "calculation"
    | "transportation_and_distribution"
    | "economic_activity"
    | "real_estate"
    | "physical_activity";
  emissionMock: jest.Mock;
  expectedResult?: (string | number)[];
};

// All APIs use STANDARD_OUTPUT_HEADERS: TotalCO2e, CO2, CH4, N2O, HFC, PFC, SF6, NF3, BioCO2, IndirectCO2e, Unit, Description, Transaction Id
// API returns camelCase, but headers are displayed with proper capitalization
const standardExpectedResult = [100, 50, 10, 5, 0, 0, 0, 0, 0, 2, "kgCO2e", "Mock description", "txn-123"];

const apiCases: ApiCase[] = [
  { name: "Location", apiType: "location", emissionMock: Location.calculate as jest.Mock, expectedResult: standardExpectedResult },
  {
    name: "Stationary",
    apiType: "stationary",
    emissionMock: Stationary.calculate as jest.Mock,
    expectedResult: standardExpectedResult,
  },
  { name: "Fugitive", apiType: "fugitive", emissionMock: Fugitive.calculate as jest.Mock, expectedResult: standardExpectedResult },
  { name: "Mobile", apiType: "mobile", emissionMock: Mobile.calculate as jest.Mock, expectedResult: standardExpectedResult },
  {
    name: "Generic Calculation",
    apiType: "calculation",
    emissionMock: Calculation.calculate as jest.Mock,
    expectedResult: standardExpectedResult,
  },
  {
    name: "Transportation & Distribution",
    apiType: "transportation_and_distribution",
    emissionMock: TransportationAndDistribution.calculate as jest.Mock,
    expectedResult: standardExpectedResult,
  },
  {
    name: "Economic Activity",
    apiType: "economic_activity",
    emissionMock: EconomicActivity.calculate as jest.Mock,
    expectedResult: [...standardExpectedResult, "", "", ""],
  },
  {
    name: "Real Estate",
    apiType: "real_estate",
    emissionMock: RealEstate.calculate as jest.Mock,
    expectedResult: [...standardExpectedResult, 42, ""],
  },
  {
    name: "Physical Activity",
    apiType: "physical_activity",
    emissionMock: PhysicalActivity.calculate as jest.Mock,
    expectedResult: [...standardExpectedResult, "", ""],
  },
];

describe("genericApiCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiCases.forEach((c) => {
      let response = mockResponse;
      if (c.apiType === "real_estate") {
        response = mockRealEstateResponse;
      } else if (c.apiType === "economic_activity" || c.apiType === "physical_activity") {
        response = mockEconomicActivityResponse;
      }
      c.emissionMock.mockResolvedValue(response);
    });
  });

  describe.each(apiCases)("$name API", ({ apiType, emissionMock, expectedResult }) => {
    const expected = expectedResult!;

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

      expect(result).toEqual([expected]);
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
      expect(result).toEqual([expected]);
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
