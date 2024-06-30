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
import { SweetQueue, addJob } from "../../../bull-mq/queues";

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
  gitInstallationId: number,
  pullRequestId: string
) => {
  logger.info("syncCodeReviews", {
    installationId: gitInstallationId,
    pullRequestId,
  });

  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) {
    logger.info("syncCodeReviews: Could not find Workspace", {
      gitInstallationId,
      pullRequestId,
    });
    return;
  }

  const pullRequest = await findPullRequest(workspace.id, pullRequestId);

  if (!pullRequest) {
    logger.info("syncCodeReviews: PR not synced yet, scheduling PR job", {
      gitInstallationId,
      pullRequestId,
    });

    addJob(SweetQueue.GITHUB_SYNC_PULL_REQUEST, {
      pull_request: {
        node_id: pullRequestId,
      },
      installation: {
        id: gitInstallationId,
      },
      syncReviews: true,
    });

    return;
  }

  if (pullRequest.repository.isFork) {
    logger.debug("syncCodeReviews: Skipping forked repository", {
      pullRequestId,
      gitInstallationId,
    });

    return;
  }

  const { reviews, firstReviewerRequestedAt } = await fetchPullRequestReviews(
    gitInstallationId,
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
              __typename
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
    if (!review.author?.id || !review.author?.login) {
      logger.info("syncCodeReviews: Skipping unknown author", {
        review,
      });

      return;
    }

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

const findPullRequest = async (
  workspaceId: number,
  gitPullRequestId: string
) => {
  return getPrisma(workspaceId).pullRequest.findFirst({
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

const findWorkspace = async (gitInstallationId: number) => {
  const workspace = await getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
    include: {
      organization: true,
      gitProfile: true,
    },
  });

  if (!workspace) return null;
  if (!workspace.gitProfile && !workspace.organization) return null;

  return workspace;
};
