// Copyright IBM Corp. 2026

import * as TypeRecommender from "emissions-api-sdk/dist/api/TypeRecommender";
import { ensureClient } from "../src/functions/client";
import { typeRecommender } from "../src/functions/typeRecommenderHelper";

jest.mock("emissions-api-sdk/dist/api/TypeRecommender", () => ({
  search: jest.fn(),
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

jest.mock("../src/functions/utils", () => {
  const actual = jest.requireActual("../src/functions/utils");
  return {
    ...actual,
    convertExcelDateToISO: jest.fn((d) => d), // pass-through
    extractSymbolFromDisplay: jest.fn((value) => value), // pass-through by default
    extractValueAfterDash: jest.fn((value) => value), // pass-through by default
  };
});

describe("typeRecommender", () => {
  const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockedSearch = TypeRecommender.search as jest.MockedFunction<typeof TypeRecommender.search>;

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
    types: [
      {
        activityType: "Electricity - Grid",
        activityUnit: ["kWh", "MWh"],
        activityDescription: "Electricity consumption from the grid",
        confidence: 0.95,
      },
    ],
  };

  it("returns formatted type recommender result with first result only", async () => {
    mockedSearch.mockResolvedValue(mockResponse);

    const result = await typeRecommender("electricity", "USA");

    expect(result).toEqual([
      ["Electricity - Grid", 0.95, "Electricity consumption from the grid"],
    ]);
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      pagination: { page: 1, size: 1 }
    }));
  });

  it("includes stateProvince in params when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", "California");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      location: { country: "USA", stateProvince: "California" }
    }));
  });

  it("excludes stateProvince from params when not provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      location: { country: "USA" }
    }));
  });

  it("includes date in params when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", undefined, undefined, undefined, "2024-01-01");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      time: { date: "2024-01-01" }
    }));
  });

  it("excludes date from params when empty string", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", undefined, undefined, undefined, "   ");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.not.objectContaining({
      time: expect.anything()
    }));
  });

  it("returns default message when no types found", async () => {
    mockedSearch.mockResolvedValue({ types: [] });

    const result = await typeRecommender("unknown", "USA");

    expect(result).toEqual([
      ["No recommendations found", 0, ""],
    ]);
  });

  it("handles null/undefined fields in response", async () => {
    const responseWithNulls = {
      types: [
        {
          activityType: null as any,
          activityUnit: ["kWh"],
          activityDescription: null as any,
          confidence: null as any,
        },
      ],
    };
    mockedSearch.mockResolvedValue(responseWithNulls);

    const result = await typeRecommender("electricity", "USA");

    expect(result).toEqual([
      ["", "", ""],
    ]);
  });

  it("throws CustomFunctions.Error with message from error response", async () => {
    const error = {
      response: { data: { message: "Invalid parameters" } },
      status: 400,
    };
    mockedSearch.mockRejectedValue(error);

    await expect(typeRecommender("invalid", "??")).rejects.toThrow("Invalid parameters");
  });

  it("throws CustomFunctions.Error with fallback message", async () => {
    const error = new Error("Something went wrong");
    mockedSearch.mockRejectedValue(error);

    await expect(typeRecommender("x", "y")).rejects.toThrow("Something went wrong");
  });

  it("throws error when response is missing types array", async () => {
    mockedSearch.mockResolvedValue({ types: null } as any);
    
    await expect(typeRecommender("electricity", "USA")).rejects.toThrow("Invalid API response structure");
  });

  it("re-throws CustomFunctions.Error without modification", async () => {
    const customError = new (global as any).CustomFunctions.Error("NotAvailable", "Custom error");
    mockedSearch.mockRejectedValue(customError);
    
    await expect(typeRecommender("electricity", "USA")).rejects.toThrow(customError);
  });

  it("uses InvalidValue error code for 400 status", async () => {
    const error = { status: 400, message: "Bad request" };
    mockedSearch.mockRejectedValue(error);
    
    try {
      await typeRecommender("electricity", "USA");
    } catch (e: any) {
      expect(e.code).toBe("InvalidValue");
    }
  });

  it("uses NotAvailable error code for non-400 status", async () => {
    const error = { status: 500, message: "Server error" };
    mockedSearch.mockRejectedValue(error);
    
    try {
      await typeRecommender("electricity", "USA");
    } catch (e: any) {
      expect(e.code).toBe("NotAvailable");
    }
  });

  it("always uses pagination with page 1 and size 1", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      pagination: { page: 1, size: 1 }
    }));
  });

  it("builds correct API params with all optional parameters", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", "California", undefined, undefined, "2024-01-01");
    
    expect(mockedSearch).toHaveBeenCalledWith({
      activity: { search: "electricity" },
      location: { country: "USA", stateProvince: "California" },
      time: { date: "2024-01-01" },
      pagination: { page: 1, size: 1 }
    });
  });

  it("includes unit in activity params when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", undefined, "kWh");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      activity: expect.objectContaining({ search: "electricity", unit: "kWh" })
    }));
  });

  it("includes scope in activity params when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", undefined, undefined, "1");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      activity: expect.objectContaining({ search: "electricity", scope: "1" })
    }));
  });

  it("includes both unit and scope in activity params when provided", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA", undefined, "kWh", "2");
    
    expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({
      activity: expect.objectContaining({ search: "electricity", unit: "kWh", scope: "2" })
    }));
  });

  it("builds correct API params with only required parameters", async () => {
    mockedSearch.mockResolvedValue(mockResponse);
    
    await typeRecommender("electricity", "USA");
    
    expect(mockedSearch).toHaveBeenCalledWith({
      activity: { search: "electricity" },
      location: { country: "USA" },
      pagination: { page: 1, size: 1 }
    });
  });
});

// Made with Bob
