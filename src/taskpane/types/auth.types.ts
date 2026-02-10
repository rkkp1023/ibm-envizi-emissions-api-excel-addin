/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { ApiCredentials, UserCredentials } from "../../common/credentials";

export enum AuthStatus {
  IDLE = "idle",
  LOADING = "loading",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  ERROR = "error",
}

export interface AuthState {
  status: AuthStatus;
  credentials: ApiCredentials | UserCredentials | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
