import { SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { retryFailedWebhooks } from "../services/github-webhook.service";

export const cronGithubRetryFailedWebhooksWorker = createWorker(
  SweetQueues.CRON_GITHUB_RETRY_FAILED_WEBHOOKS.name,
  async () => {
    await retryFailedWebhooks();
  }
);
