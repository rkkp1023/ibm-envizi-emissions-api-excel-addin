// Copyright IBM Corp. 2026

import {
  extractCellReferences,
  extractParameterCellAddresses,
  getParamsFromCell,
  isRecommendActivityTypeFormula,
  parseFormulaParams,
  readCellValues,
} from "../../src/commands/formula-parser";

// convertExcelDateToISO is a passthrough so date formatting doesn't interfere.
jest.mock("../../src/functions/utils", () => ({
  ...jest.requireActual("../../src/functions/utils"),
  convertExcelDateToISO: jest.fn((d: string) => d),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a minimal fake Excel.RequestContext whose active worksheet returns
 * the provided cell values keyed by cell reference.
 */
function buildFakeContext(cellValueMap: Record<string, string> = {}): Excel.RequestContext {
  const makeRange = (value: string) => ({
    load: jest.fn(),
    values: [[value]],
    formulas: [[value]],
  });

  const worksheet = {
    getRange: jest.fn((ref: string) => makeRange(cellValueMap[ref] ?? "")),
  };

  return {
    workbook: {
      worksheets: {
        getActiveWorksheet: jest.fn(() => worksheet),
      },
    },
    sync: jest.fn().mockResolvedValue(undefined),
  } as unknown as Excel.RequestContext;
}

/**
 * Builds a fake context where a single cell at `cellAddress` contains a known
 * formula and display value — used for getParamsFromCell tests.
 */
function buildGetParamsContext({
  cellAddress,
  formula,
  value,
  cellValueMap = {},
}: {
  cellAddress: string;
  formula: string;
  value: string;
  cellValueMap?: Record<string, string>;
}): Excel.RequestContext {
  const ranges: Record<string, { load: jest.Mock; values: any[][]; formulas: any[][] }> = {
    [cellAddress]: {
      load: jest.fn(),
      values: [[value]],
      formulas: [[formula]],
    },
    ...Object.fromEntries(
      Object.entries(cellValueMap).map(([ref, v]) => [
        ref,
        { load: jest.fn(), values: [[v]], formulas: [[v]] },
      ])
    ),
  };

  const worksheet = {
    getRange: jest.fn(
      (ref: string) => ranges[ref] ?? { load: jest.fn(), values: [[""]], formulas: [[""]] }
    ),
  };

  return {
    workbook: {
      worksheets: {
        getActiveWorksheet: jest.fn(() => worksheet),
      },
    },
    sync: jest.fn().mockResolvedValue(undefined),
  } as unknown as Excel.RequestContext;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("formula-parser", () => {
  // ── isRecommendActivityTypeFormula ───────────────────────────────────────────

  describe("isRecommendActivityTypeFormula", () => {
    describe("returns true", () => {
      it("should detect the exact formula string", () => {
        expect(isRecommendActivityTypeFormula("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1)")).toBe(true);
      });

      it("should be case-insensitive for the formula name", () => {
        expect(isRecommendActivityTypeFormula("=envizi.recommend_activity_type(A1,B1)")).toBe(true);
      });

      it("should be case-insensitive for mixed casing", () => {
        expect(isRecommendActivityTypeFormula("=Envizi.Recommend_Activity_Type(A1,B1)")).toBe(true);
      });

      it("should match when formula has leading/trailing whitespace", () => {
        expect(isRecommendActivityTypeFormula("  =ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1)  ")).toBe(
          true
        );
      });

      it("should match a full 6-argument formula", () => {
        expect(
          isRecommendActivityTypeFormula("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1,C1,D1,E1,F1)")
        ).toBe(true);
      });
    });

    describe("returns false", () => {
      it("should return false for an empty string", () => {
        expect(isRecommendActivityTypeFormula("")).toBe(false);
      });

      it("should return false for a non-formula string", () => {
        expect(isRecommendActivityTypeFormula("electricity")).toBe(false);
      });

      it("should return false for a different ENVIZI formula", () => {
        expect(isRecommendActivityTypeFormula("=ENVIZI.LOCATION(A1,B1)")).toBe(false);
      });

      it("should return false when the opening parenthesis is missing", () => {
        expect(isRecommendActivityTypeFormula("=ENVIZI.RECOMMEND_ACTIVITY_TYPE")).toBe(false);
      });

      it("should return false for null input", () => {
        expect(isRecommendActivityTypeFormula(null as any)).toBe(false);
      });

      it("should return false for undefined input", () => {
        expect(isRecommendActivityTypeFormula(undefined as any)).toBe(false);
      });

      it("should return false for a number input", () => {
        expect(isRecommendActivityTypeFormula(42 as any)).toBe(false);
      });
    });
  });

  // ── extractCellReferences ───────────────────────────────────────────────────

  describe("extractCellReferences", () => {
    it("should extract simple cell references", () => {
      expect(extractCellReferences("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B2,C3)")).toEqual([
        "A1",
        "B2",
        "C3",
      ]);
    });

    it("should extract absolute cell references with $ prefix", () => {
      const refs = extractCellReferences("=$A$1,$B$2");
      expect(refs).toContain("$A$1");
      expect(refs).toContain("$B$2");
    });

    it("should extract multi-letter column references", () => {
      const refs = extractCellReferences("=AA10,BC20");
      expect(refs).toContain("AA10");
      expect(refs).toContain("BC20");
    });

    it("should return an empty array for a formula with no cell references", () => {
      expect(extractCellReferences('="static text"')).toEqual([]);
    });

    it("should return an empty array for an empty string", () => {
      expect(extractCellReferences("")).toEqual([]);
    });

    it("should return an empty array for null/falsy input", () => {
      expect(extractCellReferences(null as any)).toEqual([]);
    });

    it("should return references in the order they appear in the formula", () => {
      const refs = extractCellReferences("=A1+B2+C3");
      expect(refs).toEqual(["A1", "B2", "C3"]);
    });
  });

  // ── extractParameterCellAddresses ───────────────────────────────────────────

  describe("extractParameterCellAddresses", () => {
    it("should extract all 6 cell positions from a 6-argument formula", () => {
      const result = extractParameterCellAddresses(
        "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1,C1,D1,E1,F1)"
      );
      expect(result).toEqual({
        searchCell: "A1",
        countryCell: "B1",
        stateProvinceCell: "C1",
        unitCell: "D1",
        scopeCell: "E1",
        dateCell: "F1",
        factorSetCell: undefined,
      });
    });

    it("should extract all 7 cell positions from a full 7-argument formula", () => {
      const result = extractParameterCellAddresses(
        "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1,C1,D1,E1,F1,G1)"
      );
      expect(result).toEqual({
        searchCell: "A1",
        countryCell: "B1",
        stateProvinceCell: "C1",
        unitCell: "D1",
        scopeCell: "E1",
        dateCell: "F1",
        factorSetCell: "G1",
      });
    });

    it("should extract 2-argument formula (search + country)", () => {
      const result = extractParameterCellAddresses("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)");
      expect(result.searchCell).toBe("B7");
      expect(result.countryCell).toBe("H7");
      expect(result.stateProvinceCell).toBeUndefined();
      expect(result.unitCell).toBeUndefined();
      expect(result.scopeCell).toBeUndefined();
      expect(result.dateCell).toBeUndefined();
      expect(result.factorSetCell).toBeUndefined();
    });

    it("should set slot to undefined when the argument is a string literal, not a cell ref", () => {
      const result = extractParameterCellAddresses(
        '=ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity",B1)'
      );
      expect(result.searchCell).toBeUndefined();
      expect(result.countryCell).toBe("B1");
    });

    it("should handle absolute references ($A$1)", () => {
      const result = extractParameterCellAddresses("=ENVIZI.RECOMMEND_ACTIVITY_TYPE($A$1,$B$1)");
      expect(result.searchCell).toBe("$A$1");
      expect(result.countryCell).toBe("$B$1");
    });

    it("should return an empty object for an empty string", () => {
      expect(extractParameterCellAddresses("")).toEqual({});
    });

    it("should return an empty object for null/falsy input", () => {
      expect(extractParameterCellAddresses(null as any)).toEqual({});
    });

    it("should return an empty object when there are no parentheses", () => {
      expect(extractParameterCellAddresses("=ENVIZI.RECOMMEND_ACTIVITY_TYPE")).toEqual({});
    });
  });

  // ── readCellValues ──────────────────────────────────────────────────────────

  describe("readCellValues", () => {
    it("should return values for each cell reference in order", async () => {
      const ctx = buildFakeContext({ A1: "electricity", B1: "USA" });
      const values = await readCellValues(["A1", "B1"], ctx);
      expect(values).toEqual(["electricity", "USA"]);
    });

    it("should return an empty string for a missing cell reference", async () => {
      const ctx = buildFakeContext({});
      const values = await readCellValues(["Z99"], ctx);
      expect(values).toEqual([""]);
    });

    it("should return an empty array for an empty cell references list", async () => {
      const ctx = buildFakeContext({});
      const values = await readCellValues([], ctx);
      expect(values).toEqual([]);
    });

    it("should call context.sync once per cell reference", async () => {
      const ctx = buildFakeContext({ A1: "v1", B1: "v2", C1: "v3" });
      await readCellValues(["A1", "B1", "C1"], ctx);
      expect(ctx.sync).toHaveBeenCalledTimes(3);
    });

    it("should convert numeric cell values to strings", async () => {
      const ctx = buildFakeContext({ A1: "42" });
      const values = await readCellValues(["A1"], ctx);
      expect(values[0]).toBe("42");
    });

    it("should return an empty string and continue when sync throws for a cell", async () => {
      const worksheet = {
        getRange: jest.fn(() => ({ load: jest.fn(), values: [[""]] })),
      };
      const ctx = {
        workbook: { worksheets: { getActiveWorksheet: jest.fn(() => worksheet) } },
        sync: jest.fn().mockRejectedValueOnce(new Error("sync error")),
      } as unknown as Excel.RequestContext;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const values = await readCellValues(["A1"], ctx);
      expect(values).toEqual([""]);
      consoleSpy.mockRestore();
    });
  });

  // ── parseFormulaParams ──────────────────────────────────────────────────────

  describe("parseFormulaParams", () => {
    it("should parse a 2-argument formula (search + country)", async () => {
      const ctx = buildFakeContext({ B7: "electricity", H7: "USA" });
      const result = await parseFormulaParams("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)", ctx);
      expect(result.search).toBe("electricity");
      expect(result.country).toBe("USA");
      expect(result.stateProvince).toBeUndefined();
      expect(result.unit).toBeUndefined();
      expect(result.scope).toBeUndefined();
      expect(result.date).toBeUndefined();
    });

    it("should parse a full 6-argument formula", async () => {
      const ctx = buildFakeContext({
        B1: "natural gas",
        C1: "AUS",
        D1: "Victoria",
        E1: "GJ",
        F1: "1",
        G1: "2024-03-15",
      });
      const result = await parseFormulaParams(
        "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B1,C1,D1,E1,F1,G1)",
        ctx
      );
      expect(result.search).toBe("natural gas");
      expect(result.country).toBe("AUS");
      expect(result.stateProvince).toBe("Victoria");
      expect(result.unit).toBe("GJ");
      expect(result.scope).toBe("1");
      expect(result.date).toBe("2024-03-15");
      expect(result.factorSet).toBeUndefined();
    });

    it("should parse a fully-specified 7-argument formula (with factorSet)", async () => {
      const ctx = buildFakeContext({
        B1: "natural gas",
        C1: "AUS",
        D1: "Victoria",
        E1: "GJ",
        F1: "1",
        G1: "2024-03-15",
        H1: "EPA",
      });
      const result = await parseFormulaParams(
        "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B1,C1,D1,E1,F1,G1,H1)",
        ctx
      );
      expect(result.search).toBe("natural gas");
      expect(result.country).toBe("AUS");
      expect(result.stateProvince).toBe("Victoria");
      expect(result.unit).toBe("GJ");
      expect(result.scope).toBe("1");
      expect(result.date).toBe("2024-03-15");
      expect(result.factorSet).toBe("EPA");
    });

    it("should strip surrounding quotes from static string literals", async () => {
      const ctx = buildFakeContext({ H7: "USA" });
      const result = await parseFormulaParams(
        '=ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity",H7)',
        ctx
      );
      expect(result.search).toBe("electricity");
      expect(result.country).toBe("USA");
    });

    it("should default country to USA when country cell is empty", async () => {
      const ctx = buildFakeContext({ A1: "coal", B1: "" });
      const result = await parseFormulaParams("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1)", ctx);
      expect(result.country).toBe("USA");
    });

    it("should set stateProvince to undefined when the cell is empty", async () => {
      const ctx = buildFakeContext({ A1: "coal", B1: "AUS", C1: "" });
      const result = await parseFormulaParams("=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,B1,C1)", ctx);
      expect(result.stateProvince).toBeUndefined();
    });

    it("should throw when the formula has no parentheses", async () => {
      const ctx = buildFakeContext({});
      await expect(parseFormulaParams("=ENVIZI.RECOMMEND_ACTIVITY_TYPE", ctx)).rejects.toThrow(
        "Invalid formula"
      );
    });

    it("should throw when the formula is empty", async () => {
      const ctx = buildFakeContext({});
      await expect(parseFormulaParams("", ctx)).rejects.toThrow("Invalid formula");
    });
  });

  // ── getParamsFromCell ────────────────────────────────────────────────────────

  describe("getParamsFromCell", () => {
    it("should parse formula params when the cell contains a recommend_activity_type formula", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "B7",
        formula: "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1,C1)",
        value: "#VALUE!",
        cellValueMap: { A1: "electricity", C1: "AUS" },
      });

      const result = await getParamsFromCell("B7", ctx);

      expect(result.search).toBe("electricity");
      expect(result.country).toBe("AUS");
    });

    it("should use cell text as search with default country when cell has no formula", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "A1",
        formula: "",
        value: "natural gas",
      });

      const result = await getParamsFromCell("A1", ctx);

      expect(result.search).toBe("natural gas");
      expect(result.country).toBe("USA");
    });

    it("should use cell text as search when formula is a plain value (not ENVIZI formula)", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "A1",
        formula: "=SUM(B1:B5)",
        value: "42",
      });

      const result = await getParamsFromCell("A1", ctx);

      expect(result.search).toBe("42");
      expect(result.country).toBe("USA");
    });

    it("should load formulas and values from the cell range", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "B7",
        formula: "",
        value: "coal",
      });

      await getParamsFromCell("B7", ctx);

      const ws = (ctx.workbook.worksheets.getActiveWorksheet as jest.Mock)();
      expect(ws.getRange).toHaveBeenCalledWith("B7");
    });

    it("should call context.sync to load cell data", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "A1",
        formula: "",
        value: "electricity",
      });

      await getParamsFromCell("A1", ctx);

      expect(ctx.sync).toHaveBeenCalled();
    });

    it("should return empty search string when cell value is empty and no formula", async () => {
      const ctx = buildGetParamsContext({
        cellAddress: "A1",
        formula: "",
        value: "",
      });

      const result = await getParamsFromCell("A1", ctx);

      expect(result.search).toBe("");
      expect(result.country).toBe("USA");
    });
  });
});
