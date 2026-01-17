import { SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import {
  findActiveSubscriptions,
  syncSubscriptionQuantity,
} from "../services/billing.service";

export const cronUpdateSeatsWorker = createWorker(
  SweetQueues.CRON_STRIPE_UPDATE_SEATS.name,
  async () => {
    logger.info("cronUpdateSeatsWorker");

    const activeSubscriptions = await findActiveSubscriptions();

    for (const subscription of activeSubscriptions) {
      syncSubscriptionQuantity(subscription);
    }
  }
);
