import { execSync } from "node:child_process";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Global test setup: validates environment and runs migrations once.
 * This runs before all tests and ensures the database is ready.
 *
 * Migrations run as superuser (table owner). The app connects as app_user
 * (subject to RLS) to match production behavior.
 */
async function globalSetup() {
  const superuserUrl = process.env.SUPERUSER_DATABASE_URL;
  const appUserUrl = process.env.DATABASE_URL;

  if (!superuserUrl) {
    throw new Error(
      "SUPERUSER_DATABASE_URL environment variable is required for tests. " +
        "Set it to a Postgres superuser connection string."
    );
  }

  if (!appUserUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for tests. " +
        "Set it to the app_user Postgres connection string."
    );
  }

  // Verify Postgres connectivity with superuser
  const prisma = new PrismaClient({ datasourceUrl: superuserUrl });
  try {
    await prisma.$connect();
    await prisma.$disconnect();
  } catch (error) {
    throw new Error(
      `Failed to connect to Postgres. Ensure Postgres is running and accessible. Error: ${error}`
    );
  }

  // Verify app_user connectivity
  const appPrisma = new PrismaClient({ datasourceUrl: appUserUrl });
  try {
    await appPrisma.$connect();
    await appPrisma.$disconnect();
  } catch (error) {
    throw new Error(
      `Failed to connect as app_user. Ensure the postgres-test container was ` +
        `initialized with init-app-db.sh (you may need to recreate it: ` +
        `docker compose down postgres-test && docker compose up -d postgres-test). ` +
        `Error: ${error}`
    );
  }

  // Run migrations as superuser (only table owner can run migrations)
  try {
    const apiDir = join(__dirname, "..", "..");
    execSync("npm run prisma:migrate:production", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: superuserUrl,
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
