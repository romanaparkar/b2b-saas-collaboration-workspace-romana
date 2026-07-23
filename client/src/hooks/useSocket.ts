import { useEffect, useState } from "react";

import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";
import type { AppSocket } from "../lib/socket";
import { useAuth } from "./useAuth";

export interface UseSocketResult {
  socket: AppSocket;
  isConnected: boolean;
  /** Set when the handshake is rejected (bad/expired token, server down). */
  connectionError: string | null;
}

/**
 * Owns the lifetime of the shared socket connection.
 *
 * The socket is opened when the user is authenticated and closed on logout, so
 * an anonymous visitor never holds one open and a signed-out session cannot
 * keep receiving a previous user's events.
 *
 * Safe to call from several components: they all observe the same singleton,
 * and only listeners — never the connection itself — are cleaned up on unmount.
 * Reconnection is handled by Socket.IO; this hook simply reports the state so
 * the UI can show it.
 */
export function useSocket(): UseSocketResult {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // The connection may already be open (another component got here first),
    // in which case the "connect" event has been and gone — reflect it now via
    // the same handler rather than a synchronous setState in the effect body.
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return { socket: getSocket(), isConnected, connectionError };
}
