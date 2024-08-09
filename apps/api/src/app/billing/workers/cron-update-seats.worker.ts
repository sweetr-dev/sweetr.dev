import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import {
  findActiveSubscriptions,
  syncSubscriptionQuantity,
} from "../services/subscription.service";

export const cronUpdateSeatsWorker = createWorker(
  SweetQueue.CRON_STRIPE_UPDATE_SEATS,
  async () => {
    logger.info("cronUpdateSeatsWorker");

    const activeSubscriptions = await findActiveSubscriptions();

    for (const subscription of activeSubscriptions) {
      syncSubscriptionQuantity(subscription);
    }
  }
);
