/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";
import { CoreToken, UserCredentials } from "../../common/credentials";
import { useAuth } from "./useAuth";

/**
 * Minimal hook to access decoded CoreGUUT token properties
 *
 * @returns Decoded token with raw string, claims, and tenantId, or null if not available
 */
export function useCoreToken() {
  const { state } = useAuth();

  return useMemo(() => {
    // Check if user is authenticated with token credentials
    if (!state.isAuthenticated || !state.credentials || !("coreToken" in state.credentials)) {
      return null;
    }

    const userCredentials = state.credentials as UserCredentials;
    const coreToken = userCredentials.coreToken;

    if (!coreToken) {
      return null;
    }

    try {
      const decoded = jwtDecode<CoreToken & { organizationId?: string; [key: string]: any }>(
        coreToken
      );

      return {
        raw: coreToken,
        decoded,
        tenantId: decoded.tenantId,
      };
    } catch (error) {
      console.error("Failed to decode coreToken:", error);
      return null;
    }
  }, [state.isAuthenticated, state.credentials]);
}
