import { apiClient } from "../lib/apiClient";
import type { CreateWorkspaceInput, Workspace } from "../types/workspace";

export const workspaceService = {
  list(): Promise<Workspace[]> {
    return apiClient.get<Workspace[]>("/api/workspaces");
  },

  get(id: string): Promise<Workspace> {
    return apiClient.get<Workspace>(`/api/workspaces/${id}`);
  },

  create(input: CreateWorkspaceInput): Promise<Workspace> {
    return apiClient.post<Workspace>("/api/workspaces", input);
  },

  /** Join an existing workspace by id. Idempotent if already a member. */
  join(id: string): Promise<Workspace> {
    return apiClient.post<Workspace>(`/api/workspaces/${id}/join`);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/workspaces/${id}`);
  },
};
