/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";

import { coreEnviziAuth } from "../../api/coreEnviziAuth";
import { enviziUiGraphQL } from "../../api/enviziUiGraphQL";
import {
  ApiCredentials,
  Credentials,
  loadCredentialsFromStorage,
  removeCredentialsFromStorage,
  saveUserCredentialsToStorage,
  UserCredentials,
} from "../../common/credentials";
import { getEnableEnviziLogin } from "../../common/env";
import { ensureClient } from "../../functions/client";
import { displayLoginDialog } from "../auth";
import { performLogin, performLogout } from "../services/authService";
import { AuthState } from "../types/auth.types";
import { authReducer, initialAuthState } from "./authReducer";

interface AuthContextType {
  enableEnviziLogin: boolean;
  state: AuthState;
  displayLogin: () => void;
  login: (credentials: ApiCredentials, saveCredentials: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function refreshToken(userCredentials: UserCredentials): Promise<UserCredentials> {
  const renewResponse = await enviziUiGraphQL.renewToken({
    token: userCredentials.token,
    refreshToken: userCredentials.refreshToken,
  });
  if (!renewResponse.data?.renewToken) {
    throw new Error("Failed to refresh token.");
  }
  const newCoreToken = await coreEnviziAuth.exchangeToken(renewResponse.data.renewToken.token);
  return {
    token: renewResponse.data.renewToken.token,
    refreshToken: renewResponse.data.renewToken.refreshToken,
    coreToken: newCoreToken,
  };
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const enableEnviziLogin = getEnableEnviziLogin();
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      let credentials: Credentials;
      try {
        credentials = await loadCredentialsFromStorage();
      } catch (error) {}
      console.log("Credentials loaded from storage:", credentials);

      // Check token expiry
      if (credentials?.["token"]) {
        const decodedToken = jwtDecode(credentials["token"]);
        if (Date.now() >= decodedToken.exp * 1000) {
          // Token expired, discard it
          console.log("Token has expired; removing from storage.");
          credentials = null;
          removeCredentialsFromStorage();
        }
      }

      dispatch({
        type: "initialize",
        payload: { credentials },
      });
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!state.credentials?.["token"]) {
      return;
    }

    const refreshTimeoutMinutes = 10;
    console.log(`Setting a ${refreshTimeoutMinutes}‑minute token refresh timer`);

    const timerId = setTimeout(
      () => {
        if (state.credentials?.["token"]) {
          console.log("Refreshing token...");
          refreshToken(state.credentials as UserCredentials).then(
            (newCredentials) => {
              console.log("Received new credentials:", newCredentials);
              saveUserCredentialsToStorage(newCredentials);
              dispatch({
                type: "refreshCredentials",
                payload: { credentials: newCredentials },
              });
            },
            (error) => {
              console.error("Failed to refresh token:", error);
            }
          );
        }
      },
      refreshTimeoutMinutes * 60 * 1000
    );

    return () => {
      clearTimeout(timerId);
    };
  }, [state.credentials]);

  const displayLogin = useCallback(() => {
    displayLoginDialog(
      async (credentials) => {
        // Token-based login: Save user credentials to storage for persistence
        // Note: API key login uses saveApiCredentialsToStorage via performLogin() instead
        saveUserCredentialsToStorage(credentials);
        ensureClient(credentials);
        dispatch({
          type: "loginSuccess",
          payload: { credentials },
        });
      },
      () => {
        dispatch({
          type: "loginFailed",
        });
      }
    );
  }, []);

  const login = useCallback(async (credentials: ApiCredentials, saveCredentials: boolean) => {
    try {
      // Perform login with API validation
      await performLogin(credentials, saveCredentials);
      dispatch({
        type: "loginSuccess",
        payload: { credentials },
      });
    } catch (error) {
      dispatch({
        type: "loginFailed",
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Perform logout and reset client
      await performLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    dispatch({ type: "logout" });
  }, []);

  const value: AuthContextType = {
    enableEnviziLogin,
    state,
    displayLogin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
