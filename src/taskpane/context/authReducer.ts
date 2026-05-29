// Copyright IBM Corp. 2026

import { Credentials } from "../../common/credentials";
import { AuthState } from "../types/auth.types";

export type AuthAction =
  | { type: "initialize"; payload: { credentials: Credentials | null } }
  | { type: "refreshCredentials"; payload: { credentials: Credentials } }
  | {
      type: "loginSuccess";
      payload: { credentials: Credentials };
    }
  | { type: "loginFailed" }
  | { type: "logout" };

export const initialAuthState: AuthState = {
  credentials: null,
  isInitialized: false,
  isAuthenticated: false,
  isLoggedOut: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "initialize":
      return {
        ...state,
        credentials: action.payload.credentials,
        isInitialized: true,
        isAuthenticated: !!action.payload.credentials,
        isLoggedOut: false,
      };

    case "refreshCredentials":
      return {
        ...state,
        credentials: action.payload.credentials,
      };

    case "loginSuccess":
      return {
        ...state,
        credentials: action.payload.credentials,
        isAuthenticated: true,
        isLoggedOut: false,
      };

    case "loginFailed":
      return {
        ...state,
        credentials: null,
        isAuthenticated: false,
        isLoggedOut: false,
      };

    case "logout":
      return {
        ...state,
        credentials: null,
        isAuthenticated: false,
        isLoggedOut: true,
      };

    default:
      return state;
  }
}
