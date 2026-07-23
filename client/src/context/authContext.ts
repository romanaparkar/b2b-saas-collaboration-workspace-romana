import { createContext } from "react";

import type { LoginInput, RegisterInput, User } from "../types/auth";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the stored session is being restored on first load. */
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

/**
 * Context object lives in its own module (no components) so the provider file
 * only exports components — required for React Fast Refresh to work reliably.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
