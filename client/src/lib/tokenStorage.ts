/**
 * The single place in the app that reads or writes the auth token.
 *
 * Components and pages must never touch localStorage directly — they go
 * through AuthContext, which uses this module. Isolating it here means the
 * storage strategy (e.g. moving to an httpOnly refresh cookie) can change
 * without touching any component.
 *
 * NOTE: an access token in localStorage is readable by injected scripts (XSS).
 * Acceptable for this stage; a refresh-token + httpOnly cookie flow is the
 * planned hardening step.
 */
const TOKEN_KEY = "b2b_workspace_token";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
