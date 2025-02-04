import { IntegrationApp } from "@prisma/client";
import { ChatPostMessageArguments, WebClient } from "@slack/web-api";
import { getPrisma, jsonObject } from "../../../../prisma";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { config } from "../../../../config";
import { IntegrationException } from "../../../errors/exceptions/integration.exception";
import { logger } from "../../../../lib/logger";

export const getSlackClient = () => new WebClient();

export const getWorkspaceSlackClient = async (workspaceId: number) => {
  const integration = await getPrisma(workspaceId).integration.findFirst({
    where: { workspaceId, app: IntegrationApp.SLACK },
  });

  if (!integration) {
    throw new ResourceNotFoundException("Slack integration not found");
  }

  const accessToken = jsonObject(integration.data).access_token;

  if (!accessToken || typeof accessToken !== "string") {
    throw new IntegrationException(
      "Invalid Slack integration: missing or invalid access token",
      { extra: integration }
    );
  }

  return {
    integration,
    slackClient: new WebClient(accessToken),
  };
};

export const authorizeSlackWorkspace = (
  slackClient: WebClient,
  code: string
) => {
  return slackClient.oauth.v2.access({
    client_id: config.slack.clientId,
    client_secret: config.slack.clientSecret,
    redirect_uri: config.slack.redirectUrl,
    code,
  });
};

export const uninstallSlackWorkspace = async (slackClient: WebClient) => {
  return slackClient.apps.uninstall({
    client_id: config.slack.clientId,
    client_secret: config.slack.clientSecret,
  });
};

export const findSlackChannelOrThrow = async (
  slackClient: WebClient,
  channelName: string
) => {
  // TO-DO: Paginate
  const response = await slackClient?.conversations.list({
    limit: 999,
    types: "public_channel,private_channel",
  });

  logger.debug("slackClient.conversations.list", {
    ok: response.ok,
    error: response.error,
    metadata: response.response_metadata,
    channels: response.channels,
  });

  if (!response?.ok || !response.channels?.length) {
    throw new IntegrationException("Failed to fetch Slack channels", {
      extra: { response },
    });
  }

  return response?.channels?.find((ch) => ch.name === channelName);
};

export const joinSlackChannelOrThrow = async (
  slackClient: WebClient,
  channelName: string
) => {
  const channel = await findSlackChannelOrThrow(slackClient, channelName);

  if (!channel?.id) {
    throw new ResourceNotFoundException("Slack channel not found", {
      userFacingMessage: "Could not find Slack channel.",
    });
  }

  if (!channel.is_member) {
    await slackClient?.conversations.join({
      channel: channel.id,
    });
  }

  return channel;
};

export const sendSlackMessage = async (
  slackClient: WebClient,
  messageOptions: ChatPostMessageArguments
) => {
  return slackClient?.chat.postMessage(messageOptions);
};
