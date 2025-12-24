import { SyncBatch } from "@prisma/client";
import { SyncBatch as ApiSyncBatch } from "../../../../graphql-types";

export const transformSyncBatch = (
  syncBatch: SyncBatch
): Omit<ApiSyncBatch, "progress"> => {
  return {
    ...syncBatch,
    scheduledAt: syncBatch.scheduledAt.toISOString(),
    finishedAt: syncBatch.finishedAt?.toISOString(),
    sinceDaysAgo: syncBatch.sinceDaysAgo,
  };
};
