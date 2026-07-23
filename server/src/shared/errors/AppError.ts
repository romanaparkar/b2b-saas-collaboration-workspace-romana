/**
 * Application error carrying an HTTP status code.
 *
 * Deliberately a single class with static factories rather than a deep
 * subclass hierarchy — it covers every case we currently need without extra
 * indirection. The global error middleware turns these into HTTP responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;

    // Required so `instanceof` works when targeting ES5/ES2020 from TS.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, message, details);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(403, message);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }
}
