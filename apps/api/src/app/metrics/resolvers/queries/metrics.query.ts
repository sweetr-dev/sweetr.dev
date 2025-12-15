import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";

export const metricsQuery = createFieldResolver("Workspace", {
  metrics: async (workspace) => {
    logger.info("query.metrics", { workspace });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    return {};
  },
});
