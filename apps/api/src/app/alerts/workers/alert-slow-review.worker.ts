import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { processSlowReviewAlert } from "../services/alert-slow-review.service";
import { AlertWithRelations } from "../services/alert.types";
import { Job } from "bullmq";

export const alertSlowReviewWorker = createWorker(
  SweetQueue.ALERT_SLOW_REVIEW,
  async ({ data: alert }: Job<AlertWithRelations<"SLOW_REVIEW">>) => {
    logger.info("alertSlowReviewWorker", { alert });

    await processSlowReviewAlert(alert);
  }
);
