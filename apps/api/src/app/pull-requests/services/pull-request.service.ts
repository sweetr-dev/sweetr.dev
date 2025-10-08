import { getPrisma, take } from "../../../prisma";
import {
  CodeReview,
  Prisma,
  PullRequest,
  PullRequestState,
} from "@prisma/client";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import {
  CountPullRequestsByDeploymentIdArgs,
  FindPullRequestsByDeploymentIdArgs,
  PaginatePullRequestsArgs,
} from "./pull-request.types";
import {
  isPullRequestApproved,
  isPullRequestPendingChangesRequested,
} from "../../code-reviews/services/code-review.service";
import { subMonths } from "date-fns";

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

export const findPullRequestById = async (
  workspaceId: number,
  pullRequestId: number
) => {
  return getPrisma(workspaceId).pullRequest.findUnique({
    where: {
      id: pullRequestId,
      workspaceId,
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

export const findTeamPullRequestsInProgress = async (
  workspaceId: number,
  teamId: number
) => {
  return getPrisma(workspaceId).pullRequest.findMany({
    where: {
      author: {
        teamMemberships: {
          some: {
            teamId,
          },
        },
      },
      mergedAt: null,
      closedAt: null,
      createdAt: {
        gte: subMonths(new Date(), 3),
      },
    },
    take: take(100),
    include: {
      codeReviews: true,
      tracking: true,
    },
  });
};

export const groupPullRequestByState = <
  T extends PullRequest & { codeReviews: CodeReview[] },
>(
  pullRequests: T[]
) => {
  const drafted: typeof pullRequests = [];
  const pendingReview: typeof pullRequests = [];
  const pendingMerge: typeof pullRequests = [];
  const changesRequested: typeof pullRequests = [];

  for (const pullRequest of pullRequests) {
    if (pullRequest.state === PullRequestState.DRAFT) {
      drafted.push(pullRequest);
      continue;
    }

    if (isPullRequestPendingChangesRequested(pullRequest.codeReviews)) {
      changesRequested.push(pullRequest);
      continue;
    }

    if (isPullRequestApproved(pullRequest.codeReviews)) {
      pendingMerge.push(pullRequest);
      continue;
    }

    pendingReview.push(pullRequest);
  }

  return {
    drafted,
    pendingReview,
    pendingMerge,
    changesRequested,
  };
};

export const findPullRequestsByDeploymentId = async ({
  workspaceId,
  deploymentId,
}: FindPullRequestsByDeploymentIdArgs) => {
  return getPrisma(workspaceId).pullRequest.findMany({
    where: {
      deployedPullRequests: {
        some: { deploymentId },
      },
      workspaceId,
    },
    take: take(100),
    orderBy: {
      mergedAt: "desc",
    },
  });
};

export const countPullRequestsByDeploymentId = async ({
  workspaceId,
  deploymentId,
}: CountPullRequestsByDeploymentIdArgs) => {
  return getPrisma(workspaceId).deployedPullRequest.count({
    where: { deploymentId, workspaceId },
  });
};
