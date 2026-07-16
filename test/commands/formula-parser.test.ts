// Copyright IBM Corp. 2026

// convertExcelDateToISO is a passthrough mock so date formatting is transparent.
jest.mock("../../src/functions/utils", () => ({
  ...jest.requireActual("../../src/functions/utils"),
  convertExcelDateToISO: jest.fn((d: string) => d),
}));

import { parseFormulaParams } from "../../src/commands/formula-parser";

/**
 * Builds a minimal fake Excel.RequestContext whose active worksheet returns
 * the provided cell values by cell reference, in order.
 *
 * readCellValues iterates cell refs sequentially. We keep a counter so each
 * call to getRange returns the next value from `cellValueMap`.
 */
function buildFakeContext(cellValueMap: Record<string, string>): Excel.RequestContext {
  const makeRange = (value: string) => ({
    load: jest.fn(),
    values: [[value]],
  });

  const worksheet = {
    getRange: jest.fn((cellRef: string) => makeRange(cellValueMap[cellRef] ?? "")),
  };

  const context = {
    workbook: {
      worksheets: {
        getActiveWorksheet: jest.fn(() => worksheet),
      },
    },
    sync: jest.fn().mockResolvedValue(undefined),
  };

  return context as unknown as Excel.RequestContext;
}

describe("parseFormulaParams", () => {
  it("handles a 2-argument formula (search + country only) without throwing", async () => {
    // =ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7) — B7="electricity", H7="USA"
    const ctx = buildFakeContext({ B7: "electricity", H7: "USA" });

    const result = await parseFormulaParams(
      "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(B7,H7)",
      ctx
    );

    expect(result.search).toBe("electricity");
    expect(result.country).toBe("USA");
    expect(result.stateProvince).toBeUndefined();
    expect(result.unit).toBeUndefined();
    expect(result.scope).toBeUndefined();
    expect(result.date).toBeUndefined();
  });

  it("handles a fully-specified 6-argument formula", async () => {
    // =ENVIZI.RECOMMEND_ACTIVITY_TYPE(B1,C1,D1,E1,F1,G1)
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
  });

  it("strips surrounding quotes from a static string literal for search", async () => {
    // =ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity",H7) — search is a literal, country is a cell
    const ctx = buildFakeContext({ H7: "USA" });

    const result = await parseFormulaParams(
      '=ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity",H7)',
      ctx
    );

    expect(result.search).toBe("electricity");
    expect(result.country).toBe("USA");
    expect(result.date).toBeUndefined();
  });
});
