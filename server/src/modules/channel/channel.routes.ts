import { Router } from "express";

import { validate } from "../../middleware/validate.middleware";
import messageRoutes from "../message/message.routes";
import { createChannel, deleteChannel, listChannels } from "./channel.controller";
import { createChannelSchema } from "./channel.validation";

/**
 * Mounted under `/api/workspaces/:workspaceId/channels`.
 *
 * Nesting mirrors the ownership model — a channel only exists inside a
 * workspace — and means the workspace id needed for every access check is
 * always present in the URL. `mergeParams` exposes it from the parent router.
 */
const router = Router({ mergeParams: true });

router.get("/", listChannels);
router.post("/", validate(createChannelSchema), createChannel);
router.delete("/:channelId", deleteChannel);

// Messages live inside a channel.
router.use("/:channelId/messages", messageRoutes);

export default router;
