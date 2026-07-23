import { Server, Socket } from "socket.io";

import { ChannelDto } from "../modules/channel/channel.types";
import { MessageDto } from "../modules/message/message.types";
import { Role } from "../shared/constants/roles";

/** Acknowledgement callback used by client-initiated events. */
export type SocketAck<T = void> = (response: SocketAckResponse<T>) => void;

export type SocketAckResponse<T = void> =
  | { success: true; data: T }
  | { success: false; message: string };

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
  /** Everyone currently connected to this workspace, including the recipient. */
  users: OnlineUser[];
}

export interface TypingPayload {
  channelId: string;
  userId: string;
  name: string;
}

export interface MessageCreatedPayload {
  message: MessageDto;
  /**
   * Echo of the client-generated id used for the optimistic placeholder, so
   * the sender can reconcile instead of rendering the message twice.
   */
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

/** Events the server emits to clients. */
export interface ServerToClientEvents {
  user_online: (payload: PresencePayload) => void;
  user_offline: (payload: PresencePayload) => void;
  "presence:sync": (payload: PresenceSyncPayload) => void;
  "channel:created": (channel: ChannelDto) => void;
  "channel:deleted": (payload: ChannelDeletedPayload) => void;
  "message:created": (payload: MessageCreatedPayload) => void;
  "message:read": (payload: MessageReadPayload) => void;
  "typing:start": (payload: TypingPayload) => void;
  "typing:stop": (payload: TypingPayload) => void;
}

/** Events clients emit to the server. */
export interface ClientToServerEvents {
  "workspace:join": (payload: { workspaceId: string }, ack?: SocketAck) => void;
  "workspace:leave": (payload: { workspaceId: string }) => void;
  "channel:join": (payload: { channelId: string }, ack?: SocketAck) => void;
  "channel:leave": (payload: { channelId: string }) => void;
  "message:new": (
    payload: { channelId: string; content: string; tempId?: string },
    ack?: SocketAck<MessageDto>,
  ) => void;
  "message:read": (payload: { messageId: string }, ack?: SocketAck) => void;
  "typing:start": (payload: { channelId: string }) => void;
  "typing:stop": (payload: { channelId: string }) => void;
}

/** Reserved for server-to-server events; unused today. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InterServerEvents {}

/** Authenticated identity attached to every socket by the auth middleware. */
export interface SocketData {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
