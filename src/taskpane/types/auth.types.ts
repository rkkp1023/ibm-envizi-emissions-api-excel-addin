/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

export enum AuthStatus {
  IDLE = "idle",
  LOADING = "loading",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  ERROR = "error",
}

export interface ApiCredentials {
  apiKey: string;
  tenantId: string;
  orgId: string;
}

export interface AuthState {
  status: AuthStatus;
  credentials: ApiCredentials | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
