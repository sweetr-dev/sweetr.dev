import { AlertType } from "@prisma/client";
import { addJobs, SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { logger } from "../../../lib/logger";
import { findScheduledAlerts } from "../services/alert-schedule.service";
import { fork } from "radash";

export const cronAlertScheduleWorker = createWorker(
  SweetQueue.CRON_SCHEDULE_ALERTS,
  async () => {
    logger.info("cronAlertScheduleWorker");

    const alerts = await findScheduledAlerts([
      AlertType.SLOW_REVIEW,
      AlertType.SLOW_MERGE,
    ]);

    const [slowReviewAlerts, slowMergeAlerts] = fork(
      alerts,
      (alert) => alert.type === AlertType.SLOW_REVIEW
    );

    await addJobs(SweetQueue.ALERT_SLOW_REVIEW, slowReviewAlerts);
    await addJobs(SweetQueue.ALERT_SLOW_MERGE, slowMergeAlerts);
  }
);
