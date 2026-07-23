import { AlertCircle, Check, CheckCheck } from "lucide-react";

import type { ChatMessage } from "../../types/message";

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  onRetry: (message: ChatMessage) => void;
}

const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const MessageItem = ({ message, isOwn, onRetry }: MessageItemProps) => {
  // The author is always in `readBy`, so anything beyond them is a real receipt.
  const otherReaders = message.readBy.filter((userId) => userId !== message.sender.id);
  const isFailed = message.status === "failed";
  const isSending = message.status === "sending";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-lg ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <span className="mb-1 px-1 text-xs font-semibold text-slate-600">
            {message.sender.name}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn ? "bg-cyan-600 text-white" : "bg-white text-slate-800 shadow-sm"
          } ${isSending ? "opacity-60" : ""} ${isFailed ? "bg-red-100 text-red-800" : ""}`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        </div>

        <div className="mt-1 flex items-center gap-2 px-1 text-xs text-slate-400">
          <span>{formatTime(message.createdAt)}</span>

          {isSending && <span>Sending…</span>}

          {isOwn && !isSending && !isFailed && (
            <span
              className="flex items-center gap-1"
              title={
                otherReaders.length > 0
                  ? `Read by ${otherReaders.length} ${
                      otherReaders.length === 1 ? "person" : "people"
                    }`
                  : "Sent"
              }
            >
              {otherReaders.length > 0 ? (
                <>
                  <CheckCheck size={14} className="text-cyan-600" />
                  {otherReaders.length}
                </>
              ) : (
                <Check size={14} />
              )}
            </span>
          )}

          {isFailed && (
            <button
              type="button"
              onClick={() => onRetry(message)}
              className="flex items-center gap-1 font-semibold text-red-600 hover:underline"
            >
              <AlertCircle size={14} />
              Failed — retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
