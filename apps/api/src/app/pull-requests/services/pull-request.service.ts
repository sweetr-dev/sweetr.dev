import { getPrisma } from "../../../prisma";
import { Prisma } from "@prisma/client";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { PaginatePullRequestsArgs } from "./pull-request.types";

export const paginatePullRequests = async (
  workspaceId: number,
  args: PaginatePullRequestsArgs
) => {
  if (!args.teamIds && !args.gitProfileIds) {
    throw new InputValidationException("Missing teamIds or gitProfileIds");
  }

  const query: Prisma.PullRequestFindManyArgs = {
    take: 10,
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    where: {
      repository: {
        workspaceId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
    },
  };

  if (args.teamIds) {
    query.where = {
      ...query.where,
      author: {
        teamMemberships: {
          some: {
            team: {
              id: { in: args.teamIds },
              workspaceId: workspaceId,
              archivedAt: null,
            },
          },
        },
      },
    };
  }

  if (args.gitProfileIds) {
    query.where = {
      ...query.where,
      author: {
        id: { in: args.gitProfileIds },
        workspaceMemberships: {
          some: {
            workspaceId,
          },
        },
      },
    };
  }

  if (args.createdAt?.from || args.createdAt?.to) {
    query.where = {
      ...query.where,
      createdAt: {
        gte: args.createdAt.from,
        lte: args.createdAt.to,
      },
    };
  }

  if (args.finalizedAt?.from || args.finalizedAt?.to) {
    query.where = {
      ...query.where,
      OR: [
        {
          mergedAt: {
            gte: args.finalizedAt.from,
            lte: args.finalizedAt.to,
          },
        },
        {
          closedAt: {
            gte: args.finalizedAt.from,
            lte: args.finalizedAt.to,
          },
        },
      ],
    };
  }

  if (args.states?.length) {
    query.where = {
      ...query.where,
      state: { in: args.states },
    };
  }

  if (args.sizes?.length) {
    query.where = {
      ...query.where,
      tracking: {
        size: { in: args.sizes },
      },
    };
  }

  return getPrisma(workspaceId).pullRequest.findMany(query);
};

export const findPullRequestByCodeReviewId = async (
  workspaceId: number,
  codeReviewId: number
) => {
  return getPrisma(workspaceId).pullRequest.findFirstOrThrow({
    where: {
      codeReviews: {
        some: {
          id: codeReviewId,
        },
      },
    },
    include: {
      author: true,
    },
  });
};

export const findPullRequestTracking = async (
  workspaceId: number,
  pullRequestId: number
) => {
  return getPrisma(workspaceId)
    .pullRequest.findUnique({ where: { id: pullRequestId } })
    .tracking();
};
