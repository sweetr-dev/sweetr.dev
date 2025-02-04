import { minutesToMilliseconds, hoursToMilliseconds } from "date-fns";
import { SweetQueue, addJob } from "./queues";
import { config } from "../config";
import { logger } from "../lib/logger";

export const scheduleCronJobs = async () => {
  logger.info("🐂📅 BullMQ: Scheduling cron jobs");

  await addJob(SweetQueue.CRON_GITHUB_RETRY_FAILED_WEBHOOKS, null, {
    repeat: {
      every: minutesToMilliseconds(
        config.github.failedWebhooks.repeatEveryMinutes
      ),
    },
  });

  await addJob(SweetQueue.CRON_STRIPE_UPDATE_SEATS, null, {
    repeat: {
      every: hoursToMilliseconds(24),
    },
  });

  await addJob(SweetQueue.CRON_SCHEDULE_DIGESTS, null, {
    repeat: {
      pattern: "*/15 * * * *",
    },
  });
};
