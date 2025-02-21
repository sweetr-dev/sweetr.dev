import { getPrisma } from "../../../prisma";
import { CodeReview, CodeReviewState, Prisma } from "@prisma/client";
import { PaginateCodeReviewsArgs } from "./code-review.types";

export const paginateCodeReviews = async (
  workspaceId: number,
  gitProfileId: number,
  args: PaginateCodeReviewsArgs
) => {
  const query: Prisma.CodeReviewFindManyArgs = {
    take: 10,
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    where: {
      authorId: gitProfileId,
      state: args.state,
      pullRequest: {
        repository: {
          workspaceId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
    },
  };

  if (args.from) {
    query.where = {
      ...query.where,
      createdAt: { gte: args.from },
    };
  }

  if (args.to) {
    query.where = {
      ...query.where,
      createdAt: { lte: args.to },
    };
  }

  return getPrisma(workspaceId).codeReview.findMany(query);
};

export const isPullRequestApproved = (
  codeReviews: Pick<CodeReview, "state">[]
) => {
  const approvals = codeReviews.filter(
    (review) => review.state === CodeReviewState.APPROVED
  ).length;

  return approvals > 0 && !isPullRequestPendingChangesRequested(codeReviews);
};

export const isPullRequestPendingChangesRequested = (
  codeReviews: Pick<CodeReview, "state">[]
) => {
  return codeReviews.some(
    (review) => review.state === CodeReviewState.CHANGES_REQUESTED
  );
};
