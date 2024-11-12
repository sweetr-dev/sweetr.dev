import { PrismaClient } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { isObject } from "radash";

const prisma = new PrismaClient();

export const getBypassRlsPrisma = () =>
  prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, , result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_workspace_id', '0', TRUE)`,
            prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    },
  }) as PrismaClient;

export const getPrisma = (workspaceId?: number) => {
  if (workspaceId?.toString()) {
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
        // Used in charts
        async $queryRaw({ args, query }) {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_workspace_id', ${workspaceId.toString()}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    }) as PrismaClient;
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
