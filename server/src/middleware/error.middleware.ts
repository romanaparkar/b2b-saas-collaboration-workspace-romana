import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { env } from "../config/env";
import { AppError } from "../shared/errors/AppError";
import { ApiResponse } from "../shared/types/api.types";

/** Catch-all for unmatched routes — converted to a 404 by the error handler. */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler: the single place where errors become HTTP responses.
 * Must be registered last, after all routes.
 */
export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${error.path}"`;
  } else if (isDuplicateKeyError(error)) {
    statusCode = 409;
    const field = Object.keys(error.keyValue ?? {})[0] ?? "field";
    message = `A record with that ${field} already exists`;
  } else if (isJwtError(error)) {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (error instanceof Error) {
    message = env.isProduction ? "Internal server error" : error.message;
  }

  // Unexpected (non-operational) errors are always logged for diagnosis.
  if (statusCode >= 500) {
    console.error("Unhandled error:", error);
  }

  const body: ApiResponse = { success: false, message };
  if (details !== undefined) {
    body.data = details;
  }

  res.status(statusCode).json(body);
};

/** MongoDB duplicate-key error (unique index violation). */
function isDuplicateKeyError(
  error: unknown,
): error is { code: number; keyValue?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

function isJwtError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
  );
}
