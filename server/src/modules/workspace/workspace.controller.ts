import { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { getParam, requireUserId } from "../../shared/utils/request";
import { workspaceService } from "./workspace.service";

/** This router declares its workspace parameter as `:id`. */
const getIdParam = (req: Request): string => getParam(req, "id");

export const listWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  const workspaces = await workspaceService.listForUser(requireUserId(req));

  res.status(200).json({
    success: true,
    data: workspaces,
  });
});

export const getWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.getByIdForUser(
    getIdParam(req),
    requireUserId(req),
  );

  res.status(200).json({
    success: true,
    data: workspace,
  });
});

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.create(requireUserId(req), req.body);

  res.status(201).json({
    success: true,
    message: "Workspace created successfully",
    data: workspace,
  });
});

export const joinWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const workspace = await workspaceService.join(getIdParam(req), requireUserId(req));

  res.status(200).json({
    success: true,
    message: "Joined workspace successfully",
    data: workspace,
  });
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.remove(getIdParam(req), requireUserId(req));

  res.status(200).json({
    success: true,
    message: "Workspace deleted successfully",
  });
});
