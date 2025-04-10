import { Prisma, Repository } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import { FindRepositoriesByWorkspaceArgs } from "./repository.types";

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

  return getPrisma(workspaceId).repository.findMany(query);
};

export const findRepositoryById = async (
  workspaceId: number,
  repositoryId: number
): Promise<Repository | null> => {
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
