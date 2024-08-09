import { minutesToMilliseconds } from "date-fns/minutesToMilliseconds";
import { SweetQueue, addJob } from "./queues";
import { config } from "../config";
import { hoursToMilliseconds } from "date-fns";

export const scheduleCronJobs = async () => {
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
};
