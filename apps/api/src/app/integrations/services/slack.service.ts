import { Workspace } from "@prisma/client";
import { IntegrationApp } from "@sweetr/graphql-types/api";
import { getPrisma } from "../../../prisma";
import { config } from "../../../config";
import { getTemporaryNonce } from "../../workspace-authorization.service";

export const installIntegration = (
  workspace: Workspace,
  code: string,
  state?: string
) => {
  return;
};

export const getIntegration = async (workspaceId: number) => {
  if (!config.slack.clientId) {
    return null;
  }

  const integration = await getPrisma(workspaceId).integration.findFirst({
    where: { workspaceId, app: IntegrationApp.SLACK },
  });

  if (!integration) {
    return {
      app: IntegrationApp.SLACK,
      isEnabled: false,
    };
  }

  return {
    app: IntegrationApp.SLACK,
    isEnabled: true,
    enabledAt: integration.createdAt.toISOString(),
    target: "ACME",
  };
};

export const getInstallUrl = () => {
  return `https://slack.com/oauth/v2/authorize?client_id=${config.slack.clientId}&state=${getTemporaryNonce()}&scope=${config.slack.scope}&user_scope=`;
};
