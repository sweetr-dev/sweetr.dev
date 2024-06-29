import {
  Workspace,
  InstallationTargetType,
  Installation,
  GitProvider,
  WorkspaceMembership,
  GitProfile,
} from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import {
  Installation as GitHubInstallation,
  User as GitHubUser,
} from "@octokit/webhooks-types";
import { SweetQueue, addJob } from "../../../bull-mq/queues";
import { logger } from "../../../lib/logger";
import { octokit } from "../../../lib/octokit";

export const syncGitHubInstallation = async (
  gitInstallation: GitHubInstallation,
  gitUser: GitHubUser
): Promise<void> => {
  logger.info("syncGitHubInstallation", {
    gitInstallation,
    gitUser,
  });

  const gitProfile = await upsertGitProfile(gitUser);
  const workspace = await upsertWorkspace(gitInstallation, gitProfile);
  const installation = await upsertInstallation(gitInstallation, workspace);

  await connectUserToWorkspace(gitProfile, workspace);

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
  // We don't get the organization's name in the webhook.
  const { data } = await octokit.rest.users.getByUsername({
    username: login,
  });

  return getPrisma().organization.upsert({
    where: {
      gitProvider_gitOrganizationId: {
        gitProvider: GitProvider.GITHUB,
        gitOrganizationId: data.node_id.toString(),
      },
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      gitOrganizationId: data.node_id.toString(),
      name: data.name || data.login,
      avatar: data.avatar_url,
      handle: data.login,
    },
    update: {
      gitProvider: GitProvider.GITHUB,
      name: data.name || data.login,
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

const upsertWorkspace = async (
  gitInstallation: GitHubInstallation,
  gitProfile: GitProfile
) => {
  const targetType = getTargetType(gitInstallation.target_type);
  const isOrganization = targetType === InstallationTargetType.ORGANIZATION;

  if (isOrganization) {
    const organization = await upsertOrganization(
      gitInstallation.account.login
    );

    return getBypassRlsPrisma().workspace.upsert({
      where: {
        organizationId: organization.id,
      },
      create: {
        organizationId: organization.id,
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
      gitProfileId: gitProfile.id,
    },
    create: {
      gitProfileId: gitProfile.id,
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

  await Promise.all(
    automations.map((automation) => {
      return getPrisma(workspace.id).automationSetting.upsert({
        where: {
          automationId_workspaceId: {
            automationId: automation.id,
            workspaceId: workspace.id,
          },
        },
        create: {
          enabled: true,
          workspaceId: workspace.id,
          automationId: automation.id,
          settings: {},
        },
        update: {},
      });
    })
  );
};

const upsertGitProfile = async (gitUser: GitHubUser): Promise<GitProfile> => {
  const gitUserId = gitUser.node_id.toString();

  const data = {
    gitUserId,
    gitProvider: GitProvider.GITHUB,
    handle: gitUser.login,
    name: gitUser.name || gitUser.login,
    avatar: gitUser.avatar_url,
  };

  const gitProfile = await getPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: { gitUserId, gitProvider: GitProvider.GITHUB },
    },
    create: data,
    update: data,
  });

  return gitProfile;
};

const connectUserToWorkspace = async (
  gitProfile: GitProfile,
  workspace: Workspace
): Promise<WorkspaceMembership> => {
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
