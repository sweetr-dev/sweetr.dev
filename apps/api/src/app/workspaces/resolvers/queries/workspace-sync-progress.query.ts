import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getInitialSyncProgress } from "../../services/workspace.service";

export const workspaceSyncProgressQuery = createFieldResolver("Workspace", {
  initialSyncProgress: async (workspace) => {
    logger.info("query.initialSyncProgress", { workspaceId: workspace.id });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Could not find workspace");
    }

    return getInitialSyncProgress(workspace.id);
  },
});
