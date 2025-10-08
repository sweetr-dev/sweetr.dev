import { Job } from "bullmq";
import { SweetQueue } from "../../../bull-mq/queues";
import { createWorker } from "../../../bull-mq/workers";
import { startSyncBatch } from "../services/sync-batch.service";

export const syncBatchWorker = createWorker(
  SweetQueue.SYNC_BATCH,
  async (job: Job<{ syncBatchId: number }>) => {
    await startSyncBatch(job.data.syncBatchId);
  }
);
