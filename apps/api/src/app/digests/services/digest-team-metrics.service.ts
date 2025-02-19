import { AnyBlock, RichTextElement } from "@slack/web-api";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceSlackClient,
  joinSlackChannelOrThrow,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { DigestWithRelations } from "./digest.types";
import { encodeId } from "../../../lib/hash-id";
import { env } from "../../../env";
import {
  DigestMetricType,
  MetricLineElements,
} from "./digest-team-metrics.types";
import { DurationUnit, endOfDay, format, startOfDay, sub } from "date-fns";
import { Frequency } from "@prisma/client";
import * as averageMetricsService from "../../metrics/services/average-metrics.service";
import { all, capitalize } from "radash";
import { getPullRequestSize } from "../../github/services/github-pull-request-tracking.service";
import { UTCDate } from "@date-fns/utc";
import { formatMsDuration } from "../../../lib/date";
import { AverageMetricFilters } from "../../metrics/services/average-metrics.types";
import { logger } from "../../../lib/logger";

export const sendTeamMetricsDigest = async (digest: DigestWithRelations) => {
  logger.info("sendTeamMetricsDigest", { digest });

  const { slackClient } = await getWorkspaceSlackClient(digest.workspaceId);

  const slackChannel = await joinSlackChannelOrThrow(
    slackClient,
    digest.channel
  );

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  const metrics = await getTeamMetrics(digest);
  const blocks = await getDigestMessageBlocks(digest, metrics);

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    blocks,
    unfurl_links: false,
    unfurl_media: false,
  });
};

const getChartFilters = (
  digest: DigestWithRelations
): { latest: AverageMetricFilters; previous: AverageMetricFilters } => {
  const subUnit = digest.frequency === Frequency.WEEKLY ? "weeks" : "months";

  return {
    latest: {
      workspaceId: digest.workspaceId,
      teamId: digest.teamId,
      startDate: startOfDay(sub(new UTCDate(), { [subUnit]: 1 })).toISOString(),
      endDate: endOfDay(new UTCDate()).toISOString(),
    },
    previous: {
      workspaceId: digest.workspaceId,
      teamId: digest.teamId,
      startDate: startOfDay(sub(new UTCDate(), { [subUnit]: 2 })).toISOString(),
      endDate: endOfDay(sub(new UTCDate(), { [subUnit]: 1 })).toISOString(),
    },
  };
};

const getTeamMetrics = async (digest: DigestWithRelations) => {
  const { latest, previous } = getChartFilters(digest);

  const latestResults: Record<DigestMetricType, number> = await all({
    prCount: averageMetricsService.getPullRequestCount(latest),
    cycleTime: averageMetricsService.getAverageCycleTime(latest),
    timeForFirstReview:
      averageMetricsService.getAverageTimeForFirstReview(latest),
    timeForApproval: averageMetricsService.getAverageTimeForApproval(latest),
    timeToMerge: averageMetricsService.getAverageTimeToMerge(latest),
    pullRequestSize: averageMetricsService.getAveragePullRequestSize(latest),
  });

  const previousResults: Record<DigestMetricType, number> = await all({
    prCount: averageMetricsService.getPullRequestCount(previous),
    cycleTime: averageMetricsService.getAverageCycleTime(previous),
    timeForFirstReview:
      averageMetricsService.getAverageTimeForFirstReview(previous),
    timeForApproval: averageMetricsService.getAverageTimeForApproval(previous),
    timeToMerge: averageMetricsService.getAverageTimeToMerge(previous),
    pullRequestSize: averageMetricsService.getAveragePullRequestSize(previous),
  });

  const calculateChange = (latestValue: number, previousValue: number) => {
    if (previousValue === 0) {
      return 0;
    }

    if (latestValue === 0) {
      return -100;
    }

    const change = ((latestValue - previousValue) * 10000) / previousValue;

    return Number(change) / 100;
  };

  const buildMetric = (key: DigestMetricType) => {
    return {
      [key]: {
        latest: {
          ...latest,
          value: latestResults[key],
        },
        previous: {
          ...previous,
          value: previousResults[key],
        },
        change: calculateChange(latestResults[key], previousResults[key]),
      },
    };
  };

  return {
    ...buildMetric("prCount"),
    ...buildMetric("cycleTime"),
    ...buildMetric("timeForFirstReview"),
    ...buildMetric("timeForApproval"),
    ...buildMetric("timeToMerge"),
    ...buildMetric("pullRequestSize"),
  };
};

const getDigestMessageBlocks = async (
  digest: DigestWithRelations,
  metrics: Awaited<ReturnType<typeof getTeamMetrics>>
): Promise<AnyBlock[]> => {
  const { latest, previous } = getChartFilters(digest);

  const dateFormatter: DurationUnit[] = [
    "years",
    "months",
    "weeks",
    "days",
    "hours",
    "minutes",
  ];

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: getHeaderText(digest),
      },
    },
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: `Avg of ${format(new UTCDate(latest.startDate), "MMM dd")}—${format(new UTCDate(latest.endDate), "MMM dd")} (vs ${format(new UTCDate(previous.startDate), "MMM dd")}—${format(new UTCDate(previous.endDate), "MMM dd")}) • ${metrics.prCount.latest.value} PRs from current period analyzed`,
            },
          ],
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n",
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
            value: `${capitalize(getPullRequestSize(digest.workspace, metrics.pullRequestSize.latest.value))} ~${metrics.pullRequestSize.latest.value.toFixed(1)} lines`,
            change: metrics.pullRequestSize.change,
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
            value: `${formatMsDuration(Number(metrics.cycleTime.latest.value), dateFormatter) || "N/A"}`,
            change: metrics.cycleTime.change,
          }),
        },
        {
          type: "rich_text_list",
          elements: [
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to First Review",
                value: `${
                  formatMsDuration(
                    Number(metrics.timeForFirstReview.latest.value),
                    dateFormatter
                  ) || "N/A"
                }`,
                change: metrics.timeForFirstReview.change,
              }),
            },
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to Approve",
                value: `${
                  formatMsDuration(
                    Number(metrics.timeForApproval.latest.value),
                    dateFormatter
                  ) || "N/A"
                }`,
                change: metrics.timeForApproval.change,
              }),
            },
            {
              type: "rich_text_section",
              elements: getMetricLineElements({
                label: "Time to Merge",
                value: `${
                  formatMsDuration(
                    Number(metrics.timeToMerge.latest.value),
                    dateFormatter
                  ) || "N/A"
                }`,
                change: metrics.timeToMerge.change,
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

const getHeaderText = (digest: DigestWithRelations) => {
  const teamName = digest.team.name;
  const teamLabel = teamName.endsWith("s") ? `${teamName}'` : `${teamName}'s`;

  return `${digest.team.icon} ${teamLabel} Metric Digest`;
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
  return change > 0 ? "🟠 " : "🟢 ";
};

const getChangeLabel = (change: number) => {
  if (change === 0) {
    return "0% change";
  }

  return `${Math.abs(change).toFixed(0)}% ${change > 0 ? "worse" : "better"}`;
};
