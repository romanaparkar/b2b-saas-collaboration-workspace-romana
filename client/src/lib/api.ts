/**
 * Centralized API configuration.
 *
 * The backend base URL is read from the `VITE_API_URL` environment variable
 * (see `.env.example`). A localhost fallback keeps local development working
 * out of the box when no `.env` file is present.
 */
const DEFAULT_API_URL = "http://localhost:5000";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

/**
 * Build a fully-qualified API URL from a relative path.
 *
 * @param path - API path beginning with a leading slash, e.g. `/api/workspaces`.
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
