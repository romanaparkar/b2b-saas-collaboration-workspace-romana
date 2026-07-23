import { ApiError } from "./apiClient";

/**
 * Turn an unknown thrown value into a message that is safe to render.
 *
 * The server already returns human-readable messages on `ApiError`, so those
 * are preferred; anything else falls back to the caller's wording rather than
 * leaking a stack trace or "[object Object]" into the UI.
 */
export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
