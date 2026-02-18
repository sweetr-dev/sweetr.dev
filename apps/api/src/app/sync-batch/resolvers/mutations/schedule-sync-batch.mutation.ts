import { addHours, differenceInHours, isAfter } from "date-fns";
import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import {
  findLastSyncBatch,
  findSyncableRepositories,
  scheduleSyncBatch,
} from "../../services/sync-batch.service";
import { transformSyncBatch } from "../transformers/sync-batch.transformer";
import { validateInputOrThrow } from "../../../validator.service";
import { scheduleSyncBatchValidationSchema } from "../../services/sync-batch.validation";
import { isLive } from "../../../../env";

export const scheduleSyncBatchMutation = createMutationResolver({
  scheduleSyncBatch: async (_, { input }) => {
    logger.info("mutation.scheduleSyncBatch", { input });

    const { workspaceId, sinceDaysAgo } = await validateInputOrThrow(
      scheduleSyncBatchValidationSchema,
      input
    );

    await protectWithPaywall(workspaceId);

    const lastSyncBatch = await findLastSyncBatch(workspaceId);

    if (
      isLive &&
      lastSyncBatch?.scheduledAt &&
      isAfter(lastSyncBatch.scheduledAt, addHours(new Date(), -24))
    ) {
      const tryAgainIn = Math.max(
        differenceInHours(addHours(lastSyncBatch.scheduledAt, 24), new Date()),
        1
      );

      throw new InputValidationException(
        "Last sync batch was scheduled less than 24 hours ago",
        {
          userFacingMessage: `You can only resync once every 24 hours. Try again in ${tryAgainIn === 1 ? "1 hour" : `${tryAgainIn} hours`}.`,
        }
      );
    }

    const repositories = await findSyncableRepositories(workspaceId);

    if (repositories.length === 0) {
      throw new InputValidationException("No syncable repositories found", {
        userFacingMessage: "No repositories to sync.",
      });
    }

    const syncBatch = await scheduleSyncBatch({
      workspaceId,
      scheduledAt: new Date(),
      sinceDaysAgo,
      metadata: {
        isOnboarding: false,
        repositories: repositories.map((repository) => repository.name),
      },
    });

    return transformSyncBatch(syncBatch);
  },
});
