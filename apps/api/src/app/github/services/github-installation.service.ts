import {
  Workspace,
  InstallationTargetType,
  Installation,
  GitProvider,
  WorkspaceMembership,
  GitProfile,
} from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { octokit } from "../../../lib/octokit";
import {
  Installation as GitHubInstallation,
  User as GitHubUser,
} from "@octokit/webhooks-types";
import { SweetQueue, addJob } from "../../../bull-mq/queues";
import { logger } from "../../../lib/logger";

export const syncGitHubInstallation = async (
  gitInstallation: GitHubInstallation,
  gitUser: GitHubUser
): Promise<void> => {
  logger.info("syncGitHubInstallation", {
    gitInstallation,
    gitUser,
  });

  const targetType = getTargetType(gitInstallation.target_type);
  const isOrganization = targetType === InstallationTargetType.ORGANIZATION;

  const gitProfile = await findGitProfileByGitIdOrThrow(
    gitUser.node_id.toString()
  );

  const organization = isOrganization
    ? await upsertOrganization(gitInstallation.account.login)
    : undefined;

  const workspace = await createOrFindWorkspace(
    targetType,
    organization?.id || gitProfile.id
  );

  const installation = await upsertInstallation(gitInstallation, workspace);

  await connectUserToWorkspace(gitUser, workspace);

  await addJob(SweetQueue.GITHUB_REPOSITORIES_SYNC, {
    installation: { id: parseInt(installation.gitInstallationId) },
    shouldSyncRepositoryPullRequests: true,
  });

  if (workspace.organization) {
    await addJob(SweetQueue.GITHUB_MEMBERS_SYNC, {
      organization: { login: workspace.organization.handle },
      installation: { id: parseInt(installation.gitInstallationId) },
    });
  }

  await createWorkspaceDefaultAutomationSettings(workspace);
};

const getTargetType = (targetType: string) => {
  return targetType === "Organization"
    ? InstallationTargetType.ORGANIZATION
    : InstallationTargetType.USER;
};

const upsertOrganization = async (login: string) => {
  const { data } = await octokit.rest.users.getByUsername({
    username: login,
  });

  return getPrisma().organization.upsert({
    where: {
      gitProvider_gitOrganizationId: {
        gitProvider: GitProvider.GITHUB,
        gitOrganizationId: data.id.toString(),
      },
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      gitOrganizationId: data.id.toString(),
      name: data.name!,
      avatar: data.avatar_url,
      handle: data.login,
    },
    update: {
      gitProvider: GitProvider.GITHUB,
      name: data.name!,
      avatar: data.avatar_url,
      handle: data.login,
    },
  });
};

const upsertInstallation = async (
  gitInstallation: GitHubInstallation,
  workspace: Workspace
): Promise<Installation> => {
  const installationData = {
    gitProvider: GitProvider.GITHUB,
    targetId: gitInstallation.target_id.toString(),
    targetType:
      gitInstallation.target_type === "Organization"
        ? InstallationTargetType.ORGANIZATION
        : InstallationTargetType.USER,
    repositorySelection: gitInstallation.repository_selection,
    permissions: gitInstallation.permissions,
    events: gitInstallation.events,
    workspaceId: workspace.id,
  };

  return getPrisma(workspace.id).installation.upsert({
    where: {
      // TO-DO: Unique should be targetId?
      gitInstallationId: gitInstallation.id.toString(),
    },
    create: {
      gitInstallationId: gitInstallation.id.toString(),
      ...installationData,
    },
    update: installationData,
  });
};

const createOrFindWorkspace = (targetType: string, targetId: number) => {
  if (targetType === InstallationTargetType.ORGANIZATION) {
    return getBypassRlsPrisma().workspace.upsert({
      where: {
        organizationId: targetId,
      },
      create: {
        organizationId: targetId,
        gitProvider: GitProvider.GITHUB,
      },
      update: {},
      include: {
        organization: true,
        gitProfile: true,
      },
    });
  }

  return getBypassRlsPrisma().workspace.upsert({
    where: {
      gitProfileId: targetId,
    },
    create: {
      gitProfileId: targetId,
      gitProvider: GitProvider.GITHUB,
    },
    update: {},
    include: {
      organization: true,
      gitProfile: true,
    },
  });
};

const createWorkspaceDefaultAutomationSettings = async (
  workspace: Workspace
) => {
  const automations = await getPrisma().automation.findMany({
    where: { available: true },
  });

  await getPrisma(workspace.id).automationSetting.createMany({
    data: automations.map((automation) => ({
      enabled: true,
      workspaceId: workspace.id,
      automationId: automation.id,
      settings: {},
    })),
  });
};

const findGitProfileByGitIdOrThrow = async (
  gitUserId: string
): Promise<GitProfile> => {
  const gitProfile = await getPrisma().gitProfile.findFirstOrThrow({
    where: { gitUserId },
    include: { user: true },
  });

  return gitProfile;
};

const connectUserToWorkspace = async (
  gitUser: GitHubUser,
  workspace: Workspace
): Promise<WorkspaceMembership> => {
  const gitProfile = await getPrisma().gitProfile.findFirstOrThrow({
    where: { gitUserId: gitUser.node_id.toString() },
    include: { user: true },
  });

  return getPrisma(workspace.id).workspaceMembership.upsert({
    where: {
      gitProfileId_workspaceId: {
        gitProfileId: gitProfile.id,
        workspaceId: workspace.id,
      },
    },
    create: {
      gitProfileId: gitProfile.id,
      workspaceId: workspace.id,
    },
    update: {},
  });
};
