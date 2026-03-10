/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import axios from "axios";

import {
  ApiCredentials,
  getUserCredentials,
  removeApiCredentialsFromStorage,
  removeCredentialsFromStorage,
  saveApiCredentialsToStorage,
  setApiCredentials,
} from "../../common/credentials";
import { getEnviziGraphQLUrl } from "../../common/env";
import { ensureClient, resetClient } from "../../functions/client";

interface LogoutUserResponse {
  data: {
    logout: boolean;
  };
}

const logoutUserMutation = `
  mutation logoutUser {
    logout
  }
`;

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
 * Executes GraphQL logout mutation to log out the user on the server
 * @returns Promise<boolean> indicating if logout was successful
 */
async function logoutUser(): Promise<boolean> {
  const userCredentials = getUserCredentials();

  // Only attempt GraphQL logout if user has token-based credentials
  if (!userCredentials?.token) {
    return true; // Skip GraphQL logout for API key users
  }

  try {
    const graphqlUrl = `${getEnviziGraphQLUrl()}/ui/graphql`;

    const response = await axios.post<LogoutUserResponse>(
      graphqlUrl,
      {
        query: logoutUserMutation,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userCredentials.token}`,
        },
      }
    );

    return response.data.data.logout;
  } catch (error) {
    console.error("Failed to execute logout mutation:", error);
    // Return true to continue with local logout even if server logout fails
    return true;
  }
}

/**
 * Performs logout by clearing credentials and resetting client
 * @returns Promise that resolves when logout is complete
 */
export async function performLogout(): Promise<void> {
  // Invalidate token and cookies asynchronously
  void logoutUser();

  // Reset client instance
  resetClient();

  // Try to remove from storage, but don't fail if it errors
  try {
    await removeCredentialsFromStorage();
  } catch (error) {
    // Log error but continue with logout
    console.error("Failed to remove credentials from storage:", error);
  }

  // Clear all localStorage items related to authentication
  localStorage.removeItem("tokenForLogin");
  localStorage.removeItem("refreshTokenForLogin");
}
