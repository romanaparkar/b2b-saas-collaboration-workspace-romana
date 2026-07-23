export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}
