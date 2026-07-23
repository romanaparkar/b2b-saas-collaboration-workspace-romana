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
  createdAt: Date;
  updatedAt: Date;
}
