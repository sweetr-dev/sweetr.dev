import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { processSlowReviewAlert } from "../services/alert-slow-review.service";
import { Job } from "bullmq";

export const alertSlowReviewWorker = createWorker(
  SweetQueues.ALERT_SLOW_REVIEW.name,
  async ({ data: alert }: Job<QueuePayload<"ALERT_SLOW_REVIEW">>) => {
    logger.info("alertSlowReviewWorker", { alert });

    await processSlowReviewAlert(alert);
  }
);
