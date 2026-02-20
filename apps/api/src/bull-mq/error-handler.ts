import { Job } from "bullmq";
import { captureException } from "../lib/sentry";
import { logger } from "../lib/logger";
import { BaseException } from "../app/errors/exceptions/base.exception";

export const bullMQErrorHandler = (error: Error) => {
  logger.info(`🐂❌ BullMQ: ${error.message}`);

  captureException(error);
};

export const workerFailedHandler = (job: Job, error: Error) => {
  logger.info(`🐂❌ BullMQ: ${job.name} - Erroed job #${job.id}`);

  let errorExtra = {};

  if (error instanceof BaseException) {
    errorExtra = error.extensions?.extra as Record<string, unknown>;
  }

  captureException(error, {
    extra: { jobId: job.id, jobName: job.name, jobData: job.data, errorExtra },
  });
};

export const workerStalledHandler = (jobId: string) => {
  logger.info(`🐂❌ BullMQ: job #${jobId} has stalled`);
};
