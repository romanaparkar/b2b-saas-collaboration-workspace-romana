import type { Channel } from "./channel";
import type { Message } from "./message";

/**
 * Client-side mirror of `server/src/socket/socket.types.ts`.
 *
 * Typing both ends means a renamed event or a changed payload is a compile
 * error here rather than a listener that silently never fires.
 */

export type SocketAckResponse<T = void> =
  | { success: true; data: T }
  | { success: false; message: string };

export type SocketAck<T = void> = (response: SocketAckResponse<T>) => void;

export interface PresencePayload {
  workspaceId: string;
  userId: string;
  name: string;
}

export interface OnlineUser {
  id: string;
  name: string;
}

export interface PresenceSyncPayload {
  workspaceId: string;
  users: OnlineUser[];
}

export interface TypingPayload {
  channelId: string;
  userId: string;
  name: string;
}

export interface MessageCreatedPayload {
  message: Message;
  tempId?: string;
}

export interface MessageReadPayload {
  messageId: string;
  channelId: string;
  workspaceId: string;
  userId: string;
  readBy: string[];
}

export interface ChannelDeletedPayload {
  channelId: string;
  workspaceId: string;
}

/** Events the client receives. */
export interface ServerToClientEvents {
  user_online: (payload: PresencePayload) => void;
  user_offline: (payload: PresencePayload) => void;
  "presence:sync": (payload: PresenceSyncPayload) => void;
  "channel:created": (channel: Channel) => void;
  "channel:deleted": (payload: ChannelDeletedPayload) => void;
  "message:created": (payload: MessageCreatedPayload) => void;
  "message:read": (payload: MessageReadPayload) => void;
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;
}

/** Events the client sends. */
export interface ClientToServerEvents {
  "workspace:join": (payload: { workspaceId: string }, ack?: SocketAck) => void;
  "workspace:leave": (payload: { workspaceId: string }) => void;
  "channel:join": (payload: { channelId: string }, ack?: SocketAck) => void;
  "channel:leave": (payload: { channelId: string }) => void;
  "message:new": (
    payload: { channelId: string; content: string; tempId?: string },
    ack?: SocketAck<Message>,
  ) => void;
  "message:read": (payload: { messageId: string }, ack?: SocketAck) => void;
  "typing:start": (payload: { channelId: string }) => void;
  "typing:stop": (payload: { channelId: string }) => void;
}
