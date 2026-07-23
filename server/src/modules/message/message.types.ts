import { Document, Types } from "mongoose";

/**
 * Message document. Messages belong to a channel; the workspace reference is
 * denormalized for efficient workspace-scoped queries and access checks.
 */
export interface IMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  channel: Types.ObjectId;
  workspace: Types.ObjectId;
  sender: Types.ObjectId;
  /** Users who have read this message. Stored as a set (no duplicates). */
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/** Minimal author details embedded in every message sent to clients. */
export interface MessageAuthor {
  id: string;
  name: string;
  email: string;
}

/**
 * Message as sent to clients. Built explicitly by the service so the REST
 * response and the socket broadcast always carry an identical shape.
 */
export interface MessageDto {
  id: string;
  content: string;
  channel: string;
  workspace: string;
  sender: MessageAuthor;
  readBy: string[];
  createdAt: string;
}
