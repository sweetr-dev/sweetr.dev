import { Environment, Prisma } from "@prisma/client";
import {
  FindEnvironmentByIdInput,
  PaginateEnvironmentsArgs,
} from "./environment.types";
import { getPrisma, take } from "../../../prisma";

export const findEnvironmentById = async ({
  environmentId,
  workspaceId,
}: FindEnvironmentByIdInput): Promise<Environment | null> => {
  return getPrisma(workspaceId).environment.findUnique({
    where: {
      id: environmentId,
      workspaceId,
    },
  });
};

export const paginateEnvironments = async (
  workspaceId: number,
  args: PaginateEnvironmentsArgs
): Promise<Environment[]> => {
  const query: Prisma.EnvironmentFindManyArgs = {
    take: take(args.limit),
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    where: {
      workspaceId,
      archivedAt: null,
    },
    orderBy: {
      id: "asc",
    },
  };

  if (args.query) {
    query.where = {
      ...query.where,
      name: {
        contains: args.query,
        mode: "insensitive",
      },
    };
  }

  if (args.environmentIds && args.environmentIds.length) {
    query.where = {
      ...query.where,
      id: { in: args.environmentIds },
    };
  }

  return getPrisma(workspaceId).environment.findMany(query);
};
