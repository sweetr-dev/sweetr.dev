import { AnyBlock, RichTextElement } from "@slack/web-api";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceSlackClient,
  joinSlackChannel,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { DigestWithWorkspace } from "./digest.types";
import { encodeId } from "../../../lib/hash-id";
import { env } from "../../../env";
import { MetricLineElements } from "./digest-team-metrics.types";

export const sendTeamMetricsDigest = async (digest: DigestWithWorkspace) => {
  const { slackClient } = await getWorkspaceSlackClient(digest.workspaceId);

  const slackChannel = await joinSlackChannel(slackClient, digest.channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  const blocks = await getDigestMessageBlocks(digest);

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    blocks,
    unfurl_links: false,
    unfurl_media: false,
  });
};

const getDigestMessageBlocks = async (
  digest: DigestWithWorkspace
): Promise<AnyBlock[]> => {
  // TO-DO: Get metrics data
  // We'll implement better PR size calculation and p90 metrics first

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Metrics Digest",
      },
    },
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Avg of Sept 15th—Sept 21st (vs Sept 8th—Sept 14th).",
      },
    },
    {
      type: "divider",
    },
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: getMetricLineElements({
            label: "📂 PR Size",
            value: "321 lines",
            change: 7,
          }),
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: getMetricLineElements({
            label: "⏱️ PR Cycle Time",
            value: "32 hours",
            change: -12,
          }),
        },
        {
          type: "rich_text_list",
          elements: [
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to First Review",
                value: "4 hours",
                change: 12,
              }),
            },
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to Approve",
                value: "12 hours",
                change: -50,
              }),
            },
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to Merge",
                value: "1 hour",
                change: 0,
              }),
            },
          ],
          style: "bullet",
          indent: 1,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Explore Metrics",
          },
          url: `${env.FRONTEND_URL}/teams/${encodeId(digest.teamId)}/digests/wip`,
        },
      ],
    },
  ];
};

const getMetricLineElements = ({
  label,
  value,
  change,
}: MetricLineElements): RichTextElement[] => {
  return [
    {
      type: "text",
      text: `${label}: `,
    },
    {
      type: "text",
      text: value,
      style: {
        bold: true,
      },
    },
    {
      type: "text",
      text: " — ",
    },
    {
      type: "text",
      text: getChangeEmoji(change),
    },
    {
      type: "text",
      text: getChangeLabel(change),
      style: {
        bold: true,
      },
    },
  ];
};

const getChangeEmoji = (change: number) => {
  return change < 0 ? "🟠 " : "🟢 ";
};

const getChangeLabel = (change: number) => {
  if (change === 0) {
    return "0% change";
  }

  return `${Math.abs(change)}% ${change > 0 ? "better" : "worse"}`;
};
