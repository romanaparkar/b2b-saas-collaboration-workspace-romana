import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(80),
  description: z.string().trim().max(300).optional().default(""),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
