import { WebhookEvent } from "@octokit/webhooks-types";
import { addJob, SweetQueueName } from "../../../bull-mq/queues";
import { getAppOctoKit } from "../../../lib/octokit";
import { config } from "../../../config";
import { GitHubAppWebhook } from "./github-webhook.types";
import { logger } from "../../../lib/logger";

const webhookToQueueMap: Partial<Record<string, SweetQueueName[]>> = {
  // Installation
  "installation.created": ["GITHUB_INSTALLATION_SYNC"],
  "installation_target.renamed": ["GITHUB_INSTALLATION_SYNC"],
  "installation.new_permissions_accepted": ["GITHUB_INSTALLATION_CONFIG_SYNC"],
  "installation.suspend": ["GITHUB_INSTALLATION_CONFIG_SYNC"],
  "installation.unsuspend": ["GITHUB_INSTALLATION_CONFIG_SYNC"],
  "installation_repositories.added": ["GITHUB_REPOSITORIES_SYNC"],
  "installation_repositories.removed": ["GITHUB_REPOSITORIES_SYNC"],
  "installation.deleted": ["GITHUB_INSTALLATION_DELETED"],
  "github_app_authorization.revoked": ["GITHUB_OAUTH_REVOKED"],

  // Pull Request
  "pull_request.opened": [
    "GITHUB_SYNC_PULL_REQUEST",
    "AUTOMATION_PR_TITLE_CHECK",
  ],
  "pull_request.synchronize": [
    "GITHUB_SYNC_PULL_REQUEST",
    "AUTOMATION_PR_TITLE_CHECK",
  ],
  "pull_request.edited": [
    "GITHUB_SYNC_PULL_REQUEST",
    "AUTOMATION_PR_TITLE_CHECK",
  ],
  "pull_request.closed": ["GITHUB_SYNC_PULL_REQUEST"],
  "pull_request.converted_to_draft": ["GITHUB_SYNC_PULL_REQUEST"],
  "pull_request.ready_for_review": ["GITHUB_SYNC_PULL_REQUEST"],
  "pull_request.reopened": ["GITHUB_SYNC_PULL_REQUEST"],

  // Code Review
  "pull_request.review_requested": ["GITHUB_SYNC_CODE_REVIEW"],
  "pull_request.review_request_removed": ["GITHUB_SYNC_CODE_REVIEW"],
  "pull_request_review.submitted": ["GITHUB_SYNC_CODE_REVIEW"],
  "pull_request_review.dismissed": ["GITHUB_SYNC_CODE_REVIEW"],
  "pull_request_review.edited": [],

  // Organization
  "organization.member_added": ["GITHUB_MEMBERS_SYNC"],
  "organization.member_removed": ["GITHUB_MEMBERS_SYNC"],

  // "organization.renamed": [], // TO-DO: Handle org rename
};

export const enqueueGithubWebhook = async (
  type: string,
  payload: WebhookEvent
): Promise<void> => {
  const event = getEventName(type, payload);

  if (!webhookToQueueMap[event]) {
    return;
  }

  for (const queue of webhookToQueueMap[event]!) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await addJob(queue, payload as any);
  }
};

const getEventName = (type: string, payload: WebhookEvent): string => {
  if ("action" in payload) {
    return `${type}.${payload.action}`;
  }

  return type;
};

export const retryFailedWebhooks = async () => {
  const octokit = getAppOctoKit();

  const deliveries = await fetchWebhookDeliveriesSince(
    Date.now() - config.github.failedWebhooks.recentWebhooksTimeframe
  );

  for (const [guid, attempts] of Object.entries(deliveries)) {
    const latestAttempt = attempts[0];

    if (
      attempts.length >= config.github.failedWebhooks.maxRetries ||
      latestAttempt.status === "OK"
    ) {
      continue;
    }

    if (!webhookToQueueMap[latestAttempt.event]) {
      continue;
    }

    logger.info("Retrying failed GitHub webhook", { guid, latestAttempt });

    await octokit.rest.apps.redeliverWebhookDelivery({
      delivery_id: latestAttempt.id,
    });
  }
};

const fetchWebhookDeliveriesSince = async (sinceTimestamp: number) => {
  const octokit = getAppOctoKit();

  const since = new Date(sinceTimestamp);

  let hasMore = true;
  let cursor: string | undefined = undefined;
  const deliveries: Record<string, GitHubAppWebhook[]> = {};

  while (hasMore) {
    const result = await octokit.rest.apps.listWebhookDeliveries({
      per_page: 100,
      cursor,
    });

    for (const delivery of result.data) {
      const deliveredAt = new Date(delivery.delivered_at);

      if (deliveredAt < since) {
        hasMore = false;
        break;
      }

      deliveries[delivery.guid] ??= [];
      deliveries[delivery.guid].push(delivery);
    }

    cursor = result.data.at(-1)?.id?.toString();

    if (!cursor || result.data.length < 100) {
      hasMore = false;
    }
  }

  return deliveries;
};
