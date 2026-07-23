import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { env } from "../config/env";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketServer,
} from "./socket.types";
import { authenticateSocket } from "./socketAuth";

/**
 * The live Socket.IO server.
 *
 * Held in this module — which imports nothing from `modules/` — so that
 * services can reach the emitter without creating an import cycle back through
 * the handlers that consume those same services.
 */
let io: SocketServer | null = null;

/**
 * Create the Socket.IO server and attach it to the existing HTTP server, so
 * REST and WebSocket traffic share a single port.
 *
 * Only transport concerns live here: CORS, and the authentication middleware
 * that must pass before any handler can run. Event wiring is registered
 * separately by `registerSocketHandlers`.
 */
export function initSocket(httpServer: HttpServer): SocketServer {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  return io;
}

/**
 * The initialized server, or `null` when sockets are not running.
 *
 * Callers must tolerate `null`: it keeps the HTTP API fully usable in contexts
 * where no socket server was started (tests, scripts), instead of throwing from
 * deep inside a service.
 */
export function getIO(): SocketServer | null {
  return io;
}
