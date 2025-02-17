import { PullRequestState } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { AlertWithRelations, AlertWithTeam } from "./alert.types";
import { isBefore, subHours } from "date-fns";
import { sendAlert } from "./send-alert.service";
import { sleep } from "radash";
import { PullRequestWithRelations } from "./alert-slow-merge.types";

export const processSlowMergeAlert = async (
  alert: AlertWithRelations<"SLOW_MERGE">
) => {
  const pullRequests = await findAlertableMergeReviewPullRequests(alert);

  for (const pullRequest of pullRequests) {
    await handleAlertEvent(alert, pullRequest);
    await sleep(100);
  }
};

const handleAlertEvent = async (
  alert: AlertWithRelations<"SLOW_MERGE">,
  pullRequest: PullRequestWithRelations
) => {
  await sendAlert({
    workspaceId: alert.workspaceId,
    channel: alert.channel,
    blocks: await getMessageBlocks(alert, pullRequest),
    text: "A pull request has been pending merge for a while",
  });

  await getPrisma(alert.workspaceId).alertEvent.create({
    data: {
      alertId: alert.id,
      pullRequestId: pullRequest.id,
      workspaceId: alert.workspaceId,
    },
  });
};

const findAlertableMergeReviewPullRequests = async (
  alert: AlertWithRelations<"SLOW_MERGE">
) => {
  const maxWaitInHours = alert.settings.maxWaitInHours;

  const pullRequests = await getPrisma(alert.workspaceId).pullRequest.findMany({
    where: {
      state: PullRequestState.OPEN,
      author: {
        teamMemberships: {
          some: {
            teamId: alert.teamId,
          },
        },
      },
      tracking: {
        firstApprovalAt: {
          lt: subHours(new Date(), maxWaitInHours),
        },
      },
    },
    include: {
      alertEvents: {
        where: {
          alertId: alert.id,
        },
      },
      author: true,
      repository: true,
      tracking: true,
    },
  });

  // Only alert once every 24 hours
  const pullRequestsToAlert = pullRequests.filter((pullRequest) => {
    const lastEvent = pullRequest.alertEvents.at(-1);

    if (!lastEvent) return true;

    return isBefore(lastEvent.createdAt, subHours(new Date(), 24));
  });

  return pullRequestsToAlert;
};

const getMessageBlocks = async (
  alert: AlertWithTeam<"SLOW_MERGE">,
  pullRequest: PullRequestWithRelations
) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `⚠️ "*<${pullRequest.gitUrl}|${pullRequest.title}>*" is pending *merge* for over ${alert.settings.maxWaitInHours} hours`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: pullRequest.author.avatar,
          alt_text: pullRequest.author.name,
        },
        {
          type: "mrkdwn",
          text: pullRequest.author.name,
        },
        {
          type: "image",
          image_url: "https://github.githubassets.com/favicons/favicon.png",
          alt_text: "GitHub",
        },
        {
          type: "mrkdwn",
          text: pullRequest.repository.fullName,
        },
        {
          type: "mrkdwn",
          text: `*Size*: \`${pullRequest.tracking?.size || "unknown"}\``,
        },
        {
          type: "mrkdwn",
          text: `*Team*: ${alert.team.name}`,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
};
