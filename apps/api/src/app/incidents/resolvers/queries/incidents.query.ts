import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { protectWithPaywall } from "../../../billing/services/billing.service";

export const incidentsQuery = createFieldResolver("Workspace", {
  incidents: async (workspace, { input }) => {
    logger.info("query.incidents", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    return [];
  },
});
