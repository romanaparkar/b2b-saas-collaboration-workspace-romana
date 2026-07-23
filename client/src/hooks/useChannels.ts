import { useCallback, useEffect, useState } from "react";

import { getSocket } from "../lib/socket";
import { channelService } from "../services/channelService";
import type { Channel } from "../types/channel";
import type { ChannelDeletedPayload } from "../types/socket";
import { toErrorMessage } from "../lib/errors";

export interface UseChannelsResult {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  createChannel: (name: string) => Promise<Channel | null>;
  deleteChannel: (channelId: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * The workspace's channel list, kept live.
 *
 * The initial list comes from REST; after that the server's `channel:created`
 * and `channel:deleted` broadcasts keep every member in sync. Creating a
 * channel deliberately does *not* append locally — the broadcast reaches the
 * author too, so applying only the broadcast keeps one code path and avoids a
 * duplicate entry.
 */
export function useChannels(workspaceId: string | null): UseChannelsResult {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let cancelled = false;

    const loadChannels = async () => {
      setIsLoading(true);

      try {
        const data = await channelService.list(workspaceId);
        if (!cancelled) {
          setChannels(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(toErrorMessage(err, "Failed to load channels."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadChannels();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const socket = getSocket();

    const handleCreated = (channel: Channel) => {
      if (channel.workspace !== workspaceId) {
        return;
      }

      setChannels((current) =>
        current.some((item) => item.id === channel.id)
          ? current
          : [...current, channel],
      );
    };

    const handleDeleted = (payload: ChannelDeletedPayload) => {
      if (payload.workspaceId !== workspaceId) {
        return;
      }

      setChannels((current) =>
        current.filter((item) => item.id !== payload.channelId),
      );
    };

    socket.on("channel:created", handleCreated);
    socket.on("channel:deleted", handleDeleted);

    return () => {
      socket.off("channel:created", handleCreated);
      socket.off("channel:deleted", handleDeleted);
    };
  }, [workspaceId]);

  const createChannel = useCallback(
    async (name: string): Promise<Channel | null> => {
      if (!workspaceId) {
        return null;
      }

      setError(null);

      try {
        return await channelService.create(workspaceId, { name });
      } catch (err) {
        setError(toErrorMessage(err, "Failed to create channel."));
        return null;
      }
    },
    [workspaceId],
  );

  const deleteChannel = useCallback(
    async (channelId: string): Promise<boolean> => {
      if (!workspaceId) {
        return false;
      }

      setError(null);

      try {
        await channelService.remove(workspaceId, channelId);
        return true;
      } catch (err) {
        setError(toErrorMessage(err, "Failed to delete channel."));
        return false;
      }
    },
    [workspaceId],
  );

  const clearError = useCallback(() => setError(null), []);

  return { channels, isLoading, error, createChannel, deleteChannel, clearError };
}
