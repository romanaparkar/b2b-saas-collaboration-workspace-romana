import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getSocket } from "../lib/socket";
import type { TypingPayload } from "../types/socket";

/**
 * How long a "typing" signal stays valid without renewal. Slightly longer than
 * the sender's re-broadcast interval, so a steady typist never flickers.
 */
const TYPING_TIMEOUT_MS = 4_000;

/** Minimum gap between outgoing typing:start events while typing continues. */
const TYPING_THROTTLE_MS = 2_000;

export interface UseTypingResult {
  /** Names of other people currently typing in this channel. */
  typingNames: string[];
  /** Call on every keystroke; throttled internally. */
  notifyTyping: () => void;
  /** Call when the input is cleared or a message is sent. */
  stopTyping: () => void;
}

/**
 * Typing indicators for a channel.
 *
 * These are transient signals, never persisted, and the server relays them only
 * to the other members of the same channel — so a user never sees their own.
 *
 * Each remote typist gets an expiry timer: a client that closes its tab
 * mid-sentence never sends `typing:stop`, and without the timeout its name
 * would linger for good.
 */
export function useTyping(channelId: string | null): UseTypingResult {
  const [typistsById, setTypistsById] = useState<Record<string, string>>({});

  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentAtRef = useRef(0);

  const clearTypist = useCallback((userId: string) => {
    const timeout = timeoutsRef.current.get(userId);

    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(userId);
    }

    setTypistsById((current) => {
      if (!(userId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[userId];
      return next;
    });
  }, []);

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    if (!channelId) {
      return;
    }

    const socket = getSocket();

    const handleStart = (payload: TypingPayload) => {
      if (payload.channelId !== channelId) {
        return;
      }

      setTypistsById((current) => ({ ...current, [payload.userId]: payload.name }));

      const existing = timeouts.get(payload.userId);
      if (existing) {
        clearTimeout(existing);
      }

      timeouts.set(
        payload.userId,
        setTimeout(() => clearTypist(payload.userId), TYPING_TIMEOUT_MS),
      );
    };

    const handleStop = (payload: TypingPayload) => {
      if (payload.channelId !== channelId) {
        return;
      }

      clearTypist(payload.userId);
    };

    socket.on("typing:start", handleStart);
    socket.on("typing:stop", handleStop);

    return () => {
      socket.off("typing:start", handleStart);
      socket.off("typing:stop", handleStop);

      for (const timeout of timeouts.values()) {
        clearTimeout(timeout);
      }
      timeouts.clear();

      setTypistsById({});
      lastSentAtRef.current = 0;
    };
  }, [channelId, clearTypist]);

  const notifyTyping = useCallback(() => {
    if (!channelId) {
      return;
    }

    // Throttled: one event every couple of seconds is enough to keep the
    // indicator alive, and avoids a broadcast per keystroke.
    const now = Date.now();

    if (now - lastSentAtRef.current < TYPING_THROTTLE_MS) {
      return;
    }

    lastSentAtRef.current = now;
    getSocket().emit("typing:start", { channelId });
  }, [channelId]);

  const stopTyping = useCallback(() => {
    if (!channelId) {
      return;
    }

    lastSentAtRef.current = 0;
    getSocket().emit("typing:stop", { channelId });
  }, [channelId]);

  const typingNames = useMemo(() => Object.values(typistsById), [typistsById]);

  return { typingNames, notifyTyping, stopTyping };
}
