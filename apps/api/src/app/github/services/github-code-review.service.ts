import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import { logger } from "../../../lib/logger";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  CodeReviewState,
  GitProvider,
  PullRequest,
  PullRequestTracking,
} from "@prisma/client";
import { parallel } from "radash";
import {
  getReviewCompareTime,
  getTimeForReview,
  getTimeToMerge,
} from "./github-pull-request-tracking.service";
import { parseNullableISO } from "../../../lib/date";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";

interface Author {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

interface ReviewData {
  author: Author;
  commentCount: number;
  state: CodeReviewState;
  createdAt: string;
}

export const syncCodeReviews = async (
  installationId: number,
  pullRequestId: string
) => {
  logger.info("syncCodeReviews", {
    installationId,
    pullRequestId,
  });

  const pullRequest = await findPullRequestOrThrow(pullRequestId);

  if (pullRequest.repository.isFork) {
    logger.info("syncPullRequest: Skipping forked repository", {
      pullRequestId,
    });

    return;
  }

  const { reviews, firstReviewerRequestedAt } = await fetchPullRequestReviews(
    installationId,
    pullRequestId
  );

  await upsertCodeReviews(pullRequest, reviews);
  await updatePullRequestTracking(
    pullRequest,
    reviews,
    parseNullableISO(firstReviewerRequestedAt)
  );
};

const fetchPullRequestReviews = async (
  installationId: number,
  pullRequestId: string
): Promise<{
  reviews: ReviewData[];
  firstReviewerRequestedAt: string | null;
}> => {
  const fireGraphQLRequest = getInstallationGraphQLOctoKit(installationId);
  const reviews: Record<string, ReviewData> = {};
  let hasNextPage = true;
  let cursor: string | null = null;
  const isFirstRequest = cursor === null;
  let firstReviewerRequestedAt = null;

  const timelineItemsFragment = `timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT], last: ${GITHUB_MAX_PAGE_LIMIT}) {
    nodes {
      __typename
      ... on ReviewRequestedEvent {
        createdAt
      }
    }
  }`;

  while (hasNextPage) {
    const response = await fireGraphQLRequest<GraphQlQueryResponseData>(
      `
      query PullRequestQuery(
        $nodeId: ID!
        $cursor: String
      ) {
        node(id: $nodeId) {
          ... on PullRequest {
            id
            author {
              login
            }
            reviews(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                id
                body
                author {
                  __typename
                  ... on User {
                    id
                    login
                    name
                    avatarUrl
                  }
                }
                comments {
                  totalCount
                }
                state
                submittedAt
              }
            }
            ${isFirstRequest ? timelineItemsFragment : ""}
          }
        }
      }
    `,
      {
        nodeId: pullRequestId,
        cursor,
      }
    );

    if (!response.node.id) {
      throw new ResourceNotFoundException("Could not find pull request");
    }

    // Get first reviewer requested date
    if (isFirstRequest) {
      firstReviewerRequestedAt =
        response.node.timelineItems.nodes[0]?.createdAt || null;
    }

    // Aggregate reviews by author
    const pullRequest = response.node;
    const { nodes, pageInfo } = pullRequest.reviews;

    for (const review of nodes) {
      const authorHandle = review.author.login;

      // Ignore self-reviews
      if (pullRequest.author.login === authorHandle) continue;

      // Ignore non-user reviews (i.e. bots)
      if (pullRequest.author.__typename !== "User") continue;

      const bodyComment = review.body ? 1 : 0;
      const oldCommentCount = reviews[authorHandle]?.commentCount ?? 0;
      const oldState = reviews[authorHandle]?.state ?? null;
      const newState = calculateReviewState(oldState, review.state);
      const createdAt =
        oldState !== newState
          ? review.submittedAt
          : reviews[authorHandle].createdAt;

      reviews[review.author.login] = {
        author: review.author,
        commentCount:
          oldCommentCount + review.comments.totalCount + bodyComment,
        state: calculateReviewState(oldState, review.state),
        createdAt,
      };
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return {
    reviews: Object.values(reviews),
    firstReviewerRequestedAt,
  };
};

const calculateReviewState = (oldState: string | null, newState: string) => {
  if (newState === "DISMISSED") return CodeReviewState.COMMENTED;

  // A new comment submission shouldn't override an approval/rejection
  if (newState === CodeReviewState.COMMENTED && oldState) {
    return getCodeReviewState(oldState);
  }

  return getCodeReviewState(newState);
};

const getCodeReviewState = (state: string) => {
  if (state === "APPROVED") return CodeReviewState.APPROVED;
  if (state === "CHANGES_REQUESTED") return CodeReviewState.CHANGES_REQUESTED;

  return CodeReviewState.COMMENTED;
};

const upsertCodeReviews = async (
  pullRequest: PullRequest,
  reviews: ReviewData[]
) => {
  logger.debug("upsertCodeReviews", { pullRequest, reviews });

  return parallel(10, reviews, async (review) => {
    const gitProfile = await upsertGitProfile(review.author);

    return await getPrisma(pullRequest.workspaceId).codeReview.upsert({
      where: {
        pullRequestId_authorId: {
          authorId: gitProfile.id,
          pullRequestId: pullRequest.id,
        },
      },
      create: {
        workspaceId: pullRequest.workspaceId,
        authorId: gitProfile.id,
        pullRequestId: pullRequest.id,
        commentCount: review.commentCount,
        state: review.state,
        createdAt: new Date(review.createdAt),
      },
      update: {
        commentCount: review.commentCount,
        state: review.state,
      },
    });
  });
};

const updatePullRequestTracking = async (
  pullRequest: PullRequest & { tracking: PullRequestTracking | null },
  reviews: ReviewData[],
  firstReviewerRequestedAt: Date | null
) => {
  const firstReviewAt = parseNullableISO(reviews[0]?.createdAt);
  const firstApprovalAt = parseNullableISO(
    reviews.find((review) => review.state === CodeReviewState.APPROVED)
      ?.createdAt
  );

  const timeToMerge = getTimeToMerge(pullRequest, firstApprovalAt);

  const timeToFirstReview = firstReviewAt
    ? getTimeForReview(
        getReviewCompareTime(
          firstReviewAt,
          pullRequest.createdAt,
          firstReviewerRequestedAt,
          pullRequest.tracking?.firstReadyAt
        ),
        firstReviewAt
      )
    : undefined;

  const timeToFirstApproval = firstApprovalAt
    ? getTimeForReview(
        getReviewCompareTime(
          firstApprovalAt,
          pullRequest.createdAt,
          firstReviewerRequestedAt,
          pullRequest.tracking?.firstReadyAt
        ),
        firstApprovalAt
      )
    : undefined;

  await getPrisma(pullRequest.workspaceId).pullRequestTracking.update({
    where: {
      pullRequestId: pullRequest.id,
    },
    data: {
      firstReviewerRequestedAt,
      firstReviewAt,
      firstApprovalAt,
      timeToMerge,
      timeToFirstReview,
      timeToFirstApproval,
    },
  });
};

const upsertGitProfile = async (author: Author) => {
  return getPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: {
        gitProvider: GitProvider.GITHUB,
        gitUserId: author.id,
      },
    },
    update: {},
    create: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: author.id,
      handle: author.login,
      name: author.name ? author.name : author.login,
      avatar: author.avatarUrl,
    },
  });
};

const findPullRequestOrThrow = async (gitPullRequestId: string) => {
  return getBypassRlsPrisma().pullRequest.findFirstOrThrow({
    where: {
      gitProvider: GitProvider.GITHUB,
      gitPullRequestId,
    },
    include: {
      repository: true,
      tracking: true,
    },
  });
};
