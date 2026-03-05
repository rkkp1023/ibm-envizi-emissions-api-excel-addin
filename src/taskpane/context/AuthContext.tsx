/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";

import {
  ApiCredentials,
  Credentials,
  loadCredentialsFromStorage,
  setUserCredentials,
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

      dispatch({
        type: "initialize",
        payload: { credentials },
      });
    };

    initialize();
  }, []);

  const displayLogin = useCallback(() => {
    displayLoginDialog(
      (credentials) => {
        // OAuth/token-based login: Set user credentials globally for logout access
        // Note: API key login uses setApiCredentials via performLogin() instead
        setUserCredentials(credentials as UserCredentials);
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
