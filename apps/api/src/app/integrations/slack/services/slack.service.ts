import { Integration, Workspace } from "@prisma/client";
import { getPrisma } from "../../../../prisma";
import { config } from "../../../../config";
import { getTemporaryNonce } from "../../../workspace-authorization.service";
import { getSlackWebClient } from "../../../../lib/slack";
import { IntegrationException } from "../../../errors/exceptions/integration.exception";
import { OauthV2AccessResponse } from "@slack/web-api";
import { isObject, omit } from "radash";
import { SlackIntegrationData } from "./slack.types";
import { JsonObject } from "@prisma/client/runtime/library";
import { IntegrationApp } from "@sweetr/graphql-types/api";

export const installIntegration = async (
  workspace: Workspace,
  code: string
) => {
  let response: OauthV2AccessResponse;

  try {
    response = await getSlackClient().oauth.v2.access({
      client_id: config.slack.clientId,
      client_secret: config.slack.clientSecret,
      redirect_uri: config.slack.redirectUrl,
      code,
    });
  } catch (error) {
    throw new IntegrationException("Integration failed. Please try again.", {
      originalError: error,
    });
  }

  if (!response.ok) {
    throw new IntegrationException("Integration failed. Please try again.", {
      extra: { response },
    });
  }

  const data: SlackIntegrationData = omit(response, [
    "response_metadata",
    "ok",
    "error",
  ]);

  await getPrisma(workspace.id).integration.upsert({
    where: {
      workspaceId_app: {
        workspaceId: workspace.id,
        app: IntegrationApp.SLACK,
      },
    },
    create: {
      workspaceId: workspace.id,
      app: IntegrationApp.SLACK,
      data: data as JsonObject,
    },
    update: {
      data: data as JsonObject,
    },
  });
};

export const removeIntegration = async (workspace: Workspace) => {
  const integration = await getPrisma(workspace.id).integration.findFirst({
    where: { workspaceId: workspace.id, app: IntegrationApp.SLACK },
  });

  if (!integration) return;

  const data = getIntegrationData(integration);

  if (!data.app_id) {
    throw new IntegrationException("Slack integration is missing app_id");
  }

  try {
    await getSlackClient(integration).apps.uninstall({
      client_id: config.slack.clientId,
      client_secret: config.slack.clientSecret,
    });
  } catch (error) {
    throw new IntegrationException(
      "Slack Uninstall failed. Please try again.",
      {
        originalError: error,
      }
    );
  }

  await getPrisma(workspace.id).integration.delete({
    where: {
      id: integration.id,
    },
  });
};

export const removeIntegrationByTeamId = async (teamId: string) => {
  return getPrisma().integration.deleteMany({
    where: {
      data: {
        path: ["team", "id"],
        equals: teamId,
      },
    },
  });
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
    target: getIntegrationData(integration).team?.name,
  };
};

const getSlackClient = (integration?: Integration) => {
  return getSlackWebClient(
    integration ? getIntegrationData(integration).access_token : undefined
  );
};

const getIntegrationData = (integration: Integration): SlackIntegrationData => {
  return isObject(integration.data)
    ? integration.data
    : JSON.parse(integration.data as string);
};

export const getInstallUrl = (): string => {
  const url = new URL("https://slack.com/oauth/v2/authorize");

  url.searchParams.append("client_id", config.slack.clientId);
  url.searchParams.append("state", encodeURIComponent(getTemporaryNonce()));
  url.searchParams.append("redirect_uri", config.slack.redirectUrl);
  url.searchParams.append("scope", config.slack.scope);

  return url.toString();
};
