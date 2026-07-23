import { getIO } from "./socket";
import { channelRoom, workspaceRoom } from "./socket.events";
import { ServerToClientEvents } from "./socket.types";

/**
 * The only way business logic is allowed to reach Socket.IO.
 *
 * Services depend on these two functions instead of the socket server itself,
 * which keeps the transport swappable, keeps the emit calls type-checked
 * against `ServerToClientEvents`, and makes every broadcast a no-op (rather
 * than a crash) when no socket server is running.
 */
export function emitToWorkspace<E extends keyof ServerToClientEvents>(
  workspaceId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
): void {
  getIO()?.to(workspaceRoom(workspaceId)).emit(event, ...args);
}

export function emitToChannel<E extends keyof ServerToClientEvents>(
  channelId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
): void {
  getIO()?.to(channelRoom(channelId)).emit(event, ...args);
}
