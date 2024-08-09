import { subDays } from "date-fns";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { countContributors } from "../../services/subscription.service";

export const purchasePlansQuery = createFieldResolver("Billing", {
  estimatedSeats: async (billing, _, context) => {
    logger.info("query.workspace.billing.estimatedSeats", { billing });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return countContributors(context.workspaceId);
  },
});
