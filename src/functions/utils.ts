// Copyright IBM Corp. 2025

/**
 * Extracts symbol/code from display format "Name (Symbol)" or returns as-is
 * This function handles both display format and direct symbol input for backward compatibility
 *
 * @param displayValue The value to extract from (e.g., "kilogram (kg)" or "kg")
 * @returns The extracted symbol (e.g., "kg") or the original value if no parentheses found
 *
 * @example
 * extractSymbolFromDisplay("kilogram (kg)") // Returns: "kg"
 * extractSymbolFromDisplay("United States (USA)") // Returns: "USA"
 * extractSymbolFromDisplay("kg") // Returns: "kg" (backward compatible)
 * extractSymbolFromDisplay("USA") // Returns: "USA" (backward compatible)
 */
export function extractSymbolFromDisplay(displayValue: string | undefined): string | undefined {
  if (!displayValue || typeof displayValue !== 'string') {
    return displayValue;
  }
  
  const trimmed = displayValue.trim();
  
  // Match pattern: "anything (SYMBOL)" where SYMBOL is captured
  // Using RegExp.exec() for better performance and safety
  // The regex looks for content within parentheses at the end of the string
  const regex = /\(([^)]+)\)$/;
  const match = regex.exec(trimmed);
  
  // If match found, return the symbol; otherwise return original (backward compatible)
  return match ? match[1].trim() : trimmed;
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
