import mongoose, { Schema } from "mongoose";

import { ROLES, ROLE_VALUES } from "../../shared/constants/roles";
import { IWorkspace } from "./workspace.types";

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ROLE_VALUES,
          default: ROLES.MEMBER,
        },
      },
    ],
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

// Primary access pattern: list every workspace a user belongs to.
workspaceSchema.index({ "members.user": 1 });

export const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);
