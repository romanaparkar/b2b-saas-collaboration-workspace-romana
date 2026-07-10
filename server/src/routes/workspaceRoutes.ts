import express from "express";

import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController";

const router = express.Router();

router.get("/", getWorkspaces);

router.post("/", createWorkspace);

router.delete("/:id", deleteWorkspace);

export default router;
