import { useEffect, useMemo, useState } from "react";

import { getSocket } from "../lib/socket";
import type {
  OnlineUser,
  PresencePayload,
  PresenceSyncPayload,
} from "../types/socket";

/**
 * Tracks who is currently online in a workspace.
 *
 * Presence arrives two ways: a `presence:sync` snapshot when we join (so we
 * see people who were already here) and incremental `user_online` /
 * `user_offline` events afterwards. State is keyed by user id, which makes
 * duplicate notifications — the same person opening a second tab — harmless.
 *
 * Events are filtered by workspace so a socket that is mid-switch between
 * workspaces cannot mix the two rosters.
 */
export function usePresence(workspaceId: string | null): OnlineUser[] {
  const [usersById, setUsersById] = useState<Record<string, OnlineUser>>({});

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const socket = getSocket();

    const handleSync = (payload: PresenceSyncPayload) => {
      if (payload.workspaceId !== workspaceId) {
        return;
      }

      // A snapshot replaces the roster outright — it is authoritative.
      setUsersById(
        Object.fromEntries(payload.users.map((user) => [user.id, user])),
      );
    };

    const handleOnline = (payload: PresencePayload) => {
      if (payload.workspaceId !== workspaceId) {
        return;
      }

      setUsersById((current) => ({
        ...current,
        [payload.userId]: { id: payload.userId, name: payload.name },
      }));
    };

    const handleOffline = (payload: PresencePayload) => {
      if (payload.workspaceId !== workspaceId) {
        return;
      }

      setUsersById((current) => {
        if (!(payload.userId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[payload.userId];
        return next;
      });
    };

    socket.on("presence:sync", handleSync);
    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);

    return () => {
      socket.off("presence:sync", handleSync);
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
      setUsersById({});
    };
  }, [workspaceId]);

  // Memoized so consumers can safely use the result in dependency arrays.
  return useMemo(() => Object.values(usersById), [usersById]);
}
