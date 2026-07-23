import { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { getParam, requireUserId } from "../../shared/utils/request";
import { channelService } from "./channel.service";

export const listChannels = asyncHandler(async (req: Request, res: Response) => {
  const channels = await channelService.listForWorkspace(
    getParam(req, "workspaceId"),
    requireUserId(req),
  );

  res.status(200).json({
    success: true,
    data: channels,
  });
});

export const createChannel = asyncHandler(async (req: Request, res: Response) => {
  const channel = await channelService.create(
    getParam(req, "workspaceId"),
    requireUserId(req),
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Channel created successfully",
    data: channel,
  });
});

export const deleteChannel = asyncHandler(async (req: Request, res: Response) => {
  await channelService.remove(
    getParam(req, "workspaceId"),
    getParam(req, "channelId"),
    requireUserId(req),
  );

  res.status(200).json({
    success: true,
    message: "Channel deleted successfully",
  });
});
