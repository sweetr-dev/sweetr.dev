import { Job } from "bullmq";
import { QueuePayload, SweetQueues } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { processSlowMergeAlert } from "../services/alert-slow-merge.service";

export const alertSlowMergeWorker = createWorker(
  SweetQueues.ALERT_SLOW_MERGE.name,
  async ({ data: alert }: Job<QueuePayload<"ALERT_SLOW_MERGE">>) => {
    logger.info("alertSlowMergeWorker", { alert });

    await processSlowMergeAlert(alert);
  }
);
