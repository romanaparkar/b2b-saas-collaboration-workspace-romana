import { Request, Response } from "express";

import { Workspace } from "./workspace.types";

/**
 * STUB implementation — data lives in memory and resets on restart.
 * Replaced by MongoDB-backed, user-scoped persistence in Phase 2.
 */
let workspaces: Workspace[] = [
  {
    id: "1",
    name: "Marketing Team",
    description: "Marketing Workspace",
  },
  {
    id: "2",
    name: "Development Team",
    description: "Development Workspace",
  },
  {
    id: "3",
    name: "Design Team",
    description: "Design Workspace",
  },
];

export const getWorkspaces = (_req: Request, res: Response) => {
  res.status(200).json(workspaces);
};

export const createWorkspace = (req: Request, res: Response) => {
  const { name, description } = req.body;

  const workspace: Workspace = {
    id: Date.now().toString(),
    name,
    description,
  };

  workspaces.push(workspace);

  res.status(201).json(workspace);
};

export const deleteWorkspace = (req: Request, res: Response) => {
  const { id } = req.params;

  workspaces = workspaces.filter((workspace) => workspace.id !== id);

  res.status(200).json({
    message: "Workspace deleted successfully",
  });
};
