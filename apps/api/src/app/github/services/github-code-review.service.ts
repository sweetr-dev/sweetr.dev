import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import { logger } from "../../../lib/logger";
import { getPrisma } from "../../../prisma";
import {
  ActivityEventType,
  CodeReviewState,
  GitProfile,
  GitProvider,
  PullRequest,
  PullRequestTracking,
} from "@prisma/client";
import { parallel, pick, sort } from "radash";
import {
  getReviewCompareTime,
  getTimeForReview,
  getTimeToMerge,
} from "./github-pull-request-tracking.service";
import { parseNullableISO } from "../../../lib/date";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { SweetQueue, addJob } from "../../../bull-mq/queues";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";
import { parseISO } from "date-fns";

interface Author {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

interface ReviewData {
  gitProfileId: number;
  commentCount: number;
  state: CodeReviewState;
  createdAt: string;
}

type ReviewDataWithId = ReviewData & {
  reviewId: string;
};

interface ReviewRequestData {
  createdAt: Date;
  deletedAt: Date | null;
  author: Author;
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

    await addJob(SweetQueue.GITHUB_SYNC_PULL_REQUEST, {
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

  const { reviews, reviewEvents, firstReviewerRequestedAt, reviewRequests } =
    await fetchPullRequestReviews(gitInstallationId, pullRequestId);

  await upsertCodeReviewRequests(pullRequest, reviewRequests);
  await upsertCodeReviews(pullRequest, reviews);

  await updatePullRequestTracking(
    pullRequest,
    reviewEvents,
    parseNullableISO(firstReviewerRequestedAt)
  );
  await upsertActivityEvents(pullRequest, reviewEvents);
};

const fetchPullRequestReviews = async (
  installationId: number,
  pullRequestId: string
): Promise<{
  reviewEvents: ReviewDataWithId[];
  reviews: ReviewData[];
  reviewRequests: ReviewRequestData[];
  firstReviewerRequestedAt: string | null;
}> => {
  const fireGraphQLRequest = getInstallationGraphQLOctoKit(installationId);
  const reviews: Record<string, ReviewData> = {};
  let hasNextPage = true;
  let cursor: string | null = null;
  const isFirstRequest = cursor === null;
  let firstReviewerRequestedAt = null;
  let reviewRequests: ReviewRequestData[] = [];
  const reviewEvents: ReviewDataWithId[] = [];
  const gitProfiles = new Map<string, GitProfile>();

  const getGitProfileId = async (author: Author) => {
    if (gitProfiles.has(author.id)) {
      return gitProfiles.get(author.id)!.id;
    }

    const gitProfile = await upsertGitProfile(author);
    gitProfiles.set(author.id, gitProfile);

    return gitProfile.id;
  };

  const timelineItemsFragment = `timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT, REVIEW_REQUEST_REMOVED_EVENT], last: ${GITHUB_MAX_PAGE_LIMIT}) {
    nodes {
      __typename
      ... on ReviewRequestedEvent {
        createdAt
        requestedReviewer {
          __typename
          ... on User {
            id
            login
            name
            avatarUrl
          }
        }
      }
      ... on ReviewRequestRemovedEvent {
        createdAt
        requestedReviewer {
          __typename
          ... on User {
            id
            login
            name
            avatarUrl
          }
        }
      }
    }
  }`;

  while (hasNextPage) {
    const response: any = await fireGraphQLRequest<GraphQlQueryResponseData>(
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

      reviewRequests = getReviewRequests(
        response.node.timelineItems.nodes.filter(
          (node) => node.requestedReviewer.__typename === "User"
        )
      );
    }

    // Aggregate reviews by author
    const pullRequest = response.node;
    const { nodes, pageInfo } = pullRequest.reviews;

    // Sort chronologically
    const sortedReviews = sort(nodes, (node) =>
      parseISO(node.submittedAt).getTime()
    );

    for (const review of sortedReviews) {
      const authorHandle = review.author.login;

      // Ignore self-reviews
      if (pullRequest.author.login === authorHandle) continue;

      // Ignore non-user reviews (i.e. bots)
      if (pullRequest.author.__typename !== "User") continue;

      // Ignore unknown authors
      if (!review.author?.id || !review.author?.login) continue;

      const gitProfileId = await getGitProfileId(review.author);

      const bodyComment = review.body ? 1 : 0;

      reviewEvents.push({
        reviewId: review.id,
        gitProfileId,
        commentCount: review.comments.totalCount + bodyComment,
        state: review.state,
        createdAt: review.submittedAt,
      });

      const oldCommentCount = reviews[authorHandle]?.commentCount ?? 0;
      const oldState = reviews[authorHandle]?.state ?? null;
      const newState = calculateReviewState(oldState, review.state);
      const createdAt =
        oldState !== newState
          ? review.submittedAt
          : reviews[authorHandle].createdAt;

      reviews[review.author.login] = {
        gitProfileId,
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
    reviewEvents,
    reviews: Object.values(reviews),
    reviewRequests,
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

const getReviewRequests = (nodes: any[]): ReviewRequestData[] => {
  const requestedReviewers = new Map<string, ReviewRequestData>();

  // Sort by createdAt
  nodes.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  nodes.forEach((node) => {
    if (
      node.__typename === "ReviewRequestedEvent" &&
      node.requestedReviewer.__typename === "User"
    ) {
      const reviewerId = node.requestedReviewer.id;

      requestedReviewers.set(reviewerId, {
        createdAt: new Date(node.createdAt),
        deletedAt: null,
        author: {
          id: reviewerId,
          login: node.requestedReviewer.login,
          name: node.requestedReviewer.name,
          avatarUrl: node.requestedReviewer.avatarUrl,
        },
      });
    }

    if (
      node.__typename === "ReviewRequestRemovedEvent" &&
      node.requestedReviewer.__typename === "User"
    ) {
      const reviewerId = node.requestedReviewer.id;

      if (requestedReviewers.has(reviewerId)) {
        const reviewRequest = requestedReviewers.get(reviewerId);

        if (reviewRequest) {
          reviewRequest.deletedAt = new Date(node.createdAt);
          reviewRequest.author = {
            id: reviewerId,
            login: node.requestedReviewer.login,
            name: node.requestedReviewer.name,
            avatarUrl: node.requestedReviewer.avatarUrl,
          };
        }
      }
    }
  });

  return Array.from(requestedReviewers.values());
};

const upsertCodeReviewRequests = async (
  pullRequest: PullRequest,
  reviewRequests: ReviewRequestData[]
) => {
  logger.debug("upsertCodeReviewRequests", { pullRequest, reviewRequests });

  return parallel(10, reviewRequests, async (reviewRequest) => {
    const gitProfile = await upsertGitProfile(reviewRequest.author);

    const data = {
      workspaceId: pullRequest.workspaceId,
      reviewerId: gitProfile.id,
      pullRequestId: pullRequest.id,
      createdAt: new Date(),
      deletedAt: reviewRequest.deletedAt,
    };

    return await getPrisma(pullRequest.workspaceId).codeReviewRequest.upsert({
      where: {
        pullRequestId_reviewerId: {
          reviewerId: gitProfile.id,
          pullRequestId: pullRequest.id,
        },
      },
      create: data,
      update: data,
    });
  });
};

const upsertCodeReviews = async (
  pullRequest: PullRequest,
  reviews: ReviewData[]
) => {
  logger.debug("upsertCodeReviews", { pullRequest, reviews });

  return parallel(10, reviews, async (review) => {
    return await getPrisma(pullRequest.workspaceId).codeReview.upsert({
      where: {
        pullRequestId_authorId: {
          authorId: review.gitProfileId,
          pullRequestId: pullRequest.id,
        },
      },
      create: {
        workspaceId: pullRequest.workspaceId,
        authorId: review.gitProfileId,
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
  reviewEvents: ReviewDataWithId[],
  firstReviewerRequestedAt: Date | null
) => {
  const firstReviewAt = parseNullableISO(reviewEvents[0]?.createdAt);
  const firstApprovalAt = parseNullableISO(
    reviewEvents.find((review) => review.state === CodeReviewState.APPROVED)
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
  const workspace = await findWorkspaceByGitInstallationId(
    gitInstallationId.toString()
  );

  if (!workspace) return null;
  if (!workspace.gitProfile && !workspace.organization) return null;

  return workspace;
};

const upsertActivityEvents = async (
  pullRequest: PullRequest,
  reviewEvents: ReviewDataWithId[]
) => {
  // Do not save "DISMISSED" and "PENDING" events.
  const events = reviewEvents.filter((event) =>
    ["APPROVED", "CHANGES_REQUESTED", "COMMENTED"].includes(event.state)
  );

  return parallel(10, events, async (event) => {
    const data = {
      type: ActivityEventType.CODE_REVIEW_SUBMITTED,
      metadata: JSON.stringify(pick(event, ["commentCount", "state"])),
      eventId: `review:${event.reviewId}`,
      eventAt: new Date(event.createdAt),
      gitProfileId: event.gitProfileId,
      workspaceId: pullRequest.workspaceId,
      pullRequestId: pullRequest.id,
      repositoryId: pullRequest.repositoryId,
    };

    return await getPrisma(pullRequest.workspaceId).activityEvent.upsert({
      where: {
        workspaceId_eventId: {
          workspaceId: pullRequest.workspaceId,
          eventId: data.eventId,
        },
      },
      create: data,
      update: data,
    });
  });
};
