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

  describe("Output headers only", () => {
    it("should return only output headers for calculation endpoint when input=false, output=true", async () => {
      const result = await headers(undefined, false, true);
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
      const result = await headers("location", false, true);
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
      const result = await headers("stationary", false, true);
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
      const result = await headers("factor", false, true);
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
      const result = await headers("factor_search", false, true);
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
      const result = await headers("calculation", true, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for location endpoint (includes powerGrid)", async () => {
      const result = await headers("location", true, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for stationary endpoint (no powerGrid)", async () => {
      const result = await headers("stationary", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for fugitive endpoint", async () => {
      const result = await headers("fugitive", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for mobile endpoint", async () => {
      const result = await headers("mobile", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for transportation_and_distribution endpoint", async () => {
      const result = await headers("transportation_and_distribution", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for economic_activity endpoint", async () => {
      const result = await headers("economic_activity", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for real_estate endpoint", async () => {
      const result = await headers("real_estate", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor endpoint", async () => {
      const result = await headers("factor", true, false);
      expect(result).toEqual([["Activity Type", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor_search endpoint", async () => {
      const result = await headers("factor_search", true, false);
      expect(result).toEqual([["Search", "Country", "StateProvince", "Unit", "Scope", "Date", "Page", "Size"]]);
    });
  });

  describe("Case insensitivity and whitespace handling", () => {
    it("should handle uppercase endpoint names", async () => {
      const result = await headers("LOCATION", true, false);
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
      const result = await headers("  fugitive  ", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid endpoint", async () => {
      await expect(headers("invalid_endpoint")).rejects.toThrow(/Invalid function name/);
    });

    it("should throw error with list of valid endpoints", async () => {
      try {
        await headers("bad_endpoint", false, true);
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
        await headers("unknown", false, true);
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.code).toBeDefined();
      }
    });
  });

  describe("Boolean parameter case insensitivity", () => {
    it('should handle string "true" (lowercase)', async () => {
      const result = await headers("location", "true" as any, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string "TRUE" (uppercase)', async () => {
      const result = await headers("stationary", "TRUE" as any, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should handle string "false" (lowercase)', async () => {
      const result = await headers("mobile", "false" as any, true);
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
      const result = await headers("fugitive", "FALSE" as any, true);
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
      const result = await headers("calculation", "TrUe" as any, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string with whitespace " true "', async () => {
      const result = await headers("economic_activity", " true " as any, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should treat non-"true" strings as false', async () => {
      const result = await headers("real_estate", "yes" as any, true);
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
          "Energy (MWh)",
          "Asset Turn Over Ratio",
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

    it("should default to both input and output headers when parameters not provided", async () => {
      const result = await headers("location");
      // Should contain both input and output headers
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("TotalCO2e");
      expect(result[0].length).toBeGreaterThan(13);
    });

    it("should default input=true and output=true when both are undefined", async () => {
      const result = await headers("mobile", undefined, undefined);
      // Should contain both input and output headers
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("TotalCO2e");
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

import { headers_by_factorid } from "../src/functions/functions";

describe("ENVIZI.HEADERS_BY_FACTORID function", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("FactorId input headers", () => {
    it("should return both input and output headers for calculation endpoint (default)", async () => {
      const result = await headers();
      // Should contain both input and output headers by default
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("TotalCO2e");
      expect(result[0].length).toBeGreaterThan(13);
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
      const result = await headers("stationary", false, true);
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
      const result = await headers("factor", false, true);
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
      const result = await headers("factor_search", false, true);
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
      const result = await headers("calculation", true, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for location endpoint (includes powerGrid)", async () => {
      const result = await headers("location", true, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it("should return input headers for stationary endpoint (no powerGrid)", async () => {
      const result = await headers("stationary", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for fugitive endpoint", async () => {
      const result = await headers("fugitive", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for mobile endpoint", async () => {
      const result = await headers("mobile", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for transportation_and_distribution endpoint", async () => {
      const result = await headers("transportation_and_distribution", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for economic_activity endpoint", async () => {
      const result = await headers("economic_activity", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for real_estate endpoint", async () => {
      const result = await headers("real_estate", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor endpoint", async () => {
      const result = await headers("factor", true, false);
      expect(result).toEqual([["Activity Type", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it("should return input headers for factor_search endpoint", async () => {
      const result = await headers("factor_search", true, false);
      expect(result).toEqual([["Search", "Country", "StateProvince", "Unit", "Scope", "Date", "Page", "Size"]]);
    });
  });

  describe("Case insensitivity and whitespace handling", () => {
    it("should handle uppercase endpoint names", async () => {
      const result = await headers("LOCATION", true, false);
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
      const result = await headers("  fugitive  ", true, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid endpoint", async () => {
      await expect(headers("invalid_endpoint")).rejects.toThrow(/Invalid function name/);
    });

    it("should throw error with list of valid endpoints", async () => {
      try {
        await headers("bad_endpoint", false, true);
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
        await headers("unknown", false, true);
        fail("Should have thrown an error");
      } catch (e: any) {
        expect(e.message).toContain("Invalid function name");
        expect(e.code).toBeDefined();
      }
    });
  });

  describe("Boolean parameter case insensitivity", () => {
    it('should handle string "true" (lowercase)', async () => {
      const result = await headers("location", "true" as any, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string "TRUE" (uppercase)', async () => {
      const result = await headers("stationary", "TRUE" as any, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should handle string "false" (lowercase)', async () => {
      const result = await headers("mobile", "false" as any, true);
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
      const result = await headers("fugitive", "FALSE" as any, true);
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
      const result = await headers("calculation", "TrUe" as any, false);
      expect(result).toEqual([
        ["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date", "Power Grid"],
      ]);
    });

    it('should handle string with whitespace " true "', async () => {
      const result = await headers("economic_activity", " true " as any, false);
      expect(result).toEqual([["Activity Type", "Value", "Unit", "Country", "StateProvince", "Date"]]);
    });

    it('should treat non-"true" strings as false', async () => {
      const result = await headers("real_estate", "yes" as any, true);
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
          "Energy (MWh)",
          "Asset Turn Over Ratio",
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
      const result = await headers("location", false, true);
      const outputResult = await headers("location", false);
      expect(result).toEqual(outputResult);
    });

    it("should default to both input and output headers when input is undefined", async () => {
      const result = await headers("mobile", undefined);
      // Should contain both input and output headers
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("TotalCO2e");
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
      const result = await headers_by_factorid("location", true, false);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for stationary endpoint", async () => {
      const result = await headers_by_factorid("stationary", true, false);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for calculation endpoint", async () => {
      const result = await headers_by_factorid("calculation", true, false);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it("should return factorId input headers for factor endpoint", async () => {
      const result = await headers_by_factorid("factor", true, false);
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
      const result = await headers_by_factorid("mobile", false, true);
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
      const result = await headers_by_factorid("LOCATION", true, false);
      expect(result).toEqual([["factorId", "value", "unit"]]);
    });

    it('should handle string "TRUE" for input parameter', async () => {
      const result = await headers_by_factorid("stationary", "TRUE" as any, false);
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

  describe("Input headers with includeActivityTypeRecommender", () => {
    it("should include recommender headers for location endpoint when flag is true", async () => {
      const result = await headers("location", true, false, true);
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
      const result = await headers("location", true, false, false);
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
      const result = await headers("stationary", true, false);
      expect(result).toEqual([[
        "Activity Type",
        "Value",
        "Unit",
        "Country",
        "StateProvince",
        "Date"
      ]]);
    });

    it("should handle string 'true' for includeActivityTypeRecommender parameter", async () => {
      const result = await headers("mobile", "true", "false", "true");
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("Recommended Activity Type");
      expect(result[0]).toContain("Confidence(%)");
      expect(result[0]).toContain("Description");
    });

    it("should ignore includeActivityTypeRecommender when input is false", async () => {
      const result = await headers("location", false, true, true);
      expect(result[0]).toContain("TotalCO2e");
      expect(result[0]).not.toContain("Recommended Activity Type");
    });

    it("should not add recommender headers for endpoints without 'type' field", async () => {
      const result = await headers("factor_search", true, false, true);
      expect(result).toEqual([[
        "Search",
        "Country",
        "StateProvince",
        "Unit",
        "Scope",
        "Date",
        "Page",
        "Size"
      ]]);
    });
  });

  describe("recommend_activity_type endpoint", () => {
    it("should return input headers for recommend_activity_type endpoint", async () => {
      const result = await headers("recommend_activity_type", true, false);
      expect(result).toEqual([[
        "Search",
        "Country",
        "StateProvince",
        "Unit",
        "Scope",
        "Date"
      ]]);
    });

    it("should return both input and output headers when both are true with recommender", async () => {
      const result = await headers("calculation", true, true, true);
      // Should contain input headers with recommender
      expect(result[0]).toContain("Activity Type");
      expect(result[0]).toContain("Recommended Activity Type");
      expect(result[0]).toContain("Confidence(%)");
      expect(result[0]).toContain("Description");
      expect(result[0]).toContain("Value");
      expect(result[0]).toContain("Unit");
      expect(result[0]).toContain("Country");
      // Should also contain output headers
      expect(result[0]).toContain("TotalCO2e");
      expect(result[0]).toContain("CO2");
      expect(result[0]).toContain("Transaction Id");
    });
  });
  });
});