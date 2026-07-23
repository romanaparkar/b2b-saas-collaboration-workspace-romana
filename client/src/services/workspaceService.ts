import { apiClient } from "../lib/apiClient";
import type { CreateWorkspaceInput, Workspace } from "../types/workspace";

export const workspaceService = {
  list(): Promise<Workspace[]> {
    return apiClient.get<Workspace[]>("/api/workspaces");
  },

  create(input: CreateWorkspaceInput): Promise<Workspace> {
    return apiClient.post<Workspace>("/api/workspaces", input);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/workspaces/${id}`);
  },
};
