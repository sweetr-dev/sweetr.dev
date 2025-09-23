import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { paginateEnvironments } from "../../services/environment.service";
import { transformEnvironment } from "../transformers/environment.transformer";

export const environmentsQuery = createFieldResolver("Workspace", {
  environments: async (workspace, { input }) => {
    logger.info("query.deployments", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const environments = await paginateEnvironments(workspace.id, {
      environmentIds: input.ids || undefined,
      query: input.query || undefined,
      cursor: input.cursor || undefined,
      limit: input.limit || undefined,
    });

    return environments.map(transformEnvironment);
  },
});
