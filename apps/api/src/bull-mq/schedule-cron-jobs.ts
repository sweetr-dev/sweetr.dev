import { minutesToMilliseconds, hoursToMilliseconds } from "date-fns";
import { SweetQueue, getQueue } from "./queues";
import { config } from "../config";
import { logger } from "../lib/logger";

export const scheduleCronJobs = async () => {
  logger.info("🐂📅 BullMQ: Scheduling cron jobs");

  await getQueue(SweetQueue.CRON_GITHUB_RETRY_FAILED_WEBHOOKS).upsertJobScheduler(
    SweetQueue.CRON_GITHUB_RETRY_FAILED_WEBHOOKS,
    {
      every: minutesToMilliseconds(
        config.github.failedWebhooks.repeatEveryMinutes
      ),
    }
  );

  await getQueue(SweetQueue.CRON_STRIPE_UPDATE_SEATS).upsertJobScheduler(
    SweetQueue.CRON_STRIPE_UPDATE_SEATS,
    {
      every: hoursToMilliseconds(24),
    }
  );

  await getQueue(SweetQueue.CRON_SCHEDULE_DIGESTS).upsertJobScheduler(
    SweetQueue.CRON_SCHEDULE_DIGESTS,
    {
      pattern: "*/15 * * * *",
    }
  );

  await getQueue(SweetQueue.CRON_SCHEDULE_ALERTS).upsertJobScheduler(
    SweetQueue.CRON_SCHEDULE_ALERTS,
    {
      pattern: "*/15 * * * *",
    }
  );
};
