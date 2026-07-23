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

/**
 * Channel as sent to clients.
 *
 * Built explicitly by the service rather than relying on the model's `toJSON`
 * transform, so the REST response and the socket broadcast are guaranteed to
 * be byte-for-byte the same shape.
 */
export interface ChannelDto {
  id: string;
  name: string;
  workspace: string;
  createdBy: string;
  createdAt: string;
}

/** Name of the channel created automatically with every new workspace. */
export const DEFAULT_CHANNEL_NAME = "general";
