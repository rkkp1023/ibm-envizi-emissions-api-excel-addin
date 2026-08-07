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

// ---------------------------------------------------------------------------
// Mock result-cache so this test suite doesn't depend on IndexedDB / crypto.
// Cache behaviour is tested independently in test/result-cache.test.ts.
// ---------------------------------------------------------------------------
const cacheStore = new Map<string, { payload: unknown; response: any[][] }>();

jest.mock("../src/functions/result-cache", () => ({
  buildCacheKey: jest.fn(async (_apiType: string, params: unknown) =>
    JSON.stringify(params)
  ),
  getSnapshot: jest.fn(async (key: string) => cacheStore.get(key) ?? null),
  setSnapshot: jest.fn(async (key: string, response: any[][]) => {
    cacheStore.set(key, response);
  }),
  clearSnapshots: jest.fn(async () => { cacheStore.clear(); }),
}));

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
  financedEmission: "",
  attributionFactor: "",
};

const mockRealEstateResponse = {
  ...mockResponse,
  "energy(MWh)": 42,
  score: "",
  financedEmission: "",
  attributionFactor: "",
};

const mockPhysicalActivityResponse = {
  ...mockResponse,
  "energy(MWh)": "",
  score: "",
  financedEmission: "",
  attributionFactor: "",
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
    expectedResult: [...standardExpectedResult, "", "", "", "", ""],
  },
  {
    name: "Real Estate",
    apiType: "real_estate",
    emissionMock: RealEstate.calculate as jest.Mock,
    expectedResult: [...standardExpectedResult, 42, "", "", ""],
  },
  {
    name: "Physical Activity",
    apiType: "physical_activity",
    emissionMock: PhysicalActivity.calculate as jest.Mock,
    expectedResult: [...standardExpectedResult, "", "", "", ""],
  },
];

describe("genericApiCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheStore.clear();
    // Re-apply mocked implementations cleared by jest.clearAllMocks()
    const { buildCacheKey, getSnapshot, setSnapshot, clearSnapshots } =
      jest.requireMock("../src/functions/result-cache");
    (buildCacheKey as jest.Mock).mockImplementation(
      async (_apiType: string, params: unknown) => JSON.stringify(params)
    );
    (getSnapshot as jest.Mock).mockImplementation(
      async (key: string) => cacheStore.get(key) ?? null
    );
    (setSnapshot as jest.Mock).mockImplementation(
      async (key: string, response: any[][]) => {
        cacheStore.set(key, response);
      }
    );
    (clearSnapshots as jest.Mock).mockImplementation(
      async () => { cacheStore.clear(); }
    );
    apiCases.forEach((c) => {
      let response = mockResponse;
      if (c.apiType === "real_estate") {
        response = mockRealEstateResponse;
      } else if (c.apiType === "economic_activity") {
        response = mockEconomicActivityResponse;
      } else if (c.apiType === "physical_activity") {
        response = mockPhysicalActivityResponse;
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

  it("caches the formatted response after a successful call", async () => {
    const { setSnapshot } = jest.requireMock("../src/functions/result-cache");
    (Location.calculate as jest.Mock).mockResolvedValueOnce(mockResponse);

    await genericApiCall("location", {
      value: 1,
      unit: "kWh",
      type: "Electricity",
      country: "USA",
    });

    expect(setSnapshot).toHaveBeenCalledWith(
      expect.any(String),   // cache key (hash)
      expect.any(Array)     // formatted response
    );
  });

  it("returns cached response when API fails and a cache entry exists", async () => {
    const payload = {
      value: 1,
      unit: "kWh",
      type: "Electricity",
      country: "USA",
    };
    const previousValues = [[100, 50, 10, 5, 0, 0, 0, 0, 0, 2, "kgCO2e", "desc", "txn-1"]];

    // Prime the cache with a successful call, then override the stored response
    (Location.calculate as jest.Mock).mockResolvedValueOnce(mockResponse);
    await genericApiCall("location", payload);
    cacheStore.forEach((_v, k) => cacheStore.set(k, previousValues));

    // Now make the API fail — the cached response should be returned
    (Location.calculate as jest.Mock).mockRejectedValueOnce(new Error("auth error"));

    const result = await genericApiCall("location", payload);

    expect(result).toEqual(previousValues);
  });

  it("throws when API fails and no cached result exists", async () => {
    (Location.calculate as jest.Mock).mockRejectedValueOnce(new Error("auth error"));

    await expect(
      genericApiCall("location", {
        value: 1,
        unit: "kWh",
        type: "Electricity",
        country: "USA",
      })
    ).rejects.toThrow("auth error");
  });

  it("omits attribution entirely when all attribution fields are null", async () => {
    (RealEstate.calculate as jest.Mock).mockResolvedValueOnce(mockRealEstateResponse);
    await genericApiCall("real_estate", {
      value: 5000,
      unit: "m2",
      type: "Commercial",
      country: "USA",
      attribution: { outstandingAmount: null as any, propertyValue: null as any },
    });
    expect(RealEstate.calculate).toHaveBeenCalledWith(
      expect.not.objectContaining({ attribution: expect.anything() })
    );
  });

  it("omits attribution entirely when all attribution fields are undefined", async () => {
    (RealEstate.calculate as jest.Mock).mockResolvedValueOnce(mockRealEstateResponse);
    await genericApiCall("real_estate", {
      value: 5000,
      unit: "m2",
      type: "Commercial",
      country: "USA",
      attribution: { outstandingAmount: undefined, propertyValue: undefined },
    });
    expect(RealEstate.calculate).toHaveBeenCalledWith(
      expect.not.objectContaining({ attribution: expect.anything() })
    );
  });

  it("omits attribution entirely when all attribution fields are zero", async () => {
    (RealEstate.calculate as jest.Mock).mockResolvedValueOnce(mockRealEstateResponse);
    await genericApiCall("real_estate", {
      value: 5000,
      unit: "m2",
      type: "Commercial",
      country: "USA",
      attribution: { outstandingAmount: 0, propertyValue: 0 },
    });
    expect(RealEstate.calculate).toHaveBeenCalledWith(
      expect.not.objectContaining({ attribution: expect.anything() })
    );
  });

  it("includes attribution when at least one field is non-null", async () => {
    (RealEstate.calculate as jest.Mock).mockResolvedValueOnce(mockRealEstateResponse);
    await genericApiCall("real_estate", {
      value: 5000,
      unit: "m2",
      type: "Commercial",
      country: "USA",
      attribution: { outstandingAmount: 1000000, propertyValue: null as any },
    });
    expect(RealEstate.calculate).toHaveBeenCalledWith(
      expect.objectContaining({ attribution: { outstandingAmount: 1000000 } })
    );
  });

  it("includes attribution for economic_activity when fields are non-zero", async () => {
    (EconomicActivity.calculate as jest.Mock).mockResolvedValueOnce(mockEconomicActivityResponse);
    await genericApiCall("economic_activity", {
      value: 0,
      type: "Electricity",
      country: "USA",
      attribution: { outstandingAmount: 500000, totalEquity: 200000, totalDebt: 300000, evic: 1000000, revenue: 400000 },
    });
    expect(EconomicActivity.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        attribution: {
          outstandingAmount: 500000,
          totalEquity: 200000,
          totalDebt: 300000,
          evic: 1000000,
          revenue: 400000,
        },
      })
    );
  });

  it("includes attribution for physical_activity when fields are non-zero", async () => {
    (PhysicalActivity.calculate as jest.Mock).mockResolvedValueOnce(mockPhysicalActivityResponse);
    await genericApiCall("physical_activity", {
      value: 100,
      type: "Electricity",
      country: "USA",
      attribution: { outstandingAmount: 750000, totalEquity: 150000, totalDebt: 250000, evic: 900000 },
    });
    expect(PhysicalActivity.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        attribution: {
          outstandingAmount: 750000,
          totalEquity: 150000,
          totalDebt: 250000,
          evic: 900000,
        },
      })
    );
  });

  it.each(["location", "calculation"] as const)(
    "includes powerGrid in location params for %s api type",
    async (apiType) => {
      const mock = apiType === "location"
        ? (Location.calculate as jest.Mock)
        : (Calculation.calculate as jest.Mock);
      mock.mockResolvedValueOnce(mockResponse);
      await genericApiCall(apiType, {
        value: 100,
        unit: "kWh",
        type: "Electricity",
        country: "USA",
        powerGrid: "USA - WECC",
      });
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.objectContaining({ powerGrid: "USA - WECC" }),
        })
      );
    }
  );

  it("ignores powerGrid for api types other than location and calculation", async () => {
    (Stationary.calculate as jest.Mock).mockResolvedValueOnce(mockResponse);
    await genericApiCall("stationary", {
      value: 100,
      unit: "kWh",
      type: "Natural Gas",
      country: "USA",
      powerGrid: "USA - WECC",
    });
    expect(Stationary.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        location: expect.not.objectContaining({ powerGrid: expect.anything() }),
      })
    );
  });

  it("omits time when date is empty", async () => {
    (Location.calculate as jest.Mock).mockResolvedValueOnce(mockResponse);
    await genericApiCall("location", {
      value: 100,
      unit: "kWh",
      type: "Electricity",
      country: "USA",
      date: "",
    });
    expect(Location.calculate).toHaveBeenCalledWith(
      expect.not.objectContaining({ time: expect.anything() })
    );
  });

  it("omits unit from activity when unit is not provided", async () => {
    (Stationary.calculate as jest.Mock).mockResolvedValueOnce(mockResponse);
    await genericApiCall("stationary", {
      value: 100,
      type: "Natural Gas",
      country: "USA",
    });
    expect(Stationary.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        activity: expect.not.objectContaining({ unit: expect.anything() }),
      })
    );
  });

  it("uses 400 invalidValue error code when API responds with status 400", async () => {
    const err: any = new Error("bad request");
    err.status = 400;
    (Location.calculate as jest.Mock).mockRejectedValueOnce(err);
    await expect(
      genericApiCall("location", { value: 1, unit: "kg", type: "Electricity", country: "USA" })
    ).rejects.toMatchObject({ code: "InvalidValue", message: "bad request" });
  });

  it("uses notAvailable error code for non-400 API errors", async () => {
    const err: any = new Error("server error");
    err.status = 500;
    (Location.calculate as jest.Mock).mockRejectedValueOnce(err);
    await expect(
      genericApiCall("location", { value: 1, unit: "kg", type: "Electricity", country: "USA" })
    ).rejects.toMatchObject({ code: "NotAvailable", message: "server error" });
  });

  it("prefers error message from response.data.message when available", async () => {
    const err: any = new Error("fallback");
    err.response = { data: { message: "detailed API error" } };
    (Location.calculate as jest.Mock).mockRejectedValueOnce(err);
    await expect(
      genericApiCall("location", { value: 1, unit: "kg", type: "Electricity", country: "USA" })
    ).rejects.toMatchObject({ message: "detailed API error" });
  });

  it.each([undefined, null, "" as any, 0])(
    "omits value from activity for economic_activity when value is %s",
    async (emptyValue) => {
      (EconomicActivity.calculate as jest.Mock).mockResolvedValueOnce(mockEconomicActivityResponse);
      await genericApiCall("economic_activity", {
        value: emptyValue,
        factorId: 42,
      });
      expect(EconomicActivity.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: expect.not.objectContaining({ value: expect.anything() }),
        })
      );
    }
  );

  it("still includes value in activity for economic_activity when value is provided", async () => {
    (EconomicActivity.calculate as jest.Mock).mockResolvedValueOnce(mockEconomicActivityResponse);
    await genericApiCall("economic_activity", {
      value: 500,
      factorId: 42,
    });
    expect(EconomicActivity.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        activity: expect.objectContaining({ value: 500 }),
      })
    );
  });
});
