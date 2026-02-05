// Copyright IBM Corp. 2026

export interface LoginDialogMessage {
  token: string; // normal Envizi access token, expires in 1 hour
  refreshToken: string; // Envizi refresh token for getting new access tokens, expires in 8 hours
  coreToken: string; // CoreGUUT token
}
