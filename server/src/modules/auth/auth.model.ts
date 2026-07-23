import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

import { ROLES, ROLE_VALUES } from "../../shared/constants/roles";
import { IUser } from "./auth.types";

const SALT_ROUNDS = 10;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // Never returned by default; queries must opt in with .select("+password")
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.MEMBER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

/**
 * Hash the password before persisting.
 * Living on the model guarantees a plaintext password can never be stored,
 * regardless of which service writes the document.
 */
userSchema.pre("save", async function hashPassword() {
  // Async middleware: returning resolves the hook, so no `next` is needed.
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
