import { Prisma, Repository } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import {
  FindRepositoriesByWorkspaceArgs,
  FindRepositoryByIdArgs,
} from "./repository.types";

export const findRepositoriesByWorkspace = async ({
  workspaceId,
  ...args
}: FindRepositoriesByWorkspaceArgs): Promise<Repository[]> => {
  const query: Prisma.RepositoryFindManyArgs = {
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: take(args.limit),
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

  if (args.repositoriesIds) {
    query.where = {
      ...query.where,
      id: { in: args.repositoriesIds },
    };
  }

  return getPrisma(workspaceId).repository.findMany(query);
};

export const findRepositoryById = async ({
  workspaceId,
  repositoryId,
}: FindRepositoryByIdArgs): Promise<Repository | null> => {
  return getPrisma(workspaceId).repository.findUnique({
    where: {
      id: repositoryId,
    },
  });
};

export const isRepositorySyncable = async (repository: Repository) => {
  return (
    repository.isFork === false &&
    repository.isMirror === false &&
    !repository.archivedAt
  );
};
