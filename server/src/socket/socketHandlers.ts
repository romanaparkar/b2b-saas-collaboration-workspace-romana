import { AppError } from "../shared/errors/AppError";
import { channelService } from "../modules/channel/channel.service";
import { messageService } from "../modules/message/message.service";
import { createMessageSchema } from "../modules/message/message.validation";
import { workspaceService } from "../modules/workspace/workspace.service";
import { presence } from "./presence";
import { SOCKET_EVENTS, channelRoom, workspaceRoom } from "./socket.events";
import { AppSocket, OnlineUser, SocketAck, SocketServer } from "./socket.types";

const WORKSPACE_ROOM_PREFIX = "workspace:";
const CHANNEL_ROOM_PREFIX = "channel:";

/**
 * Turn a thrown error into a message that is safe to send to a client.
 * `AppError`s are deliberate and descriptive; anything else is a bug and is
 * logged rather than leaked.
 */
function toClientMessage(error: unknown, context: string): string {
  if (error instanceof AppError) {
    return error.message;
  }

  console.error(`Socket handler failed (${context}):`, error);
  return "Something went wrong";
}

/** Reply to an optional acknowledgement callback, if the client supplied one. */
function ok<T>(ack: SocketAck<T> | undefined, data: T): void {
  ack?.({ success: true, data });
}

function fail(ack: SocketAck<never> | undefined, message: string): void {
  ack?.({ success: false, message });
}

/** Rooms of a given kind the socket currently belongs to. */
function roomsWithPrefix(socket: AppSocket, prefix: string): string[] {
  return [...socket.rooms].filter((room) => room.startsWith(prefix));
}

/**
 * The distinct users currently connected to a workspace room.
 *
 * Derived from live room membership rather than a second bookkeeping structure,
 * so it cannot drift out of sync with the rooms themselves. De-duplicated by
 * user id because one person may hold several sockets.
 */
async function onlineUsersInWorkspace(
  io: SocketServer,
  workspaceId: string,
): Promise<OnlineUser[]> {
  const sockets = await io.in(workspaceRoom(workspaceId)).fetchSockets();
  const byId = new Map<string, OnlineUser>();

  for (const member of sockets) {
    byId.set(member.data.user.id, {
      id: member.data.user.id,
      name: member.data.user.name,
    });
  }

  return [...byId.values()];
}

/**
 * Wire every socket event to the service layer.
 *
 * Handlers stay deliberately thin — the socket equivalent of a controller.
 * They authenticate, validate, delegate to a service, and acknowledge; all
 * business rules and every broadcast live in the services, so HTTP and socket
 * clients are guaranteed to behave identically.
 */
export function registerSocketHandlers(io: SocketServer): void {
  io.on("connection", (socket: AppSocket) => {
    const user = socket.data.user;

    presence.add(user.id, socket.id);

    /**
     * Join a workspace room.
     *
     * Any previously joined workspace (and its channel rooms) is left first,
     * so switching workspaces never leaves a socket receiving events from the
     * old one.
     */
    socket.on(SOCKET_EVENTS.WORKSPACE_JOIN, async ({ workspaceId }, ack) => {
      try {
        // Membership is verified before any room is joined.
        await workspaceService.getByIdForUser(workspaceId, user.id);

        const room = workspaceRoom(workspaceId);

        for (const previous of roomsWithPrefix(socket, WORKSPACE_ROOM_PREFIX)) {
          if (previous !== room) {
            await socket.leave(previous);
          }
        }

        for (const previous of roomsWithPrefix(socket, CHANNEL_ROOM_PREFIX)) {
          await socket.leave(previous);
        }

        await socket.join(room);

        // Tell the newcomer who is already here...
        socket.emit(SOCKET_EVENTS.PRESENCE_SYNC, {
          workspaceId,
          users: await onlineUsersInWorkspace(io, workspaceId),
        });

        // ...and tell everyone else about the newcomer. Clients keep presence
        // in a set, so a repeat notification (second tab) is harmless.
        socket.to(room).emit(SOCKET_EVENTS.USER_ONLINE, {
          workspaceId,
          userId: user.id,
          name: user.name,
        });

        ok(ack, undefined);
      } catch (error) {
        fail(ack, toClientMessage(error, SOCKET_EVENTS.WORKSPACE_JOIN));
      }
    });

    socket.on(SOCKET_EVENTS.WORKSPACE_LEAVE, async ({ workspaceId }) => {
      await socket.leave(workspaceRoom(workspaceId));
    });

    /**
     * Join a channel room. Only used to scope typing indicators — messages are
     * broadcast workspace-wide so unread counts work for unopened channels.
     */
    socket.on(SOCKET_EVENTS.CHANNEL_JOIN, async ({ channelId }, ack) => {
      try {
        await channelService.getAccessibleChannel(channelId, user.id);

        const room = channelRoom(channelId);

        for (const previous of roomsWithPrefix(socket, CHANNEL_ROOM_PREFIX)) {
          if (previous !== room) {
            await socket.leave(previous);
          }
        }

        await socket.join(room);
        ok(ack, undefined);
      } catch (error) {
        fail(ack, toClientMessage(error, SOCKET_EVENTS.CHANNEL_JOIN));
      }
    });

    socket.on(SOCKET_EVENTS.CHANNEL_LEAVE, async ({ channelId }) => {
      await socket.leave(channelRoom(channelId));
    });

    /**
     * Send a message. The service persists it and broadcasts `message:created`
     * to the workspace; the ack lets the sender confirm (or roll back) their
     * optimistic placeholder.
     */
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, async ({ channelId, content, tempId }, ack) => {
      try {
        const parsed = createMessageSchema.safeParse({ content });

        if (!parsed.success) {
          fail(ack, parsed.error.issues[0]?.message ?? "Invalid message");
          return;
        }

        const message = await messageService.create(
          channelId,
          user.id,
          parsed.data,
          tempId,
        );

        ok(ack, message);
      } catch (error) {
        fail(ack, toClientMessage(error, SOCKET_EVENTS.MESSAGE_NEW));
      }
    });

    /** Read receipt. The service skips the broadcast if it is a repeat. */
    socket.on(SOCKET_EVENTS.MESSAGE_READ, async ({ messageId }, ack) => {
      try {
        await messageService.markRead(messageId, user.id);
        ok(ack, undefined);
      } catch (error) {
        fail(ack, toClientMessage(error, SOCKET_EVENTS.MESSAGE_READ));
      }
    });

    /**
     * Typing indicators are transient signals, never persisted, and go only to
     * the *other* members of the same channel.
     */
    socket.on(SOCKET_EVENTS.TYPING_START, ({ channelId }) => {
      socket.to(channelRoom(channelId)).emit(SOCKET_EVENTS.TYPING_START, {
        channelId,
        userId: user.id,
        name: user.name,
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ channelId }) => {
      socket.to(channelRoom(channelId)).emit(SOCKET_EVENTS.TYPING_STOP, {
        channelId,
        userId: user.id,
        name: user.name,
      });
    });

    /**
     * `disconnecting` rather than `disconnect`: the socket's rooms are still
     * populated here, so we know which workspaces to notify.
     *
     * The user only goes offline when this was their last connection, which is
     * what makes a page refresh — briefly two sockets — invisible to others.
     */
    socket.on("disconnecting", () => {
      const rooms = roomsWithPrefix(socket, WORKSPACE_ROOM_PREFIX);
      const wasLastConnection = presence.remove(user.id, socket.id);

      if (!wasLastConnection) {
        return;
      }

      for (const room of rooms) {
        socket.to(room).emit(SOCKET_EVENTS.USER_OFFLINE, {
          workspaceId: room.slice(WORKSPACE_ROOM_PREFIX.length),
          userId: user.id,
          name: user.name,
        });
      }
    });
  });
}
