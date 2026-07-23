import { useCallback, useEffect, useRef, useState } from "react";

import { toErrorMessage } from "../lib/errors";
import { getSocket } from "../lib/socket";
import { messageService } from "../services/messageService";
import type { ChatMessage, Message } from "../types/message";
import type { MessageCreatedPayload, MessageReadPayload } from "../types/socket";
import { useAuth } from "./useAuth";

/** How many messages of history to load when a channel is opened. */
const HISTORY_LIMIT = 50;

export interface UseMessagesResult {
  /** Oldest first — the order a transcript is read in. */
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (message: ChatMessage) => Promise<void>;
}

/**
 * Insert or reconcile a server-confirmed message.
 *
 * Handles the three ways the same message can reach us — our own optimistic
 * placeholder, the acknowledgement of our send, and the workspace broadcast —
 * so it appears exactly once regardless of which arrives first.
 */
function upsertMessage(
  list: ChatMessage[],
  message: Message,
  tempId?: string,
): ChatMessage[] {
  const withoutPlaceholder = tempId
    ? list.filter((item) => item.tempId !== tempId)
    : list;

  const existingIndex = withoutPlaceholder.findIndex(
    (item) => item.id === message.id,
  );

  if (existingIndex === -1) {
    return [...withoutPlaceholder, message];
  }

  // Already present (e.g. the ack landed before the broadcast): refresh it in
  // place rather than appending a duplicate.
  const next = [...withoutPlaceholder];
  next[existingIndex] = message;
  return next;
}

/**
 * Message history and live messaging for a single channel.
 *
 * History is loaded over REST; new messages arrive over the socket. Sends are
 * optimistic — the message renders immediately in a "sending" state and is
 * replaced by the server's copy, or marked failed if the write did not happen.
 *
 * While the socket is reconnecting, sends fall back to the REST endpoint so a
 * message typed during a network blip is not silently lost; the server
 * broadcasts it either way, so other members see no difference.
 */
export function useMessages(
  workspaceId: string | null,
  channelId: string | null,
): UseMessagesResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read receipts already sent, so scrolling and re-renders do not re-report
  // the same message on every pass.
  const reportedReadsRef = useRef<Set<string>>(new Set());

  // Load history whenever the open channel changes.
  useEffect(() => {
    if (!workspaceId || !channelId) {
      return;
    }

    let cancelled = false;

    // Not React state — safe to reset synchronously.
    reportedReadsRef.current = new Set();

    const loadHistory = async () => {
      setIsLoading(true);
      setMessages([]);

      try {
        const history = await messageService.list(workspaceId, channelId, {
          limit: HISTORY_LIMIT,
        });

        if (!cancelled) {
          // The API returns newest first; the transcript reads oldest first.
          setMessages([...history].reverse());
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(toErrorMessage(err, "Failed to load messages."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, channelId]);

  // Live updates for the open channel.
  useEffect(() => {
    if (!channelId) {
      return;
    }

    const socket = getSocket();

    const handleCreated = ({ message, tempId }: MessageCreatedPayload) => {
      // Messages are broadcast workspace-wide; other channels are the unread
      // counter's business, not ours.
      if (message.channel !== channelId) {
        return;
      }

      setMessages((current) => upsertMessage(current, message, tempId));
    };

    const handleRead = (payload: MessageReadPayload) => {
      if (payload.channelId !== channelId) {
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === payload.messageId ? { ...item, readBy: payload.readBy } : item,
        ),
      );
    };

    socket.on("message:created", handleCreated);
    socket.on("message:read", handleRead);

    return () => {
      socket.off("message:created", handleCreated);
      socket.off("message:read", handleRead);
    };
  }, [channelId]);

  // Report read receipts for messages written by other people.
  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = getSocket();

    for (const message of messages) {
      const isPending = message.status !== undefined;
      const isOwn = message.sender.id === user.id;

      if (
        isPending ||
        isOwn ||
        message.readBy.includes(user.id) ||
        reportedReadsRef.current.has(message.id)
      ) {
        continue;
      }

      reportedReadsRef.current.add(message.id);
      socket.emit("message:read", { messageId: message.id });
    }
  }, [messages, user]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();

      if (!workspaceId || !channelId || !user || trimmed === "") {
        return;
      }

      const tempId = crypto.randomUUID();

      const placeholder: ChatMessage = {
        id: tempId,
        tempId,
        status: "sending",
        content: trimmed,
        channel: channelId,
        workspace: workspaceId,
        sender: { id: user.id, name: user.name, email: user.email },
        readBy: [user.id],
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, placeholder]);

      const markFailed = () => {
        setMessages((current) =>
          current.map((item) =>
            item.tempId === tempId ? { ...item, status: "failed" } : item,
          ),
        );
      };

      const socket = getSocket();

      if (socket.connected) {
        socket.emit("message:new", { channelId, content: trimmed, tempId }, (response) => {
          if (response.success) {
            setMessages((current) => upsertMessage(current, response.data, tempId));
          } else {
            setError(response.message);
            markFailed();
          }
        });
        return;
      }

      // Reconnecting: go over HTTP so the message is not lost.
      try {
        const saved = await messageService.create(workspaceId, channelId, {
          content: trimmed,
        });
        setMessages((current) => upsertMessage(current, saved, tempId));
      } catch (err) {
        setError(toErrorMessage(err, "Failed to send message."));
        markFailed();
      }
    },
    [workspaceId, channelId, user],
  );

  const retryMessage = useCallback(
    async (message: ChatMessage) => {
      // Drop the failed placeholder and send again from scratch, so the retry
      // gets a fresh temp id and cannot collide with the original attempt.
      setMessages((current) =>
        current.filter((item) => item.tempId !== message.tempId),
      );

      await sendMessage(message.content);
    },
    [sendMessage],
  );

  return { messages, isLoading, error, sendMessage, retryMessage };
}
