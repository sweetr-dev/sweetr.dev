import { addHours, isAfter } from "date-fns";
import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import {
  DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO,
  findLastSyncBatch,
  findSyncableRepositories,
  scheduleSyncBatch,
} from "../../services/sync-batch.service";
import { transformSyncBatch } from "../transformers/sync-batch.transformer";

export const scheduleSyncBatchMutation = createMutationResolver({
  scheduleSyncBatch: async (_, { input }) => {
    logger.info("mutation.scheduleSyncBatch", { input });

    const { workspaceId, sinceDaysAgo } = input;

    await protectWithPaywall(workspaceId);

    const lastSyncBatch = await findLastSyncBatch(workspaceId);

    // if last batch was scheduled less than 24 hours ago, throw an error - use date fns throughout the codebase
    if (
      lastSyncBatch?.scheduledAt &&
      isAfter(lastSyncBatch.scheduledAt, addHours(new Date(), -24))
    ) {
      throw new InputValidationException(
        "Last sync batch was scheduled less than 24 hours ago",
        {
          userFacingMessage: "You can only resync once every 24 hours.",
        }
      );
    }

    const repositories = await findSyncableRepositories(workspaceId);

    if (repositories.length === 0) {
      throw new InputValidationException("No syncable repositories found", {
        validationErrors: {
          repositories: "No syncable repositories found",
        },
      });
    }

    const syncBatch = await scheduleSyncBatch({
      workspaceId,
      scheduledAt: new Date(),
      sinceDaysAgo: Math.min(sinceDaysAgo, DEFAULT_SYNC_BATCH_SINCE_DAYS_AGO),
      metadata: {
        isOnboarding: false,
        repositories: repositories.map((repository) => repository.name),
      },
    });

    return transformSyncBatch(syncBatch);
  },
});
