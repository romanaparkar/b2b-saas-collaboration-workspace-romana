import { Document, Types } from "mongoose";

/** Channel document. A workspace always has at least a default channel. */
export interface IChannel extends Document {
  _id: Types.ObjectId;
  name: string;
  workspace: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** Name of the channel created automatically with every new workspace. */
export const DEFAULT_CHANNEL_NAME = "general";
