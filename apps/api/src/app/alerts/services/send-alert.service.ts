import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceSlackClient,
  joinSlackChannelOrThrow,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { SendAlertArgs } from "./send-alert.types";

export const sendAlert = async ({
  workspaceId,
  channel,
  blocks,
  text,
}: SendAlertArgs) => {
  const { slackClient } = await getWorkspaceSlackClient(workspaceId);

  const slackChannel = await joinSlackChannelOrThrow(slackClient, channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    blocks,
    text,
    unfurl_links: false,
    unfurl_media: false,
  });
};
