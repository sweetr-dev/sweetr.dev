import { GitProvider, Repository, Workspace } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import { parallel } from "radash";
import { logger } from "../../../lib/logger";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";
import {
  DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO,
  scheduleSyncBatch,
} from "../../sync-batch/services/sync-batch.service";
import { captureException } from "../../../lib/sentry";
import { initApplicationsFromRepositories } from "../../applications/services/application.service";
import { initIncidentDetectionSettings } from "../../incidents/services/incident-detection.service";

type RepositoryData = Omit<
  Repository,
  "id" | "workspaceId" | "createdAt" | "updatedAt"
>;

export const syncGitHubRepositories = async (
  gitInstallationId: number,
  syncRepositories?: string[]
): Promise<void> => {
  logger.info("syncGitHubRepositories", { gitInstallationId });

  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) {
    logger.info("syncGitHubRepositories: Could not find Workspace", {
      gitInstallationId,
    });
    return;
  }

  const isOnboarding = syncRepositories === undefined;
  const gitHubRepositories = await fetchGitHubRepositories(gitInstallationId);
  const repositories = await upsertRepositories(workspace, gitHubRepositories);

  if (isOnboarding) {
    try {
      await initIncidentDetectionSettings(workspace.id);
    } catch (error) {
      logger.warn("Failed to initialize incident detection settings", {
        workspaceId: workspace.id,
        error,
      });
      captureException(error);
    }

    try {
      await initApplicationsFromRepositories(workspace.id, repositories);
    } catch (error) {
      logger.warn("Failed to initialize applications from repositories", {
        workspaceId: workspace.id,
        error,
      });
      captureException(error);
    }
  }

  // When syncRepositories is undefined, we are onboarding.
  // We schedule a sync batch without specifying any repositories, which will trigger all repositories to be synced.
  if (syncRepositories === undefined || syncRepositories.length > 0) {
    await scheduleSyncBatch({
      workspaceId: workspace.id,
      scheduledAt: new Date(),
      sinceDaysAgo: DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO,
      metadata: {
        isOnboarding,
        repositories:
          syncRepositories ?? repositories.map((repository) => repository.name),
        gitProvider: GitProvider.GITHUB,
      },
    });
  }
};

const fetchGitHubRepositories = async (
  gitInstallationId: number
): Promise<RepositoryData[]> => {
  const fireGraphQLRequest = getInstallationGraphQLOctoKit(gitInstallationId);

  const repositories: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response: any = await fireGraphQLRequest({
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
                  defaultBranchRef {
                    name
                  }
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
    defaultBranch: repository.defaultBranchRef?.name ?? "main",
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
  const workspace = await findWorkspaceByGitInstallationId(
    gitInstallationId.toString()
  );

  if (!workspace) return null;
  if (!workspace.gitProfile && !workspace.organization) return null;

  return workspace;
};
