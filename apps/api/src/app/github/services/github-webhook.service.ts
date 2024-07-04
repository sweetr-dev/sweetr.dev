import { WebhookEvent } from "@octokit/webhooks-types";
import { SweetQueue, addJob } from "../../../bull-mq/queues";
import { getAppOctoKit } from "../../../lib/octokit";
import { config } from "../../../config";
import { GitHubAppWebhook } from "./github-webhook.types";
import { logger } from "../../../lib/logger";

const webhookToQueueMap: Record<string, SweetQueue[]> = {
  // Installation
  "installation.created": [SweetQueue.GITHUB_INSTALLATION_SYNC],
  "installation_target.renamed": [SweetQueue.GITHUB_INSTALLATION_SYNC],
  "installation_repositories.added": [SweetQueue.GITHUB_REPOSITORIES_SYNC],
  "installation_repositories.removed": [SweetQueue.GITHUB_REPOSITORIES_SYNC],
  "installation.deleted": [SweetQueue.GITHUB_INSTALLATION_DELETED],
  "installation.new_permissions_accepted": [],
  "github_app_authorization.revoked": [SweetQueue.GITHUB_OAUTH_REVOKED],

  // Pull Request
  "pull_request.opened": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.synchronize": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.edited": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.closed": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.converted_to_draft": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.ready_for_review": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],
  "pull_request.reopened": [SweetQueue.GITHUB_SYNC_PULL_REQUEST],

  // Code Review
  "pull_request.review_requested": [SweetQueue.GITHUB_SYNC_CODE_REVIEW],
  "pull_request.review_request_removed": [SweetQueue.GITHUB_SYNC_CODE_REVIEW],
  "pull_request_review.submitted": [SweetQueue.GITHUB_SYNC_CODE_REVIEW],
  "pull_request_review.dismissed": [SweetQueue.GITHUB_SYNC_CODE_REVIEW],
  "pull_request_review.edited": [],

  // Organization
  "organization.member_added": [SweetQueue.GITHUB_MEMBERS_SYNC],
  "organization.member_removed": [SweetQueue.GITHUB_MEMBERS_SYNC],

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

  for (const queue of webhookToQueueMap[event]) {
    await addJob(queue, payload);
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
    if (attempts.some((attempt) => attempt.status.toLowerCase() === "ok"))
      continue;

    logger.info(`Retrying webhook delivery ${guid}`, { webhook: attempts[0] });

    await octokit.rest.apps.redeliverWebhookDelivery({
      delivery_id: attempts[0].id,
    });
  }
};

// https://docs.github.com/en/webhooks/using-webhooks/automatically-redelivering-failed-deliveries-for-a-github-app-webhook
const fetchWebhookDeliveriesSince = async (fetchSince: number) => {
  const octokit = getAppOctoKit();

  const iterator = octokit.paginate.iterator("GET /app/hook/deliveries", {
    per_page: 100,
  });

  const deliveries: GitHubAppWebhook[] = [];

  for await (const { data } of iterator) {
    const oldestDeliveryTimestamp = new Date(
      data[data.length - 1].delivered_at
    ).getTime();
    if (oldestDeliveryTimestamp < fetchSince) {
      for (const delivery of data) {
        if (new Date(delivery.delivered_at).getTime() > fetchSince) {
          deliveries.push(delivery);
        } else {
          break;
        }
      }
      break;
    } else {
      deliveries.push(...data);
    }
  }

  const deliveriesByGuid: Record<string, GitHubAppWebhook[]> = {};

  // Group deliveries by guid
  for (const delivery of deliveries) {
    deliveriesByGuid[delivery.guid]
      ? deliveriesByGuid[delivery.guid].push(delivery)
      : (deliveriesByGuid[delivery.guid] = [delivery]);
  }

  return deliveriesByGuid;
};
