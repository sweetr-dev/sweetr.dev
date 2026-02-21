import { PrismaClient } from "@prisma/client";

/**
 * Superuser Prisma client for test setup/teardown.
 * Bypasses RLS — used for creating seed data and truncating tables.
 */
let sudoPrismaClient: PrismaClient | null = null;

export function getSudoPrismaClient(): PrismaClient {
  if (!sudoPrismaClient) {
    const url = process.env.SUPERUSER_DATABASE_URL;
    if (!url) {
      throw new Error(
        "SUPERUSER_DATABASE_URL is required. " +
          "Run tests via: npm run test:integration"
      );
    }
    sudoPrismaClient = new PrismaClient({
      datasourceUrl: url,
      log: process.env.DEBUG_PRISMA ? ["query", "error", "warn"] : ["error"],
    });
  }
  return sudoPrismaClient;
}
