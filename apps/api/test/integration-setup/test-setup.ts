import { afterEach } from "vitest";
import { getTestPrismaClient } from "./prisma-client";

/**
 * Per-test setup: truncates all tables after each test for isolation.
 *
 * Why truncation over transactions?
 * - SQL-heavy metrics queries use window functions, CTEs, and complex joins
 * - These can behave differently inside transactions (visibility, locking)
 * - Truncation ensures each test starts with a truly clean slate
 * - Better matches production query behavior
 * - Prevents subtle bugs from transaction isolation levels
 *
 * Trade-off: slightly slower than transactions, but correctness > speed
 * for a production metrics engine.
 */
afterEach(
  async () => {
    const prisma = getTestPrismaClient();

    // Get all table names from Prisma schema

    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations')
    `;

    if (tables.length === 0) {
      return;
    }

    const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");

    // Truncate all tables with CASCADE to handle foreign key constraints
    // This is faster than DELETE and resets auto-increment counters
    // Use RESTART IDENTITY to reset sequences
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`
    );
  },
  30000 // 30 second timeout for truncation
);
