import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { Role } from "../shared/constants/roles";
import { AppError } from "../shared/errors/AppError";
import { JwtPayload } from "../modules/auth/auth.types";

/**
 * Authentication: verifies the `Authorization: Bearer <token>` header and
 * attaches the decoded user to `req.user`.
 */
export const protect: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized("Authentication token is missing"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
};

/**
 * Authorization foundation: restricts a route to specific global roles.
 * Must run after `protect`.
 */
export const authorize =
  (...allowedRoles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden("You do not have permission to perform this action"));
      return;
    }

    next();
  };
