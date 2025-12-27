import { Environment, Prisma } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import {
  ArchiveEnvironmentArgs,
  FindEnvironmentByIdArgs,
  FindOrCreateEnvironmentArgs,
  PaginateEnvironmentsArgs,
  UnarchiveEnvironmentArgs,
} from "./environment.types";

export const DEFAULT_PRODUCTION_ENVIRONMENT_NAME = "production";

export const findEnvironmentById = async ({
  environmentId,
  workspaceId,
}: FindEnvironmentByIdArgs): Promise<Environment | null> => {
  return getPrisma(workspaceId).environment.findUnique({
    where: { id: environmentId, workspaceId },
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
      archivedAt: args.archivedOnly ? { not: null } : null,
    },
    orderBy: { id: "asc" },
  };

  if (args.query) {
    query.where = {
      ...query.where,
      name: { contains: args.query, mode: "insensitive" },
    };
  }

  if (args.environmentIds && args.environmentIds.length) {
    query.where = { ...query.where, id: { in: args.environmentIds } };
  }

  return getPrisma(workspaceId).environment.findMany(query);
};

export const archiveEnvironment = async ({
  workspaceId,
  environmentId,
}: ArchiveEnvironmentArgs) => {
  return getPrisma(workspaceId).environment.update({
    where: { id: environmentId },
    data: { archivedAt: new Date() },
  });
};

export const unarchiveEnvironment = async ({
  workspaceId,
  environmentId,
}: UnarchiveEnvironmentArgs) => {
  return getPrisma(workspaceId).environment.update({
    where: { id: environmentId },
    data: { archivedAt: null },
  });
};

export const findOrCreateEnvironment = async ({
  workspaceId,
  name,
}: FindOrCreateEnvironmentArgs) => {
  const environment = await getPrisma(workspaceId).environment.findUnique({
    where: { workspaceId_name: { workspaceId, name } },
  });

  if (environment) {
    return environment;
  }

  return getPrisma(workspaceId).environment.create({
    data: {
      workspaceId,
      name,
      isProduction: ["production", "prod"].includes(name.toLowerCase()),
    },
  });
};
