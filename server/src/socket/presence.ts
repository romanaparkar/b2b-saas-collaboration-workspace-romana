/**
 * In-memory presence tracking.
 *
 * A user maps to a *set* of socket ids rather than a single one, because the
 * same account is routinely connected from several tabs or devices. Only the
 * first connection makes a user "online" and only the last disconnection makes
 * them "offline", which is also what makes reconnects invisible: a refresh
 * briefly adds a second socket before the old one is reaped.
 *
 * This store is deliberately process-local. Running multiple API instances
 * would require a shared backend (the Redis adapter is the planned Phase 5
 * step); the interface below is small enough to swap without touching handlers.
 */
const socketsByUser = new Map<string, Set<string>>();

export const presence = {
  /**
   * Register a socket for a user.
   * @returns `true` when this is the user's first live connection.
   */
  add(userId: string, socketId: string): boolean {
    const sockets = socketsByUser.get(userId);

    if (!sockets) {
      socketsByUser.set(userId, new Set([socketId]));
      return true;
    }

    sockets.add(socketId);
    return false;
  },

  /**
   * Remove a socket for a user.
   * @returns `true` when the user has no remaining connections.
   */
  remove(userId: string, socketId: string): boolean {
    const sockets = socketsByUser.get(userId);

    if (!sockets) {
      return false;
    }

    sockets.delete(socketId);

    if (sockets.size > 0) {
      return false;
    }

    socketsByUser.delete(userId);
    return true;
  },

  isOnline(userId: string): boolean {
    return socketsByUser.has(userId);
  },

  /** Ids of every currently connected user. */
  onlineUserIds(): string[] {
    return [...socketsByUser.keys()];
  },
};
