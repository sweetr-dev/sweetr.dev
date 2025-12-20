import { execSync } from "node:child_process";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Global test setup: validates environment and runs migrations once.
 * This runs before all tests and ensures the database is ready.
 * No domain data is created here - that's handled per-test.
 */
async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for tests. " +
        "Set it to a Postgres connection string."
    );
  }

  // Validate DATABASE_URL format
  if (!databaseUrl.startsWith("postgresql://")) {
    throw new Error(
      `DATABASE_URL must be a PostgreSQL connection string, got: ${databaseUrl.substring(0, 50)}...`
    );
  }

  // Verify Postgres connectivity
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    await prisma.$disconnect();
  } catch (error) {
    throw new Error(
      `Failed to connect to Postgres at ${databaseUrl}. ` +
        `Ensure Postgres is running and accessible. Error: ${error}`
    );
  }

  // Run migrations using prisma migrate deploy (never db push)
  // This ensures the schema matches production exactly
  try {
    // Run from apps/api directory where prisma/ is located
    const apiDir = join(__dirname, "..");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      cwd: apiDir,
    });
  } catch (error) {
    throw new Error(
      `Failed to run database migrations. ` +
        `Ensure migrations are up to date. Error: ${error}`
    );
  }
}

export default globalSetup;

