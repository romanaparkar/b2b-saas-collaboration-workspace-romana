import { useCallback, useEffect, useState } from "react";

import { getSocket } from "../lib/socket";
import type { MessageCreatedPayload } from "../types/socket";
import { useAuth } from "./useAuth";

export type UnreadCounts = Record<string, number>;

export interface UseUnreadCountsResult {
  unreadCounts: UnreadCounts;
  markChannelRead: (channelId: string) => void;
}

/**
 * Per-channel unread badges.
 *
 * This works because messages are broadcast to the whole workspace, not just
 * the channel room — the client hears about activity in channels it has not
 * opened, which is exactly what an unread count needs.
 *
 * Counting is session-scoped: it starts from zero on load rather than from a
 * stored last-read marker. Server-side unread state is a later concern; this
 * covers the live case the UI actually shows.
 */
export function useUnreadCounts(activeChannelId: string | null): UseUnreadCountsResult {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  useEffect(() => {
    const socket = getSocket();

    const handleCreated = ({ message }: MessageCreatedPayload) => {
      // Nothing is unread in the channel you are looking at, and your own
      // messages are never unread.
      if (message.channel === activeChannelId || message.sender.id === user?.id) {
        return;
      }

      setUnreadCounts((current) => ({
        ...current,
        [message.channel]: (current[message.channel] ?? 0) + 1,
      }));
    };

    socket.on("message:created", handleCreated);

    return () => {
      socket.off("message:created", handleCreated);
    };
  }, [activeChannelId, user?.id]);

  // Opening a channel clears its badge. Callers invoke this on selection rather
  // than an effect deriving it, keeping unread state free of cascading renders.
  const markChannelRead = useCallback((channelId: string) => {
    setUnreadCounts((current) =>
      current[channelId] ? { ...current, [channelId]: 0 } : current,
    );
  }, []);

  return { unreadCounts, markChannelRead };
}
