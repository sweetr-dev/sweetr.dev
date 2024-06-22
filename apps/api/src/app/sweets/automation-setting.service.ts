import { GitProvider } from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../prisma";
import { AutomationSlug } from "@sweetr/graphql-types/api";

export const isAutomationEnabled = async (
  gitInstallationId: number,
  slug: AutomationSlug
) => {
  const workspace = await findWorkspaceOrThrow(gitInstallationId);

  if (!workspace) return false;

  const automationSetting = await getPrisma(
    workspace.id
  ).automationSetting.findFirst({
    where: { automation: { slug }, workspaceId: workspace.id },
  });

  if (!automationSetting) return false;

  return automationSetting.enabled;
};

const findWorkspaceOrThrow = async (gitInstallationId: number) => {
  return getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
  });
};
