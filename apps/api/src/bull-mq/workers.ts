import { Job, Worker, WorkerOptions } from "bullmq";
import { redisConnection } from "./redis-connection";
import { SweetQueues, QueuePayload } from "./queues";
import {
  bullMQErrorHandler,
  workerFailedHandler,
  workerStalledHandler,
} from "./error-handler";
import { logger } from "../lib/logger";

const workers: Worker[] = [];

// Helper type to get queue name strings
type QueueNameString = (typeof SweetQueues)[keyof typeof SweetQueues]["name"];

/**
 * Create a worker for a queue.
 * Pass the queue name string (e.g., SweetQueues.SEND_EMAIL.name).
 */
export const createWorker = <T>(
  queueName: QueueNameString,
  processor: (job: Job<T>, token?: string) => Promise<void>,
  workerOptions?: Omit<WorkerOptions, "connection">
) => {
  const worker = new Worker(
    queueName,
    async (job, token) => {
      logger.info(`🐂▶️ BullmQ: ${job.name} - Processing job #${job.id}`);

      return processor(job as Job<T>, token);
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
