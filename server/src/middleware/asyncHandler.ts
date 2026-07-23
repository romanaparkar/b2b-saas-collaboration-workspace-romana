import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async route handler so rejected promises are forwarded to the
 * global error middleware. Removes repetitive try/catch from controllers.
 */
export const asyncHandler =
  (handler: AsyncRouteHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
