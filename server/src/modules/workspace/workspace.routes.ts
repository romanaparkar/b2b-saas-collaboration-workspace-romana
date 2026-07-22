import { Router } from "express";

import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "./workspace.controller";

const router = Router();

router.get("/", getWorkspaces);
router.post("/", createWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
