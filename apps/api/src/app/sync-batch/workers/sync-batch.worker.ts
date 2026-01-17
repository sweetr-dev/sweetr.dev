import { Job } from "bullmq";
import { SweetQueues, QueuePayload } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { startSyncBatch } from "../services/sync-batch.service";

export const syncBatchWorker = createWorker(
  SweetQueues.SYNC_BATCH.name,
  async (job: Job<QueuePayload<"SYNC_BATCH">>) => {
    await startSyncBatch(job.data.syncBatchId);
  }
);
