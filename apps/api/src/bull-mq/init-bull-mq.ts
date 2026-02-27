import { loadFilesSync } from "@graphql-tools/load-files";
import { join } from "path";
import { logger } from "../lib/logger";
import { initQueues } from "./queues";
import { scheduleCronJobs } from "./schedule-cron-jobs";
import { env } from "../env";

// Automatically loads all workers
export const initBullMQ = async () => {
  if (!env.BULLMQ_ENABLED) return;

  initQueues();

  const workers = loadFilesSync(join(__dirname, "../**/*.(worker).(js|ts)"));

  await scheduleCronJobs();

  logger.info(`🐂⚡️ BullMQ: Initialized ${workers.length} workers`);
};
