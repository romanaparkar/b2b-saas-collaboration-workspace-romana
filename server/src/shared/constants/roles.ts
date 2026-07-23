/**
 * Role definitions shared across modules.
 * Used for the user's global role and for workspace membership roles.
 */
export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);
