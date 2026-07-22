import dotenv from "dotenv";

// Load variables from `.env` into `process.env` as early as possible.
dotenv.config();

/**
 * Strongly-typed, validated view of the environment.
 *
 * Centralizing env access here means:
 *  - the rest of the codebase never touches `process.env` directly,
 *  - required variables are validated once, at startup (fail fast),
 *  - every value has an explicit type instead of `string | undefined`.
 */
export interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  clientUrl: string;
  /** Used from Phase 1 (authentication) onward. */
  jwtSecret: string;
}

/** Read a required variable, throwing a clear error if it is missing/empty. */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required environment variable "${key}". ` +
        `Copy server/.env.example to server/.env and set it.`,
    );
  }
  return value;
}

/** Read an optional variable, falling back to a default. */
function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value.trim() === "" ? fallback : value;
}

export const env: EnvConfig = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: Number.parseInt(optionalEnv("PORT", "5000"), 10),
  mongoUri: requireEnv("MONGO_URI"),
  clientUrl: optionalEnv("CLIENT_URL", "http://localhost:5173"),
  // Not required yet in Phase 0; authentication (Phase 1) will consume it.
  jwtSecret: optionalEnv("JWT_SECRET", ""),
};
