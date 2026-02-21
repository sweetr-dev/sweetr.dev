import { Prisma, PrismaClient } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { isObject } from "radash";

const prisma = new PrismaClient();

/**
 * Creates a Prisma extension that injects RLS session variables into every
 * operation via set_config. Handles standalone queries, interactive
 * transactions, and batch transactions.
 *
 * Based on: https://gist.github.com/danielrose7/a0c6a98e7de5f63dffb86ec05d34dab9
 * Related: https://github.com/prisma/prisma/issues/20678
 */
const createRlsExtension = (rlsSql: Prisma.Sql) =>
  Prisma.defineExtension((client) =>
    client.$extends({
      client: {
        $transaction: (async (
          ...txnParams: Parameters<typeof client.$transaction>
        ) => {
          const [first, options] = txnParams;

          if (Array.isArray(first)) {
            const [, ...results] = await client.$transaction(
              [client.$executeRaw(rlsSql), ...first],
              options
            );
            return results;
          }

          return client.$transaction(async (tx) => {
            await tx.$executeRaw(rlsSql);
            return (first as Function)(tx);
          }, options);
        }) as typeof client.$transaction,
      },
      query: {
        $allModels: {
          async $allOperations({ args, query, ...rest }) {
            const existingTxn = (rest as any).__internalParams?.transaction;
            if (existingTxn) return query(args);

            const [, result] = await client.$transaction([
              client.$executeRaw(rlsSql),
              query(args),
            ]);
            return result;
          },
        },
        async $allOperations({ args, model, query, ...rest }) {
          if (model) return query(args);

          const existingTxn = (rest as any).__internalParams?.transaction;
          if (existingTxn) return query(args);

          const [, result] = await client.$transaction([
            client.$executeRaw(rlsSql),
            query(args),
          ]);
          return result;
        },
      },
    })
  );

export const getBypassRlsPrisma = () =>
  prisma.$extends(
    createRlsExtension(
      Prisma.sql`SELECT set_config('app.current_workspace_id', '0', TRUE), set_config('app.bypass_rls', 'on', TRUE)`
    )
  ) as unknown as PrismaClient;

export const getPrisma = (workspaceId?: number) => {
  if (workspaceId?.toString()) {
    return prisma.$extends(
      createRlsExtension(
        Prisma.sql`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, TRUE)`
      )
    ) as unknown as PrismaClient;
  }

  return prisma;
};

export const take = (limit: number = 50) => {
  return Math.min(100, limit);
};

export const jsonObject = <T extends Record<string, any>>(
  value: string | object | JsonValue
): T => {
  return isObject(value) ? value : JSON.parse(value as string);
};
