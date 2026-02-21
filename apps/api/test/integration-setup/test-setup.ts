import { afterEach } from "vitest";
import { getSudoPrismaClient } from "./prisma-client";

/**
 * Per-test setup: truncates all tables after each test for isolation.
 *
 * Uses the admin (superuser) client because app_user lacks TRUNCATE privilege.
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
afterEach(async () => {
  const sudoPrisma = getSudoPrismaClient();

  const tables = await sudoPrisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations')
    `;

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");

  await sudoPrisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`
  );
}, 30000);
