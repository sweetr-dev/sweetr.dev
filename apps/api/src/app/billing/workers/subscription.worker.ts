import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import Stripe from "stripe";
import { syncSubscriptionWithStripe } from "../services/billing.service";
import { logger } from "../../../lib/logger";

type JobData =
  | Stripe.CustomerSubscriptionCreatedEvent.Data
  | Stripe.CustomerSubscriptionUpdatedEvent.Data
  | Stripe.CustomerSubscriptionDeletedEvent.Data;

export const subscriptionWorker = createWorker(
  SweetQueue.STRIPE_SUBSCRIPTION_UPDATED,
  async (job: Job<JobData>) => {
    const subscription = job.data.object;
    logger.info("subscriptionWorker", { subscription });

    await syncSubscriptionWithStripe(subscription.id);
  }
);
