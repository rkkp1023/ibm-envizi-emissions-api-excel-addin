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

import { headers } from "../src/functions/functions";

describe("ENVIZI.HEADERS function", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("Output headers (default)", () => {
    it("should return output headers for calculation endpoint (default)", async () => {
      const result = await headers();
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for location endpoint", async () => {
      const result = await headers("location", false);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for stationary endpoint", async () => {
      const result = await headers("stationary");
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for factor endpoint", async () => {
      const result = await headers("factor");
      expect(result).toEqual([
        [
          "Factor Set",
          "Source",
          "Methodology",
          "Scope",
          "Activity Type",
          "Activity Unit",
          "Name",
          "Description",
          "Published From",
          "Published To",
          "Region",
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Factor Id",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for factor_search endpoint", async () => {
      const result = await headers("factor_search");
      expect(result).toEqual([
        [
          "Factor Set",
          "Source",
          "Methodology",
          "Scope",
          "Activity Type",
          "Activity Unit",
          "Region",
          "Factor Id",
          "Published From",
          "Published To",
        ],
      ]);
    });
  });

  describe("Input headers", () => {
    it("should return input headers for calculation endpoint", async () => {
      const result = await headers("calculation", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for location endpoint (includes powerGrid)", async () => {
      const result = await headers("location", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for stationary endpoint (no powerGrid)", async () => {
      const result = await headers("stationary", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for fugitive endpoint", async () => {
      const result = await headers("fugitive", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for mobile endpoint", async () => {
      const result = await headers("mobile", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for transportation_and_distribution endpoint", async () => {
      const result = await headers("transportation_and_distribution", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for economic_activity endpoint", async () => {
      const result = await headers("economic_activity", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for real_estate endpoint", async () => {
      const result = await headers("real_estate", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor endpoint", async () => {
      const result = await headers("factor", true);
      expect(result).toEqual([["Activity Type", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor_search endpoint", async () => {
      const result = await headers("factor_search", true);
      expect(result).toEqual([["Search", "Country", "StateProvince", "Date", "Page", "Size"]]);
    });
  });

  describe("Case insensitivity and whitespace handling", () => {
    it("should handle uppercase endpoint names", async () => {
      const result = await headers("LOCATION", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should handle mixed case endpoint names", async () => {
      const result = await headers("StAtIoNaRy", false);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should handle endpoint names with whitespace", async () => {
      const result = await headers("  fugitive  ", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid endpoint", async () => {
      await expect(headers("invalid_endpoint")).rejects.toThrow(/Invalid function name/);
    });

    it("should throw error with list of valid endpoints", async () => {
      try {
        await headers("bad_endpoint");
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.message).toContain("location");
        expect(e.message).toContain("stationary");
        expect(e.message).toContain("calculation");
      }
    });

    it("should throw error for invalid endpoint with proper message", async () => {
      try {
        await headers("unknown");
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.code).toBeDefined();
      }
    });
  });

  describe("Boolean parameter case insensitivity", () => {
    it('should handle string "true" (lowercase)', async () => {
      const result = await headers("location", "true" as any);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string "TRUE" (uppercase)', async () => {
      const result = await headers("stationary", "TRUE" as any);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should handle string "false" (lowercase)', async () => {
      const result = await headers("mobile", "false" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it('should handle string "FALSE" (uppercase)', async () => {
      const result = await headers("fugitive", "FALSE" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it('should handle string "TrUe" (mixed case)', async () => {
      const result = await headers("calculation", "TrUe" as any);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string with whitespace " true "', async () => {
      const result = await headers("economic_activity", " true " as any);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should treat non-"true" strings as false', async () => {
      const result = await headers("real_estate", "yes" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });
  });

  describe("Default parameter behavior", () => {
    it("should default to calculation endpoint when no endpoint provided", async () => {
      const result = await headers();
      const calculationResult = await headers("calculation");
      expect(result).toEqual(calculationResult);
    });

    it("should default to output headers when input parameter not provided", async () => {
      const result = await headers("location");
      const outputResult = await headers("location", false);
      expect(result).toEqual(outputResult);
    });

    it("should default to output headers when input is undefined", async () => {
      const result = await headers("mobile", undefined);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });
  });

  describe("All endpoints coverage", () => {
    const allEndpoints = [
      "location",
      "stationary",
      "fugitive",
      "mobile",
      "transportation_and_distribution",
      "calculation",
      "economic_activity",
      "real_estate",
      "factor",
      "factor_search",
    ];

    it.each(allEndpoints)("should return valid input headers for %s", async (endpoint) => {
      const result = await headers(endpoint, true);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBeGreaterThan(0);
    });

    it.each(allEndpoints)("should return valid output headers for %s", async (endpoint) => {
      const result = await headers(endpoint, false);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBeGreaterThan(0);
    });
  });
});
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

import { headers_by_factorid } from "../src/functions/functions";

describe("ENVIZI.HEADERS function", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("Output headers (default)", () => {
    it("should return output headers for calculation endpoint (default)", async () => {
      const result = await headers();
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for location endpoint", async () => {
      const result = await headers("location", false);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for stationary endpoint", async () => {
      const result = await headers("stationary");
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for factor endpoint", async () => {
      const result = await headers("factor");
      expect(result).toEqual([
        [
          "Factor Set",
          "Source",
          "Methodology",
          "Scope",
          "Activity Type",
          "Activity Unit",
          "Name",
          "Description",
          "Published From",
          "Published To",
          "Region",
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Factor Id",
          "Transaction Id",
        ],
      ]);
    });

    it("should return output headers for factor_search endpoint", async () => {
      const result = await headers("factor_search");
      expect(result).toEqual([
        [
          "Factor Set",
          "Source",
          "Methodology",
          "Scope",
          "Activity Type",
          "Activity Unit",
          "Region",
          "Factor Id",
          "Published From",
          "Published To",
        ],
      ]);
    });
  });

  describe("Input headers", () => {
    it("should return input headers for calculation endpoint", async () => {
      const result = await headers("calculation", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for location endpoint (includes powerGrid)", async () => {
      const result = await headers("location", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for stationary endpoint (no powerGrid)", async () => {
      const result = await headers("stationary", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for fugitive endpoint", async () => {
      const result = await headers("fugitive", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for mobile endpoint", async () => {
      const result = await headers("mobile", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for transportation_and_distribution endpoint", async () => {
      const result = await headers("transportation_and_distribution", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for economic_activity endpoint", async () => {
      const result = await headers("economic_activity", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for real_estate endpoint", async () => {
      const result = await headers("real_estate", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor endpoint", async () => {
      const result = await headers("factor", true);
      expect(result).toEqual([["Activity Type", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor_search endpoint", async () => {
      const result = await headers("factor_search", true);
      expect(result).toEqual([["Search", "Country", "StateProvince", "Date", "Page", "Size"]]);
    });
  });

  describe("Case insensitivity and whitespace handling", () => {
    it("should handle uppercase endpoint names", async () => {
      const result = await headers("LOCATION", true);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should handle mixed case endpoint names", async () => {
      const result = await headers("StAtIoNaRy", false);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should handle endpoint names with whitespace", async () => {
      const result = await headers("  fugitive  ", true);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid endpoint", async () => {
      await expect(headers("invalid_endpoint")).rejects.toThrow(/Invalid function name/);
    });

    it("should throw error with list of valid endpoints", async () => {
      try {
        await headers("bad_endpoint");
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.message).toContain("location");
        expect(e.message).toContain("stationary");
        expect(e.message).toContain("calculation");
      }
    });

    it("should throw error for invalid endpoint with proper message", async () => {
      try {
        await headers("unknown");
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.code).toBeDefined();
      }
    });
  });

  describe("Boolean parameter case insensitivity", () => {
    it('should handle string "true" (lowercase)', async () => {
      const result = await headers("location", "true" as any);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string "TRUE" (uppercase)', async () => {
      const result = await headers("stationary", "TRUE" as any);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should handle string "false" (lowercase)', async () => {
      const result = await headers("mobile", "false" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it('should handle string "FALSE" (uppercase)', async () => {
      const result = await headers("fugitive", "FALSE" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it('should handle string "TrUe" (mixed case)', async () => {
      const result = await headers("calculation", "TrUe" as any);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string with whitespace " true "', async () => {
      const result = await headers("economic_activity", " true " as any);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should treat non-"true" strings as false', async () => {
      const result = await headers("real_estate", "yes" as any);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });
  });

  describe("Default parameter behavior", () => {
    it("should default to calculation endpoint when no endpoint provided", async () => {
      const result = await headers();
      const calculationResult = await headers("calculation");
      expect(result).toEqual(calculationResult);
    });

    it("should default to output headers when input parameter not provided", async () => {
      const result = await headers("location");
      const outputResult = await headers("location", false);
      expect(result).toEqual(outputResult);
    });

    it("should default to output headers when input is undefined", async () => {
      const result = await headers("mobile", undefined);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });
  });

  describe("All endpoints coverage", () => {
    const allEndpoints = [
      "location",
      "stationary",
      "fugitive",
      "mobile",
      "transportation_and_distribution",
      "calculation",
      "economic_activity",
      "real_estate",
      "factor",
      "factor_search",
    ];

    it.each(allEndpoints)("should return valid input headers for %s", async (endpoint) => {
      const result = await headers(endpoint, true);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBeGreaterThan(0);
    });

    it.each(allEndpoints)("should return valid output headers for %s", async (endpoint) => {
      const result = await headers(endpoint, false);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(Array.isArray(result[0])).toBe(true);
      expect(result[0].length).toBeGreaterThan(0);
    });
  });
});

describe("ENVIZI.HEADERS_BY_FACTORID function", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("FactorId input headers", () => {
    it("should return factorId input headers for location endpoint", async () => {
      const result = await headers_by_factorid("location", true);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for stationary endpoint", async () => {
      const result = await headers_by_factorid("stationary", true);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for calculation endpoint", async () => {
      const result = await headers_by_factorid("calculation", true);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for factor endpoint", async () => {
      const result = await headers_by_factorid("factor", true);
      expect(result).toEqual([["factorId", "unit"]]);
    });
  });

  describe("Output headers (same as regular headers)", () => {
    it("should return output headers for location endpoint", async () => {
      const result = await headers_by_factorid("location", false);
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });

    it("should default to output headers when input not specified", async () => {
      const result = await headers_by_factorid("mobile");
      expect(result).toEqual([
        [
          "TotalCO2e",
          "CO2",
          "CH4",
          "N2O",
          "HFC",
          "PFC",
          "SF6",
          "NF3",
          "BioCO2",
          "IndirectCO2e",
          "Unit",
          "Description",
          "Transaction Id",
        ],
      ]);
    });
  });

  describe("Error handling", () => {
    it("should throw error for factor_search endpoint", async () => {
      await expect(headers_by_factorid("factor_search", true)).rejects.toThrow(
        /does not support factorId-based calls/
      );
    });

    it("should throw error for invalid endpoint", async () => {
      await expect(headers_by_factorid("invalid", true)).rejects.toThrow(/Invalid function name/);
    });
  });

  describe("Case insensitivity", () => {
    it("should handle uppercase endpoint names", async () => {
      const result = await headers_by_factorid("LOCATION", true);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it('should handle string "TRUE" for input parameter', async () => {
      const result = await headers_by_factorid("stationary", "TRUE" as any);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });
  });

  describe("All supported endpoints", () => {
    const supportedEndpoints = [
      "location",
      "stationary",
      "fugitive",
      "mobile",
      "transportation_and_distribution",
      "calculation",
      "economic_activity",
      "real_estate",
      "factor",
    ];

    it.each(supportedEndpoints)(
      "should return factorId input headers for %s",
      async (endpoint) => {
        const result = await headers_by_factorid(endpoint, true);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        expect(Array.isArray(result[0])).toBe(true);
        expect(result[0]).toContain("factorId");
      }
    );

  describe("Input headers with includeDataTypeRecommender", () => {
    it("should include recommender headers for location endpoint when flag is true", async () => {
      const result = await headers("location", true, true);
      expect(result).toEqual([[
        "Activity Type",
        "Recommended Activity Type",
        "Confidence(%)",
        "Description",
        "Value",
        "Unit",
        "Country",
        "StateProvince",
        "Date",
        "Power Grid"
      ]]);
    });

    it("should not include recommender headers when flag is false", async () => {
      const result = await headers("location", true, false);
      expect(result).toEqual([[
        "Activity Type",
        "Value",
        "Unit",
        "Country",
        "StateProvince",
        "Date",
        "Power Grid"
      ]]);
    });

    it("should not include recommender headers when flag is not provided (default)", async () => {
      const result = await headers("stationary", true);
      expect(result).toEqual([[
        "Activity Type",
        "Value",
        "Unit",
        "Country",
        "StateProvince",
        "Date"
      ]]);
    });

    it("should handle string 'true' for includeDataTypeRecommender parameter", async () => {
      const result = await headers("mobile", "true", "true");
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("Recommended Activity Type");
      expect(result[0]).toContain("Confidence(%)");
      expect(result[0]).toContain("Description");
    });

    it("should not affect output headers when includeDataTypeRecommender is true", async () => {
      const result = await headers("location", false, true);
      expect(result[0]).toContain("TotalCO2e");
      expect(result[0]).not.toContain("Activity Name");
    });

    it("should not add recommender headers for endpoints without 'type' field", async () => {
      const result = await headers("factor_search", true, true);
      expect(result).toEqual([[
        "Search",
        "Country",
        "StateProvince",
        "Date",
        "Page",
        "Size"
      ]]);
    });
  });
  });
});