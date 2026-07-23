import { RequestHandler } from "express";
import { ZodType } from "zod";

import { AppError } from "../shared/errors/AppError";

/**
 * Validates `req.body` against a Zod schema.
 * On success the parsed (and coerced) data replaces `req.body`, so controllers
 * receive typed, trusted input. On failure a 400 with field-level details is
 * forwarded to the global error handler.
 */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(AppError.badRequest("Validation failed", details));
      return;
    }

    req.body = result.data;
    next();
  };
