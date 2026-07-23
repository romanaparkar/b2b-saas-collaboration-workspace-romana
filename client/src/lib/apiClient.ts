import { apiUrl } from "./api";
import { tokenStorage } from "./tokenStorage";

/** Error thrown for any non-2xx API response. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Shape every endpoint returns (see server/src/shared/types/api.types.ts). */
interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Central HTTP layer.
 *
 * Responsibilities: attach the bearer token, set JSON headers, unwrap the
 * response envelope, and normalize errors into `ApiError`. Components never
 * call `fetch` directly.
 */
async function request<T>(
  path: string,
  options: { method: string; body?: unknown } = { method: "GET" },
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(apiUrl(path), {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    // Network-level failure (server down, DNS, CORS preflight rejection).
    throw new ApiError(0, "Unable to reach the server. Is the API running?");
  }

  // A body is not guaranteed (e.g. 204), so parsing is best-effort.
  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      envelope?.message ?? "Something went wrong",
      envelope?.data,
    );
  }

  return envelope?.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
