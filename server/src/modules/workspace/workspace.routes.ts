import { Router } from "express";

import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import channelRoutes from "../channel/channel.routes";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  joinWorkspace,
  listWorkspaces,
} from "./workspace.controller";
import { createWorkspaceSchema } from "./workspace.validation";

const router = Router();

// Every workspace route requires authentication — including the nested
// channel and message routers mounted below.
router.use(protect);

router.get("/", listWorkspaces);
router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/:id", getWorkspace);
router.post("/:id/join", joinWorkspace);
router.delete("/:id", deleteWorkspace);

// Channels (and, nested inside them, messages) belong to a workspace.
router.use("/:workspaceId/channels", channelRoutes);

export default router;
