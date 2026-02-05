/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";

import { loadApiCredentialsFromStorage } from "../../common/credentials";
import { performLogin, performLogout } from "../services/authService";
import { ApiCredentials } from "../types/auth.types";
import { AuthActionType, AuthReducer, initialAuthState } from "./AuthReducer";

/* global OfficeRuntime */

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  credentials: ApiCredentials | null;
  error: string | null;
  login: (credentials: ApiCredentials, saveCredentials: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(AuthReducer, initialAuthState);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const credentials = await loadApiCredentialsFromStorage();

        if (credentials) {
          dispatch({
            type: AuthActionType.RESTORE_SESSION,
            payload: { credentials },
          });
        } else {
          dispatch({ type: AuthActionType.LOGOUT });
        }
      } catch (error) {
        dispatch({ type: AuthActionType.LOGOUT });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: ApiCredentials, saveCredentials: boolean) => {
    dispatch({ type: AuthActionType.LOGIN_START });

    try {
      // Perform login with API validation
      await performLogin(credentials, saveCredentials);

      dispatch({
        type: AuthActionType.LOGIN_SUCCESS,
        payload: { credentials },
      });
    } catch (error: any) {
      dispatch({
        type: AuthActionType.LOGIN_FAILURE,
        payload: { error: error.message || "Login failed" },
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Perform logout and reset client
      await performLogout();
      dispatch({ type: AuthActionType.LOGOUT });
    } catch (error) {
      // Always dispatch logout even if there's an error
      dispatch({ type: AuthActionType.LOGOUT });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AuthActionType.CLEAR_ERROR });
  }, []);

  const value: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    credentials: state.credentials,
    error: state.error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
