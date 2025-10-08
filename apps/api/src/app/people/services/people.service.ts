import { getPrisma, take } from "../../../prisma";
import {
  FindGitProfileByHandleArgs,
  FindGitProfileByIdArgs,
  PaginateGitProfilesArgs,
} from "./people.types";
import { GitProfile, Prisma } from "@prisma/client";

export const paginateGitProfiles = async (
  workspaceId: number,
  args: PaginateGitProfilesArgs
) => {
  const query: Prisma.GitProfileFindManyArgs = {
    take: take(args.limit || 20),
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    orderBy: {
      name: "asc",
    },
    where: {
      workspaceMemberships: {
        some: {
          workspaceId,
        },
      },
    },
  };

  if (args.gitProfileIds?.length) {
    query.where = {
      ...query.where,
      id: { in: args.gitProfileIds },
    };
  }

  if (args.query) {
    query.where = {
      ...query.where,
      OR: [
        {
          handle: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: args.query,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  return getPrisma(workspaceId).gitProfile.findMany(query);
};

export const findGitProfileByHandle = async ({
  workspaceId,
  handle,
}: FindGitProfileByHandleArgs) => {
  return getPrisma(workspaceId).gitProfile.findFirst({
    where: {
      handle,
      workspaceMemberships: {
        some: {
          workspaceId,
        },
      },
    },
  });
};

export const findGitProfileById = async ({
  workspaceId,
  gitProfileId,
}: FindGitProfileByIdArgs) => {
  return getPrisma(workspaceId).gitProfile.findUnique({
    where: {
      id: gitProfileId,
    },
    include: {
      user: true,
    },
  });
};

// TO-DO: Support other Git Providers
export const getPersonGitUrl = (person: GitProfile) => {
  return `https://github.com/${person.handle}`;
};
