export interface MessageAuthor {
  id: string;
  name: string;
  email: string;
}

/** A message exactly as the server stores and broadcasts it. */
export interface Message {
  id: string;
  content: string;
  channel: string;
  workspace: string;
  sender: MessageAuthor;
  /** Ids of users who have read this message. */
  readBy: string[];
  createdAt: string;
}

/**
 * A message as rendered in the UI.
 *
 * Extends the server shape with the client-only fields needed for optimistic
 * sending: `tempId` identifies the placeholder so the server's broadcast can
 * replace it instead of appearing twice, and `status` drives the "sending" /
 * "failed" affordances.
 */
export interface ChatMessage extends Message {
  tempId?: string;
  status?: "sending" | "failed";
}

export interface CreateMessageInput {
  content: string;
}
