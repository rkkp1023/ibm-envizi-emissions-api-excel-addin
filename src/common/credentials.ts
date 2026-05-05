// Copyright IBM Corp. 2025, 2026

import { JwtPayload } from "jwt-decode";

/* global OfficeRuntime */

const userCredentialsKey = "userCredentials";

export interface UserCredentials {
  token: string; // normal Envizi access token, expires in 1 hour
  refreshToken: string; // Envizi refresh token for getting new access tokens, expires in 8 hours
  coreToken: string; // CoreGUUT token
}

export type Credentials = UserCredentials;

export interface CoreToken extends JwtPayload {
  tenantId: string;
}

declare global {
  interface Window {
    userCredentials?: UserCredentials;
  }
}

export function getUserCredentials(): UserCredentials {
  return window.userCredentials;
}

export function setUserCredentials(userCredentials: UserCredentials): void {
  window.userCredentials = userCredentials;
}

export async function loadUserCredentialsFromStorage(): Promise<UserCredentials | null> {
  if (!OfficeRuntime.storage) {
    return null;
  }
  return OfficeRuntime.storage.getItem(userCredentialsKey).then((credentialsJSON) => {
    if (credentialsJSON) {
      const userCredentials = JSON.parse(credentialsJSON);
      setUserCredentials(userCredentials);
      return userCredentials;
    }
    return null;
  });
}

export async function saveUserCredentialsToStorage(
  userCredentials: UserCredentials
): Promise<void> {
  setUserCredentials(userCredentials);
  if (!OfficeRuntime.storage) {
    return;
  }
  const credentialsJSON = JSON.stringify(userCredentials);
  return OfficeRuntime.storage.setItem(userCredentialsKey, credentialsJSON);
}

export async function removeUserCredentialsFromStorage(): Promise<void> {
  setUserCredentials(null);
  if (!OfficeRuntime.storage) {
    return;
  }
  return OfficeRuntime.storage.removeItem(userCredentialsKey);
}

export async function loadCredentialsFromStorage(): Promise<Credentials | null> {
  return await loadUserCredentialsFromStorage();
}

export async function removeCredentialsFromStorage(): Promise<void> {
  await removeUserCredentialsFromStorage();
}
