import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { disconnectSocket } from "../lib/socket";
import { tokenStorage } from "../lib/tokenStorage";
import { authService } from "../services/authService";
import type { LoginInput, RegisterInput, User } from "../types/auth";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Owns all authentication state and is the only consumer of tokenStorage.
 * Components interact with auth exclusively through the `useAuth` hook.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" when there is a stored session to restore, so no state
  // update is needed in the effect body when the user is signed out.
  const [isLoading, setIsLoading] = useState(() => tokenStorage.get() !== null);

  // Restore the session on first load: a stored token is only trusted after
  // the server confirms it via /me.
  useEffect(() => {
    if (!tokenStorage.get()) {
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        const currentUser = await authService.getMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        // Token is invalid or expired — drop it.
        tokenStorage.clear();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user: authUser, token } = await authService.login(input);
    tokenStorage.set(token);
    setUser(authUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: authUser, token } = await authService.register(input);
    tokenStorage.set(token);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    // Close the realtime connection before dropping the token, so the socket
    // does not attempt a reconnect with a credential we are about to discard.
    disconnectSocket();
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
