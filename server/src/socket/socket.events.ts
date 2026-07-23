/**
 * Every Socket.IO event name used by the application, in one place.
 *
 * Both transports (HTTP controllers and socket handlers) and the client refer
 * to these names, so keeping them as constants prevents silent typos — a
 * mistyped event name fails at compile time instead of simply never firing.
 */
export const SOCKET_EVENTS = {
  // Presence
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  PRESENCE_SYNC: "presence:sync",

  // Room management (client -> server)
  WORKSPACE_JOIN: "workspace:join",
  WORKSPACE_LEAVE: "workspace:leave",
  CHANNEL_JOIN: "channel:join",
  CHANNEL_LEAVE: "channel:leave",

  // Channels (server -> client)
  CHANNEL_CREATED: "channel:created",
  CHANNEL_DELETED: "channel:deleted",

  // Messaging
  MESSAGE_NEW: "message:new",
  MESSAGE_CREATED: "message:created",
  MESSAGE_READ: "message:read",

  // Typing indicator
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;

/**
 * Room naming.
 *
 * Rooms are namespaced (`workspace:<id>` rather than the bare id) because a
 * Socket.IO server shares one room namespace with the auto-created per-socket
 * rooms. Prefixing guarantees a workspace id can never collide with a socket id
 * or a channel id.
 */
export const workspaceRoom = (workspaceId: string): string => `workspace:${workspaceId}`;

export const channelRoom = (channelId: string): string => `channel:${channelId}`;
