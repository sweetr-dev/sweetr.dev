import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { logger } from "../../../lib/logger";
import {
  findWorkspaceByGitInstallationId,
  getWorkspaceHandle,
} from "../../workspaces/services/workspace.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { JobPriority, SweetQueue, addJobs } from "../../../bull-mq/queues";
import { sleep } from "radash";
import { isAfter, parseISO, startOfDay, subDays } from "date-fns";
import { isAppSelfHosted } from "../../../lib/self-host";
import {
  incrementSyncBatchProgress,
  maybeFinishSyncBatch,
} from "../../sync-batch/services/sync-batch.service";

export const syncGitHubRepositoryPullRequests = async (
  repositoryName: string,
  gitInstallationId: number,
  sinceDaysAgo: number,
  syncBatchId: number,
  isOnboarding: boolean
): Promise<void> => {
  logger.info("syncGitHubRepositoryPullRequests", {
    repositoryName,
    gitInstallationId,
    syncBatchId,
  });

  const workspace = await findWorkspaceOrThrow(gitInstallationId);
  const handle = getWorkspaceHandle(workspace);

  if (!handle) {
    throw new BusinessRuleException("Workspace has no handle", { workspace });
  }

  const gitHubPullRequests = await fetchGitHubPullRequests(
    repositoryName,
    handle,
    gitInstallationId,
    isAppSelfHosted() ? null : sinceDaysAgo
  );

  if (!gitHubPullRequests.length) {
    // TO-DO: Possible problem when the first repository being synced has no PRs
    await maybeFinishSyncBatch(syncBatchId);

    return;
  }

  await incrementSyncBatchProgress(
    syncBatchId,
    "waiting",
    gitHubPullRequests.length
  );

  addJobs(
    SweetQueue.GITHUB_SYNC_PULL_REQUEST,
    gitHubPullRequests.map((pullRequest) => ({
      installation: { id: gitInstallationId },
      pull_request: { node_id: pullRequest.id },
      syncReviews: true,
      isOnboarding,
      syncBatchId,
    })),
    {
      priority: JobPriority.LOW,
    }
  );
};

// Note: We could optimize initial sync by fetching all PR data here and saving to our database.
// For now we dispatch one job per PR instead, to break down the problem and keep the code simpler.
const fetchGitHubPullRequests = async (
  repositoryName: string,
  owner: string,
  gitInstallationId: number,
  sinceDaysAgo: number | null
) => {
  const fireGraphQLRequest =
    await getInstallationGraphQLOctoKit(gitInstallationId);

  const pullRequests: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response: any = await fireGraphQLRequest({
      query: `
        query GetRepositoryPullRequests(
          $owner: String!
          $name: String!
          $cursor: String
          $order: IssueOrder!
        ) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor, orderBy: $order) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                id
                title
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
      owner,
      name: repositoryName,
      cursor,
      order: {
        direction: "DESC",
        field: "UPDATED_AT",
      },
    });

    const { nodes, pageInfo } = response.repository.pullRequests;

    const filteredPullRequests = sinceDaysAgo
      ? nodes.filter((pullRequest) =>
          isWithinSyncRange(pullRequest.createdAt, sinceDaysAgo)
        )
      : nodes;

    pullRequests.push(...filteredPullRequests);

    const createdAt = nodes?.at(-1)?.createdAt;

    // Stop fetching pages when historical data limit is reached
    if (createdAt && !isWithinSyncRange(createdAt, sinceDaysAgo)) {
      break;
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
    await sleep(500);
  }

  return pullRequests;
};

const isWithinSyncRange = (createdAt: string, sinceDaysAgo: number | null) => {
  if (!sinceDaysAgo) return true;

  return isAfter(
    parseISO(createdAt),
    startOfDay(subDays(new Date(), sinceDaysAgo))
  );
};

const findWorkspaceOrThrow = async (gitInstallationId: number) => {
  const workspace = await findWorkspaceByGitInstallationId(
    gitInstallationId.toString()
  );

  if (!workspace) {
    throw new ResourceNotFoundException("Workspace not found", {
      gitInstallationId,
    });
  }

  if (!workspace.installation) {
    throw new ResourceNotFoundException("Workspace has no installation", {
      gitInstallationId,
    });
  }

  return {
    ...workspace,
    installation: workspace.installation,
  };
};
