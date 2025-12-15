// Copyright IBM Corp. 2025

import { factorHelper } from "../src/functions/factorHelper";
import { Factor } from "emissions-api-sdk";
import { ensureClient } from "../src/functions/client";
import { convertExcelDateToISO } from "../src/functions/utils";

(global as any).CustomFunctions = {
  ErrorCode: {
    notAvailable: "NotAvailable",
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

jest.mock("emissions-api-sdk", () => ({
  Factor: {
    retrieveFactor: jest.fn(),
  },
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

jest.mock("../src/functions/utils", () => ({
  convertExcelDateToISO: jest.fn(),
}));

describe("factorHelper", () => {
  const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockedRetrieveFactor = Factor.retrieveFactor as jest.MockedFunction<
    typeof Factor.retrieveFactor
  >;
  const mockedConvertDate = convertExcelDateToISO as jest.MockedFunction<
    typeof convertExcelDateToISO
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEnsureClient.mockResolvedValue(undefined);
    mockedConvertDate.mockImplementation((d) => d); // pass-through
  });

  const baseResponse = {
    factorSet: "setA",
    source: "sourceA",
    activityType: "fuel",
    activityUnit: ["L"],
    name: "Diesel Combustion",
    description: "Diesel use",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2025-01-01",
    publishedFrom: "2024-01-01",
    publishedTo:"2024-01-01",
    region: "USA",
    totalCO2e: 123.45,
    CO2: 100,
    CH4: 10,
    N2O: 5,
    HFC: 2,
    PFC: 1,
    SF6: 0.5,
    NF3: 0.1,
    bioCO2: 0,
    indirectCO2e: 1.5,
    unit: "L",
    factorId: 12345,
    transactionId: "abc-123",
    
    
  };

  it("returns all values from full response", async () => {
    mockedRetrieveFactor.mockResolvedValue(baseResponse);

    const result = await factorHelper("fuel", "L", "USA", "CA", "2024-01-01");

    expect(mockedRetrieveFactor).toHaveBeenCalledWith({
      activity: { type: "fuel", unit: "L" },
      location: { country: "USA", stateProvince: "CA" },
      time: { date: "2024-01-01" },
    });

    expect(result).toEqual([
      [
        baseResponse.factorSet,
        baseResponse.source,
        baseResponse.activityType,
        "L",
        baseResponse.name,
        baseResponse.description,
        baseResponse.effectiveFrom,
        baseResponse.effectiveTo,
        baseResponse.publishedFrom,
        baseResponse.publishedTo,
        baseResponse.region,
        baseResponse.totalCO2e,
        baseResponse.CO2,
        baseResponse.CH4,
        baseResponse.N2O,
        baseResponse.HFC,
        baseResponse.PFC,
        baseResponse.SF6,
        baseResponse.NF3,
        baseResponse.bioCO2,
        baseResponse.indirectCO2e,
        baseResponse.unit,
        baseResponse.factorId,
        baseResponse.transactionId,
        
        
      ],
    ]);
  });

  it("handles factorId input", async () => {
    mockedRetrieveFactor.mockResolvedValue(baseResponse);

    await factorHelper(12345, "kg");

    expect(mockedRetrieveFactor).toHaveBeenCalledWith({
      activity: { factorId: 12345, unit: "kg" },
    });
  });

  it("throws if API response is undefined", async () => {
    mockedRetrieveFactor.mockResolvedValue(undefined as any);

    await expect(factorHelper("type", "unit")).rejects.toThrow("Invalid API response");
  });

  it("handles typed object response from SDK v1.0.2+", async () => {
    mockedRetrieveFactor.mockResolvedValue(baseResponse);

    const result = await factorHelper("fuel", "L");

    expect(result[0][11]).toBe(123.45); // totalCO2e
  });

  it("handles activityUnit as array", async () => {
    const responseWithMultipleUnits = {
      ...baseResponse,
      activityUnit: ["L", "gal", "m3"],
    };
    mockedRetrieveFactor.mockResolvedValue(responseWithMultipleUnits);

    const result = await factorHelper("fuel", "L");

    expect(result[0][3]).toBe("L, gal, m3"); // activityUnit joined
  });

  it("returns default values for missing or null fields", async () => {
  // Create a mock response with some fields missing (null or undefined)
  const mockResponseWithNullValues = {
    factorSet: null,
    source: "sourceA",
    activityType: "fuel",
    activityUnit: ["L"],
    name: null,              
    description: null,    
    effectiveFrom: null,
    effectiveTo: null,
    publishedFrom: null,
    publishedTo: null,         
    region: null,            
    totalCO2e: null,         
    CO2: null,               
    CH4: null,               
    N2O: null,               
    HFC: null,               
    PFC: null,               
    SF6: null,               
    NF3: null,               
    bioCO2: null,            
    indirectCO2e: null,      
    unit: "L",
    factorId: null as any,
    transactionId: null,
  };

  
  mockedRetrieveFactor.mockResolvedValue(mockResponseWithNullValues);

  const result = await factorHelper("fuel", "L", "USA", "CA", "2024-01-01");

  
  expect(result).toEqual([
    [
      "",             
      "sourceA",      
      "fuel",         
      "L",
      "",
      "",
      "",
      "",
      "",
      "",
      "",             
      0,              
      0,              
      0,              
      0,              
      0,              
      0,              
      0,              
      0,              
      0,              
      0,              
      "L",            
      "",              
      "",             
    ]
  ]);
});
  it("handles country without stateProvince", async () => {
    mockedRetrieveFactor.mockResolvedValue(baseResponse);
    await factorHelper("fuel", "L", "USA");
    expect(mockedRetrieveFactor).toHaveBeenCalledWith({
      activity: { type: "fuel", unit: "L" },
      location: { country: "USA" },
    });
  });

  it("handles empty date string", async () => {
    mockedRetrieveFactor.mockResolvedValue(baseResponse);
    await factorHelper("fuel", "L", "USA", "CA", "   ");
    expect(mockedConvertDate).not.toHaveBeenCalled();
  });

  it("handles activityUnit as string", async () => {
    const response = { ...baseResponse, activityUnit: "kg" as any };
    mockedRetrieveFactor.mockResolvedValue(response);
    const result = await factorHelper("fuel", "L");
    expect(result[0][3]).toBe("kg");
  });


  
});
