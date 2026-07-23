import { apiClient } from "../lib/apiClient";
import type { AuthResult, LoginInput, RegisterInput, User } from "../types/auth";

/** The only module that knows the shape of the auth endpoints. */
export const authService = {
  register(input: RegisterInput): Promise<AuthResult> {
    return apiClient.post<AuthResult>("/api/auth/register", input);
  },

  login(input: LoginInput): Promise<AuthResult> {
    return apiClient.post<AuthResult>("/api/auth/login", input);
  },

  /** Validates the stored token and returns the current user. */
  getMe(): Promise<User> {
    return apiClient.get<User>("/api/auth/me");
  },
};
