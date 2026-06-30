// Copyright IBM Corp. 2026

import axios from "axios";

export interface UserStatusResponse {
  isFederated: boolean;
  realmName: string;
  uniqueSecurityName: string;
  user: string;
  [key: string]: any;
}

export class IDaaSApi {
  /**
   * Fetches user status from IBM login API
   * Uses credentials: 'include' to send cookies with the request
   *
   * @returns Promise<UserStatusResponse> User status data from the API
   * @throws Error if the request fails
   */
  async getUserStatus(): Promise<UserStatusResponse> {
    try {
      const apiUrl = "https://login.ibm.com/v1/mgmt/idaas/user/status/";

      const response = await axios.get<UserStatusResponse>(apiUrl, {
        withCredentials: true, // Equivalent to credentials: 'include' in fetch
      });

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch user status:", errorMessage);
      throw error;
    }
  }
}

export const idaasApi = new IDaaSApi();

// Made with Bob
