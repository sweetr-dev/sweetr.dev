import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { createStripeCustomerPortalSession } from "../../services/stripe.service";

export const loginToStripeMutation = createMutationResolver({
  loginToStripe: async (_, { input }) => {
    logger.info("mutation.loginToStripe", {
      workspaceId: input.workspaceId,
    });

    if (!input.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const session = await createStripeCustomerPortalSession(input.workspaceId);

    return session?.url;
  },
});
