import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { isActiveCustomer } from "../../workspace-authorization.service";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";
import { getPrisma } from "../../../prisma";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { AlertType, CodeReviewState, PullRequestState } from "@prisma/client";
import { findActiveAlerts } from "./alert.service";
import { unique } from "radash";
import {
  getWorkspaceSlackClient,
  joinSlackChannelOrThrow,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { AlertWithTeam } from "./alert.types";
import { PullRequestWithRelations } from "./alert-merged-without-approval.types";

export const alertMergedWithoutApproval = async (
  gitInstallationId: string,
  gitPullRequestId: string
) => {
  const workspace = await getWorkspaceOrThrow(gitInstallationId);

  if (!isActiveCustomer(workspace, workspace?.subscription)) return;

  const pullRequest = await getPullRequestOrThrow(
    workspace.id,
    gitPullRequestId
  );

  const isApproved = pullRequest.codeReviews.some(
    (cr) => cr.state === CodeReviewState.APPROVED
  );
  const isMerged = pullRequest.state === PullRequestState.MERGED;

  if (isApproved || !isMerged) {
    return;
  }

  const teamIds = pullRequest.author.teamMemberships.map((m) => m.teamId);

  const alerts = await findActiveAlerts({
    workspaceId: workspace.id,
    teamIds,
    type: AlertType.MERGED_WITHOUT_APPROVAL,
  });

  const uniqueAlerts = unique(alerts, (alert) => alert.channel);

  await Promise.all(
    uniqueAlerts.map((alert) => sendAlert(workspace.id, alert, pullRequest))
  );
};

const sendAlert = async (
  workspaceId: number,
  alert: AlertWithTeam<"MERGED_WITHOUT_APPROVAL">,
  pullRequest: PullRequestWithRelations
) => {
  const { slackClient } = await getWorkspaceSlackClient(workspaceId);

  const slackChannel = await joinSlackChannelOrThrow(
    slackClient,
    alert.channel
  );

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  const blocks = await getMessageBlocks(alert, pullRequest);

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    blocks,
    text: "A pull request was merged without approvals",
    unfurl_links: false,
    unfurl_media: false,
  });
};

const getMessageBlocks = async (
  alert: AlertWithTeam<"MERGED_WITHOUT_APPROVAL">,
  pullRequest: PullRequestWithRelations
) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `PR "*<${pullRequest.gitUrl}|${pullRequest.title}>*" was merged without approvals ⚠️`,
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
  ];
};

const getWorkspaceOrThrow = async (gitInstallationId: string) => {
  const workspace = await findWorkspaceByGitInstallationId(gitInstallationId, {
    subscription: true,
  });

  if (!workspace) {
    throw new ResourceNotFoundException("Workspace not found");
  }

  return workspace;
};

const getPullRequestOrThrow = async (
  workspaceId: number,
  gitPullRequestId: string
) => {
  const pullRequest = await getPrisma(workspaceId).pullRequest.findFirst({
    where: {
      gitPullRequestId,
    },
    include: {
      codeReviews: true,
      repository: true,
      tracking: true,
      author: {
        include: {
          teamMemberships: true,
        },
      },
    },
  });

  if (!pullRequest) {
    throw new BusinessRuleException(
      `alertMergedWithoutApproval: Pull request not found`,
      {
        extra: {
          workspaceId,
          gitPullRequestId,
        },
      }
    );
  }

  return pullRequest;
};
