import { getInstallationGraphQLOctoKit } from "../../../lib/octokit";
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import { logger } from "../../../lib/logger";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  GitProvider,
  PullRequest,
  PullRequestState,
  Repository,
} from "@prisma/client";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { JobPriority, SweetQueue, addJob } from "../../../bull-mq/queues";
import {
  getCycleTime,
  getFirstDraftAndReadyDates,
  getPullRequestSize,
  getTimeToCode,
  getTimeToMerge,
} from "./github-pull-request-tracking.service";

interface Author {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

export const syncPullRequest = async (
  installationId: number,
  pullRequestId: string,
  shouldSyncReviews = false
) => {
  logger.info("syncPullRequest", {
    installationId,
    pullRequestId,
  });

  const gitPrData = await fetchPullRequest(installationId, pullRequestId);

  if (gitPrData.repository.isFork) {
    logger.info("syncPullRequest: Skipping forked repository", {
      gitPrData,
    });

    return;
  }

  if (!gitPrData.author.id) {
    logger.info("syncPullRequest: Skipping unknown author", {
      gitPrData,
    });

    return;
  }

  const gitProfile = await upsertGitProfile(gitPrData.author);
  const repository = await findRepositoryOrThrow(gitPrData.repository.id);

  const pullRequest = await upsertPullRequest(
    gitProfile.id,
    repository,
    gitPrData
  );

  if (shouldSyncReviews) {
    logger.debug("syncPullRequest: Adding job to sync reviews", {
      gitPrData,
    });

    addJob(
      SweetQueue.GITHUB_SYNC_CODE_REVIEW,
      {
        pull_request: {
          node_id: pullRequest.gitPullRequestId,
        },
        installation: {
          id: installationId,
        },
      },
      {
        priority: JobPriority.LOW,
      }
    );
  }
};

const fetchPullRequest = async (
  installationId: number,
  pullRequestId: string
) => {
  const fireGraphQLRequest = getInstallationGraphQLOctoKit(installationId);
  const response = await fireGraphQLRequest<GraphQlQueryResponseData>(
    `
      query PullRequestQuery(
        $nodeId: ID!
      ) {
        node(id: $nodeId) {
          ... on PullRequest {
            id

            title
            number
            url

            totalCommentsCount
            changedFiles
            additions
            deletions

            state
            isDraft
            closedAt
            mergedAt

            createdAt
            updatedAt
            
            author {
              ... on User {
                id
                login
                name
                avatarUrl
              }
            }

            repository {
              id
              name
              nameWithOwner
              isFork
            }

            commits(first: 1) {
              nodes {
                commit {
                  committedDate
                }
              }
            }

            timelineItems(itemTypes: [READY_FOR_REVIEW_EVENT, CONVERT_TO_DRAFT_EVENT], last: 100) {
              nodes {
                __typename
                ... on ReadyForReviewEvent {
                  createdAt
                }
                ... on ConvertToDraftEvent {
                  createdAt
                }
              }
            }
          }
        }
      }
    `,
    {
      nodeId: pullRequestId,
    }
  );

  return response.node;
};

const upsertPullRequest = async (
  gitProfileId: number,
  repository: Repository,
  gitPrData: any
) => {
  const data: Omit<PullRequest, "id"> = {
    gitProvider: GitProvider.GITHUB,
    gitPullRequestId: gitPrData.id,
    gitUrl: gitPrData.url,
    title: gitPrData.title,
    number: gitPrData.number.toString(),
    commentCount: gitPrData.totalCommentsCount,
    changedFilesCount: gitPrData.changedFiles,
    linesAddedCount: gitPrData.additions,
    linesDeletedCount: gitPrData.deletions,
    state: getPullRequestState(gitPrData.state, gitPrData.isDraft),
    mergedAt: gitPrData.mergedAt,
    closedAt: gitPrData.closedAt,
    createdAt: gitPrData.createdAt,
    updatedAt: gitPrData.updatedAt,
    repositoryId: repository.id,
    workspaceId: repository.workspaceId,
    authorId: gitProfileId,
  };

  const pullRequest = await getPrisma(
    repository.workspaceId
  ).pullRequest.upsert({
    where: {
      gitProvider_gitPullRequestId: {
        gitProvider: GitProvider.GITHUB,
        gitPullRequestId: gitPrData.id,
      },
    },
    create: data,
    update: data,
  });

  await upsertPullRequestTracking(pullRequest, gitPrData);

  return pullRequest;
};

const upsertPullRequestTracking = async (
  pullRequest: PullRequest,
  gitPrData: any
) => {
  const { firstDraftedAt, firstReadyAt } = getFirstDraftAndReadyDates(
    pullRequest,
    gitPrData
  );

  const tracking = await getPrisma(
    pullRequest.workspaceId
  ).pullRequestTracking.findUnique({
    where: {
      pullRequestId: pullRequest.id,
    },
  });

  const size = getPullRequestSize(pullRequest);
  const timeToMerge = getTimeToMerge(pullRequest, tracking?.firstApprovalAt);

  const firstCommitAt = gitPrData.commits.nodes[0]?.commit.committedDate;
  const timeToCode = getTimeToCode(firstCommitAt, tracking?.firstReadyAt);
  const cycleTime = getCycleTime(pullRequest, firstCommitAt);

  await getPrisma(pullRequest.workspaceId).pullRequestTracking.upsert({
    where: {
      pullRequestId: pullRequest.id,
    },
    create: {
      pullRequestId: pullRequest.id,
      workspaceId: pullRequest.workspaceId,
      size,
      firstCommitAt,
      firstDraftedAt,
      firstReadyAt,
      timeToMerge,
      timeToCode,
      cycleTime,
    },
    update: {
      size,
      firstCommitAt,
      firstDraftedAt,
      firstReadyAt,
      timeToMerge,
      timeToCode,
      cycleTime,
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

const findRepositoryOrThrow = async (gitRepositoryId: string) => {
  return getBypassRlsPrisma().repository.findFirstOrThrow({
    where: {
      gitProvider: GitProvider.GITHUB,
      gitRepositoryId,
    },
  });
};

// A draft that was closed will have state === "CLOSED" and isDraft === true.
function getPullRequestState(
  state: string,
  isDraft: boolean
): PullRequestState {
  if (state === "CLOSED") return PullRequestState.CLOSED;
  if (state === "MERGED") return PullRequestState.MERGED;
  if (isDraft) return PullRequestState.DRAFT;

  if (state === "OPEN") return PullRequestState.OPEN;
  throw new BusinessRuleException(`Unknown pull request state: ${state}`);
}
