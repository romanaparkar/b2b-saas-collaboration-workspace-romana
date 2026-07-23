import { Request, Response } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";
import { AppError } from "../../shared/errors/AppError";
import { getParam, requireUserId } from "../../shared/utils/request";
import { messageService } from "./message.service";
import { listMessagesQuerySchema } from "./message.validation";

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  // `validate` only covers request bodies, so the query string is parsed here.
  const query = listMessagesQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw AppError.badRequest(
      "Invalid query parameters",
      query.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const messages = await messageService.listForChannel(
    getParam(req, "channelId"),
    requireUserId(req),
    query.data,
  );

  res.status(200).json({
    success: true,
    data: messages,
  });
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.create(
    getParam(req, "channelId"),
    requireUserId(req),
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

export const markMessageRead = asyncHandler(async (req: Request, res: Response) => {
  await messageService.markRead(getParam(req, "messageId"), requireUserId(req));

  res.status(200).json({
    success: true,
    message: "Message marked as read",
  });
});
