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
  joinSlackChannel,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";

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

  const channels = unique(alerts.map((alert) => alert.channel));

  await Promise.all(
    channels.map((channel) => sendAlert(workspace.id, channel))
  );
};

const sendAlert = async (workspaceId: number, channel: string) => {
  const { slackClient } = await getWorkspaceSlackClient(workspaceId);

  const slackChannel = await joinSlackChannel(slackClient, channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    text: "A pull request was merged without approval",
    unfurl_links: false,
    unfurl_media: false,
  });
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
