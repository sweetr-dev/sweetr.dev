import { GitProvider } from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../prisma";
import { ResourceNotFoundException } from "../errors/exceptions/resource-not-found.exception";
import { AutomationSlug } from "@sweetr/graphql-types/api";

export const isAutomationEnabled = async (
  gitInstallationId: number,
  slug: AutomationSlug
) => {
  const workspace = await findWorkspaceOrThrow(gitInstallationId);

  const automationSetting = await getPrisma(
    workspace.id
  ).automationSetting.findFirst({
    where: { automation: { slug }, workspaceId: workspace.id },
  });

  if (!automationSetting) return false;

  return automationSetting.enabled;
};

const findWorkspaceOrThrow = async (gitInstallationId: number) => {
  const workspace = await getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
  });

  if (!workspace) {
    throw new ResourceNotFoundException("Could not find workspace", {
      gitInstallationId,
    });
  }

  return workspace;
};
