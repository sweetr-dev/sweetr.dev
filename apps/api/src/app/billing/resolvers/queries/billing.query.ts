import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { isAppSelfHosted } from "../../../../lib/self-host";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findWorkspaceById } from "../../../workspaces/services/workspace.service";
import { transformBilling } from "../transformers/billing.transformer";

export const workspaceBillingQuery = createFieldResolver("Workspace", {
  billing: async ({ id: workspaceId }) => {
    logger.info("query.workspace.billing", { workspaceId });

    if (isAppSelfHosted()) {
      return null;
    }

    const workspace = workspaceId ? await findWorkspaceById(workspaceId) : null;

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return transformBilling(workspace, workspace.subscription);
  },
});
