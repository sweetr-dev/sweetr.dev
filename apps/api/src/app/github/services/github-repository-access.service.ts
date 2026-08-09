import { getInstallationOctoKit } from "../../../lib/octokit";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { logger } from "../../../lib/logger";
import { addJobs, SweetQueue } from "../../../bull-mq/queues";
import type { RepositoryAccessSyncJobPayload } from "./github-repository-access.types";

export const syncRepositoryAccess = async (
  workspaceId: number,
  gitInstallationId: number,
  repositoryId: number
): Promise<void> => {
  const repository = await getPrisma(workspaceId).repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repository) {
    logger.warn("syncRepositoryAccess: repository not found", {
      repositoryId,
      workspaceId,
    });
    return;
  }

  if (repository.workspaceId !== workspaceId) {
    logger.warn("syncRepositoryAccess: repository workspace mismatch", {
      repositoryId,
      workspaceId,
    });
    return;
  }

  const [owner, repo] = repository.fullName.split("/", 2);
  if (!owner || !repo) {
    logger.warn("syncRepositoryAccess: invalid fullName", {
      fullName: repository.fullName,
    });
    return;
  }

  const octokit = getInstallationOctoKit(gitInstallationId);
  const collaboratorNodeIds = new Set<string>();

  for await (const response of octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/collaborators",
    {
      owner,
      repo,
      affiliation: "all",
      per_page: 100,
    }
  )) {
    const users = response.data as { node_id?: string }[];
    for (const user of users) {
      if (user.node_id) {
        collaboratorNodeIds.add(user.node_id);
      }
    }
  }

  const memberships = await getPrisma(workspaceId).workspaceMembership.findMany(
    {
      where: { workspaceId },
      include: { gitProfile: true },
    }
  );

  const membershipIdsWithAccess = memberships
    .filter(
      (m) => m.gitProfile && collaboratorNodeIds.has(m.gitProfile.gitUserId)
    )
    .map((m) => m.id);

  await getPrisma(workspaceId).$transaction(async (tx) => {
    await tx.workspaceMembershipRepository.deleteMany({
      where: { repositoryId },
    });

    if (membershipIdsWithAccess.length > 0) {
      await tx.workspaceMembershipRepository.createMany({
        data: membershipIdsWithAccess.map((workspaceMembershipId) => ({
          workspaceMembershipId,
          repositoryId,
          workspaceId,
        })),
      });
    }
  });
};

export const listTeamRepositoryInternalIds = async (
  gitInstallationId: number,
  orgLogin: string,
  teamSlug: string,
  workspaceId: number
): Promise<number[]> => {
  const octokit = getInstallationOctoKit(gitInstallationId);
  const nodeIds: string[] = [];

  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/teams/{team_slug}/repos",
    {
      org: orgLogin,
      team_slug: teamSlug,
      per_page: 100,
    }
  )) {
    const repos = response.data as { node_id?: string }[];
    for (const r of repos) {
      if (r.node_id) {
        nodeIds.push(r.node_id);
      }
    }
  }

  if (nodeIds.length === 0) {
    return [];
  }

  const rows = await getBypassRlsPrisma().repository.findMany({
    where: {
      workspaceId,
      gitRepositoryId: { in: nodeIds },
    },
    select: { id: true },
  });

  return rows.map((row) => row.id);
};

export const resolveTeamSlug = async (
  gitInstallationId: number,
  organization: { id: number },
  team: { id: number; slug?: string }
): Promise<string> => {
  if (team.slug) {
    return team.slug;
  }

  const octokit = getInstallationOctoKit(gitInstallationId);
  const { data } = await octokit.request(
    "GET /organizations/{org_id}/team/{team_id}",
    {
      org_id: organization.id,
      team_id: team.id,
    }
  );
  return data.slug;
};

export const enqueueRepositoryAccessSyncJobs = async (
  workspaceId: number,
  gitInstallationId: number,
  repositoryIds: number[]
): Promise<void> => {
  if (repositoryIds.length === 0) {
    return;
  }

  await addJobs(
    SweetQueue.GITHUB_REPOSITORY_ACCESS_SYNC,
    repositoryIds.map(
      (repositoryId): RepositoryAccessSyncJobPayload => ({
        workspaceId,
        gitInstallationId,
        repositoryId,
      })
    )
  );
};
