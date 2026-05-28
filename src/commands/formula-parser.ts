// Copyright IBM Corp. 2026

/**
 * Utility functions for parsing Excel formulas and extracting parameters
 */

/**
 * Interface for parsed formula parameters
 */
export interface FormulaParams {
  search: string;
  country: string;
  stateProvince?: string;
  unit?: string;
  scope?: string;
  date?: string;
}

/**
 * Detects if a cell contains the ENVIZI.recommend_activity_type formula
 * @param formula The formula string from Excel (e.g., "=ENVIZI.recommend_activity_type(A1, B1, C1, D1)")
 * @returns true if it's the recommend_activity_type formula
 */
export function isRecommendActivityTypeFormula(formula: string): boolean {
  if (!formula || typeof formula !== "string") {
    return false;
  }

  const normalizedFormula = formula.trim().toUpperCase();
  return normalizedFormula.includes("ENVIZI.RECOMMEND_ACTIVITY_TYPE(");
}

/**
 * Extracts cell references from the formula
 * @param formula The formula string (e.g., "=ENVIZI.RECOMMEND_ACTIVITY_TYPE((A1, B1, C1, D1)")
 * @returns Array of cell references (e.g., ["A1", "B1", "C1", "D1"])
 */
export function extractCellReferences(formula: string): string[] {
  if (!formula) {
    return [];
  }

  // Match cell references like A1, B2, $A$1, etc.
  // This regex matches Excel cell references (with optional $ for absolute references)
  const cellRefRegex = /\$?[A-Z]+\$?\d+/gi;
  const matches = formula.match(cellRefRegex);

  return matches || [];
}

/**
 * Reads values from cell references
 * @param cellReferences Array of cell references (e.g., ["A1", "B1"])
 * @param context Excel context
 * @returns Array of cell values
 */
export async function readCellValues(
  cellReferences: string[],
  context: Excel.RequestContext
): Promise<string[]> {
  const values: string[] = [];

  for (const cellRef of cellReferences) {
    try {
      const range = context.workbook.worksheets.getActiveWorksheet().getRange(cellRef);
      range.load("values");
      await context.sync();

      const cellValue = range.values[0][0];
      values.push(cellValue?.toString() || "");
    } catch (error) {
      console.error(`Error reading cell ${cellRef}:`, error);
      values.push("");
    }
  }

  return values;
}

/**
 * Parses the formula and extracts parameter values
 * @param formula The formula string
 * @param context Excel context
 * @returns Parsed parameters for the API call
 */
export async function parseFormulaParams(
  formula: string,
  context: Excel.RequestContext
): Promise<FormulaParams> {
  const cellRefs = extractCellReferences(formula);

  if (!cellRefs.length) {
    throw new Error("No cell references found in formula");
  }

  // Read values from the referenced cells
  const values = await readCellValues(cellRefs, context);

  // Map values to parameters based on function signature:
  // recommend_activity_type(search, country, stateProvince?, date?)
  const params: FormulaParams = {
    search: values[0] || "",
    country: values[1] || "USA",
    stateProvince: values[2] || undefined,
    unit: values[3] || undefined,
    scope: values[4] || undefined,
    date: values[5] || undefined,
  };

  return params;
}

/**
 * Gets parameters for the API call from a cell
 * If the cell has a formula, parse it to extract parameters
 * Otherwise, use the cell text as search with default country
 *
 * @param cellAddress The address of the selected cell
 * @param context Excel context
 * @returns Parameters for the type recommender API
 */
export async function getParamsFromCell(
  cellAddress: string,
  context: Excel.RequestContext
): Promise<FormulaParams> {
  const range = context.workbook.worksheets.getActiveWorksheet().getRange(cellAddress);

  range.load(["formulas", "values"]);
  await context.sync();

  const formula = range.formulas[0][0] as string;
  const cellValue = range.values[0][0]?.toString() || "";

  // Check if cell has the recommend_activity_type formula
  if (formula && isRecommendActivityTypeFormula(formula)) {
    // Parse formula to extract parameters from referenced cells
    const params = await parseFormulaParams(formula, context);
    return params;
  } else {
    // Use cell text as search with default country
    const params = {
      search: cellValue,
      country: "USA",
    };
    return params;
  }
}
