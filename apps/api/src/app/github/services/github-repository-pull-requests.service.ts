import { GitProvider } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { getBypassRlsPrisma } from "../../../prisma";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { logger } from "../../../lib/logger";
import {
  getWorkspaceHandle,
  incrementInitialSyncProgress,
} from "../../workspaces/services/workspace.service";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { JobPriority, SweetQueue, addJobs } from "../../../bull-mq/queues";
import { sleep } from "radash";
import { isAfter, parseISO, startOfDay, subDays } from "date-fns";
import { isAppSelfHosted } from "../../../lib/self-host";

export const syncGitHubRepositoryPullRequests = async (
  repositoryName: string,
  gitInstallationId: number,
  sinceDaysAgo?: number
): Promise<void> => {
  logger.info("syncGitHubRepositoryPullRequests", {
    repositoryName,
    gitInstallationId,
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
    isAppSelfHosted() ? null : sinceDaysAgo || 365
  );

  if (!gitHubPullRequests.length) return;

  await incrementInitialSyncProgress(
    workspace.id,
    "waiting",
    gitHubPullRequests.length
  );

  addJobs(
    SweetQueue.GITHUB_SYNC_PULL_REQUEST,
    gitHubPullRequests.map((pullRequest) => ({
      installation: { id: gitInstallationId },
      pull_request: { node_id: pullRequest.id },
      syncReviews: true,
      initialSync: true,
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
  const workspace = await getBypassRlsPrisma().workspace.findFirstOrThrow({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
    include: {
      installation: true,
      gitProfile: true,
      organization: true,
    },
  });

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
