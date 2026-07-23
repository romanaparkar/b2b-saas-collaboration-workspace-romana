import { Document, Types } from "mongoose";

import { Role } from "../../shared/constants/roles";

export interface WorkspaceMember {
  user: Types.ObjectId;
  role: Role;
}

/** Workspace document. Membership drives access control. */
export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: WorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}
