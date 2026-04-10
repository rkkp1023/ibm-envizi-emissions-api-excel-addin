// Copyright IBM Corp. 2026

import { Credentials } from "../../common/credentials";

export interface AuthState {
  credentials: Credentials | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoggedOut: boolean;
}
