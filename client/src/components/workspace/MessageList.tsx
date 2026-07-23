import { useEffect, useRef } from "react";

import type { ChatMessage } from "../../types/message";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  isLoading: boolean;
  onRetry: (message: ChatMessage) => void;
}

/**
 * Distance from the bottom (px) within which the view is considered "at the
 * bottom" and should keep following new messages.
 */
const STICK_THRESHOLD_PX = 80;

const MessageList = ({
  messages,
  currentUserId,
  isLoading,
  onRetry,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll only while the reader is already at the bottom — yanking the
  // view away from someone scrolled up reading history would be hostile.
  const shouldStickRef = useRef(true);

  const handleScroll = () => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    shouldStickRef.current = distanceFromBottom < STICK_THRESHOLD_PX;
  };

  useEffect(() => {
    if (shouldStickRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Loading messages…</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">
          No messages yet. Say something to get the conversation started.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-4 overflow-y-auto bg-slate-100 px-6 py-6"
    >
      {messages.map((message) => (
        <MessageItem
          key={message.tempId ?? message.id}
          message={message}
          isOwn={message.sender.id === currentUserId}
          onRetry={onRetry}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
