import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { syncSubscriptionWithStripe } from "../services/billing.service";
import { logger } from "../../../lib/logger";

export const subscriptionWorker = createWorker(
  SweetQueues.STRIPE_SUBSCRIPTION_UPDATED.name,
  async (job: Job<QueuePayload<"STRIPE_SUBSCRIPTION_UPDATED">>) => {
    const subscription = job.data.object;
    logger.info("subscriptionWorker", { subscription });

    await syncSubscriptionWithStripe(subscription.id);
  }
);
