import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findOnboardingSyncBatch,
  getSyncBatchProgress,
} from "../../../sync-batch/services/sync-batch.service";

export const workspaceSyncProgressQuery = createFieldResolver("Workspace", {
  initialSyncProgress: async (workspace) => {
    logger.info("query.initialSyncProgress", { workspaceId: workspace.id });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Could not find workspace");
    }

    const syncBatch = await findOnboardingSyncBatch(workspace.id);

    if (!syncBatch) {
      return 100;
    }

    const { progress } = await getSyncBatchProgress(syncBatch.id);

    return progress;
  },
});
