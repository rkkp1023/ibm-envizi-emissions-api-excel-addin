// Copyright IBM Corp. 2026

import axios from "axios";

import { getUserCredentials, removeCredentialsFromStorage } from "../../common/credentials";
import { getEnviziGraphQLUrl } from "../../common/env";
import { resetClient } from "../../functions/client";

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
 * Executes GraphQL logout mutation to log out the user on the server
 * @returns Promise<boolean> indicating if logout was successful
 */
async function logoutUser(): Promise<boolean> {
  const userCredentials = getUserCredentials();

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
