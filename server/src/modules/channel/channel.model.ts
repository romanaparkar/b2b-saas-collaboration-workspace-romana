import mongoose, { Schema } from "mongoose";

import { IChannel } from "./channel.types";

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Channel names are unique within a workspace (not globally).
channelSchema.index({ workspace: 1, name: 1 }, { unique: true });

export const Channel = mongoose.model<IChannel>("Channel", channelSchema);
