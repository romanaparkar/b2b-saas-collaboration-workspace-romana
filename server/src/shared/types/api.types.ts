/**
 * Consistent response envelope used by every endpoint.
 * Keeps the client's API layer simple: it always unwraps `data`.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
