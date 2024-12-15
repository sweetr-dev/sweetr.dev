import {
  InstallIntegrationArgs,
  IntegrationService,
  RemoveIntegrationArgs,
} from "./integrations.types";
import { IntegrationApp } from "@prisma/client";
import * as slackService from "../slack/services/slack-integration.service";
import { logger } from "../../../lib/logger";
import { Integration } from "@sweetr/graphql-types/api";

const integrationServices: Record<IntegrationApp, IntegrationService> = {
  [IntegrationApp.SLACK]: slackService,
};

export const installIntegration = ({
  workspaceId,
  app,
  code,
}: InstallIntegrationArgs) => {
  return integrationServices[app].installIntegration(workspaceId, code);
};

export const removeIntegration = ({
  workspaceId,
  app,
}: RemoveIntegrationArgs) => {
  return integrationServices[app].removeIntegration(workspaceId);
};

export const removeAllIntegrationsFromWorkspace = async (
  workspaceId: number
) => {
  const integrations = await getWorkspaceEnabledIntegrations(workspaceId);

  return Promise.all(
    integrations.map((i) => {
      logger.info("[removeAllWorkspaceIntegrations] Removing integration", {
        workspaceId,
        app: i.app,
      });

      return removeIntegration({ workspaceId, app: i.app });
    })
  );
};

export const getIntegrationInstallUrl = async (app: IntegrationApp) => {
  return integrationServices[app].getInstallUrl();
};

export const getWorkspaceEnabledIntegrations = async (
  workspaceId: number
): Promise<Integration[]> => {
  const integrationPromises = Object.values(integrationServices).map(
    (service) => service.getIntegration(workspaceId)
  );

  const integrations = await Promise.all(integrationPromises);

  return integrations.filter((i) => i !== null && i.isEnabled) as Integration[];
};
