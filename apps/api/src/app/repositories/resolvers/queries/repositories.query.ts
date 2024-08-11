import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findRepositoriesByWorkspace } from "../../services/repository.service";
import { transformRepository } from "../transformers/repository.transformer";

export const repositoriesQuery = createFieldResolver("Workspace", {
  repositories: async (workspace, { input }) => {
    logger.info("query.repositories", { workspace, input });

    if (!workspace?.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const repositories = await findRepositoriesByWorkspace({
      workspaceId: workspace.id,
      limit: input?.limit || undefined,
      query: input?.query || undefined,
    });

    return repositories.map(transformRepository);
  },
});
