import { Request } from "express";

import { AppError } from "../errors/AppError";

/** Returns the authenticated user's id, or throws if `protect` did not run. */
export function requireUserId(req: Request): string {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user.id;
}

/**
 * Read a route parameter as a string.
 *
 * Express 5 types params as `string | string[]`; none of our routes declare a
 * repeated parameter, so the first value is always the intended one.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}
