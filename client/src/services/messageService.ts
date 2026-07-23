import { apiClient } from "../lib/apiClient";
import type { CreateMessageInput, Message } from "../types/message";

const messagesPath = (workspaceId: string, channelId: string) =>
  `/api/workspaces/${workspaceId}/channels/${channelId}/messages`;

export interface ListMessagesParams {
  limit?: number;
  /** ISO timestamp cursor: return messages older than this. */
  before?: string;
}

export const messageService = {
  /**
   * Channel history, newest first (the server's ordering).
   * Callers that render a transcript reverse it for display.
   */
  list(
    workspaceId: string,
    channelId: string,
    params: ListMessagesParams = {},
  ): Promise<Message[]> {
    const query = new URLSearchParams();

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    if (params.before !== undefined) {
      query.set("before", params.before);
    }

    const search = query.toString();
    const suffix = search === "" ? "" : `?${search}`;

    return apiClient.get<Message[]>(`${messagesPath(workspaceId, channelId)}${suffix}`);
  },

  /**
   * Send over HTTP.
   *
   * The UI sends through the socket while it is connected; this is the
   * fallback used mid-reconnect, so a message typed during a blip is still
   * delivered (and still broadcast to everyone else by the server).
   */
  create(
    workspaceId: string,
    channelId: string,
    input: CreateMessageInput,
  ): Promise<Message> {
    return apiClient.post<Message>(messagesPath(workspaceId, channelId), input);
  },
};
