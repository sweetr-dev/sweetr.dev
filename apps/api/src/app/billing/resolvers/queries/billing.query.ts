import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findWorkspaceByIdOrThrow } from "../../../workspaces/services/workspace.service";
import { findSubscription } from "../../services/subscription.service";
import { transformBilling } from "../transformers/billing.transformer";

export const workspaceBillingQuery = createFieldResolver("Workspace", {
  billing: async ({ id: workspaceId }) => {
    logger.info("query.workspace.billing", { workspaceId });

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const workspace = await findWorkspaceByIdOrThrow(workspaceId);
    const subscription = await findSubscription(workspaceId);

    return transformBilling(workspace, subscription);
  },
});
