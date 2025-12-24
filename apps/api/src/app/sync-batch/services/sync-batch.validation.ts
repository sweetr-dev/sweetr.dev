import { z } from "zod";
import { DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO } from "./sync-batch.service";

export const scheduleSyncBatchValidationSchema = z.object({
  workspaceId: z.number(),
  sinceDaysAgo: z.number().min(1).max(DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO).int(),
});

export type ScheduleSyncBatchInput = z.infer<
  typeof scheduleSyncBatchValidationSchema
>;
