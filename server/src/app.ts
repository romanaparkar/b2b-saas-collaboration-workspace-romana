import express, { Application, Request, Response } from "express";
import cors from "cors";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import workspaceRoutes from "./modules/workspace/workspace.routes";

/**
 * Build and configure the Express application.
 *
 * Kept separate from server startup (see index.ts) so the app can be imported
 * for testing without opening a network port.
 */
const app: Application = express();

// Restrict CORS to the known client origin instead of allowing every origin.
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "B2B SaaS Collaboration Workspace API is running",
  });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);

// Error handling — must be registered after all routes.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
