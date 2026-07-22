import app from "./app";
import { env } from "./config/env";
import connectDB from "./config/db";

/**
 * Server bootstrap: connect to the database first, then start listening.
 * If the DB connection fails the process exits (see config/db.ts), so we never
 * accept traffic without a working database.
 */
const start = async (): Promise<void> => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
  });
};

start();
