import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { retryFailedWebhooks } from "../services/github-webhook.service";

export const cronGithubRetryFailedWebhooksWorker = createWorker(
  SweetQueue.CRON_GITHUB_RETRY_FAILED_WEBHOOKS,
  async () => {
    await retryFailedWebhooks();
  }
);
