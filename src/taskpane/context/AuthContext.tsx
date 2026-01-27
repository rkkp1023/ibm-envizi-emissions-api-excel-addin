/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  ApiCredentials,
  loadApiCredentialsFromStorage,
  removeApiCredentialsFromStorage,
  saveApiCredentialsToStorage,
  setApiCredentials,
} from "../../common/credentials";

/* global OfficeRuntime */

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ApiCredentials, saveCredentials: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has saved credentials
    loadApiCredentialsFromStorage()
      .then((credentials) => {
        if (credentials) {
          setIsAuthenticated(true);
        }
      })
      .catch((error) => {
        console.error("Error loading credentials:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials: ApiCredentials, saveCredentials: boolean) => {
    // Validate credentials (basic validation)
    if (!credentials.apiKey || !credentials.tenantId || !credentials.orgId) {
      throw new Error("All fields are required");
    }

    // Set credentials in memory
    setApiCredentials(credentials);

    // Save to storage if requested
    if (saveCredentials) {
      await saveApiCredentialsToStorage(credentials);
    }

    setIsAuthenticated(true);
  };

  const logout = async () => {
    await removeApiCredentialsFromStorage();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
