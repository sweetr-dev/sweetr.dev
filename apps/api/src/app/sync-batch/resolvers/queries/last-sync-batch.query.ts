import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findLastSyncBatch } from "../../services/sync-batch.service";
import { transformSyncBatch } from "../transformers/sync-batch.transformer";

export const workspaceLastSyncBatchQuery = createFieldResolver("Workspace", {
  lastSyncBatch: async ({ id: workspaceId }) => {
    logger.info("query.workspace.lastSyncBatch", { workspaceId });

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const syncBatch = await findLastSyncBatch(workspaceId);

    if (!syncBatch) {
      return null;
    }

    return transformSyncBatch(syncBatch);
  },
});
