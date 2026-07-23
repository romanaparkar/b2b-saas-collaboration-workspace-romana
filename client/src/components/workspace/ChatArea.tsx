import { Hash } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useChannelRoom } from "../../hooks/useChannelRoom";
import { useMessages } from "../../hooks/useMessages";
import { useTyping } from "../../hooks/useTyping";
import type { Channel } from "../../types/channel";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

interface ChatAreaProps {
  workspaceId: string;
  channel: Channel;
  isConnected: boolean;
}

/**
 * Everything scoped to the open channel: history, live messages, typing and
 * composing.
 *
 * The parent renders this with a `key` of the channel id, so switching
 * channels remounts it and no state from the previous conversation can leak
 * into the next one.
 */
const ChatArea = ({ workspaceId, channel, isConnected }: ChatAreaProps) => {
  const { user } = useAuth();

  useChannelRoom(channel.id, isConnected);

  const { messages, isLoading, error, sendMessage, retryMessage } = useMessages(
    workspaceId,
    channel.id,
  );

  const { typingNames, notifyTyping, stopTyping } = useTyping(channel.id);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-4">
        <Hash size={18} className="text-slate-400" />
        <h1 className="text-lg font-semibold text-slate-900">{channel.name}</h1>
      </header>

      {error && (
        <p role="alert" className="bg-red-50 px-6 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <MessageList
        messages={messages}
        currentUserId={user?.id ?? null}
        isLoading={isLoading}
        onRetry={retryMessage}
      />

      <TypingIndicator names={typingNames} />

      <MessageInput
        channelName={channel.name}
        disabled={false}
        onSend={sendMessage}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
      />
    </section>
  );
};

export default ChatArea;
