import { GitProvider, Repository, Workspace } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { parallel } from "radash";
import { logger } from "../../../lib/logger";
import { SweetQueue, addJobs } from "../../../bull-mq/queues";
import { isRepositorySyncable } from "../../repositories/services/repository.service";

type RepositoryData = Omit<
  Repository,
  "id" | "workspaceId" | "createdAt" | "updatedAt"
>;

export const syncGitHubRepositories = async (
  gitInstallationId: number,
  shouldSyncRepositoryPullRequests: boolean
): Promise<void> => {
  logger.info("syncGitHubRepositories", { gitInstallationId });

  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) {
    logger.info("syncGitHubRepositories: Could not find Workspace", {
      gitInstallationId,
    });
    return;
  }

  const gitHubRepositories = await fetchGitHubRepositories(gitInstallationId);
  const repositories = await upsertRepositories(workspace, gitHubRepositories);

  if (shouldSyncRepositoryPullRequests) {
    const nonArchivedRepositories = repositories.filter(
      (repository) => !repository.archivedAt
    );

    await enqueuePullRequestsSync(nonArchivedRepositories, gitInstallationId);
  }
};

const fetchGitHubRepositories = async (
  gitInstallationId: number
): Promise<RepositoryData[]> => {
  const fireGraphQLRequest =
    await getInstallationGraphQLOctoKit(gitInstallationId);

  const repositories: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fireGraphQLRequest({
      query: `
          query GetOrganizationRepositories($cursor: String) {
            viewer {
              repositories(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
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
              }
            }
          }
        `,
      cursor,
    });

    const { nodes, pageInfo } = response.viewer.repositories;

    repositories.push(...nodes);

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return repositories.map((repository) => ({
    gitRepositoryId: repository.id,
    gitProvider: GitProvider.GITHUB,
    name: repository.name,
    fullName: repository.nameWithOwner,
    description: repository.description,
    starCount: repository.stargazerCount,
    isFork: repository.isFork,
    isMirror: repository.isMirror,
    isPrivate: repository.isPrivate,
    archivedAt: repository.archivedAt ? new Date(repository.archivedAt) : null,
    createdAt: new Date(repository.createdAt),
  }));
};

const upsertRepositories = async (
  workspace: Workspace,
  repositories: RepositoryData[]
) => {
  return parallel(10, repositories, async (repository) => {
    return await getPrisma(workspace.id).repository.upsert({
      where: {
        gitProvider_gitRepositoryId: {
          gitProvider: GitProvider.GITHUB,
          gitRepositoryId: repository.gitRepositoryId,
        },
      },
      create: {
        ...repository,
        workspaceId: workspace.id,
        createdAt: new Date(),
      },
      update: {
        ...repository,
        workspaceId: workspace.id,
      },
    });
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

const enqueuePullRequestsSync = async (
  repositories: Repository[],
  gitInstallationId: number
) => {
  const syncableRepositories = repositories.filter(isRepositorySyncable);

  if (syncableRepositories.length === 0) return;

  return addJobs(
    SweetQueue.GITHUB_SYNC_REPOSITORY_PULL_REQUESTS,
    syncableRepositories.map((repository) => ({
      gitInstallationId,
      repository,
    }))
  );
};
