import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getSyncBatchProgress } from "../../services/sync-batch.service";

export const syncBatchProgressQuery = createFieldResolver("SyncBatch", {
  progress: async ({ id }) => {
    logger.info("query.workspace.lastSyncBatch.progress", { id });

    if (!id) {
      throw new ResourceNotFoundException("Sync batch not found");
    }

    const { progress } = await getSyncBatchProgress(id);

    return progress;
  },
});
