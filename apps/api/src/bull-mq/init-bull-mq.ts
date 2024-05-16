import { loadFilesSync } from "@graphql-tools/load-files";
import { join } from "path";
import { logger } from "../lib/logger";
import { scheduleCronJobs } from "./schedule-cron-jobs";

// Automatically loads all workers
export const initBullMQ = async () => {
  const workers = loadFilesSync(join(__dirname, "../**/*.(worker).(js|ts)"));

  await scheduleCronJobs();

  logger.info(`🐂⚡️ BullMQ: Initialized ${workers.length} workers`);
};
