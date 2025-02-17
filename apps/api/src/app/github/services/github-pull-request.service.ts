import {
  getInstallationGraphQLOctoKit,
  getInstallationOctoKit,
  GITHUB_MAX_PAGE_LIMIT,
} from "../../../lib/octokit";
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import { logger } from "../../../lib/logger";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  GitProvider,
  Prisma,
  PullRequest,
  PullRequestState,
  Repository,
  Workspace,
} from "@prisma/client";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { JobPriority, SweetQueue, addJob } from "../../../bull-mq/queues";
import {
  getCycleTime,
  getFirstDraftAndReadyDates,
  getPullRequestLinesTracked,
  getPullRequestSize,
  getTimeToCode,
  getTimeToMerge,
} from "./github-pull-request-tracking.service";
import {
  findWorkspaceByGitInstallationId,
  findWorkspaceUsers,
  getInitialSyncProgress,
  incrementInitialSyncProgress,
} from "../../workspaces/services/workspace.service";
import { parseNullableISO } from "../../../lib/date";
import {
  enqueueEmail,
  hasSentEmail,
  markEmailAsSent,
} from "../../email/services/send-email.service";
import { captureException } from "@sentry/node";
import { EmailTemplate } from "../../email/services/email-template.service";

interface Author {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}
type RepositoryData = Omit<
  Repository,
  "id" | "workspaceId" | "createdAt" | "updatedAt"
>;

export const syncPullRequest = async (
  gitInstallationId: number,
  pullRequestId: string,
  { syncReviews, initialSync, failCount } = {
    syncReviews: false,
    initialSync: false,
    failCount: 0,
  }
) => {
  logger.info("syncPullRequest", {
    installationId: gitInstallationId,
    pullRequestId,
  });

  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) {
    logger.info("syncPullRequest: Could not find Workspace", {
      gitInstallationId,
      pullRequestId,
      syncReviews,
    });

    return;
  }

  if (initialSync && failCount === 0) {
    await incrementInitialSyncProgress(workspace.id, "done", 1);
  }

  const gitPrData = await fetchPullRequest(gitInstallationId, pullRequestId);

  if (gitPrData.repository.isFork) {
    logger.info("syncPullRequest: Skipping forked repository", {
      gitPrData,
    });

    return;
  }

  if (!gitPrData.author?.id || !gitPrData.author?.login) {
    logger.info("syncPullRequest: Skipping unknown author", {
      gitPrData,
    });

    return;
  }

  const gitProfile = await upsertGitProfile(gitPrData.author);
  const repository = await upsertRepository(workspace.id, gitPrData.repository);
  const pullRequest = await upsertPullRequest(
    workspace,
    gitInstallationId,
    gitProfile.id,
    repository,
    gitPrData
  );

  if (syncReviews) {
    logger.debug("syncPullRequest: Adding job to sync reviews", {
      gitPrData,
    });

    await addJob(
      SweetQueue.GITHUB_SYNC_CODE_REVIEW,
      {
        pull_request: {
          node_id: pullRequest.gitPullRequestId,
        },
        installation: {
          id: gitInstallationId,
        },
      },
      {
        priority: JobPriority.LOW,
      }
    );
  }

  if (initialSync) {
    const shouldSendEmail = await isSyncComplete(workspace.id);

    if (shouldSendEmail) sendSyncCompleteEmail(workspace.id);
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
              description
              stargazerCount
              isFork
              isArchived
              isMirror
              isPrivate
              archivedAt
              createdAt
            }

            files(first: ${GITHUB_MAX_PAGE_LIMIT}) {
              nodes {
                __typename
                changeType
                path
                additions
                deletions
              }
              pageInfo {
                hasNextPage
                endCursor 
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

  return {
    ...response.node,
    files: await getPullRequestFiles(
      installationId,
      pullRequestId,
      response.node.files
    ),
  };
};

const getPullRequestFiles = async (
  installationId: number,
  pullRequestId: string,
  fileQuery: any
) => {
  if (!fileQuery.pageInfo.hasNextPage) {
    return fileQuery.nodes || [];
  }

  const files: object[] = [...(fileQuery.nodes || [])];

  while (fileQuery.pageInfo.hasNextPage) {
    const fireGraphQLRequest = getInstallationGraphQLOctoKit(installationId);
    const response = await fireGraphQLRequest<GraphQlQueryResponseData>(
      `
      query PullRequestFilesQuery(
        $nodeId: ID!
        $cursor: String
      ) {
        node(id: $nodeId) {
          ... on PullRequest {
            id
            files(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor) {
              nodes {
                changeType
                path
                additions
                deletions
              }
              pageInfo {
                hasNextPage
                endCursor 
              }
            }
          }
        }
      }
    `,
      {
        nodeId: pullRequestId,
        cursor: fileQuery.pageInfo.endCursor,
      }
    );

    files.push(...response.node.files.nodes);
    fileQuery.pageInfo = response.node.files.pageInfo;
  }

  return files;
};

const upsertPullRequest = async (
  workspace: Workspace,
  installationId: number,
  gitProfileId: number,
  repository: Repository,
  gitPrData: any
) => {
  const data: Prisma.PullRequestUncheckedCreateInput = {
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
    files: gitPrData.files,
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

  await upsertPullRequestTracking(
    workspace,
    installationId,
    repository,
    pullRequest,
    gitPrData
  );

  return pullRequest;
};

const upsertPullRequestTracking = async (
  workspace: Workspace,
  installationId: number,
  repository: Repository,
  pullRequest: PullRequest,
  gitPrData: any
) => {
  const firstCommit = await getFirstCommit(
    installationId,
    repository,
    pullRequest
  );

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

  const {
    linesAddedCount,
    linesDeletedCount,
    changedFilesCount,
    linesChangedCount,
  } = getPullRequestLinesTracked(workspace, pullRequest);
  const size = getPullRequestSize(workspace, linesChangedCount);
  const timeToMerge = getTimeToMerge(pullRequest, tracking?.firstApprovalAt);

  const firstCommitAt = parseNullableISO(firstCommit?.commit?.committer?.date);
  const timeToCode = getTimeToCode(firstCommitAt, tracking?.firstReadyAt);
  const cycleTime = getCycleTime(pullRequest, firstCommitAt);

  await getPrisma(pullRequest.workspaceId).pullRequestTracking.upsert({
    where: {
      pullRequestId: pullRequest.id,
    },
    create: {
      pullRequestId: pullRequest.id,
      workspaceId: pullRequest.workspaceId,
      linesAddedCount,
      linesDeletedCount,
      changedFilesCount,
      size,
      firstCommitAt,
      firstDraftedAt,
      firstReadyAt,
      timeToMerge,
      timeToCode,
      cycleTime,
    },
    update: {
      linesAddedCount,
      linesDeletedCount,
      changedFilesCount,
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

const getFirstCommit = async (
  installationId: number,
  repository: Repository,
  pullRequest: PullRequest
) => {
  try {
    const octokit = await getInstallationOctoKit(installationId);
    const [owner, ...repo] = repository.fullName.split("/");

    const response = await octokit.rest.pulls.listCommits({
      owner,
      pull_number: parseInt(pullRequest.number),
      repo: repo.join("/"),
      page: 1,
      per_page: 1,
    });

    return response.data.at(0);
  } catch (error) {
    return undefined;
  }
};

const upsertGitProfile = async (author: Author) => {
  return getPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: {
        gitProvider: GitProvider.GITHUB,
        gitUserId: author.id,
      },
    },
    update: {
      handle: author.login,
      name: author.name ? author.name : author.login,
      avatar: author.avatarUrl,
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: author.id,
      handle: author.login,
      name: author.name ? author.name : author.login,
      avatar: author.avatarUrl,
    },
  });
};

const upsertRepository = async (workspaceId, gitRepositoryData: any) => {
  const data: RepositoryData = {
    gitRepositoryId: gitRepositoryData.id,
    gitProvider: GitProvider.GITHUB,
    name: gitRepositoryData.name,
    fullName: gitRepositoryData.nameWithOwner,
    description: gitRepositoryData.description,
    starCount: gitRepositoryData.stargazerCount,
    isFork: gitRepositoryData.isFork,
    isMirror: gitRepositoryData.isMirror,
    isPrivate: gitRepositoryData.isPrivate,
    archivedAt: gitRepositoryData.archivedAt
      ? new Date(gitRepositoryData.archivedAt)
      : null,
  };

  return await getPrisma(workspaceId).repository.upsert({
    where: {
      gitProvider_gitRepositoryId: {
        gitProvider: GitProvider.GITHUB,
        gitRepositoryId: gitRepositoryData.id,
      },
    },
    create: {
      ...data,
      workspaceId: workspaceId,
      createdAt: new Date(),
    },
    update: {
      ...data,
      workspaceId: workspaceId,
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

const isSyncComplete = async (workspaceId: number) => {
  const progress = await getInitialSyncProgress(workspaceId);

  return progress >= 100;
};

const sendSyncCompleteEmail = async (workspaceId: number) => {
  const emailTemplate: EmailTemplate = "InitialSyncCompleteEmail";
  const emailKey = `workspace:${workspaceId}:email:${emailTemplate}`;

  const isDuplicateEmail = await hasSentEmail(emailKey);
  if (isDuplicateEmail) return;

  const members = await findWorkspaceUsers(workspaceId);

  if (!members.length) {
    captureException(
      new BusinessRuleException(
        "Attempted to send sync complete email to workspace with no members.",
        {
          extra: {
            workspaceId,
          },
        }
      )
    );

    return;
  }

  for (const member of members) {
    if (!member.user) continue;

    await enqueueEmail({
      to: member.user.email,
      subject: "Sync complete.",
      template: {
        type: emailTemplate,
        props: {
          username: member.name,
        },
      },
    });
  }

  const oneDayInSeconds = 60 * 60 * 24;
  await markEmailAsSent(emailKey, oneDayInSeconds);
};
