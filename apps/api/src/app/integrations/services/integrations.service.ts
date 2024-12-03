import {
  InstallIntegrationArgs,
  IntegrationService,
  RemoveIntegrationArgs,
} from "./integrations.types";
import { IntegrationApp } from "@prisma/client";
import * as slackService from "../slack/services/slack-integration.service";
import { logger } from "../../../lib/logger";

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
  const integrations = await getWorkspaceIntegrations(workspaceId);

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

export const getWorkspaceIntegrations = async (workspaceId: number) => {
  const integrations = Object.values(integrationServices).map((service) =>
    service.getIntegration(workspaceId)
  );

  return (await Promise.all(integrations)).filter((i) => i !== null);
};
