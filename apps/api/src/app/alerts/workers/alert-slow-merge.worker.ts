import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { processSlowMergeAlert } from "../services/alert-slow-merge.service";
import { AlertWithRelations } from "../services/alert.types";
import { Job } from "bullmq";

export const alertSlowMergeWorker = createWorker(
  SweetQueue.ALERT_SLOW_MERGE,
  async ({ data: alert }: Job<AlertWithRelations<"SLOW_MERGE">>) => {
    logger.info("alertSlowMergeWorker", { alert });

    await processSlowMergeAlert(alert);
  }
);
