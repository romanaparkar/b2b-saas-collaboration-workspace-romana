import { z } from "zod";

/** Matches the `maxlength` configured on the message schema. */
export const MESSAGE_MAX_LENGTH = 4000;

/** Page size used when the client does not ask for a specific one. */
export const DEFAULT_MESSAGE_LIMIT = 50;
export const MAX_MESSAGE_LIMIT = 100;

export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(MESSAGE_MAX_LENGTH, `Message must be at most ${MESSAGE_MAX_LENGTH} characters`),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

/**
 * Query for message history.
 *
 * `before` is a timestamp cursor rather than a page number: messages arrive
 * continuously, so offset paging would skip or repeat rows as new ones land.
 */
export const listMessagesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_MESSAGE_LIMIT)
    .default(DEFAULT_MESSAGE_LIMIT),
  before: z.coerce.date().optional(),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
