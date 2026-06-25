// Copyright IBM Corp. 2026

import { convertExcelDateToISO } from "../functions/utils";

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
 * Interface for parameter cell addresses extracted from formula
 */
export interface ParameterCellAddresses {
  searchCell?: string;
  countryCell?: string;
  stateProvinceCell?: string;
  unitCell?: string;
  scopeCell?: string;
  dateCell?: string;
}

/**
 * Extracts parameter cell addresses from the ENVIZI.recommend_activity_type formula
 * Uses extractCellReferences to get all cell references and maps them to parameter positions
 * @param formula The formula string (e.g., "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(A1, B1, C1, D1)")
 * @returns Object containing cell addresses for each parameter (search, country, stateProvince, unit, scope, date)
 */
export function extractParameterCellAddresses(formula: string): ParameterCellAddresses {
  if (!formula) {
    return {};
  }

  // Extract all cell references from the formula using the existing utility
  const cellRefs = extractCellReferences(formula);

  // Map cell references to their respective parameter positions
  return {
    searchCell: cellRefs[0],
    countryCell: cellRefs[1],
    stateProvinceCell: cellRefs[2],
    unitCell: cellRefs[3],
    scopeCell: cellRefs[4],
    dateCell: cellRefs[5],
  };
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

export async function parseFormulaParams(
  formula: string,
  context: Excel.RequestContext
): Promise<FormulaParams> {
  // Extract function arguments
  const regex = /\((.*)\)/;
  const match = regex.exec(formula);

  if (!match?.[1]) {
    throw new Error("Invalid formula");
  }

  // Split all params in exact order
  const rawParams = match[1].split(",").map((p) => p.trim());

  // Identify cell refs only
  const cellRefs = rawParams.filter((param) => /^[A-Z]+[0-9]+$/i.test(param));

  // Read only cell reference values
  const cellValues = await readCellValues(cellRefs, context);

  let cellIndex = 0;

  // Rebuild params preserving original positions
  const resolvedValues = rawParams.map((param) => {
    const isCellRef = /^[A-Z]+[0-9]+$/i.test(param);

    if (isCellRef) {
      return cellValues[cellIndex++] || "";
    }

    // Remove quotes from static text
    return param.replace(/^"(.*)"$/, "$1");
  });

  const params: FormulaParams = {
    search: resolvedValues[0] || "",
    country: resolvedValues[1] || "USA",
    stateProvince: resolvedValues[2] || undefined,
    unit: resolvedValues[3] || undefined,
    scope: resolvedValues[4] || undefined,
    date: convertExcelDateToISO(resolvedValues[5]) || undefined,
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
