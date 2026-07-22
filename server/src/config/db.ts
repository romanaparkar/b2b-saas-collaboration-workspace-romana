import mongoose from "mongoose";

import { env } from "./env";

/**
 * Establish the MongoDB connection.
 *
 * Fails fast: if the database is unreachable the process exits, so the server
 * never boots in a half-working state. Errors are logged with actionable hints
 * for the most common MongoDB Atlas misconfigurations.
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed.");

    if (error instanceof Error) {
      console.error(`   Reason: ${error.message}`);
    }

    // Common Atlas pitfalls — surfaced here to speed up debugging.
    console.error(
      "   Checklist:\n" +
        "     • Is the password in MONGO_URI URL-encoded? (@ -> %40, # -> %23, : -> %3A, / -> %2F)\n" +
        "     • Does the URI include the database name before the '?' query string?\n" +
        "     • Is your current IP allow-listed under Atlas > Network Access?\n" +
        "     • Are the database username/password correct?",
    );

    process.exit(1);
  }
};

export default connectDB;
