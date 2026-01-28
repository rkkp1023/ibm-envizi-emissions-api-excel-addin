// Copyright IBM Corp. 2025

/**
 * Shared utilities for API operations
 */

/**
 * Handles errors in custom functions, re-throwing CustomFunctions.Error as-is
 * @param error The error to handle
 * @param defaultMessage Default error message if not a CustomFunctions.Error
 * @throws CustomFunctions.Error
 */
export function handleCustomFunctionError(error: unknown, defaultMessage: string): never {
  // Re-throw CustomFunctions.Error as-is
  if (error instanceof CustomFunctions.Error || (error as any)?.name === "CustomFunctions.Error") {
    throw error;
  }
  throw new CustomFunctions.Error(
    CustomFunctions.ErrorCode.notAvailable,
    `${defaultMessage}: ${(error as any)?.message || "Unknown error"}`
  );
}
