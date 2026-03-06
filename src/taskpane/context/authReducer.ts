/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Credentials } from "../../common/credentials";
import { AuthState } from "../types/auth.types";

export type AuthAction =
  | { type: "initialize"; payload: { credentials: Credentials } }
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
  justLoggedOut: false,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "initialize":
      return {
        ...state,
        credentials: action.payload.credentials,
        isInitialized: true,
        isAuthenticated: !!action.payload.credentials,
        justLoggedOut: false,
      };

    case "loginSuccess":
      return {
        ...state,
        credentials: action.payload.credentials,
        isAuthenticated: true,
        justLoggedOut: false,
      };

    case "loginFailed":
      return {
        ...state,
        credentials: null,
        isAuthenticated: false,
        justLoggedOut: false,
      };

    case "logout":
      return {
        ...state,
        credentials: null,
        isAuthenticated: false,
        justLoggedOut: true,
      };

    default:
      return state;
  }
}
