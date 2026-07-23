import { useEffect } from "react";

import { getSocket } from "../lib/socket";

/**
 * Subscribes the socket to a channel's room for as long as it is open.
 *
 * Channel rooms exist purely to scope typing indicators: messages are
 * broadcast workspace-wide so that unread badges work for channels the user is
 * not currently viewing. Re-joining whenever the connection returns keeps the
 * subscription correct across reconnects, since rooms are server-side state.
 */
export function useChannelRoom(channelId: string | null, isConnected: boolean): void {
  useEffect(() => {
    if (!channelId || !isConnected) {
      return;
    }

    const socket = getSocket();
    socket.emit("channel:join", { channelId });

    return () => {
      socket.emit("channel:leave", { channelId });
    };
  }, [channelId, isConnected]);
}
