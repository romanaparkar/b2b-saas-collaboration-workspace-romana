import { Router } from "express";

import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
} from "./workspace.controller";
import { createWorkspaceSchema } from "./workspace.validation";

const router = Router();

// Every workspace route requires authentication.
router.use(protect);

router.get("/", listWorkspaces);
router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/:id", getWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
