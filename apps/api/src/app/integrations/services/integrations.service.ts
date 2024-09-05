import {
  InstallIntegrationArgs,
  IntegrationService,
  RemoveIntegrationArgs,
} from "./integrations.types";
import { IntegrationApp } from "@prisma/client";
import * as slackService from "./slack.service";

const integrationServices: Record<IntegrationApp, IntegrationService> = {
  [IntegrationApp.SLACK]: slackService,
};

export const installIntegration = ({
  workspace,
  app,
  code,
}: InstallIntegrationArgs) => {
  return integrationServices[app].installIntegration(workspace, code);
};

export const removeIntegration = ({
  workspace,
  app,
}: RemoveIntegrationArgs) => {
  return integrationServices[app].removeIntegration(workspace);
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
