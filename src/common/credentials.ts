// Copyright IBM Corp. 2025, 2026

import { JwtPayload } from "jwt-decode";

import { getEnableEnviziLogin } from "./env";

/* global OfficeRuntime */

const apiCredentialsKey = "apiCredentials";
const userCredentialsKey = "userCredentials";

export interface ApiCredentials {
  apiKey: string;
  tenantId: string;
  orgId: string;
}

export interface UserCredentials {
  token: string; // normal Envizi access token, expires in 1 hour
  refreshToken: string; // Envizi refresh token for getting new access tokens, expires in 8 hours
  coreToken: string; // CoreGUUT token
}

export type Credentials = ApiCredentials | UserCredentials;

export interface CoreToken extends JwtPayload {
  tenantId: string;
}

declare global {
  interface Window {
    apiCredentials?: ApiCredentials;
    userCredentials?: UserCredentials;
  }
}

export function getApiCredentials(): ApiCredentials {
  return window.apiCredentials;
}

export function setApiCredentials(apiCredentials: ApiCredentials): void {
  window.apiCredentials = apiCredentials;
}

export function getUserCredentials(): UserCredentials {
  return window.userCredentials;
}

export function setUserCredentials(userCredentials: UserCredentials): void {
  window.userCredentials = userCredentials;
}

export async function loadApiCredentialsFromStorage(): Promise<ApiCredentials | null> {
  if (!OfficeRuntime.storage) {
    return null;
  }
  return OfficeRuntime.storage.getItem(apiCredentialsKey).then((credentialsJSON) => {
    if (credentialsJSON) {
      const apiCredentials = JSON.parse(credentialsJSON);
      setApiCredentials(apiCredentials);
      return apiCredentials;
    }
    return null;
  });
}

export async function saveApiCredentialsToStorage(apiCredentials: ApiCredentials): Promise<void> {
  setApiCredentials(apiCredentials);
  if (!OfficeRuntime.storage) {
    return;
  }
  const credentialsJSON = JSON.stringify(apiCredentials);
  return OfficeRuntime.storage.setItem(apiCredentialsKey, credentialsJSON);
}

export async function removeApiCredentialsFromStorage(): Promise<void> {
  setApiCredentials(null);
  if (!OfficeRuntime.storage) {
    return;
  }
  return OfficeRuntime.storage.removeItem(apiCredentialsKey);
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
  let credentials: Credentials | null = await loadApiCredentialsFromStorage();
  if (!credentials && getEnableEnviziLogin()) {
    credentials = await loadUserCredentialsFromStorage();
  }
  return credentials;
}

export async function removeCredentialsFromStorage(): Promise<void> {
  const promises = [removeApiCredentialsFromStorage()];
  if (getEnableEnviziLogin()) {
    promises.push(removeUserCredentialsFromStorage());
  }
  await Promise.all(promises);
}
