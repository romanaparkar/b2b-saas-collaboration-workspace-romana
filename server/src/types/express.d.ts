import type { Role } from "../shared/constants/roles";

/**
 * Augments Express's Request with the authenticated user set by `protect`.
 * Keeps `req.user` strongly typed across the codebase instead of `any`.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
