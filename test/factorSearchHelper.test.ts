// Copyright IBM Corp. 2025

import { factorSearch } from "../src/functions/factorSearchHelper";
import { Factor } from "emissions-api-sdk";
import { ensureClient } from "../src/functions/client";


jest.mock("emissions-api-sdk", () => ({
  Factor: {
    search: jest.fn(),
  },
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

jest.mock("../src/functions/utils", () => ({
  convertExcelDateToISO: jest.fn((d) => d), // pass-through
}));

describe("factorSearch", () => {
  const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockedSearch = Factor.search as jest.MockedFunction<typeof Factor.search>;

  // Mock CustomFunctions global for Jest
  beforeAll(() => {
    (global as any).CustomFunctions = {
      ErrorCode: {
        notAvailable: "NotAvailable",
        invalidValue: "InvalidValue",
      },
      Error: class CustomFunctionError extends Error {
        code: string;
        constructor(code: string, message: string) {
          super(message);
          this.code = code;
          this.name = "CustomFunctions.Error";
        }
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEnsureClient.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  const mockResponse = {
    factors: [
      {
        factorSet: "set1",
        source: "source1",
        activityType: "type1",
        activityUnit: ["kg"],
        region: "USA",
        factorId: 1001,
        name: "Factor 1",
        description: "Description 1",
        effectiveFrom: "2024-01-01",
        effectiveTo: "2025-01-01",
        publishedFrom: "2024-01-01",
        publishedTo: "2025-01-01",
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
        transactionId: "txn-1001",
      },
      {
        factorSet: "set2",
        source: "source2",
        activityType: "type2",
        activityUnit: ["L"],
        region: "Canada",
        factorId: 1002,
        name: "Factor 2",
        description: "Description 2",
        effectiveFrom: "2024-01-01",
        effectiveTo: "2025-01-01",
        publishedFrom: "2024-01-01",
        publishedTo: "2025-01-01",
        totalCO2e: 200,
        CO2: 100,
        CH4: 20,
        N2O: 10,
        HFC: 0,
        PFC: 0,
        SF6: 0,
        NF3: 0,
        bioCO2: 0,
        indirectCO2e: 4,
        unit: "kgCO2e",
        transactionId: "txn-1002",
      },
    ],
  };

  it("returns formatted factor search result from object response", async () => {
    mockedSearch.mockResolvedValue(mockResponse);

    const result = await factorSearch("diesel", "USA");

    expect(result).toEqual([
      ["set1", "source1", "type1", "kg", "USA", 1001],
      ["set2", "source2", "type2", "L", "Canada", 1002],
    ]);
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      pagination: { page: 1, size: 30 }
    }));
  });

  it("handles typed object response from SDK v1.0.2+", async () => {
    mockedSearch.mockResolvedValue(mockResponse);

    const result = await factorSearch("diesel", "USA");

    expect(result).toEqual([
      ["set1", "source1", "type1", "kg", "USA", 1001],
      ["set2", "source2", "type2", "L", "Canada", 1002],
    ]);
  });

  it("handles activityUnit as array with multiple values", async () => {
    const responseWithMultipleUnits = {
      factors: [
        {
          ...mockResponse.factors[0],
          activityUnit: ["kg", "lb", "ton"],
        },
      ],
    };
    mockedSearch.mockResolvedValue(responseWithMultipleUnits);

    const result = await factorSearch("diesel", "USA");

    expect(result[0][3]).toBe("kg, lb, ton"); // activityUnit joined
  });

  it("throws CustomFunctions.Error with message from error response", async () => {
    const error = {
      response: { data: { message: "Invalid parameters" } },
      status: 400,
    };
    mockedSearch.mockRejectedValue(error);

    await expect(factorSearch("invalid", "??")).rejects.toThrow("Invalid parameters");
  });

  it("throws CustomFunctions.Error with fallback message", async () => {
    const error = new Error("Something went wrong");
    mockedSearch.mockRejectedValue(error);

    await expect(factorSearch("x", "y")).rejects.toThrow("Something went wrong");
  });

  it("returns default values for missing or null fields in factor search response", async () => {
  
  const mockResponseWithNullValues = {
    factors: [
      {
        ...mockResponse.factors[0],
        factorSet: null,
        factorId: null as any,
      },
      {
        ...mockResponse.factors[1],
        source: null,
      },
    ],
  };

  
  mockedSearch.mockResolvedValue(mockResponseWithNullValues);

  const result = await factorSearch("diesel", "USA");

  
  expect(result).toEqual([
    [
      "",
      "source1",
      "type1",
      "kg",
      "USA",
      "",
    ],
    [
      "set2",
      "",
      "type2",
      "L",
      "Canada",
      1002,
    ],
  ]);
});

  it("uses custom pagination parameters when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);

    await factorSearch("diesel", "USA", undefined, undefined, 2, 50);

    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      pagination: { page: 2, size: 50 }
    }));
  });
});
