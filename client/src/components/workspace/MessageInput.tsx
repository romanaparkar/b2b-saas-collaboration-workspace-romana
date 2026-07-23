import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  channelName: string;
  disabled: boolean;
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
}

const MessageInput = ({
  channelName,
  disabled,
  onSend,
  onTyping,
  onStopTyping,
}: MessageInputProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = content.trim();

    if (trimmed === "") {
      return;
    }

    // Cleared immediately: the send is optimistic, so waiting for the server
    // would make the input feel laggy.
    setContent("");
    onStopTyping();

    await onSend(trimmed);
  };

  const handleChange = (value: string) => {
    setContent(value);

    if (value.trim() === "") {
      onStopTyping();
    } else {
      onTyping();
    }
  };

  // Enter sends, Shift+Enter inserts a newline — the convention users expect
  // from every other chat app.
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
      <textarea
        value={content}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onStopTyping}
        disabled={disabled}
        rows={1}
        maxLength={4000}
        placeholder={`Message #${channelName}`}
        aria-label={`Message ${channelName}`}
        className="max-h-40 flex-1 resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      <button
        type="submit"
        disabled={disabled || content.trim() === ""}
        aria-label="Send message"
        className="rounded-lg bg-cyan-600 p-3 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  );
};

export default MessageInput;
