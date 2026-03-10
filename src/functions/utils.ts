// Copyright IBM Corp. 2025

/**
 * Extracts symbol/code from display format "Symbol (Name)" or returns as-is
 * This function handles both display format and direct symbol input for backward compatibility
 *
 * @param displayValue The value to extract from (e.g., "kg(kilogram)" or "kg")
 * @returns The extracted symbol (e.g., "kg") or the original value if no parentheses found
 *
 * @example
 * extractSymbolFromDisplay("kg(kilogram)") // Returns: "kg"
 * extractSymbolFromDisplay("USA(United States)") // Returns: "USA"
 * extractSymbolFromDisplay("kg") // Returns: "kg" (backward compatible)
 * extractSymbolFromDisplay("USA") // Returns: "USA" (backward compatible)
 */
export function extractSymbolFromDisplay(displayValue: string | undefined): string | undefined {
  if (!displayValue || typeof displayValue !== 'string') {
    return displayValue;
  }
  
  const trimmed = displayValue.trim();
  
  // Extract symbol from "Symbol(Name)" format using string operations
  // This approach is safe from ReDoS attacks and more performant
  const firstOpenParen = trimmed.indexOf('(');
  const lastCloseParen = trimmed.lastIndexOf(')');
  
  // Check if we have valid parentheses: "symbol(name)"
  if (firstOpenParen > 0 &&
      lastCloseParen === trimmed.length - 1 &&
      firstOpenParen < lastCloseParen) {
    // Extract and return the content BEFORE the opening parenthesis
    return trimmed.substring(0, firstOpenParen).trim();
  }
  
  // No valid parentheses pattern found, return original (backward compatible)
  return trimmed;
}

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
