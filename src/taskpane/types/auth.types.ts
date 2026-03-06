/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Credentials } from "../../common/credentials";

export interface AuthState {
  credentials: Credentials | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoggedOut: boolean;
}
