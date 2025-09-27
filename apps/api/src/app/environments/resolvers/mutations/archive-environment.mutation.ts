import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  archiveEnvironment,
  unarchiveEnvironment,
} from "../../services/environment.service";
import { transformEnvironment } from "../transformers/environment.transformer";

export const archiveEnvironmentMutation = createMutationResolver({
  archiveEnvironment: async (_, { input }) => {
    logger.info("mutation.archiveEnvironment", { input });

    await protectWithPaywall(input.workspaceId);

    const environment = await archiveEnvironment({
      workspaceId: input.workspaceId,
      environmentId: input.environmentId,
    });

    return transformEnvironment(environment);
  },
  unarchiveEnvironment: async (_, { input }) => {
    logger.info("mutation.unarchiveEnvironment", { input });

    await protectWithPaywall(input.workspaceId);

    const environment = await unarchiveEnvironment({
      workspaceId: input.workspaceId,
      environmentId: input.environmentId,
    });

    return transformEnvironment(environment);
  },
});
