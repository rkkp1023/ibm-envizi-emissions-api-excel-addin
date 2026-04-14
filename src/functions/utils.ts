// Copyright IBM Corp. 2025

/**
 * Extracts symbol/code from display format "Symbol (Name)" or returns as-is
 * This function handles both display format and direct symbol input for backward compatibility
 *
 * @param displayValue The value to extract from (e.g., "kg (kilogram)" or "kg")
 * @returns The extracted symbol (e.g., "kg") or the original value if no parentheses found
 *
 * @example
 * extractSymbolFromDisplay("kg (kilogram)") // Returns: "kg"
 * extractSymbolFromDisplay("USA (United States)") // Returns: "USA"
 * extractSymbolFromDisplay("kg") // Returns: "kg" (backward compatible)
 * extractSymbolFromDisplay("USA") // Returns: "USA" (backward compatible)
 */
export function extractSymbolFromDisplay(displayValue: string | undefined): string | undefined {
  if (!displayValue || typeof displayValue !== 'string') {
    return displayValue;
  }
  
  const trimmed = displayValue.trim();
  
  // Extract symbol from "Symbol (Name)" format using string operations
  // This approach is safe from ReDoS attacks and more performant
  const firstOpenParen = trimmed.indexOf('(');
  const lastCloseParen = trimmed.lastIndexOf(')');
  
  // Check if we have valid parentheses: "symbol (name)"
  if (firstOpenParen > 0 &&
      lastCloseParen === trimmed.length - 1 &&
      firstOpenParen < lastCloseParen) {
    // Extract and return the content BEFORE the opening parenthesis
    return trimmed.substring(0, firstOpenParen).trim();
  }
  
  // No valid parentheses pattern found, return original (backward compatible)
  return trimmed;
}

/**
 * Extracts the value after the dash from display format "CountryCode - Value"
 * This function is used for state/province and power grid values
 *
 * @param displayValue The value to extract from (e.g., "USA - California")
 * @returns The extracted value (e.g., "California") or the original value if no dash found
 *
 * @example
 * extractValueAfterDash("USA - California") // Returns: "California"
 * extractValueAfterDash("USA - WECC") // Returns: "WECC"
 * extractValueAfterDash("California") // Returns: "California" (backward compatible)
 */
export function extractValueAfterDash(displayValue: string | undefined): string | undefined {
  if (!displayValue || typeof displayValue !== 'string') {
    return displayValue;
  }
  
  const trimmed = displayValue.trim();
  
  // Find the dash separator
  const dashIndex = trimmed.indexOf(' - ');
  
  // If dash found, extract the part after it
  if (dashIndex > 0 && dashIndex < trimmed.length - 3) {
    return trimmed.substring(dashIndex + 3).trim();
  }
  
  // No dash pattern found, return original (backward compatible)
  return trimmed;
}

/**
 * Parses a boolean parameter that can be boolean, string, undefined, or null.
 * Supports case-insensitive string "true"/"false" values.
 *
 * @param value The value to parse (boolean, string, undefined, or null)
 * @param defaultValue The default value to return if value is undefined or null
 * @returns The parsed boolean value
 *
 * @example
 * parseBooleanParameter(true, false) // Returns: true
 * parseBooleanParameter("true", false) // Returns: true
 * parseBooleanParameter("TRUE", false) // Returns: true
 * parseBooleanParameter(false, true) // Returns: false
 * parseBooleanParameter("false", true) // Returns: false
 * parseBooleanParameter(undefined, true) // Returns: true (default)
 * parseBooleanParameter(null, false) // Returns: false (default)
 */
export function parseBooleanParameter(
  value: boolean | string | undefined | null,
  defaultValue: boolean
): boolean {
  // Handle undefined or null - return default
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // Handle string input - case-insensitive comparison
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }
  
  // Handle boolean input
  return value === true;
}

/**
 * Builds a combined headers array based on input/output flags.
 * This is a shared utility to avoid code duplication between headers functions.
 *
 * @param showInput Whether to include input headers
 * @param showOutput Whether to include output headers
 * @param getInputHeadersFn Function to get input headers
 * @param getOutputHeadersFn Function to get output headers
 * @returns Combined array of headers
 */
export function buildHeadersList(
  showInput: boolean,
  showOutput: boolean,
  getInputHeadersFn: () => string[],
  getOutputHeadersFn: () => string[]
): string[] {
  let headersList: string[] = [];
  
  if (showInput) {
    const inputHeaders = getInputHeadersFn();
    headersList = [...inputHeaders];
  }
  
  if (showOutput) {
    const outputHeaders = getOutputHeadersFn();
    headersList = [...headersList, ...outputHeaders];
  }
  
  return headersList;
}

/**
 * Converts Excel date to ISO format
 */
export function convertExcelDateToISO(input: string): string {
  const trimmed = input.trim();

  // Case 1: Already in ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: Excel serial date (e.g., 44562)
  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && asNumber > 20000) {
    const date = new Date(Math.round((asNumber - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  }

  
}
