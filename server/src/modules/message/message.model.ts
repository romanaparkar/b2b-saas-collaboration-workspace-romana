import mongoose, { Schema } from "mongoose";

import { IMessage } from "./message.types";

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: 4000,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    sender: {
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

// Primary access pattern: fetch a channel's messages in chronological order.
messageSchema.index({ channel: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
