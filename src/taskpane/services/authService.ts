/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import {
  ApiCredentials,
  removeApiCredentialsFromStorage,
  removeCredentialsFromStorage,
  saveApiCredentialsToStorage,
  setApiCredentials,
} from "../../common/credentials";
import { ensureClient, resetClient } from "../../functions/client";

/**
 * Validates credentials by attempting to initialize the API client
 * @param credentials - The API credentials to validate
 * @returns Promise that resolves if credentials are valid
 * @throws Error with status code if validation fails
 */
export async function validateCredentials(credentials: ApiCredentials): Promise<void> {
  try {
    // Attempt to initialize client with credentials
    // This will make an API call to validate the credentials
    await ensureClient(credentials);
  } catch (error: any) {
    // Re-throw with appropriate error message
    const errorMessage =
      error.status === 401
        ? "Invalid credentials. Please enter your credentials and try again."
        : "Something went wrong. Please try again later.";

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = error.status;
    throw enhancedError;
  }
}

/**
 * Performs login with credential validation
 * @param credentials - The API credentials
 * @param saveCredentials - Whether to save credentials to storage
 * @returns Promise that resolves if login is successful
 */
export async function performLogin(
  credentials: ApiCredentials,
  saveCredentials: boolean
): Promise<void> {
  // Validate all required fields
  if (!credentials.apiKey || !credentials.tenantId || !credentials.orgId) {
    throw new Error("All fields are required");
  }

  // Validate credentials with API
  await validateCredentials(credentials);

  // Set credentials in memory
  setApiCredentials(credentials);

  // Save to storage if requested
  if (saveCredentials) {
    await saveApiCredentialsToStorage(credentials);
  } else {
    await removeApiCredentialsFromStorage();
  }
}

/**
 * Performs logout by clearing credentials and resetting client
 * @returns Promise that resolves when logout is complete
 */
export async function performLogout(): Promise<void> {
  resetClient();
  // Try to remove from storage, but don't fail if it errors
  try {
    await removeCredentialsFromStorage();
  } catch (error) {
    // Log error but continue with logout
    console.error("Failed to remove credentials from storage:", error);
  }
}
