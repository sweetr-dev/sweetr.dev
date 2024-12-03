import { GitProvider } from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { Installation as GitHubInstallation } from "@octokit/webhooks-types";
import { logger } from "../../../lib/logger";
import { removeAllIntegrationsFromWorkspace } from "../../integrations/services/integrations.service";

export const handleAppUninstall = async (
  gitInstallation: GitHubInstallation
): Promise<void> => {
  logger.info("handleAppUninstall", {
    gitInstallation,
  });

  const installation = await getBypassRlsPrisma().installation.findFirst({
    where: {
      gitInstallationId: gitInstallation.id.toString(),
      gitProvider: GitProvider.GITHUB,
    },
    include: {
      workspace: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!installation) {
    logger.info("[deleteWorkspace] Installation not found for installationId", {
      gitInstallationId: gitInstallation.id,
    });

    return;
  }

  await removeAllIntegrationsFromWorkspace(installation.workspaceId);

  if (installation.workspace.organization) {
    // Deleting organization causes cascade action for whole workspace.
    await getPrisma(installation.workspace.id).organization.delete({
      where: {
        id: installation.workspace.organization.id,
      },
    });

    logger.info("[deleteWorkspace] Deleted organization", {
      organizationId: installation.workspace.organization.id,
    });

    return;
  }

  // If it's a personal workspace, we don't delete the user, just the workspace.
  await getPrisma(installation.workspaceId).workspace.delete({
    where: {
      id: installation.workspaceId,
    },
  });

  logger.info("[deleteWorkspace] Deleted workspace", {
    workspaceId: installation.workspaceId,
  });
};
