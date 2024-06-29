import { Job } from "bullmq";
import { captureException } from "../lib/sentry";
import { logger } from "../lib/logger";

export const bullMQErrorHandler = (error: Error) => {
  logger.info(`🐂❌ BullMQ: ${error.message}`);

  captureException(error);
};

export const workerFailedHandler = (job: Job, error: Error) => {
  logger.info(`🐂❌ BullMQ: ${job.name} - Erroed job #${job.id}`);

  captureException(error, { extra: { jobId: job.id, jobName: job.name } });
};

export const workerStalledHandler = (jobId: string) => {
  logger.info(`🐂❌ BullMQ: job #${jobId} has stalled`);
};
