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
  isProduction: boolean;
  port: number;
  mongoUri: string;
  clientUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
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

const nodeEnv = optionalEnv("NODE_ENV", "development");

export const env: EnvConfig = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number.parseInt(optionalEnv("PORT", "5000"), 10),
  mongoUri: requireEnv("MONGO_URI"),
  clientUrl: optionalEnv("CLIENT_URL", "http://localhost:5173"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: optionalEnv("JWT_EXPIRES_IN", "7d"),
};
