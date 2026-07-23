import { Router } from "express";

import { validate } from "../../middleware/validate.middleware";
import { createMessage, listMessages, markMessageRead } from "./message.controller";
import { createMessageSchema } from "./message.validation";

/**
 * Mounted under `/api/workspaces/:workspaceId/channels/:channelId/messages`.
 * `mergeParams` is required so `:channelId` from the parent router is visible.
 *
 * Authentication is applied once by the workspace router at the top of the
 * chain, so it is not repeated here.
 */
const router = Router({ mergeParams: true });

router.get("/", listMessages);
router.post("/", validate(createMessageSchema), createMessage);
router.post("/:messageId/read", markMessageRead);

export default router;
