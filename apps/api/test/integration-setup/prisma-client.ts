import { PrismaClient } from "@prisma/client";

/**
 * Single reusable Prisma client for tests.
 * Ensures connection reuse and safe cleanup.
 * No global mutable state leaks.
 */
let prismaClient: PrismaClient | null = null;

export function getTestPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.DEBUG_PRISMA ? ["query", "error", "warn"] : ["error"],
    });
  }
  return prismaClient;
}

/**
 * Cleanup function to disconnect Prisma client.
 * Called automatically by Vitest's global teardown if needed.
 */
export async function closeTestPrismaClient(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}


