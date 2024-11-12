import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceSlackClient,
  joinSlackChannel,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { DigestWithWorkspace } from "./digest.types";

export const sendTeamMetricsDigest = async (digest: DigestWithWorkspace) => {
  const { slackClient } = await getWorkspaceSlackClient(digest.workspaceId);

  const slackChannel = await joinSlackChannel(slackClient, digest.channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    text: "Hello, world!",
  });
};
