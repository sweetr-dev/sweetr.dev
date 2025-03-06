import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { isActiveCustomer } from "../../../workspace-authorization.service";
import { findWorkspaceById } from "../../../workspaces/services/workspace.service";

export const isActiveCustomerQuery = createFieldResolver("Workspace", {
  isActiveCustomer: async ({ id: workspaceId }) => {
    logger.info("query.workspace.isActiveCustomer", {
      workspaceId,
    });

    const workspace = workspaceId ? await findWorkspaceById(workspaceId) : null;

    if (!workspace) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    return isActiveCustomer(workspace);
  },
});
