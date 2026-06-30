// Copyright IBM Corp. 2025
import { factorHelper } from "../src/functions/factorHelper";
import { factorSearch } from "../src/functions/factorSearchHelper";
import * as api from "../src/functions/functions";
import { genericApiCall } from "../src/functions/generic-api-call";

jest.mock("../src/functions/generic-api-call", () => ({
  genericApiCall: jest.fn(),
}));

jest.mock("../src/functions/factorSearchHelper", () => ({
  factorSearch: jest.fn(),
}));

jest.mock("../src/functions/factorHelper", () => ({
  factorHelper: jest.fn(),
}));


describe("emissions custom functions", () => {
  const mockedGenericApiCall = genericApiCall as jest.MockedFunction<typeof genericApiCall>;

  beforeEach(() => {
    mockedGenericApiCall.mockResolvedValue([["mocked-response"]]);
  });

  const commonTests: {
    fn: (...args: any[]) => Promise<any[][]>;
    name: string;
    apiType: Parameters<typeof genericApiCall>[0];
    args: any[];
    expectedPayload: any;
  }[] = [
    {
      fn: api.location,
      name: "location",
      apiType: "location",
      args: ["electricity", 100, "kWh","USA", "NY", "2024-01-01", "grid1"],
      expectedPayload: {
        type: "electricity",
        value: 100,
        country: "USA",
        stateProvince: "NY",
        date: "2024-01-01",
        unit: "kWh",
        powerGrid: "grid1",
      },
    },
    {
      fn: api.location_by_factorId,
      name: "location_by_factorId",
      apiType: "location",
      args: [123, 200, "kg"],
      expectedPayload: { factorId: 123, value: 200, unit: "kg" },
    },
    {
      fn: api.stationary,
      name: "stationary",
      apiType: "stationary",
      args: ["fuel", 10, "L", "USA", "CA", "2024-01-01"],
      expectedPayload: {
        type: "fuel",
        value: 10,
        unit: "L",
        country: "USA",
        stateProvince: "CA",
        date: "2024-01-01",
      },
    },
    {
      fn: api.stationary_by_factorId,
      name: "stationary_by_factorId",
      apiType: "stationary",
      args: [456, 20, "L"],
      expectedPayload: { factorId: 456, value: 20, unit: "L" },
    },
    {
      fn: api.fugitive,
      name: "fugitive",
      apiType: "fugitive",
      args: ["gas", 50, "kg", "USA", "TX", "2024-01-01"],
      expectedPayload: {
        type: "gas",
        value: 50,
        unit: "kg",
        country: "USA",
        stateProvince: "TX",
        date: "2024-01-01",
      },
    },
    {
      fn: api.fugitive_by_factorId,
      name: "fugitive_by_factorId",
      apiType: "fugitive",
      args: [789, 30, "kg"],
      expectedPayload: { factorId: 789, value: 30, unit: "kg" },
    },
    {
      fn: api.mobile,
      name: "mobile",
      apiType: "mobile",
      args: ["diesel", 70, "L", "USA", "FL", "2024-01-01"],
      expectedPayload: {
        type: "diesel",
        value: 70,
        unit: "L",
        country: "USA",
        stateProvince: "FL",
        date: "2024-01-01",
      },
    },
    {
      fn: api.mobile_by_factorId,
      name: "mobile_by_factorId",
      apiType: "mobile",
      args: [111, 90, "L"],
      expectedPayload: { factorId: 111, value: 90, unit: "L" },
    },
    {
      fn: api.transportation_and_distribution,
      name: "transportation_and_distribution",
      apiType: "transportation_and_distribution",
      args: ["shipping", 5, "ton", "USA", "WA", "2024-01-01"],
      expectedPayload: {
        type: "shipping",
        value: 5,
        unit: "ton",
        country: "USA",
        stateProvince: "WA",
        date: "2024-01-01",
      },
    },
    {
      fn: api.transportation_and_distribution_by_factorId,
      name: "transportation_and_distribution_by_factorId",
      apiType: "transportation_and_distribution",
      args: [222, 15, "ton"],
      expectedPayload: { factorId: 222, value: 15, unit: "ton" },
    },
    {
      fn: api.calculation,
      name: "calculation",
      apiType: "calculation",
      args: ["custom", 999, "kg", "USA", "NJ", "2024-01-01", "gridX"],
      expectedPayload: {
        type: "custom",
        value: 999,
        unit: "kg",
        country: "USA",
        stateProvince: "NJ",
        date: "2024-01-01",
        powerGrid: "gridX",
      },
    },
    {
      fn: api.calculation_by_factorId,
      name: "calculation_by_factorId",
      apiType: "calculation",
      args: [333, 444, "kg"],
      expectedPayload: { factorId: 333, value: 444, unit: "kg" },
    },
    {
      fn: api.economic_activity,
      name: "economic_activity",
      apiType: "economic_activity",
      args: ["office", 1000, "sqft", "USA", "CA", "2024-01-01"],
      expectedPayload: {
        type: "office",
        value: 1000,
        unit: "sqft",
        country: "USA",
        stateProvince: "CA",
        date: "2024-01-01",
      },
    },
    {
      fn: api.economic_activity_by_factorId,
      name: "economic_activity_by_factorId",
      apiType: "economic_activity",
      args: [555, 2000, "sqft"],
      expectedPayload: { factorId: 555, value: 2000, unit: "sqft" },
    },
    {
      fn: api.real_estate,
      name: "real_estate",
      apiType: "real_estate",
      args: ["building", 5000, "sqm", "USA", "NY", "2024-01-01"],
      expectedPayload: {
        type: "building",
        value: 5000,
        unit: "sqm",
        country: "USA",
        stateProvince: "NY",
        date: "2024-01-01",
      },
    },
    {
      fn: api.real_estate_by_factorId,
      name: "real_estate_by_factorId",
      apiType: "real_estate",
      args: [666, 3000, "sqm"],
      expectedPayload: { factorId: 666, value: 3000, unit: "sqm" },
    },
  ];

  test.each(commonTests)("$name calls genericApiCall correctly", async ({ fn, apiType, args, expectedPayload }) => {
    const result = await fn(...args);

    expect(mockedGenericApiCall).toHaveBeenCalledWith(apiType, expectedPayload);
    expect(result).toEqual([["mocked-response"]]);
  });

  it("propagates errors from genericApiCall", async () => {
    mockedGenericApiCall.mockRejectedValueOnce(new Error("Boom!"));
    await expect(api.location("electricity", 1, "kwh" , "USA")).rejects.toThrow("Boom!");
  });

  describe("economic_activity attribution", () => {
    it("passes full attribution when all fields provided", async () => {
      await api.economic_activity("office", 1000, "usd", "USA", undefined, undefined, 500000, 2000000, 1000000, 8000000, 3000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.objectContaining({
        attribution: { outstandingAmount: 500000, totalEquity: 2000000, totalDebt: 1000000, evic: 8000000, revenue: 3000000 },
      }));
    });

    it("passes only revenue when only revenue provided", async () => {
      await api.economic_activity("office", 1000, "usd", "USA", undefined, undefined, undefined, undefined, undefined, undefined, 2000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.objectContaining({
        attribution: { outstandingAmount: undefined, totalEquity: undefined, totalDebt: undefined, evic: undefined, revenue: 2000000 },
      }));
    });

    it("passes only outstandingAmount + evic when provided", async () => {
      await api.economic_activity("office", 1000, "usd", "USA", undefined, undefined, 500000, undefined, undefined, 8000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.objectContaining({
        attribution: { outstandingAmount: 500000, totalEquity: undefined, totalDebt: undefined, evic: 8000000, revenue: undefined },
      }));
    });

    it("omits attribution when no attribution fields provided", async () => {
      await api.economic_activity("office", 1000, "usd", "USA");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });

    it("economic_activity_by_factorId passes full attribution", async () => {
      await api.economic_activity_by_factorId(555, 1000, "usd", 500000, 2000000, 1000000, 8000000, 3000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.objectContaining({
        attribution: { outstandingAmount: 500000, totalEquity: 2000000, totalDebt: 1000000, evic: 8000000, revenue: 3000000 },
      }));
    });

    it("economic_activity_by_factorId omits attribution when none provided", async () => {
      await api.economic_activity_by_factorId(555, 1000, "usd");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("economic_activity", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });
  });

  describe("real_estate attribution", () => {
    it("passes outstandingAmount and propertyValue", async () => {
      await api.real_estate("Commercial", 5000, "m2", "USA", undefined, undefined, 1000000, 5000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("real_estate", expect.objectContaining({
        attribution: { outstandingAmount: 1000000, propertyValue: 5000000 },
      }));
    });

    it("omits attribution when no attribution fields provided", async () => {
      await api.real_estate("Commercial", 5000, "m2", "USA");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("real_estate", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });

    it("real_estate_by_factorId passes outstandingAmount and propertyValue", async () => {
      await api.real_estate_by_factorId(666, 5000, "m2", 1000000, 5000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("real_estate", expect.objectContaining({
        attribution: { outstandingAmount: 1000000, propertyValue: 5000000 },
      }));
    });

    it("real_estate_by_factorId omits attribution when none provided", async () => {
      await api.real_estate_by_factorId(666, 5000, "m2");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("real_estate", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });
  });

  describe("physical_activity attribution", () => {
    it("passes outstandingAmount + totalEquity + totalDebt (private company)", async () => {
      await api.physical_activity("commercial real estate", 0.1, "km2", "USA", undefined, undefined, 1000000, 3000000, 2000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("physical_activity", expect.objectContaining({
        attribution: { outstandingAmount: 1000000, totalEquity: 3000000, totalDebt: 2000000, evic: undefined },
      }));
    });

    it("passes outstandingAmount + evic (listed company)", async () => {
      await api.physical_activity("commercial real estate", 0.1, "km2", "USA", undefined, undefined, 1000000, undefined, undefined, 10000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("physical_activity", expect.objectContaining({
        attribution: { outstandingAmount: 1000000, totalEquity: undefined, totalDebt: undefined, evic: 10000000 },
      }));
    });

    it("omits attribution when no attribution fields provided", async () => {
      await api.physical_activity("commercial real estate", 0.1, "km2", "USA");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("physical_activity", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });

    it("physical_activity_by_factorId passes outstandingAmount + evic", async () => {
      await api.physical_activity_by_factorId(777, 0.1, "km2", 1000000, undefined, undefined, 10000000);
      expect(mockedGenericApiCall).toHaveBeenCalledWith("physical_activity", expect.objectContaining({
        attribution: { outstandingAmount: 1000000, totalEquity: undefined, totalDebt: undefined, evic: 10000000 },
      }));
    });

    it("physical_activity_by_factorId omits attribution when none provided", async () => {
      await api.physical_activity_by_factorId(777, 0.1, "km2");
      expect(mockedGenericApiCall).toHaveBeenCalledWith("physical_activity", expect.not.objectContaining({
        attribution: expect.anything(),
      }));
    });
  });
});

describe("factor-related functions", () => {
  const mockedFactorSearch = factorSearch as jest.MockedFunction<typeof factorSearch>;
  const mockedFactorHelper = factorHelper as jest.MockedFunction<typeof factorHelper>;

  beforeEach(() => {
    mockedFactorSearch.mockResolvedValue([["search-result"]]);
    mockedFactorHelper.mockResolvedValue([["helper-result"]]);
  });

  it("factor_search calls factorSearch with correct arguments", async () => {
    const result = await api.factor_search("electricity", "usa","new york", undefined, undefined, "10/10/2020");
    expect(mockedFactorSearch).toHaveBeenCalledWith("electricity", "usa","new york", undefined, undefined, "10/10/2020", undefined, undefined);
    expect(result).toEqual([["search-result"]]);
  });

  it("factor_search calls factorSearch with pagination parameters", async () => {
    const result = await api.factor_search("electricity", "usa", "new york", undefined, undefined, "10/10/2020", 2, 50);
    expect(mockedFactorSearch).toHaveBeenCalledWith("electricity", "usa", "new york", undefined, undefined, "10/10/2020", 2, 50);
    expect(result).toEqual([["search-result"]]);
  });

  it("factor calls factorHelper with correct arguments", async () => {
    const result = await api.factor("electricity", "kwh", "usa","new york","10/10/2020");
    expect(mockedFactorHelper).toHaveBeenCalledWith("electricity", "kwh", "usa","new york","10/10/2020");
    expect(result).toEqual([["helper-result"]]);
  });

  it("factorById calls factorHelper with correct arguments", async () => {
    const result = await api.factor_by_id(123, "kg");
    expect(mockedFactorHelper).toHaveBeenCalledWith(123, "kg");
    expect(result).toEqual([["helper-result"]]);
  });
});
