# Login Flows Explanation

## Two Authentication Methods

### 1. **API Key Login Flow (Default - Credential-based)**
This is the default flow using API keys directly.

**How it works:**
1. User clicks login in the taskpane
2. Opens a dialog to Envizi's login page
3. User logs in with Envizi credentials
4. Returns three tokens:
   - `token`: Envizi access token (expires in 1 hour)
   - `refreshToken`: Envizi refresh token (expires in 8 hours)
   - `coreToken`: CoreGUUT token (for IBM API access)
5. Tokens are stored in `OfficeRuntime.storage` with key `userCredentials`

**Storage Structure:**
```javascript
// Stored in OfficeRuntime.storage with key: "userCredentials"
{
  "token": "eyJhbGc...",           // Envizi access token
  "refreshToken": "eyJhbGc...",    // Envizi refresh token
  "coreToken": "eyJhbGc..."        // CoreGUUT token
}
```

**For Local Development (Bypass Login UI):**
Store these in localStorage to skip the login dialog:
```javascript
localStorage.setItem("tokenForLogin", "your-envizi-access-token");
localStorage.setItem("refreshTokenForLogin", "your-envizi-refresh-token");
```

**Enable/Disable:**
```javascript
// To enable Envizi login (opt-in):
localStorage.setItem("enableEnviziLogin", "true");

// To disable and use API key flow (default):
localStorage.setItem("enableEnviziLogin", "false");
// OR remove the item entirely
localStorage.removeItem("enableEnviziLogin");
```

---

### 2. **Envizi SSO Login Flow (Optional - Token-based)**
This is an optional flow that uses Envizi's SSO authentication.

**How it works:**
1. User enters credentials in the taskpane:
   - API Key
   - Tenant ID
   - Organization ID
2. Credentials are validated against the API
3. Stored in `OfficeRuntime.storage` with key `apiCredentials`

**Storage Structure:**
```javascript
// Stored in OfficeRuntime.storage with key: "apiCredentials"
{
  "apiKey": "your-api-key",
  "tenantId": "your-tenant-id",
  "orgId": "your-org-id"
}
```

**For Local Development:**
You can manually set these in OfficeRuntime.storage, but it's easier to use the UI.

---

## How Credentials Are Loaded

The system checks credentials in this order:

1. **First**: Try to load API credentials (`apiCredentials` key)
2. **Second**: If Envizi login is enabled (opt-in) AND no API credentials found, try to load user credentials (`userCredentials` key)

See `src/common/credentials.ts` line 117-123:
```typescript
export async function loadCredentialsFromStorage(): Promise<Credentials | null> {
  let credentials: Credentials | null = await loadApiCredentialsFromStorage();
  if (!credentials && getEnableEnviziLogin()) {
    credentials = await loadUserCredentialsFromStorage();
  }
  return credentials;
}
```

---

## Current Issue with Commands

The problem is that when commands (Insert Activity Types, Insert Area, Insert Units) are triggered:

1. They call `ensureClient()` in `src/functions/client.ts`
2. `ensureClient()` calls `loadCredentialsFromStorage()`
3. If no credentials found, it throws a `CustomFunctions.Error`
4. This error doesn't have a standard `.message` property
5. The notification system fails because `error.message` is `undefined`

---

## What You Need to Store for Local Development

### For API Key Flow (Default):
```javascript
// Use the UI to enter:
// - API Key
// - Tenant ID
// - Organization ID
```

### For Envizi SSO Flow (Optional):
```javascript
// Enable Envizi login first:
localStorage.setItem("enableEnviziLogin", "true");

// Then in browser console or localStorage:
localStorage.setItem("tokenForLogin", "YOUR_ENVIZI_ACCESS_TOKEN");
localStorage.setItem("refreshTokenForLogin", "YOUR_ENVIZI_REFRESH_TOKEN");
```

---

## Files Involved

1. **`src/common/credentials.ts`**: Manages credential storage/retrieval
2. **`src/common/env.ts`**: Environment config, `getEnableEnviziLogin()` function
3. **`src/functions/client.ts`**: Initializes API client, checks credentials
4. **`src/taskpane/services/authService.ts`**: Login/logout logic
5. **`src/taskpane/context/AuthContext.tsx`**: React context for auth state
6. **`src/login/login.ts`**: SSO login dialog handler
7. **`src/commands/commands-entry.ts`**: Command handlers (ribbon buttons)

---

## Solution Needed

The commands need to:
1. Check if user is logged in (either flow)
2. If NOT logged in, show error notification
3. Handle both `CustomFunctions.Error` and standard `Error` objects
4. Ensure notification dialog works in SharedRuntime context