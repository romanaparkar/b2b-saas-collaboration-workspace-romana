import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters")
    .max(60, "Channel name must be at most 60 characters")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
      "Channel names may contain letters, numbers and hyphens, and must start with a letter or number",
    )
    // Stored lowercase so "General" and "general" cannot both exist in the
    // same workspace and collide in the UI.
    .transform((value) => value.toLowerCase()),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
