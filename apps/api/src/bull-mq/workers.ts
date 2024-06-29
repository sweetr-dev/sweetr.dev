import { Processor, Worker, WorkerOptions } from "bullmq";
import { redisConnection } from "./redis-connection";
import { SweetQueue } from "./queues";
import {
  bullMQErrorHandler,
  workerFailedHandler,
  workerStalledHandler,
} from "./error-handler";
import { logger } from "../lib/logger";

const workers: Worker[] = [];

export const createWorker = (
  queueName: SweetQueue,
  processor: Processor,
  workerOptions?: Omit<WorkerOptions, "connection">
) => {
  const worker = new Worker(
    queueName,
    async (job, token) => {
      logger.info(`🐂▶️ BullmQ: ${job.name} - Processing job #${job.id}`);

      processor(job, token);
    },
    {
      connection: redisConnection,
      removeOnComplete: { age: 1 },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
      },
      ...workerOptions,
    }
  );

  worker.on("failed", workerFailedHandler);
  worker.on("error", bullMQErrorHandler);
  worker.on("stalled", workerStalledHandler);
  worker.on("completed", (job) =>
    logger.info(`🐂✅ BullMQ: ${job.name} - Completed job #${job.id}`)
  );

  workers.push(worker);

  return worker;
};

export const closeAllQueueWorkers = async () => {
  await Promise.all(
    workers.map(async (worker) => {
      return worker
        .close()
        .then(() => logger.info(`🐂🔶 BullMQ: Closed ${worker.name}`));
    })
  );
};
