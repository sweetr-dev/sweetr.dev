import { Prisma, Repository } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import {
  FindRepositoriesByWorkspaceArgs,
  FindRepositoryByIdArgs,
} from "./repository.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";

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

export const findRepositoryByIdOrThrow = async ({
  workspaceId,
  repositoryId,
}: FindRepositoryByIdArgs) => {
  const repository = await findRepositoryById({ workspaceId, repositoryId });

  if (!repository) {
    throw new ResourceNotFoundException("Repository not found");
  }

  return repository;
};

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

export const isRepositorySyncable = async (repository: Repository) => {
  return (
    repository.isFork === false &&
    repository.isMirror === false &&
    !repository.archivedAt
  );
};
