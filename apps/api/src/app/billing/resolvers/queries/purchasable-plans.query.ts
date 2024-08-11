import { isProduction } from "../../../../env";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findSubscription } from "../../services/billing.service";

export const purchasePlansQuery = createFieldResolver("Billing", {
  purchasablePlans: async (billing, _, context) => {
    logger.info("query.workspace.billing.purchasablePlans", { billing });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const subscription = await findSubscription(context.workspaceId);

    if (subscription) return null;

    if (isProduction) {
      return {
        cloud: {
          yearly: "cloud_yearly",
          monthly: "cloud_monthly",
        },
      };
    }

    return {
      cloud: {
        yearly: "test_cloud_yearly",
        monthly: "test_cloud_monthly",
      },
    };
  },
});
