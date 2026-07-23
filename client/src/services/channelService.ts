import { apiClient } from "../lib/apiClient";
import type { Channel, CreateChannelInput } from "../types/channel";

/** Channels are nested under their workspace, mirroring the REST routes. */
const channelsPath = (workspaceId: string) => `/api/workspaces/${workspaceId}/channels`;

export const channelService = {
  list(workspaceId: string): Promise<Channel[]> {
    return apiClient.get<Channel[]>(channelsPath(workspaceId));
  },

  create(workspaceId: string, input: CreateChannelInput): Promise<Channel> {
    return apiClient.post<Channel>(channelsPath(workspaceId), input);
  },

  remove(workspaceId: string, channelId: string): Promise<void> {
    return apiClient.delete<void>(`${channelsPath(workspaceId)}/${channelId}`);
  },
};
