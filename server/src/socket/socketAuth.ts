import { ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { authService } from "../modules/auth/auth.service";
import { JwtPayload } from "../modules/auth/auth.types";
import { AppSocket } from "./socket.types";

/**
 * Read the access token from the handshake.
 *
 * `auth.token` is the documented Socket.IO mechanism and is what our client
 * uses; the `Authorization` header is accepted as a fallback so the same token
 * works from tools such as Postman.
 */
function extractToken(socket: AppSocket): string | null {
  const fromAuth = socket.handshake.auth?.token;

  if (typeof fromAuth === "string" && fromAuth.trim() !== "") {
    return fromAuth.trim();
  }

  const header = socket.handshake.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return null;
}

/**
 * Socket.IO connection middleware — the socket equivalent of `protect`.
 *
 * Runs once per connection (including every reconnect), so an expired or
 * revoked token cannot keep a long-lived socket alive. The user is loaded from
 * the database rather than trusted from the token alone, which both confirms
 * the account still exists and gives handlers the display name needed for
 * presence and typing broadcasts.
 */
export async function authenticateSocket(
  socket: AppSocket,
  next: (err?: ExtendedError) => void,
): Promise<void> {
  const token = extractToken(socket);

  if (!token) {
    next(new Error("Authentication token is missing"));
    return;
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    next(new Error("Invalid or expired token"));
    return;
  }

  try {
    const user = await authService.getUserById(payload.sub);
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Account no longer exists"));
  }
}
