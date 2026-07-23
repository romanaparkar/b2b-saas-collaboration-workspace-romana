import { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { AppError } from "../../shared/errors/AppError";
import { workspaceService } from "./workspace.service";

/** Returns the authenticated user's id, or throws if `protect` did not run. */
function requireUserId(req: Request): string {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user.id;
}

/**
 * Express 5 types route params as `string | string[]`; our routes only ever
 * define a single `:id`, so normalize it to a string here.
 */
function getIdParam(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

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

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
  await workspaceService.remove(getIdParam(req), requireUserId(req));

  res.status(200).json({
    success: true,
    message: "Workspace deleted successfully",
  });
});
