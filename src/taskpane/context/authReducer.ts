/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { ApiCredentials, AuthState, AuthStatus } from "../types/auth.types";

export enum AuthActionType {
  LOGIN_START = "LOGIN_START",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  RESTORE_SESSION = "RESTORE_SESSION",
  CLEAR_ERROR = "CLEAR_ERROR",
}

export type AuthAction =
  | { type: AuthActionType.LOGIN_START }
  | { type: AuthActionType.LOGIN_SUCCESS; payload: { credentials: ApiCredentials } }
  | { type: AuthActionType.LOGIN_FAILURE; payload: { error: string } }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.RESTORE_SESSION; payload: { credentials: ApiCredentials } }
  | { type: AuthActionType.CLEAR_ERROR };

export const initialAuthState: AuthState = {
  status: AuthStatus.IDLE,
  credentials: null,
  error: null,
  isLoading: true,
  isAuthenticated: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.LOGIN_START:
      return {
        ...state,
        status: AuthStatus.LOADING,
        isLoading: true,
        error: null,
      };

    case AuthActionType.LOGIN_SUCCESS:
      return {
        ...state,
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
        isAuthenticated: true,
        credentials: action.payload.credentials,
        error: null,
      };

    case AuthActionType.LOGIN_FAILURE:
      return {
        ...state,
        status: AuthStatus.ERROR,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload.error,
      };

    case AuthActionType.LOGOUT:
      return {
        ...initialAuthState,
        status: AuthStatus.UNAUTHENTICATED,
        isLoading: false,
        isAuthenticated: false,
      };

    case AuthActionType.RESTORE_SESSION:
      return {
        ...state,
        status: AuthStatus.AUTHENTICATED,
        isLoading: false,
        isAuthenticated: true,
        credentials: action.payload.credentials,
      };

    case AuthActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
