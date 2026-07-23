import http from "http";

import app from "./app";
import { env } from "./config/env";
import connectDB from "./config/db";
import { initSocket } from "./socket/socket";
import { registerSocketHandlers } from "./socket/socketHandlers";

/**
 * Server bootstrap: connect to the database first, then start listening.
 * If the DB connection fails the process exits (see config/db.ts), so we never
 * accept traffic without a working database.
 *
 * Express is wrapped in an explicit HTTP server so Socket.IO can share the same
 * port — clients then need only one origin for both REST and WebSocket traffic.
 */
const start = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = initSocket(httpServer);
  registerSocketHandlers(io);

  httpServer.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
    console.log(`⚡ Socket.IO listening on the same port`);
  });
};

start();
