import { Document, Types } from "mongoose";

import { Role } from "../../shared/constants/roles";

/** User document as stored in MongoDB. */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

/** Claims embedded in the signed access token. */
export interface JwtPayload {
  /** User id (standard JWT subject claim). */
  sub: string;
  role: Role;
}

/** Public user shape returned to clients (never includes the password). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}
