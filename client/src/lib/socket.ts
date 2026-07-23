import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

import { API_BASE_URL } from "./api";
import { tokenStorage } from "./tokenStorage";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socket";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * The application's single Socket.IO connection.
 *
 * One socket is shared by every hook and component: opening a connection per
 * feature would multiply server load, duplicate every broadcast, and make
 * presence report the same user several times over. The instance is created
 * lazily and never re-created, so listeners registered anywhere survive
 * automatic reconnects.
 */
let socket: AppSocket | null = null;

/** The socket instance, created (but not connected) on first use. */
export function getSocket(): AppSocket {
  if (socket) {
    return socket;
  }

  socket = io(API_BASE_URL, {
    // The connection is opened deliberately once the user is authenticated,
    // never as a side effect of importing this module.
    autoConnect: false,

    // A callback (rather than a static object) is re-invoked on every
    // reconnect attempt, so the socket always presents the current token
    // instead of one captured when the page first loaded.
    auth: (callback) => {
      callback({ token: tokenStorage.get() ?? "" });
    },

    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5_000,
  });

  return socket;
}

/** Open the connection, or leave it open if it already is. */
export function connectSocket(): AppSocket {
  const instance = getSocket();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
}

/**
 * Close the connection and discard the instance.
 *
 * Called on logout: the next login must re-authenticate from scratch rather
 * than reuse a socket that is still bound to the previous user's identity.
 */
export function disconnectSocket(): void {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
