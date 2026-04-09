import { GitProvider, Repository, Workspace } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationOctoKit,
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
import { isRepositorySyncable } from "../../repositories/services/repository.service";

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
      await initApplicationsFromRepositories(
        workspace.id,
        repositories.filter(isRepositorySyncable)
      );
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
  const octokit = getInstallationOctoKit(gitInstallationId);

  const repositories: any[] = [];
  let page = 1;

  while (true) {
    // We can't use GraphQL API here since it will throw permission error when trying to access defaultBranchRef
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: GITHUB_MAX_PAGE_LIMIT,
      page,
    });

    repositories.push(...data.repositories);

    if (repositories.length >= data.total_count) break;
    page++;
  }

  return repositories.map((repository) => ({
    gitRepositoryId: repository.node_id,
    gitProvider: GitProvider.GITHUB,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description ?? null,
    defaultBranch: repository.default_branch ?? "main",
    starCount: repository.stargazers_count ?? 0,
    isFork: repository.fork ?? false,
    isMirror: !!repository.mirror_url,
    isPrivate: repository.private ?? false,
    archivedAt: repository.archived ? new Date() : null,
    createdAt: new Date(repository.created_at!),
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
