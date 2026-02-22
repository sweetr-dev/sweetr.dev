import { getPrisma, jsonObject } from "../../../../prisma";
import { config } from "../../../../config";
import { getTemporaryNonce } from "../../../authorization.service";
import { IntegrationException } from "../../../errors/exceptions/integration.exception";
import { OauthV2AccessResponse } from "@slack/web-api";
import { omit } from "radash";
import { SlackIntegrationData } from "./slack.types";
import { JsonObject } from "@prisma/client/runtime/library";
import { IntegrationApp } from "../../../../graphql-types";
import {
  authorizeSlackWorkspace,
  getSlackClient,
  getWorkspaceSlackClient,
  joinSlackChannelOrThrow,
  sendSlackMessage,
  uninstallSlackWorkspace,
} from "./slack-client.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";

export const installIntegration = async (workspaceId: number, code: string) => {
  let response: OauthV2AccessResponse;

  try {
    response = await authorizeSlackWorkspace(getSlackClient(), code);
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

  await getPrisma(workspaceId).integration.upsert({
    where: {
      workspaceId_app: {
        workspaceId,
        app: IntegrationApp.SLACK,
      },
    },
    create: {
      workspaceId,
      app: IntegrationApp.SLACK,
      data: data as JsonObject,
    },
    update: {
      data: data as JsonObject,
    },
  });
};

export const removeIntegration = async (workspaceId: number) => {
  try {
    const { slackClient, integration } =
      await getWorkspaceSlackClient(workspaceId);

    await uninstallSlackWorkspace(slackClient);

    await getPrisma(workspaceId).integration.delete({
      where: {
        id: integration.id,
      },
    });
  } catch (error) {
    throw new IntegrationException(
      "Slack Uninstall failed. Please try again.",
      {
        originalError: error,
      }
    );
  }
};

export const removeIntegrationBySlackTeamId = async (teamId: string) => {
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
    target: jsonObject(integration.data).team?.name,
  };
};

export const getInstallUrl = (): string => {
  if (!config.slack.clientId) {
    throw new IntegrationException("SLACK_CLIENT_ID is not set");
  }

  const url = new URL("https://slack.com/oauth/v2/authorize");

  url.searchParams.append("client_id", config.slack.clientId);
  url.searchParams.append("state", encodeURIComponent(getTemporaryNonce()));
  url.searchParams.append("redirect_uri", config.slack.redirectUrl);
  url.searchParams.append("scope", config.slack.scope);

  return url.toString();
};

export const sendTestMessage = async (workspaceId: number, channel: string) => {
  const { slackClient } = await getWorkspaceSlackClient(workspaceId);

  const slackChannel = await joinSlackChannelOrThrow(slackClient, channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    text: "Sweet, it works! 🍧",
    unfurl_links: false,
    unfurl_media: false,
  });
};
