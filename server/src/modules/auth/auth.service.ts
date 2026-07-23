import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { User } from "./auth.model";
import { AuthResult, IUser, JwtPayload, PublicUser } from "./auth.types";
import { LoginInput, RegisterInput } from "./auth.validation";

/**
 * Sign an access token.
 *
 * Token creation is isolated here so refresh tokens / rotation / OAuth can be
 * added later without touching controllers or routes.
 */
function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

/** Map a user document to the public shape returned to clients. */
function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function buildAuthResult(user: IUser): AuthResult {
  return {
    user: toPublicUser(user),
    token: signAccessToken({ sub: user._id.toString(), role: user.role }),
  };
}

export const authService = {
  /** Create a new account and immediately issue an access token. */
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email });

    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    // Password hashing happens in the model's pre-save hook.
    const user = await User.create(input);

    return buildAuthResult(user);
  },

  /** Verify credentials and issue an access token. */
  async login(input: LoginInput): Promise<AuthResult> {
    // `password` is `select: false`, so it must be requested explicitly.
    const user = await User.findOne({ email: input.email }).select("+password");

    // Same message for unknown email and wrong password: avoids leaking
    // which accounts exist.
    if (!user || !(await user.comparePassword(input.password))) {
      throw AppError.unauthorized("Invalid email or password");
    }

    return buildAuthResult(user);
  },

  /** Fetch the current user (used by GET /api/auth/me). */
  async getUserById(id: string): Promise<PublicUser> {
    const user = await User.findById(id);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    return toPublicUser(user);
  },
};
