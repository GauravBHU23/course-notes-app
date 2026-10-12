import * as SecureStore from "expo-secure-store";

// Mirrors the web app's app_session cookie: a small base64url-encoded
// {userId, sessionId, sessionVersion} token, except here it's sent back to
// the API via the x-app-session header (see getSessionPayload.ts on the
// backend) since there's no cookie jar for our own cookies on native.
const SESSION_TOKEN_KEY = "app_session_token";

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
