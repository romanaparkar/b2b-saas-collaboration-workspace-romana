import { useEffect, useState } from "react";

import { getSocket } from "../lib/socket";

export interface UseWorkspaceRoomResult {
  /** True once the server has confirmed the join. */
  hasJoined: boolean;
  error: string | null;
}

/**
 * Keeps the socket subscribed to a workspace's room.
 *
 * The join is re-issued on every (re)connect, because rooms live on the server
 * and are lost when a connection drops — without this, a client would look
 * connected after a network blip while silently receiving nothing. The server
 * also drops the previous workspace room on join, so switching workspaces
 * cannot leave a stale subscription behind.
 */
export function useWorkspaceRoom(
  workspaceId: string | null,
  isConnected: boolean,
): UseWorkspaceRoomResult {
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !isConnected) {
      return;
    }

    const socket = getSocket();
    let cancelled = false;

    socket.emit("workspace:join", { workspaceId }, (response) => {
      if (cancelled) {
        return;
      }

      if (response.success) {
        setHasJoined(true);
        setError(null);
      } else {
        setHasJoined(false);
        setError(response.message);
      }
    });

    return () => {
      cancelled = true;
      setHasJoined(false);
      socket.emit("workspace:leave", { workspaceId });
    };
  }, [workspaceId, isConnected]);

  return { hasJoined, error };
}
